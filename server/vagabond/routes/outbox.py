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
    total_items = db.session.query(Activity).filter(Activity.actor == actor).count()
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
def post_outbox_c2s(actor_name, user=None):

    #Verify that user is authorized to post to this outbox
    is_own_outbox = False
    actor = None
    for _actor in user.actors:
        if _actor.username.lower() == actor_name.lower():
            is_own_outbox = True
            actor = _actor
            break

    if not is_own_outbox:
        return error('You can\'t post to the outbox of an actor that isn\'t yours.')

    inbound_object = request.get_json()
    inbound_object_target = None
    if 'object' in inbound_object:
        inbound_object_target = resolve_ap_object(inbound_object['object'])


    #Create activity and object, set polymorphic type, and flush to DB
    base_activity = None
    base_object = None

    if inbound_object['type'] == 'Note':
        base_object = Note()
        base_activity = Create()
    elif inbound_object['type'] == 'Follow':
        #TODO: generalize follow
        return follow(actor, inbound_object)
    else:
        return error('Vagabond does not currently support this type of AcvtivityPub object. :(')


    if base_object is not None:
        db.session.add(base_object)
    db.session.add(base_activity)

    db.session.flush()

    #General AP object handling
    if inbound_object_target is None:
        # Client only sent an object/activity to the server and didn't specify a target object
        if 'published' in inbound_object:
            published = parse(inbound_object['published'])
            base_activity.published = published
            base_object.published = published

        base_activity.add_all_recipients(inbound_object)
        base_object.add_all_recipients(inbound_object)
        base_activity.set_object(base_object)


    elif inbound_object_target is not None:
            # Client sent both the activity and the related object to the server
            if 'published' in inbound_object:
                base_activity.published = parse(inbound_object['published'])

            if 'published' in inbound_object_target:
                base_object.published = parse(inbound_object_target['published'])


    #Generic things to handle independently of whether or not an activity and an object
    # or just an object were provided.
    base_activity.set_actor(actor)
  

    # Handle requirements for specific object types
    if inbound_object['type'] == 'Note':
        base_object.attribute_to(actor)
        base_object.content = inbound_object['content']




    db.session.commit()

    return make_response('', 201)


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

    ordere_items = []

    for activity in activities:
        ordere_items.append(activity.to_dict())

    output = {
        '@context': 'https://www.w3.org/ns/activitystreams',
        'id': f'{api_url}/actors/{actor_name}/outbox/{page}',
        'partOf': f'{api_url}/actors/{actor_name}/outbox',
        'type': 'OrderedCollectionPage',
        'prev': f'{api_url}/actors/{actor_name}/outbox/{page-1}',
        'next': f'{api_url}/actors/{actor_name}/outbox/{page+1}',
        'orderedItems': ordere_items
    }

    response = make_response(output, 200)
    response.headers['Content-Type'] = 'application/activity+json'
    return response
