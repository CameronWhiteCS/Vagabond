import enum

from datetime import datetime
from vagabond.__main__ import db
from vagabond.config import config
from vagabond.util import xsd_datetime
import vagabond.models
from vagabond.models import APObjectType


class APObjectRecipient(db.Model):
    
    id = db.Column(db.Integer, primary_key=True)
    ap_object_id = db.Column(db.Integer, db.ForeignKey('ap_object.id'), nullable=False)
    method = db.Column(db.String(3), nullable=False)
    recipient = db.Column(db.String(256), nullable=False)

    ap_object = db.relationship('APObject', backref='recipients')

    def __init__(self, method, recipient):
        self.method = method
        self.recipient = recipient



class APObjectAttributedTo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    internal_actor_id = db.Column(db.ForeignKey('ap_object.id'))
    external_actor_id = db.Column(db.String(1024))
    ap_object_id = db.Column(db.Integer, db.ForeignKey('ap_object.id'), nullable=False)



class APObject(db.Model):
    '''
        Superclass for all ActivityPub objects including instances of Activity
    '''
    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(256), unique=True)

    in_reply_to_internal_id = db.Column(db.ForeignKey('ap_object.id'))
    in_reply_to_external_id = db.Column(db.String(256))

    content = db.Column(db.String(4096))
    published = db.Column(db.DateTime, default=datetime.utcnow)
    type = db.Column(db.Enum(APObjectType))
    
    #attributedTo property
    internal_author_id = db.Column(db.Integer, db.ForeignKey('ap_object.id'))
    external_author_id = db.Column(db.String(256))

    __mapper_args__ = {
        'polymorphic_identity': APObjectType.OBJECT,
        'polymorphic_on': type
    }

    @staticmethod
    def get_object_from_url(url):
        '''
            Takes an input URL originating from this server
            and returns the corresponding database model. For example,
            if the input to this method is
            https://cameron.teamvagabond.com/api/v1/objects/1, this method
            will return db.session.query(APObject).get(1)
            This works for the /api/v1/actors/<actorname> route as well.
        '''
        api_url = config['api_url']
        if url.replace(api_url, '') != url:
            url = url.replace(api_url, '')
            splits = url.split('/')
            if len(splits) == 3:
                if splits[1] == 'actors':
                    try:
                        username = splits[2]
                        return db.session.query(vagabond.models.Actor).filter(db.func.lower(username) == db.func.lower(vagabond.models.Actor.username)).first()
                    except:
                        return None
                elif splits[1] == 'objects':
                    try:
                        _id = int(splits[2])
                        return db.session.query(vagabond.models.APObject).get(_id)
                    except:
                        return None

    def set_in_reply_to(self, in_reply_to):
        '''
            Sets the inReplyTo propety of this APObject
        '''

        if isinstance(in_reply_to, dict):
            if 'id' in in_reply_to:
                self.in_reply_to_external_id = in_reply_to['id']
                obj = APObject.get_object_from_url(in_reply_to['id'])
                if obj is not None:
                    self.in_reply_to_internal_id = obj.id
            else:
                raise Exception('Cannot set inReplyTo property: provided dictionary lacks \'id\' property.')

        elif isinstance(in_reply_to, str):
            self.in_reply_to_external_id = in_reply_to
            obj = APObject.get_object_from_url(in_reply_to)
            if obj is not None:
                self.in_reply_to_internal_id = obj.id

        elif(isinstance(in_reply_to, db.Model)):
            self.in_reply_to_external_id = in_reply_to.to_dict()['id']
            self.in_reply_to_internal_id = in_reply_to.id



    def to_dict(self):

        api_url = config['api_url']

        output = {
            '@context': ["https://www.w3.org/ns/activitystreams"],
            'type': self.type.value,
        }

        if self.external_id is not None:
            output['id'] = self.external_id
        else:
            output['id'] = f'{api_url}/objects/{self.id}'

        #inReplyTo - what this object is in reply to
        if self.in_reply_to_external_id is not None:
            output['inReplyTo'] = self.in_reply_to_external_id
        elif self.in_reply_to_internal_id is not None:
            in_reply_to = db.session.query(APObject).get(self.in_reply_to_internal_id)
            if in_reply_to is not None:
                output['inReplyTo'] = in_reply_to.to_dict()['id']

        #inReplyTo - what objects are a reply to this one
        if self.type == APObjectType.NOTE and self.id is not None:
            total_items = db.session.query(APObject).filter(APObject.in_reply_to_internal_id == self.id).count()
            if total_items > 0:
                output['replies'] = f'{api_url}/objects/{self.id}/replies'

        #attributedTo
        if hasattr(self, 'external_author_id') and self.external_author_id is not None:
            output['attributedTo'] = self.external_author_id

        elif hasattr(self, 'internal_author_id') and self.internal_author_id is not None:
            attributed_to = db.session.query(APObject).get(self.internal_author_id)
            if attributed_to is not None:
                output['attributedTo'] = attributed_to.to_dict()['id']

        if hasattr(self, 'content') and self.content is not None:
            output['content'] = self.content

        if hasattr(self, 'published'):
            output['published'] = xsd_datetime(self.published)

        if hasattr(self, 'recipients'):
            for recipient in self.recipients:
                
                if recipient.method not in output:
                    output[recipient.method] = []
                
                output[recipient.method].append(recipient.recipient)

        return output



    def add_recipient(self, method, recipient):
        '''
            method = 'to' | 'bto' | 'cc' | 'bcc'
            recipient = Actor URL ID

            Adds an actor as a recipient of this object using either the to, bto, cc, or bcc
            ActivityPub fields. 
        '''
        method = method.lower()
        if method != 'to' and method !='bto' and method != 'cc' and method != 'bcc':
            raise Exception("Only acceptable values for APObject#add_recipient are 'to', 'bto', 'cc', and 'bcc'")

        self.recipients.append(APObjectRecipient(method, recipient))

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



    def attribute_to(self, author):
        '''
            author: str | Model | int

            A string indicates that the object is being attributed to an external actor while
            a SQLAlchemy model or integer indicates a local actor.

        '''
        #TODO: use get_object_from_url to set internal author id
        if isinstance(author, str):
            self.external_author_id = author
        elif isinstance(author, db.Model):
            self.internal_author_id = author.id
        elif isinstance(author, int): 
            self.internal_author_id = author

