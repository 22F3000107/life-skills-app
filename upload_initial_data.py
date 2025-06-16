from main import app
from application.sec import datastore
from application.models import db, Role
from werkzeug.security import generate_password_hash

with app.app_context():
	db.create_all()
	datastore.find_or_create_role(name="admin")
	datastore.find_or_create_role(name="user")
	db.session.commit()
	if not datastore.find_user(email="admin@email.com",password=generate_password_hash("admin")):
		datastore.create_user(email="admin@email.com",password=generate_password_hash("admin"),fullname="Admin", roles=["admin"])
	if not datastore.find_user(email="user@email.com",password=generate_password_hash("user")):
		datastore.create_user(email="user@email.com",password=generate_password_hash("user"),fullname="User", roles=["user"])
	db.session.commit()
	