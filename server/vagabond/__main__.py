from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_cors import CORS
from vagabond.config import config

VERSION = '0.0.1'

app = Flask(__name__, static_url_path='/')
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+mysqlconnector://{config['mysql_user']}:{config['mysql_password']}@{config['mysql_server']}:{config['mysql_port']}/{config['mysql_database']}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SECRET_KEY'] = 'v5t8IIbv7c8xw59sqoQInUHEouXqVLSHrvw0Ggk00_BiBNSBXH--qU_tiwGER8uf_-vsOdh6Pjwf2vYL1I_U7-rdFYvZ-C2C6sYokT6HGww-WaH97BGrRKHcUmt0kFb-sJRfAFik5-QPERSXEdmCya4uvRRVxX8bI2126dbM20A'
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

db = SQLAlchemy(app)
limiter = Limiter(app)
cors = CORS(app)

from vagabond.models import *
from vagabond.routes import *


db.create_all()

if __name__ == '__main__':
    app.run()
