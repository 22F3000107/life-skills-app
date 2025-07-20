from flask import jsonify, current_app
from flask_restful import Resource, request, reqparse, fields, marshal
from sqlalchemy.exc import SQLAlchemyError
from .models import db, User,roles_users,Acadteam, Role, Concept, Module, Question
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
import os
from sqlalchemy import func
from application.sec import datastore
import uuid
from datetime import datetime
import json

class AcademicRegisterAPI(Resource):
    def options(self):
        return {},200
    
    def post(self):
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        phone_number = data.get("phone_number")
        age=data.get("age")
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
                age=age,
                fs_uniquifier=str(uuid.uuid4()),
                roles=[academy_role]
            )

            db.session.commit()

            if qualification and discipline and institution:
                acadteam = Acadteam(
                    user_id=user.id,
                    qualification=qualification,
                    discipline=discipline,
                    institution=institution
                )
                db.session.add(acadteam)

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
        

    
module_parser = reqparse.RequestParser()
module_parser.add_argument('name', type=str,help='Module is required.', required=True)
module_parser.add_argument('description', type=str,help='Description is required.', required=True)

module_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String
}

class ModuleAPI(Resource):
    def options(self):
        return {},200
    
    @jwt_required()
    def get(self):
        try:
            modules = Module.query.all()
            if not modules:
                return {"message": "No modules found."}, 404

            module_data = []
            for mod in modules:
                approved = sum(1 for q in mod.questions if q.is_approved is True)
                rejected = sum(1 for q in mod.questions if q.is_approved is False)
                review = sum(1 for q in mod.questions if q.is_approved is None)
                concepts_count = len(mod.concepts)
                module_data.append({
                    "id": mod.id,
                    "name": mod.name,
                    "approved_count": approved,
                    "rejected_count": rejected,
                    "review_count": review,
                    "concepts_count": concepts_count,
                })

            return module_data, 200
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
            return {"message": "Internal server error."}, 500
        

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
            return {"message": "Internal server error."}, 500
        
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
            return {"message": "Internal server error."}, 500
        
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
            return {"message": "Internal server error."}, 500
        

concept_parser = reqparse.RequestParser()
concept_parser.add_argument('module_id', type=int, required=True, help='Module ID is required.')
concept_parser.add_argument('name', type=str, required=True, help='Concept name is required.')
concept_parser.add_argument('description', type=str, required=False, help='Concept description.')
concept_parser.add_argument('date', type=str, required=False, help='Date of concept creation.')
concept_parser.add_argument('live', type=bool, required=False, help='Is concept live?')
concept_parser.add_argument('max_marks', type=int, required=False, help='Maximum marks for a concept.')

concept_fields = {
    'id': fields.Integer,
    'module_id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'date': fields.DateTime(dt_format='iso8601'),
    'live': fields.Boolean,
    'created_by_id': fields.Integer,
    'updated_by_id': fields.Integer,
    'created_at': fields.DateTime(dt_format='iso8601'),
    'updated_at': fields.DateTime(dt_format='iso8601'),
    'flag': fields.Boolean,
    'max_marks': fields.Integer
}

class ConceptAPI(Resource):
    def options(self):
        return {},200
    
    @jwt_required()
    def get(self):
        try:
            concepts = Concept.query.all()
            if concepts:
                return marshal(concepts, concept_fields), 200
            else:
                return {"message": "No concept found."}, 404
        except SQLAlchemyError as e:
            return {"message": "Internal server error."}, 500
        

    @jwt_required()
    def post(self):
        args = concept_parser.parse_args()
        module_id = args['module_id']
        name = args['name']
        description = args.get('description')
        date = args.get('date')
        live = args.get('live', False)
        max_marks = args.get('max_marks')
        current_user_id = get_jwt_identity()

        try:
            if Concept.query.filter_by(name=name).first():
                return {"message": "Concept with this name already exists."}, 400

            concept_date = datetime.strptime(date, "%d-%m-%Y").date() if date else None

            acad_team_member = Acadteam.query.filter_by(user_id=current_user_id).first()
            if not acad_team_member:
                return {"message": "Academic team member is required for this action."}, 404

            new_concept = Concept(
                module_id=module_id,
                name=name,
                description=description,
                date=concept_date,
                live=live,
                max_marks=max_marks,
                created_by_id=current_user_id,
                updated_by_id=current_user_id
            )
            db.session.add(new_concept)
            db.session.commit()
            return {"message": "Concept created successfully."}, 201

        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": str(e)}, 500



