'''
    Contains routes and functions for processing
    inbound requests to an actor outbox.
'''

from math import ceil

from flask import make_response, request, session

from dateutil.parser import parse

from vagabond.__main__ import app, db
from vagabond.models import Actor, APObjectAttributedTo, APObject, APObjectType, Following, Note, Activity, Create, Follow, FollowedBy, Like, Notification, Undo
from vagabond.routes import error, require_signin
from vagabond.config import config
from vagabond.crypto import signed_request
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
        if inbox.replace(config['api_url'], '') == inbox: #Don't deliver messages to ourselves!
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

    is_local = False # Whether or not the object being acted upon is an object that **originated** on this server
    if 'object' in inbound_object and inbound_object['object'].replace(config['api_url'], '') != inbound_object['object']:
        is_local = True

    # Create activity and possibly the object, set polymorphic type, and flush to DB
    base_activity = None # base_activity always exists
    base_object = None # base_object sometimes exists

    if inbound_object['type'] == 'Note':
        base_object = Note()
        base_activity = Create()
        db.session.add(base_object)
        db.session.add(base_activity)
    elif inbound_object['type'] == 'Follow':
        base_activity = Follow()
        db.session.add(base_activity)
    elif inbound_object['type'] == 'Like':
        base_activity = Like()
        db.session.add(base_activity)
    #Undoes follow, like, and  block
    elif inbound_object['type'] == 'Undo':
        base_activity = Undo()
        
    else:
        return error('Vagabond does not currently support this type of AcvtivityPub object.')

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
        base_activity.add_all_recipients(inbound_object)
        base_object.add_all_recipients(inbound_object)
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

        new_follow = Following(actor.id, leader['id'], leader['followers'], approved=is_local)
        db.session.add(new_follow)

        # Due to the correspondance nature of the Follow activity, it has some very unusual requirements.
        # We need to detect if the incoming Follow activity is targeting a local user. If it is, we don't need
        # To deliver server-to-server messages about this transaction. Attempting to do so would cause problems
        # resulting from uncomitted database transactions and be a waste of resources.
        if is_local:
            local_leader = db.session.query(Actor).filter(db.func.lower(Actor.username) == db.func.lower(inbound_object['object'].replace(f'{config["api_url"]}/actors/', ''))).first()
            if local_leader is None:
                return make_response('Actor not found', 404)
            actor_dict = actor.to_dict()
            new_followed_by = FollowedBy(local_leader.id, actor_dict['id'], actor_dict['inbox'], follower_shared_inbox=actor_dict['endpoints']['sharedInbox'], approved=True)
            db.session.add(Notification(local_leader, f'{actor_dict["preferredUsername"]} has followed you.', 'Follow'))
            db.session.add(new_followed_by)
        else:
            db.session.commit() #This is required so when we get an Accept activity back before the end of this request, we're able to find the Follow activity
            try:
                signed_request(actor, base_activity.to_dict(), leader['inbox'])
            except:
                return error('Your follow request was not able to be delivered to that server.')

    elif inbound_object['type'] == 'Like':
        liked_object = resolve_ap_object(inbound_object['object'])

        if liked_object['type'] == 'Create' or liked_object['type'] == 'Note':
            base_activity.set_object(inbound_object['object'])
            #DEBUG
            app.logger.error('\n\n\n\n\n\n')
            app.logger.error(resolve_ap_object('https://mastodon.online/users/gerakey2#accepts/follows/299765'))
            app.logger.error('\n\n\n\n\n\n')

            #Debug
        else:
            return error('You cannot like that kind of object.')
    elif inbound_object['type'] == 'Undo':
        #if base_activity.actor != resolve_ap_object(inbound_object['object'])['actor']
        return make_response('The actor who made the activity must be the one to undo it', 404)
        
        #else
            #first see if it will even let me undo the object
            #delete the activity made, follow needs to be stored in the AP_object like create is
        
            
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

    actor = db.session.query(Actor).filter(db.func.lower(Actor.username) == db.func.lower(actor_name)).first()

    if actor is None:
        return error('Actor not found', 404)

    base_query = db.session.query(Activity).filter(Activity.actor == actor)
    
    if 'maxId' in request.args:
        base_query = base_query.filter(Activity.id <= int(request.args['maxId']))

    base_query = base_query.order_by(Activity.published.desc()).paginate(page, 20)

    activities = base_query.items

    api_url = config['api_url']

    ordered_items = []

    for activity in activities:
        ordered_items.append(activity.to_dict())

    prev = f'{api_url}/actors/{actor_name}/outbox/{page-1}'
    _next =  f'{api_url}/actors/{actor_name}/outbox/{page+1}'

    if 'maxId' in request.args:
        max_id = int(request.args['maxId'])
        prev = prev + f'?maxId={max_id}'
        _next = _next + f'?maxId={max_id}'

    output = {
        '@context': 'https://www.w3.org/ns/activitystreams',
        'id': f'{api_url}/actors/{actor_name}/outbox/{page}',
        'partOf': f'{api_url}/actors/{actor_name}/outbox',
        'type': 'OrderedCollectionPage',
        'prev': prev,
        'next': _next,
        'orderedItems': ordered_items
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

    max_id_object = db.session.query(Activity).filter(Activity.actor == actor).order_by(Activity.id.desc()).first()
    max_id = 0
    if max_id_object is not None:
        max_id = max_id_object.id

    max_page = ceil(total_items / items_per_page)
    api_url = config['api_url']

    output = {
        '@context': 'https://www.w3.org/ns/activitystreams',
        'id': f'{api_url}/actors/{username}/outbox',
        'type': 'OrderedCollection',
        'totalItems': total_items,
        'first': f'{api_url}/actors/{username}/outbox/1?maxId={max_id}',
        'last': f'{api_url}/actors/{username}/outbox/{max_page}?maxId={max_id}'
    }

    response = make_response(output, 200)
    response.headers['Content-Type'] = 'application/activity+json'
    return response