from flask import Flask
from application.models import db, User
from config import DevelopmentConfig
# from application.resources import api
# from flask_security import Security
# from application.sec import datastore
# from application.worker import celery_init_app
# import flask_excel as excel
# from celery.schedules import crontab
# from application.tasks import daily_reminder, monthly_activity
# from application.instances import cache
# from flask_security import current_user


def create_app():
	app = Flask(__name__)
	app.config.from_object(DevelopmentConfig)
	db.init_app(app)
	# api.init_app(app)
	# excel.init_excel(app)
	# app.security = Security(app, datastore)
	# cache.init_app(app)
	with app.app_context():
		# import application.views
		db.create_all()
	return app


app = create_app()
# celery_app = celery_init_app(app)


# @celery_app.on_after_configure.connect
# def send_email(sender, **kwargs):
# 	sender.add_periodic_task(
# 	    crontab(hour=19, minute=30),
# 	    daily_reminder.s())


# @celery_app.on_after_configure.connect
# def send_activity_report(sender, **kwargs):
# 	sender.add_periodic_task(10, monthly_activity.s())


if __name__ == '__main__':
	app.run(debug=True)

#crontab(hour=23, minute=39, day_of_month=6)
