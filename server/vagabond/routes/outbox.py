'''
    Contains routes and functions for processing
    inbound requests to an actor outbox.
'''

from math import ceil

from flask import make_response, request, session

from dateutil.parser import parse

from vagabond.__main__ import app, db
from vagabond.models import Actor, APObjectAttributedTo, APObject, APObjectType, Following, Note, Activity, Create, Follow, FollowedBy, Like
from vagabond.routes import error, require_signin
from vagabond.config import config
from vagabond.crypto import require_signature, signed_request
from vagabond.util import resolve_ap_object

import json

def deliver(actor, message):
    '''
        Delivers the specified message to the inboxes of the actor's followers
    '''
    
    all_inboxes = []

    shared_inboxes = db.session.query(FollowedBy.follower_shared_inbox.distinct()).filter(FollowedBy.leader_id == actor.id, FollowedBy.follower_shared_inbox != None).all()
    print(shared_inboxes)
    for inbox in shared_inboxes:
        all_inboxes.append(inbox[0])

    unique_inboxes = db.session.query(FollowedBy.follower_inbox.distinct()).filter(FollowedBy.leader_id == actor.id, FollowedBy.follower_shared_inbox == None).all()
    for inbox in unique_inboxes:
        all_inboxes.append(inbox[0])

    for inbox in all_inboxes:
        try:
            signed_request(actor, message, url=inbox)
        except:
            app.logger.error(f'Could not deliver message to the following inbox: {inbox}')


# TODO: Cerberus validation
@require_signin
def post_outbox_c2s(actor_name, user=None):

    # Make sure the user has permission to post to this outbox
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



    # Create activity and possibly the object, set polymorphic type, and flush to DB
    base_activity = None # base_activity always exists
    base_object = None # base_object sometimes exists

    if inbound_object['type'] == 'Note':
        base_object = Note()
        base_activity = Create()
        db.session.add(base_object)
        db.session.add(base_activity)
        base_activity.add_all_recipients(inbound_object)
        base_object.add_all_recipients(inbound_object)
    elif inbound_object['type'] == 'Follow':
        base_activity = Follow()
        db.session.add(base_activity)
    elif inbound_object['type'] == 'Like':
        base_activity = Like()
        db.session.add(base_activity)
    else:
        return error('Vagabond does not currently support this type of AcvtivityPub object. :(')

    db.session.flush()


    # Set actor ---> activity relationship
    base_activity.set_actor(actor)


    # Set activity ----> object relationship
    if base_object is None:
        base_activity.set_object(inbound_object['object'])
    else:
        base_activity.set_object(base_object)

    # Handle requirements for specific object types
    if inbound_object['type'] == 'Note':
        base_object.attribute_to(actor)
        base_object.content = inbound_object['content']
    elif inbound_object['type'] == 'Follow':
        leader = resolve_ap_object(inbound_object['object'])

        existing_follow = db.session.query(Following).filter(db.and_(
            Following.follower_id == actor.id,
            Following.leader == leader['id']
        )).first()

        if existing_follow is not None and existing_follow.approved is True:
                return error('You are already following this actor.')

        new_follow = Following(actor.id, leader['id'], leader['followers'])
        db.session.add(new_follow)
        signed_request(actor, base_activity.to_dict(), leader['inbox'])

    elif inbound_object['type'] == 'Like':
        in_obj = resolve_ap_object(inbound_object['object'])

        if in_obj['type'] == 'Create' or in_obj['type'] == 'Note':
            new_like = in_obj['liked']
            db.session.add(new_like)
        else:
            return error('object has to a valid type.')
        
    deliver(actor, base_activity.to_dict())

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