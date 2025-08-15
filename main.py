import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from application.models import db, User, Acadteam, Rewards, Module, Quiz, Question, QuizQuestion
from config import DevelopmentConfig
from application.resources import api
from flask_security import Security
from application.sec import datastore
from application.instances import cache
from werkzeug.security import generate_password_hash
import uuid
# add this part
from application.worker import celery_init_app
from application.tasks import weekly_reminder,send_reminder_to_inactive
from application.models import ReminderSetting
from celery.schedules import crontab

def sync_questions_to_quiz_questions():
    print("Starting sync of Question -> QuizQuestion...")
    quizzes = Quiz.query.all()

    for quiz in quizzes:
        questions = Question.query.filter_by(concept_id=quiz.concept_id).all()

        for question in questions:
            # Check if already exists in QuizQuestion
            exists = QuizQuestion.query.filter_by(quiz_id=quiz.id, question=question.question_statement).first()
            if not exists:
                options = []
                correct_answer_index = 0

                if isinstance(question.answers, list):
                    options = [opt['text'] if isinstance(opt, dict) else str(opt) for opt in question.answers]

                    # Find correct answer index
                    for idx, opt in enumerate(question.answers):
                        if isinstance(opt, dict) and opt.get('correct') is True:
                            correct_answer_index = idx
                            break

                new_quiz_question = QuizQuestion(
                    quiz_id=quiz.id,
                    question=question.question_statement,
                    options=options,
                    correct_answer=correct_answer_index,
                    hint=""  # Add hint if you have it
                )
                db.session.add(new_quiz_question)

    db.session.commit()
    print("Sync complete.")



def create_app():
    app = Flask(__name__, static_folder="frontend", static_url_path='') 
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5500"}}, supports_credentials=True)
    app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    jwt = JWTManager(app)
    cache.init_app(app)

    with app.app_context():
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

        # Sync Questions to QuizQuestions here
        sync_questions_to_quiz_questions()

        db.session.commit()
        return app


app = create_app()
celery_app = celery_init_app(app)

# @celery_app.on_after_configure.connect
# def send_email(sender, **kwargs):
#     weekly = ReminderSetting.query.get(1)
#     sender.add_periodic_task(
#             crontab(minute=int(weekly.minute_weekly), 
#                     hour=int(weekly.hour_weekly), 
#                     day_of_week=weekly.day_of_week.lower()),
#             weekly_reminder.s()
#         )

# @celery_app.on_after_configure.connect
# def setup_periodic_tasks(sender, **kwargs):
#     inactive = ReminderSetting.query.get(2)
#     sender.add_periodic_task(
#             crontab(minute=int(inactive.minute_inactive), 
#                     hour=int(inactive.hour_inactive)),
#             send_reminder_to_inactive.s()
#         )


@celery_app.on_after_configure.connect
def send_email(sender, **kwargs):
    sender.add_periodic_task(
            crontab(minute='*'),
            weekly_reminder.s()
        )

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
            crontab(minute='*'),
            send_reminder_to_inactive.s()
        )

@app.route("/")
def serve_index():
    return send_from_directory("frontend/static", "index.html")


@app.route("/<path:filename>")
def serve_static(filename):
    file_path = os.path.join("frontend", filename)
    if os.path.exists(file_path):
        return send_from_directory("frontend", filename)
    return send_from_directory("frontend/static", "index.html")


if __name__ == '__main__':
    app.run(debug=True)

