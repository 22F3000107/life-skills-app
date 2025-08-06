from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from werkzeug.security import generate_password_hash, check_password_hash

from datetime import date,datetime
import uuid

db = SQLAlchemy()

roles_users = db.Table('roles_users',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('role_id', db.Integer, db.ForeignKey('role.id'))
)

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.BigInteger, nullable=False)
    age = db.Column(db.Integer, nullable=True)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    active = db.Column(db.Boolean(), default=True)
    registered = db.Column(db.DateTime, default=datetime.utcnow)

    roles = db.relationship('Role', secondary=roles_users,
                            backref=db.backref('users', lazy='dynamic'))
    acadteam = db.relationship('Acadteam', back_populates='user', uselist=False)
    rewards = db.relationship('Rewards', backref='user', uselist=False)
    habits = db.relationship('Habit', backref='user', lazy=True)
    goals = db.relationship('Goal', backref='user', lazy=True)
    scores = db.relationship('Scores', backref='user', lazy=True)
    stories = db.relationship('Story', backref='author', lazy=True, cascade="all, delete-orphan")
    quizzes = db.relationship('Quiz', backref='author', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def __init__(self, **kwargs):
        if 'fs_uniquifier' not in kwargs:
            kwargs['fs_uniquifier'] = str(uuid.uuid4())
        super().__init__(**kwargs)

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

class Acadteam(db.Model):
    __tablename__ = 'acadteam'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    qualification = db.Column(db.String(100), nullable=False)
    discipline = db.Column(db.String(100), nullable=False)
    institution = db.Column(db.String(100), nullable=False)

    user = db.relationship('User', back_populates='acadteam')

class Rewards(db.Model):
    __tablename__ = 'rewards'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    coins = db.Column(db.Integer, default=0, nullable=False)
    streak = db.Column(db.Integer, default=0, nullable=False)

    def __repr__(self):
        return f"<Rewards User ID: {self.user_id}, Coins: {self.coins}, Streak: {self.streak}>"

class Habit(db.Model):
    __tablename__ = 'habit'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    date = db.Column(db.Date, nullable=False, default=date.today)

    def __repr__(self):
        return f"<Habit {self.name} for User {self.user_id} on {self.date}>"

class Goal(db.Model):
    __tablename__ = 'goal'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    text = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(20), default="active")
    due_date = db.Column(db.Date, nullable=False)

    def __repr__(self):
        return f"<Goal {self.text} ({self.status}) for User {self.user_id}>"

class Module(db.Model):
    __tablename__ = 'module'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=False)

class Concept(db.Model):
    __tablename__ = 'concept'
    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey('module.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    date = db.Column(db.Date)
    live = db.Column(db.Boolean, default=False)
    created_by = db.Column(db.Integer, db.ForeignKey('acadteam.id'))
    flag = db.Column(db.Boolean, default=False)
    max_marks = db.Column(db.Integer)

    module = db.relationship('Module', backref=db.backref('concepts', lazy=True))
    created_by_team = db.relationship('Acadteam', backref=db.backref('concepts', lazy=True))
    questions = db.relationship('Question', back_populates='concept')

class Question(db.Model):
    __tablename__ = 'question'
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=True)
    module_id = db.Column(db.Integer, db.ForeignKey('module.id'), nullable=False)
    concept_id = db.Column(db.Integer, db.ForeignKey('concept.id'), nullable=False)
    age_group = db.Column(db.String(20))
    type = db.Column(db.String(20))
    question_statement = db.Column(db.String(255))
    answers = db.Column(db.String(255))
    approvals = db.Column(db.String(255))
    rejections = db.Column(db.String(255))
    marks = db.Column(db.Integer)
    flag = db.Column(db.Boolean, default=False)
    audio_url = db.Column(db.String(255))
    img_url = db.Column(db.String(255))

    parent = db.relationship('Question', remote_side=[id], backref='sub_questions')
    module = db.relationship('Module', backref=db.backref('questions', lazy=True))
    concept = db.relationship('Concept', back_populates='questions')

class Scores(db.Model):
    __tablename__ = 'scores'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    concept_id = db.Column(db.Integer, db.ForeignKey('concept.id'), nullable=False)
    marks_obtained = db.Column(db.Integer)

    concept = db.relationship('Concept', backref=db.backref('scores', lazy=True))

class Quiz(db.Model):
    __tablename__ = 'quiz'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    skill = db.Column(db.String(100), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    status = db.Column(db.String(20), default="draft")  # draft|published|flagged
    flag_reason = db.Column(db.String(255))
    flag = db.Column(db.Boolean, default=False)
    questions = db.relationship('QuizQuestion', backref='quiz', lazy=True)

class QuizQuestion(db.Model):
    __tablename__ = 'quiz_question'
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    question = db.Column(db.String(255), nullable=False)
    options = db.Column(db.PickleType, nullable=False)  # Store list of options
    correct_answer = db.Column(db.Integer, nullable=False)  # Index of correct answer

class Story(db.Model):
    __tablename__ = 'story'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # optional
    status = db.Column(db.String(20), default="draft")  # draft|published|
    flag_reason = db.Column(db.String(255))
    flag = db.Column(db.Boolean, default=False)

class QuizAttempt(db.Model):
    __tablename__ = 'quiz_attempt'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    score = db.Column(db.Integer, nullable=True)
    attempted_on = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('quiz_attempts', lazy=True))
    quiz = db.relationship('Quiz', backref=db.backref('attempts', lazy=True))
