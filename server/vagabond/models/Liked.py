
from vagabond.__main__ import db
from vagabond.models import Like

class Liked(db.Model):

    id = db.Column(db.Integer, nullable=False, primary_key=True)
    approved = db.Column(db.Boolean, nullable=False)
    liked_collection = db.Column(Like, nullable=False)

    # how to add object to the actor's liked collection

    def __init__(self, liker_id, liker, liked_collection, approved=False):
        self.liked_collection = liked_collection
        self.approved = approved
