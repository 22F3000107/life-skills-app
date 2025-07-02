from flask import jsonify, current_app
from flask_restful import Resource, request
from sqlalchemy.exc import SQLAlchemyError
from .models import db, User,roles_users,Acedteam
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
import os
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func
from application.sec import datastore
import uuid

class LoginAPI(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return {"error": "Missing email or password"}, 400
        
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return {"error": "Invalid credentials"}, 401
        
        if not user.check_password(password):
            return {"error": "Invalid credentials"}, 401
        
        roles = [role.name for role in user.roles]
        
        access_token = create_access_token(identity={
            "id": user.id,
            "email": user.email,
            "roles": roles
        })
        
        return {
            "access_token": access_token,
            "user_id": user.id,
            "roles": roles[0]
        }, 200
    
class RegisterAPI(Resource):
    def post(self):
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        phone_number = data.get("phone_number")

        if not all([email, password, first_name, last_name, phone_number]):
            return {"error": "All fields are required."}, 400

        if datastore.find_user(email=email):
            return {"error": "Email already registered."}, 409

        user_role = datastore.find_or_create_role(name="user")
        user = datastore.create_user(
            email=email,
            password=generate_password_hash(password),
            first_name=first_name,
            last_name=last_name,
            phone_number=phone_number,
            roles=[user_role],
            fs_uniquifier=str(uuid.uuid4())
        )
        db.session.commit()

        return {
            "message": "User registered successfully.",
            "user_id": user.id,
            "email": user.email
        }, 201


class AcademyRegisterAPI(Resource):
    def post(self):
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        phone_number = data.get("phone_number")
        qualification = data.get("qualification")
        discipline = data.get("discipline")
        institution = data.get("institution")

        if not email or not password:
            return {"error": "Email and password are required"}, 400

        if datastore.find_user(email=email):
            return {"error": "User already exists"}, 400

        try:
            academy_role = datastore.find_or_create_role(name="academic")

            user = datastore.create_user(
                email=email,
                password=generate_password_hash(password),
                first_name=first_name,
                last_name=last_name,
                phone_number=phone_number,
                fs_uniquifier=str(uuid.uuid4()),
                roles=[academy_role]
            )

            db.session.commit()

            if qualification and discipline and institution:
                acedteam = Acedteam(
                    user_id=user.id,
                    qualification=qualification,
                    discipline=discipline,
                    institution=institution
                )
                db.session.add(acedteam)

            db.session.commit()

            return {
                "message": "Academy registered successfully",
                "user_id": user.id,
                "email": user.email,
                "role": "academic"
            }, 201

        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": str(e)}, 500