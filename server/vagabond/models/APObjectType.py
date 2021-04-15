import enum

class APObjectType(enum.Enum):
    NOTE = 'Note'
    PERSON = 'Person'
    OBJECT = 'Object'
    CREATE = 'Create'
    DELETE = 'Delete'
    FOLLOW = 'Follow'
    ACTIVITY = 'Activity'
    LIKE = 'Like'
    UNDO = 'Undo'
    ACCEPT = 'Accept'
    REJECT = 'Reject'
    MENTION = 'Mention'