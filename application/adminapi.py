from flask import jsonify, current_app
from flask_restful import Resource, request
from sqlalchemy.exc import SQLAlchemyError
from .models import db, User,roles_users,Acadteam
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
        
        access_token = create_access_token(identity=str(user.id))

        
        return {
            "access_token": access_token,
            "user_id": user.id,
            "roles": roles[0]
        }, 200
    
