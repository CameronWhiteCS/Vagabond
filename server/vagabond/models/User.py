from vagabond.__main__ import db
from bcrypt import hashpw, gensalt


class User(db.Model):
    id = db.Column(db.Integer, nullable=False, primary_key=True)
    username = db.Column(db.String(32), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    primary_actor_id = db.Column(db.Integer, db.ForeignKey('actor.id'))
    primary_actor = db.relationship('Actor', uselist=False, foreign_keys=[primary_actor_id])

    def __init__(self, username, password):
        self.username = username.lower()
        self.password_hash = hashpw(bytes(password, 'utf-8'), gensalt())

