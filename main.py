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
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5500"}}, supports_credentials=True)
    # Initialize JWT after app configuration
    jwt = JWTManager(app)
    # excel.init_excel(app)
    # app.security = Security(app, datastore)
    cache.init_app(app)

    with app.app_context():
        # import application.views
        db.create_all()
        admin_role = datastore.find_or_create_role(name="admin")
        student_role = datastore.find_or_create_role(name="user")
        academy_role = datastore.find_or_create_role(name="academic")
        db.session.commit()

        if not datastore.find_user(email="acad@email.com"):
            datastore.create_user(
                email="acad@email.com",
                password=generate_password_hash("acad"),
                first_name="acad",
                last_name="academ",
                phone_number=9999999999,
                age=30,
                roles=[academy_role],
                fs_uniquifier=str(uuid.uuid4())
            )
            db.session.commit()
        else:
            print("acad exists.")
    # @app.after_request
    # def add_cors_headers(response):
    #     response.headers.add("Access-Control-Allow-Origin", "http://localhost:5500")
    #     response.headers.add("Access-Control-Allow-Credentials", "true")
    #     response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    #     response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
    #     return response
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

