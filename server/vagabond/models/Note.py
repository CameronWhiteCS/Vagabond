from vagabond.__main__ import db
from vagabond.models import APObject, APObjectType

class Note(APObject):
    id = db.Column(db.ForeignKey('ap_object.id'), primary_key=True)

    __mapper_args__ = {
        'polymorphic_identity': APObjectType.NOTE
    }