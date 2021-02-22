import enum

from datetime import datetime
from vagabond.__main__ import db
from vagabond.config import config
from vagabond.util import xsd_datetime
from vagabond.models import APObjectType


class APObjectTo(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    to = db.Column(db.String(256), nullable=False)
    ap_object_id = db.Column(db.Integer, db.ForeignKey('ap_object.id'), nullable=False)
    ap_object = db.relationship('APObject', backref='to')

    def __init__(self, ap_object_id, to):
        self.ap_object_id = ap_object_id
        self.to = to


class APObjectBto(db.Model):
    
    id = db.Column(db.Integer, primary_key=True)
    bto = db.Column(db.String(256), nullable=False)
    ap_object_id = db.Column(db.Integer, db.ForeignKey('ap_object.id'), nullable=False)
    ap_object = db.relationship('APObject', backref='bto')

    def __init__(self, ap_object_id, bto):
        self.ap_object_id = ap_object_id
        self.bto = bto


class APObjectCc(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cc = db.Column(db.String(256), nullable=False)
    ap_object_id = db.Column(db.Integer, db.ForeignKey('ap_object.id'), nullable=False)
    ap_object = db.relationship('APObject', backref='cc')

    def __init__(self, ap_object_id, cc):
        self.ap_object_id = ap_object_id
        self.cc = cc


class APObjectBcc(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    bcc = db.Column(db.String(256), nullable=False)
    ap_object_id = db.Column(db.Integer, db.ForeignKey('ap_object.id'), nullable=False)
    ap_object = db.relationship('APObject', backref='bcc')

    def __init__(self, ap_object_id, bcc):
        self.ap_object_id = ap_object_id
        self.bcc = bcc


class APObjectAttributedTo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    internal_actor_id = db.Column(db.ForeignKey('actor.id'))
    external_actor_id = db.Column(db.String(1024))
    ap_object_id = db.Column(db.Integer, db.ForeignKey('ap_object.id'), nullable=False)
    
    ap_object = db.relationship('APObject', uselist=False, foreign_keys=[ap_object_id])
    internal_actor = db.relationship('Actor', foreign_keys=[internal_actor_id])


class APObject(db.Model):
    '''
        Superclass for all ActivityPub objects including instances of Activity
    '''
    id = db.Column(db.Integer, primary_key=True)
    context = ["https://www.w3.org/ns/activitystreams"]
    content = db.Column(db.String(4096))
    published = db.Column(db.DateTime, default=datetime.utcnow)
    type = db.Column(db.Enum(APObjectType))
    attributed_to = db.relationship('APObjectAttributedTo', uselist=False)

    __mapper_args__ = {
        'polymorphic_identity': APObjectType.OBJECT,
        'polymorphic_on': type
    }

    def to_dict(self):

        api_url = config['api_url']

        output = {
            '@context': self.context,
            'id': f'{api_url}/objects/{self.id}',
            'type': self.type.value,
        }

        if self.attributed_to is not None:
            if self.attributed_to.internal_actor_id is not None:
                output['attributedTo'] = f'{api_url}/actors/{self.attributed_to.internal_actor.username}'
            elif self.attributed_to.external_actor_id is not None:
                output['attributedTo'] = self.attributed_to.external_actor_id

        if self.content is not None:
            output['content'] = self.content

        if self.published is not None:
            output['published'] = xsd_datetime(self.published)

        to = []
        if self.to is not None:
            for _to in self.to:
                to.append(_to.to)
        output['to'] = to

        cc = []
        if self.cc is not None:
            for _cc in self.cc:
                cc.append(_cc.cc)
        output['cc'] = cc       

        return output

    def set_to(self, to):
        '''
            Input: list

            Sets the 'to' field for this object. This operation will erase
            all of the previous 'to' fields for this object, but these changes
            will not be comitted or flushed.
        '''
        db.session.query(APObjectTo).filter(APObjectTo.ap_object_id == self.id).delete()
        for _to in to:
            new_to = APObjectTo(self.id, _to)
            db.session.add(new_to)

    def set_cc(self, cc):
        '''
            Input: list

            Sets the 'to' field for this object. This operation will erase
            all of the previous 'to' fields for this object, but these changes
            will not be comitted or flushed.
        '''
        db.session.query(APObjectCc).filter(APObjectCc.ap_object_id == self.id).delete()
        for _cc in cc:
            new_cc = APObjectCc(self.id, _cc)
            db.session.add(new_cc)


    def set_bcc(self, bcc):
        '''
            Input: list

            Sets the 'to' field for this object. This operation will erase
            all of the previous 'to' fields for this object, but these changes
            will not be comitted or flushed.
        '''
        db.session.query(APObjectBcc).filter(APObjectBcc.ap_object_id == self.id).delete()
        for _bcc in bcc:
            new_bcc = APObjectBcc(self.id, _bcc)
            db.session.add(new_bcc)


    def attribute_to(self, author):
        '''
            author: str | Model | int

            Creates an instance of APObjectAttributedTo that represents an attribution
            to the input id, external actor URL, or vagabond.models.Actor instance.

            A string indicates that the object is being attributed to an external actor while
            a SQLAlchemy model or integer indicates a local actor.

            The newly created instance of APObjectAttributedTo is added to the database session,
            but not committed or flushed.
        '''
        attribution = APObjectAttributedTo()
        attribution.ap_object_id = self.id

        if isinstance(author, str):
            attribution.external_actor_id = author
        elif isinstance(author, db.Model):
            attribution.internal_actor_id = author.id
        elif isinstance(author, int): 
            attribution.internal_actor_id = author

        db.session.add(attribution)

