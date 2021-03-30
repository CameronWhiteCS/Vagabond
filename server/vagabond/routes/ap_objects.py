from flask import make_response, jsonify

from vagabond.__main__ import app, db
from vagabond.models import APObjectType, APObject, Actor
from vagabond.config import config
from vagabond.util import xsd_datetime
from vagabond.routes import error


@app.route('/api/v1/objects/<int:object_id>')
def get_note_by_id(object_id):

    ap_object = db.session.query(APObject).get(object_id)

    if ap_object is None:
        return error('Object not found', 404)
        
    response = make_response(ap_object.to_dict(), 200)
    response.headers['Content-Type'] = 'application/activity+json'
    return response


@app.route('/api/v1/feed')
def route_feed():
    notes = db.session.query(APObject).filter_by(type=APObjectType.NOTE).order_by(APObject.published.desc()).all()
    output = []
    for note in notes:
        output.append({
            'content': note.content,
            'handle': '@username@domain',
            'published': note.published
        })
    return make_response(jsonify(output), 200)
