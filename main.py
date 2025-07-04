from flask import Flask
from flask_jwt_extended import JWTManager
from application.models import db, User
from config import DevelopmentConfig
from application.resources import api
from flask_security import Security
from application.sec import datastore
# from application.worker import celery_init_app
# import flask_excel as excel
# from celery.schedules import crontab
# from application.tasks import daily_reminder, monthly_activity
from application.instances import cache
from flask_security import current_user
from werkzeug.security import generate_password_hash
import uuid

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    # Initialize JWT after app configuration
    jwt = JWTManager(app)
    # excel.init_excel(app)
    app.security = Security(app, datastore)
    cache.init_app(app)

    with app.app_context():
        # import application.views
        db.create_all()
        admin_role = datastore.find_or_create_role(name="admin")
        student_role = datastore.find_or_create_role(name="user")
        academy_role = datastore.find_or_create_role(name="academic")
        db.session.commit()

        if not datastore.find_user(email="admin@email.com"):
            datastore.create_user(
                email="admin@email.com",
                password=generate_password_hash("admin"),
                first_name="Admin",
                last_name="Admin",
                phone_number=9999999999,
                age=30,
                roles=[admin_role],
                fs_uniquifier=str(uuid.uuid4())
            )
            db.session.commit()
        else:
            print("Admin exists.")

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

