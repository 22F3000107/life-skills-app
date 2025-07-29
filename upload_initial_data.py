from main import app
from application.sec import datastore
from application.models import db, Role, Acadteam, Rewards
from flask_security import hash_password
from werkzeug.security import generate_password_hash
import uuid

with app.app_context():
    # db.create_all()
    # datastore.find_or_create_role(name="admin", description="User is an admin.")
    # datastore.find_or_create_role(name="academic", description="User is a member of academic team.")
    # datastore.find_or_create_role(name="user", description="User is a Student.")
    # db.session.commit()

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
            active=True)
        
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