from flask import jsonify, current_app
from flask_restful import Resource, request, reqparse, fields, marshal
from sqlalchemy.exc import SQLAlchemyError

from flask_security import roles_required, auth_required, current_user

from .models import db, User,roles_users,Acadteam, Module
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
import os
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
    
module_parser = reqparse.RequestParser()
module_parser.add_argument('name', type=str,help='Module is required.', required=True)
module_parser.add_argument('description', type=str,help='Description is required.', required=True)

module_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String
}
class ModuleAPI(Resource):
    @jwt_required()
    def get(self):
        try:
            modules = Module.query.all()
            if modules:
                return marshal(modules, module_fields), 200
            else:
                return {"message": "No modules found."}, 404
        except SQLAlchemyError as e:
            return {"error": str(e)}, 500

    @jwt_required()   
    def post(self):

        args = module_parser.parse_args()
        name = args['name']
        description = args['description']

        try:
            existing_module = Module.query.filter_by(name=name).first()
            if existing_module:
                return{"message": "Module with this name already exists."}, 409
            new_module = Module(name=name, description=description)
            db.session.add(new_module)
            db.session.commit()
            return{"message": "Module created successfully."}, 201
        except SQLAlchemyError as e:
            #db.session.rollback()
            return{"error": str(e)}, 500
        

class ModuleResource(Resource):
    @jwt_required()
    def get(self, module_id):
        try:
            module = Module.query.get(module_id)
            if module:
                return marshal(module, module_fields), 200
            else:
                return{"message": "Module not found."}, 404
        except SQLAlchemyError as e:
            return{"error": str(e)}, 500
        
    @jwt_required()
    def put(self, module_id):
        args = module_parser.parse_args()
        name = args['name']
        description = args['description']

        try:
            module = Module.query.get(module_id)
            if not module:
                return{"message": "Module not found."}, 404
            if module.name != name:
                existing_module = Module.query.filter_by(name=name).first()
                if existing_module and existing_module.id != module_id:
                    return{"message": "Another module with this name already exists."}
            module.name = name
            module.description = description
            db.session.commit()
            return{"message": "Module updated successfully"}, 200
        except SQLAlchemyError as e:
            #db.session.rollback()
            return{"error": str(e)}, 500
        
    @jwt_required()
    def delete(self, module_id):
        try:
            module = Module.query.get(module_id)
            if not module:
                return{"message": "Module not found"}, 404
            db.session.delete(module)
            db.session.commit()
            return{"message": "Module deleted successfully."}, 200
        except SQLAlchemyError as e:
            #db.session.rollback()
            return{"error": str(e)}, 500
        
