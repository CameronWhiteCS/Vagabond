'''
    Contains routes and functions for processing
    inbound requests to an actor outbox.
'''

from math import ceil

from flask import make_response, request, session

from dateutil.parser import parse

from vagabond.__main__ import app, db
from vagabond.models import Actor, APObjectAttributedTo, APObject, APObjectType, Following, Note, Activity, Create, Follow
from vagabond.routes import error, require_signin
from vagabond.config import config
from vagabond.crypto import require_signature, signed_request
from vagabond.util import resolve_ap_object


def get_outbox(username):

    username = username.lower()

    actor = db.session.query(Actor).filter_by(username=username).first()
    if not actor:
        return error('Actor not found', 404)

    items_per_page = 20
    total_items = db.session.query(APObject).filter_by(type=APObjectType.NOTE).count()
    max_page = ceil(total_items / items_per_page)
    api_url = config['api_url']

    output = {
        '@context': 'https://www.w3.org/ns/activitystreams',
        'id': f'{api_url}/actors/{username}/outbox',
        'type': 'OrderedCollection',
        'totalItems': total_items,
        'first': f'{api_url}/actors/{username}/outbox/1',
        'last': f'{api_url}/actors/{username}/outbox/{max_page}'
    }

    response = make_response(output, 200)
    response.headers['Content-Type'] = 'application/activity+json'
    return response


# TODO Input validation for note
def create_note(actor, note):
    '''
            actor: Actor model
            note: Dictionary representing the newly created note
    '''

    published = parse(note.get('published'))
    content = note.get('content')

    #Create note
    new_note = Note()
    new_note.content = content
    new_note.published = published
    db.session.add(new_note)
    db.session.flush()
    new_note.attribute_to(actor)
    new_note.add_all_recipients(note)


    #Create activity
    new_activity = Create()
    new_activity.set_actor(actor)
    new_activity.set_object(new_note)
    db.session.add(new_activity)
    db.session.flush()
    new_activity.attribute_to(actor)
    new_activity.add_all_recipients(note)

    db.session.commit()

    return make_response('', 201)


# TODO: Input validation for follow activity
def follow(actor, follow_activity):
    '''
        actor: Actor model
        follow_activity: Dictionary representation of the new follow request
    '''

    leader = resolve_ap_object(follow_activity['object'])

    existing_follow = db.session.query(Following).filter(db.and_(
        Following.follower_id == actor.id,
        Following.leader == leader['id']
    )).first()

    if existing_follow is not None:
        if existing_follow.approved is True:
            return error('You are already following this actor.')

        db.session.delete(existing_follow)

    new_activity = Follow()
    new_activity.set_actor(actor)
    new_activity.set_object(follow_activity['object'])
    db.session.add(new_activity)
    db.session.flush()

    new_follow = Following(actor.id, leader['id'], leader['followers'])
    db.session.add(new_follow)

    signed_request(actor, new_activity.to_dict(), leader['inbox'])

    db.session.commit()

    return make_response('', 200)


'''
**kwargs used instead of 'user' argument
to calm down the linter. User argument provided
by require_signin
'''
# TODO: Cerberus validation


@require_signin
def post_outbox_c2s(actor_name, *args, **kwargs):

    user = kwargs['user']
    is_own_outbox = False
    actor = None
    for _actor in user.actors:
        if _actor.username.lower() == actor_name.lower():
            is_own_outbox = True
            actor = _actor
            break

    if not is_own_outbox:
        return error('You can\'t post to the outbox of an actor that isn\'t yours.')

    _type = request.get_json().get('type')
    if _type is None:
        return error('Invalid ActivityPub object type')
    elif _type == 'Note':
        return create_note(actor, request.get_json())
    elif _type == 'Follow':
        return follow(actor, request.get_json())

    return error('Invalid ActivityPub object type.')


@app.route('/api/v1/actors/<actor_name>/outbox', methods=['GET', 'POST'])
def route_user_outbox(actor_name):
    '''
        Post requests to an actor's outbox can come from either a C2S or S2S
        interaction. Here we determine which type of request is being received
        and act accordingly. GET requests are also permitted.
    '''
    if request.method == 'GET':
        return get_outbox(actor_name)
    elif request.method == 'POST' and 'uid' in session:
        return post_outbox_c2s(actor_name)
    else:
        return error('Invalid request')


@app.route('/api/v1/actors/<actor_name>/outbox/<int:page>')
def route_user_outbox_paginated(actor_name, page):

    actor = db.session.query(Actor).filter_by(username=actor_name.lower()).first()

    if actor is None:
        return error('Actor not found', 404)

    activities = db.session.query(Activity).filter(db.and_(
        Activity.actor == actor, Activity.type != APObjectType.FOLLOW)).order_by(Activity.published.desc()).paginate(page, 20).items
    api_url = config['api_url']

    orderedItems = []

    for activity in activities:
        orderedItems.append(activity.to_dict())

    output = {
        '@context': 'https://www.w3.org/ns/activitystreams',
        'id': f'{api_url}/actors/{actor_name}/outbox/{page}',
        'partOf': f'{api_url}/actors/{actor_name}/outbox',
        'type': 'OrderedCollectionPage',
        'prev': f'{api_url}/actors/{actor_name}/outbox/{page-1}',
        'next': f'{api_url}/actors/{actor_name}/outbox/{page+1}',
        'orderedItems': orderedItems
    }

    response = make_response(output, 200)
    response.headers['Content-Type'] = 'application/activity+json'
    return response