class ConceptResource(Resource):
    def options(self):
        return {},200
    
    @jwt_required()
    def get(self, concept_id):
        try:
            concepts = Concept.query.get(concept_id)
            if concepts:
                return marshal(concepts, concept_fields), 200
            else:
                return {"message": "No concept found."}, 404
        except SQLAlchemyError as e:
            return {"message": "Internal server error."}, 500   

    @jwt_required()
    def put(self, concept_id):
        args = concept_parser.parse_args()
        module_id = args['module_id']
        name = args['name']
        description = args.get('description')
        date = args.get('date')
        live = args.get('live', False)
        max_marks = args.get('max_marks')
        current_user_id = get_jwt_identity()

        try:
            concept = Concept.query.get(concept_id)
            if not concept:
                return {"message": "Concept not found."}, 404

            concept_date = datetime.strptime(date, "%d-%m-%Y").date() if date else None

            concept.module_id = module_id
            concept.name = name
            concept.description = description
            concept.date = concept_date
            concept.live = live
            concept.max_marks = max_marks
            concept.updated_by_id = current_user_id
            db.session.commit()

            return {"message": "Concept updated successfully."}, 200

        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": str(e)}, 500


    @jwt_required()
    def delete(self, concept_id):
        try:
            concepts = Concept.query.get(concept_id)
            if not concepts:
                return {"message": "Concept not found."}, 404
            
            db.session.delete(concepts)
            db.session.commit()
            return {"message": "Concept deleted successfully."}, 200
        except SQLAlchemyError as e:
            return {"message": "Internal server error."}, 500           
         
question_parser = reqparse.RequestParser()
question_parser.add_argument('module_id', type=int, required=True, help='Module ID is required.')
question_parser.add_argument('concept_id', type=int, required=False, help='Assigned to the concept.')
question_parser.add_argument('question_id', type=int, required=False, help='Question id.')
question_parser.add_argument('age_group', type=str, action='append', required=False, help='Age group(s) for the question.')
question_parser.add_argument('type', type=str, required=False, help='Type of question.')
question_parser.add_argument('question_statement', type=str, required=True, help='Question Statement is required.')
question_parser.add_argument('answers', type=dict, action='append', required=True)
question_parser.add_argument('is_approved', type=bool, required=False, help='Approval of question.')
question_parser.add_argument('marks', type=int, required=True, help='Marks of the question is required.')
question_parser.add_argument('is_archived', type=bool, required=False, help='Archived?')
question_parser.add_argument('audio_url', type=str, required=False, help='Audio url for question.')
question_parser.add_argument('image_url', type=str, required=False, help='Image Url for question.')

answer_fields = {
    'text': fields.String,
    'correct': fields.Boolean,
    'submitted': fields.Boolean,
    'left': fields.String,
    'right': fields.String
}
question_fields = {
    'id': fields.Integer,
    'question_id': fields.Integer,
    'module_id': fields.Integer,
    'concept_id': fields.Integer,
    'age_group': fields.List(fields.String),
    'type': fields.String,
    'question_statement': fields.String,
    'answers': fields.List(fields.Nested(answer_fields)),
    'is_approved': fields.Boolean,
    'marks': fields.Integer,
    'is_archived': fields.Boolean,
    'audio_url': fields.String,
    'image_url': fields.String,
    'created_by_id': fields.Integer,
    'updated_by_id': fields.Integer,
    'module_name': fields.String(attribute=lambda q: q.module.name if q.module else None),
    'created_at': fields.DateTime(dt_format='iso8601'),
    'updated_at': fields.DateTime(dt_format='iso8601')
}



