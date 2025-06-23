class Config(object):
	DEBUG = False
	TESTING = False
	CACHE_TYPE ="RedisCache"
	CACHE_DEFAULT_TIMEOUT = 300


class DevelopmentConfig(Config):
	DEBUG = True
	SQLALCHEMY_DATABASE_URI = 'sqlite:///dev.db'
	SECRET_KEY = "thisissupersecret"
	SECURITY_PASSWORD_SALT = "thisissalty"
	SQLALCHEMY_TRACK_MODIFICATIONS = False
	WTF_CSRF_ENABLED = False
	SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'
	CACHE_REDIS_HOST = 'localhost'
	CACHE_REDIS_PORT = 6379
	CACHE_REDIS_DB = 3

