from flask import request, make_response

from vagabond.routes import error
from vagabond.__main__ import app, db
from vagabond.crypto import require_signature
from vagabond.config import config
from vagabond.models import Actor, Following, Follow
from vagabond.util import resolve_ap_object


# TODO: Is it possible to look up object using the id url
# instead of filtering?
def modify_follow(actor, activity, obj):

    following = db.session.query(Following).filter(db.and_(
        Following.follower_id == actor.id,
        Following.leader == activity['actor']),
        Following.approved == 0
    ).first()

    follow_activity = db.session.query(Follow).filter(db.and_(
        Follow.external_object_id == obj['object'],
        Follow.internal_actor_id == actor.id
    )).first()

    if following is None or follow_activity is None:
        app.logger.error('Follow request not found.')
        return error('Follow request not found.', 404)

    if activity['type'] == 'Accept':
        following.approved = True
        db.session.add(following)
    else:
        db.session.delete(following)

    db.session.delete(follow_activity)
    

    db.session.commit()

    return make_response('', 200)


@app.route('/api/v1/actors/<actor_name>/inbox', methods=['GET', 'POST'])
@require_signature
def post_inbox_s2s(actor_name):
    
    if request.method == 'POST':
        activity = request.get_json()
        actor = db.session.query(Actor).filter_by(
            username=actor_name.lower()).first()
        obj = resolve_ap_object(request.get_json().get('object'))

        if (activity['type'] == 'Accept' or activity['type'] == 'Reject') and obj['type'] == 'Follow':
            return modify_follow(actor, activity, obj)
        else:
            return error('Invalid request')
