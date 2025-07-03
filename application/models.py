from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

db = SQLAlchemy()

roles_users = db.Table('roles_users',
    db.Column('user_id', db.Integer(), db.ForeignKey('user.id')),
    db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))
)

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.BigInteger, nullable=False)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    active = db.Column(db.Boolean(), default=True) 

    roles = db.relationship('Role', secondary=roles_users,
                            backref=db.backref('users', lazy='dynamic'))
    acedteam = db.relationship('Acedteam', back_populates='user', uselist=False)

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def __init__(self, **kwargs):
        if 'fs_uniquifier' not in kwargs:
            kwargs['fs_uniquifier'] = str(uuid.uuid4())
        super().__init__(**kwargs)

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)

class Acedteam(db.Model):
    __tablename__ = 'acedteam'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone_number = db.Column(db.BigInteger, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    qualification = db.Column(db.String(100), nullable=False)
    discipline = db.Column(db.String(100), nullable=False)
    institution = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    user = db.relationship('User', back_populates='acedteam')

class Module(db.Model):
    __tablename__ = 'module'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(100), nullable=False)

class Concept(db.Model):
    __tablename__ = 'concept'
    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey('module.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    date= db.Column(db.Date)
    live= db.Column(db.Boolean, default=False)
    created_by = db.Column(db.Integer, db.ForeignKey('acedteam.id'))
    flag = db.Column(db.Boolean, default=False)
    max_marks = db.Column(db.Integer)

    module = db.relationship('Module', backref=db.backref('concept', lazy=True))
    created_by_team = db.relationship('Acedteam', backref=db.backref('concept', lazy=True))
    questions = db.relationship('Question', back_populates='concept')

class Question(db.Model):
    __tablename__ = 'question'
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    module_id = db.Column(db.Integer, db.ForeignKey('module.id'), nullable=False)
    concept_id = db.Column(db.Integer, db.ForeignKey('concept.id'), nullable=False)
    age_group = db.Column(db.String(20))
    type = db.Column(db.String(20))
    question_statement = db.Column(db.String(255))
    answers = db.Column(db.String(255))  # CSV
    approvals = db.Column(db.String(255))  # CSV
    rejections = db.Column(db.String(255))  # CSV
    marks = db.Column(db.Integer)
    flag = db.Column(db.Boolean, default=False)
    audio_url = db.Column(db.String(255))
    img_url = db.Column(db.String(255))

    module = db.relationship('Module', backref=db.backref('questions', lazy=True))
    concept = db.relationship('Concept', back_populates='questions')

class Scores(db.Model):
    __tablename__ = 'score'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    concept_id = db.Column(db.Integer, db.ForeignKey('concept.id'), nullable=False)
    marks_obtained = db.Column(db.Integer)

    user = db.relationship('User', backref=db.backref('scores', lazy=True))
    concept = db.relationship('Concept', backref=db.backref('scores', lazy=True))

