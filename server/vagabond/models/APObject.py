import enum

from datetime import datetime
from vagabond.__main__ import db
from vagabond.config import config
from vagabond.util import xsd_datetime
from vagabond.models import APObjectType


class APObjectRecipient(db.Model):
    
    id = db.Column(db.Integer, primary_key=True)
    ap_object_id = db.Column(db.Integer, db.ForeignKey('ap_object.id'), nullable=False)
    method = db.Column(db.String(3), nullable=False)
    recipient = db.Column(db.String(256), nullable=False)

    ap_object = db.relationship('APObject', backref='recipients')

    def __init__(self, ap_object_id, method, recipient):
        self.ap_object_id = ap_object_id
        self.method = method
        self.recipient = recipient


class APObjectInbox(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ap_object_id = db.Column(db.Integer, db.ForeignKey('ap_object.id'), nullable=False)
    actor_id = db.Column(db.Integer, db.ForeignKey('actor.id'), nullable=False)

    actor = db.relationship('Actor', foreign_keys=[actor_id])
    ap_object = db.relationship('APObject', foreign_keys=[ap_object_id])

    def __init__(self, ap_object_id, actor_id):
        self.ap_object_id = ap_object_id
        self.actor_id = actor_id


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
    external_id = db.Column(db.String(256), unique=True)
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
            'type': self.type.value,
        }

        if self.external_id is not None:
            output['id'] = self.external_id
        else:
            output['id'] = f'{api_url}/objects/{self.id}'

        if self.attributed_to is not None:
            if self.attributed_to.internal_actor_id is not None:
                output['attributedTo'] = f'{api_url}/actors/{self.attributed_to.internal_actor.username}'
            elif self.attributed_to.external_actor_id is not None:
                output['attributedTo'] = self.attributed_to.external_actor_id

        if self.content is not None:
            output['content'] = self.content

        if self.published is not None:
            output['published'] = xsd_datetime(self.published)

        if hasattr(self, 'recipients'):
            for recipient in self.recipients:
                if output.get(recipient.method) is None:
                    output[recipient.method] = [recipient.recipient]
                else:
                    output[recipient.method].append(recipient.recipient)



        return output

    def add_recipient(self, method: str, recipient):
        '''
            method = 'to' | 'bto' | 'cc' | 'bcc'
            recipient = Actor URL ID

            Adds an actor as a recipient of this object using either the to, bto, cc, or bcc
            ActivityPub fields. This method adds records to the database but does not commit or flush
            them.
        '''
        method = method.lower()
        if method != 'to' and method !='bto' and method != 'cc' and method != 'bcc':
            raise Exception("Only acceptable values for APObject#add_recipient are 'to', 'bto', 'cc', and 'bcc'")

        db.session.add((APObjectRecipient(self.id, method, recipient)))


    def add_all_recipients(self, obj: dict):
        '''
            Takes a dictionary object which contains some combination of 
            the 'to', 'bto', 'cc', and 'bcc' fields and adds the intended recipients 
            as recipients of this object.

            The four aformentioned fields can be either strings or lists.
        '''
        keys = ['to', 'bto', 'cc', 'bcc']
        for key in keys:
            value = obj.get(key)
            if value is not None:
                if isinstance(value, str):
                    value = [value]
                elif isinstance(value, list) is not True:
                    raise Exception(f'APObject#add_all_recipients method given an object whose {key} value was neither a string nor an array.')
                
                for _value in value:
                    self.add_recipient(key, _value)

    def add_to_inbox(self, actor):
        '''
            actor: Vagabond.models.Actor | int
            Puts this object into the inbox of a local actor.

        '''


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

