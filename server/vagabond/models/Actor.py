from vagabond.models import APObject, APObjectType
from vagabond.__main__ import db
from vagabond.config import config
from Crypto.PublicKey import RSA



class Actor(APObject):
    id = db.Column(db.Integer, db.ForeignKey('ap_object.id'), primary_key=True)
    username = db.Column(db.String(32), nullable=False)
    public_key = db.Column(db.Text(16639))
    private_key = db.Column(db.Text(16639))

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship('User', backref='actors', foreign_keys=[user_id])

    __mapper_args__ = {
        'polymorphic_identity': APObjectType.PERSON
    }

    def __init__(self, username, user=None, user_id=None):

        self.username = username

        if user_id is not None:
            self.user_id = user_id
        elif user is not None:
            self.user_id = user.id
        else:
            raise Exception(
                'Instantiating an Actor requires either a user object or user id. ')

        key = RSA.generate(2048)
        self.private_key = key.export_key()
        self.public_key = key.publickey().export_key()
        self.type = APObjectType.PERSON

    def to_dict(self):

        api_url = config['api_url']
        username = self.username
        output = super().to_dict()
        
        output['id'] = f'{api_url}/actors/{username}'
        output['inbox'] = f'{api_url}/actors/{username}/inbox'
        output['outbox'] = f'{api_url}/actors/{username}/outbox'
        output['followers'] = f'{api_url}/actors/{username}/followers'
        output['following'] = f'{api_url}/actors/{username}/following'
        output['liked'] = f'{api_url}/actors/{username}/liked'
        output['preferredUsername'] = self.username
        output['endpoints'] = {
            'sharedInbox': f'{api_url}/inbox'
        }


        output['publicKey'] = {
            'actor': f'{api_url}/actors/{username}',
            'id': f'{api_url}/actors/{username}#main-key',
            'publicKeyPem': self.public_key
        }

        return output
