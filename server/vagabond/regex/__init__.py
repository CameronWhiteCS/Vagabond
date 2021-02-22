'''
    Collection of regular expressions in string format used for Cerberus input validation.
'''

USERNAME = '^[a-z0-9_-]{1,32}$'

ACTOR_NAME = '^[a-z0-9_-]{1,32}$'

PASSWORD = '^.{12,255}'

ACTOR_HANDLE = '@[\\w]{1,}@[\\w.]{1,}.[\\w]{1,}'
