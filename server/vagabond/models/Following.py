from vagabond.__main__ import db


class Following(db.Model):
    '''
        Representation of who a user is following both locally
        and federally.

        This model also records which ActivityPub outbox page the
        follower most recently requested to view for a given leader.
    '''
    id = db.Column(db.Integer, nullable=False, primary_key=True)
    approved = db.Column(db.Boolean, nullable=False)
    leader = db.Column(db.String(256), nullable=False)

    follower_id = db.Column(db.Integer, db.ForeignKey('actor.id'), nullable=False)
    follower = db.relationship('Actor', backref='following')

    def __init__(self, follower_id, leader, approved=False):
        self.follower_id = follower_id
        self.leader = leader
        self.approved = approved