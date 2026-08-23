import os
#base directory
basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

class Config():
    DEBUG=False
    SQLALCHEMY_TRACK_MODIFICATIONS=False

class LocalDevelopmentConfig(Config):
    #database
    SQLALCHEMY_DATABASE_URI=f"sqlite:///{os.path.join(basedir,'instance','placementdb.sqlite3')}"
    DEBUG=True

    #security
    SECRET_KEY='application-secretkey'#hashing user creds in session
    SECURITY_PASSWORD_HASH='bcrypt'#mechanism for hashing password
    SECURITY_PASSWORD_SALT='This is a password-salt'#hashing the password
    WTF_CSRF_ENABLED=False
    SECURITY_TOKEN_AUTHENTICATION_HEADER='Authentication-Token'
    SECURITY_LOGIN_URL='/auth/login' 

    CACHE_TYPE="RedisCache"
    CACHE_REDIS_URL="redis://localhost:6379/2"
    CACHE_DEFAULT_TIMEOUT=300
    