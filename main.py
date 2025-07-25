from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from application.models import db, User, Acadteam, Rewards, Module
from config import DevelopmentConfig
from application.resources import api
from flask_security import Security
from application.sec import datastore
# from application.worker import celery_init_app
# import flask_excel as excel
# from celery.schedules import crontab
# from application.tasks import daily_reminder, monthly_activity
from application.instances import cache
from flask_security import hash_password
from werkzeug.security import generate_password_hash
import uuid

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    # Initialize JWT after app configuration
    jwt = JWTManager(app)
    # excel.init_excel(app)
    # app.security = Security(app, datastore)
    cache.init_app(app)

    with app.app_context():
        # import application.views
        db.create_all()
        datastore.find_or_create_role(name="admin", description="User is an admin.")
        datastore.find_or_create_role(name="academic", description="User is a member of academic team.")
        datastore.find_or_create_role(name="user", description="User is a Student.")
        db.session.commit()

        if not datastore.find_user(email="admin@email.com"):
            admin_user = datastore.create_user(
                first_name="Admin",
                last_name="User",
                email="admin@email.com", 
                password=generate_password_hash("admin"), 
                phone_number=9999999999,
                age=35,
                fs_uniquifier=str(uuid.uuid4()),
                roles=["admin"])
    
    
        if not datastore.find_user(email="acad@email.com"):
            academic_user = datastore.create_user(
                first_name="Academic",
                last_name="Team",
                email="acad@email.com", 
                password=generate_password_hash("acad1234"), 
                phone_number=8888888888,
                age=30,
                fs_uniquifier=str(uuid.uuid4()),
                roles=["academic"], 
                active=False)
            
            academic_member = Acadteam(
                user=academic_user,
                qualification="M.SC. Computer Science",
                discipline = "Computer Science",
                institution="Univeristy")
            db.session.add(academic_member)

        if not datastore.find_user(email="user@email.com"):
            student_user = datastore.create_user(
                first_name="Regular",
                last_name="Student",
                email="user@email.com", 
                password=generate_password_hash("user1234"),
                phone_number=7777777777,
                age=13,
                fs_uniquifier=str(uuid.uuid4()),
                roles=["user"])
            rewards = Rewards(user=student_user, coins=20, streak=0)
            db.session.add(rewards)

        db.session.commit()
        return app


app = create_app()
# celery_app = celery_init_app(app)

# @celery_app.on_after_configure.connect
# def send_email(sender, **kwargs):
#     sender.add_periodic_task(
#         crontab(hour=19, minute=30),
#         daily_reminder.s())

# @celery_app.on_after_configure.connect
# def send_activity_report(sender, **kwargs):
#     sender.add_periodic_task(10, monthly_activity.s())

if __name__ == '__main__':
    app.run(debug=True)

# crontab(hour=23, minute=39, day_of_month=6)