class QuestionAPI(Resource):
    def options(self):
        return {},200
    
    @jwt_required()
    def get(self):
        try:
            questions = Question.query.all()
            if questions:
                return marshal(questions, question_fields), 200
            else:
                return {"message": "No question found."}, 404
        except SQLAlchemyError as e:
            return {"message": "Internal server error."}, 500
            
    @jwt_required()
    def post(self):
        args = question_parser.parse_args()
        current_user_id = get_jwt_identity()
        
        try:
            answers = args.get('answers')
            if not isinstance(answers, list) or not all(isinstance(ans, dict) for ans in answers):
                return {"message": "Invalid format for 'answers'. Expected a list of JSON objects."}, 400

            new_question = Question(
                module_id=args['module_id'],
                concept_id=args['concept_id'],
                question_id=args.get('question_id'),
                age_group=args.get('age_group'),
                type=args.get('type'),
                question_statement=args.get('question_statement'),
                answers=answers,
                is_approved=args.get('is_approved'),
                marks=args.get('marks'),
                is_archived=args.get('is_archived', False),
                audio_url=args.get('audio_url'),
                image_url=args.get('image_url'),
                created_by_id=current_user_id,
                updated_by_id=current_user_id
            )
            db.session.add(new_question)
            db.session.commit()
            return {"message": "Question created successfully."}, 201

        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": str(e)}, 500

class QuestionResource(Resource):
    def options(self,question_id):
        return {},200
    
    @jwt_required()
    def get(self, question_id):
        try:
            questions = Question.query.get(question_id)
            if questions:
                return marshal(questions, question_fields), 200
            else:
                return {"message": "No question found."}, 404
        except SQLAlchemyError as e:
            return {"message": "Internal server error."}, 500
        
    @jwt_required()
    def put(self, question_id):
        args = question_parser.parse_args()
        current_user_id = get_jwt_identity()

        try:
            question = Question.query.get(question_id)
            if not question:
                return {"message": "Question not found."}, 404

            question.module_id = args['module_id']
            question.concept_id = args['concept_id']
            question.question_id = args.get('question_id')
            question.age_group = args.get('age_group')
            question.type = args.get('type')
            question.question_statement = args.get('question_statement')
            question.answers = args.get('answers')
            question.is_approved = args.get('is_approved')
            question.marks = args.get('marks')
            question.is_archived = args.get('is_archived', False)
            question.audio_url = args.get('audio_url')
            question.image_url = args.get('image_url')
            question.updated_by_id = current_user_id

            db.session.commit()
            return {"message": "Question updated successfully."}, 200

        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": str(e)}, 500
        
    @jwt_required()
    def patch(self, question_id):
        current_user_id = get_jwt_identity()

        try:
            question = Question.query.get(question_id)
            if not question:
                return {"message": "Question not found."}, 404

            question.is_archived = True
            question.updated_by_id = current_user_id
            db.session.commit()
            return {"message": "Question archived successfully."}, 200

        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": str(e)}, 500
        
class QuestionsByModuleAPI(Resource):
    def options(self,module_id):
        return {},200

    @jwt_required()
    def get(self, module_id):
        try:
            # Extract module ID from mcode (e.g., "M13001" → 1)
            
            module = Module.query.get(module_id)
            if not module:
                return {"message": "Module not found."}, 404

            questions = Question.query.filter_by(module_id=module.id).all()

            # Serialize questions
            question_data = []
            for q in questions:
                question_data.append({
                    "id": q.id,
                    "type": q.type,
                    "question_statement": q.question_statement,
                    "age_group": q.age_group,
                    "answers": q.answers,
                    "status": "Approved" if q.is_approved is True else
                              "Rejected" if q.is_approved is False else
                              "Pending",
                    "marks": q.marks,
                    "image_url": q.image_url,
                    "audio_url": q.audio_url,
                    "module_id": module_id, 
                })

            return {
    "module": {
        "id": module.id,
        "name": module.name
    },
    "questions": question_data
}, 200

        except SQLAlchemyError as e:
            return {"error": str(e)}, 500
