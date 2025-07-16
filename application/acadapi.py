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

class AcademicRegisterAPI(Resource):
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
    'created_by': fields.Integer,
    'flag': fields.Boolean,
    'max_marks': fields.Integer
}

class ConceptAPI(Resource):
    @jwt_required()
    def get(self):
        try:
            concepts = Concept.query.all()
            if concepts:
                return marshal(concepts, concept_fields), 200
            else:
                return {"message": "No concept found."}, 404
        except SQLAlchemyError as e:
            return{"error": str(e)}, 500
        

    @jwt_required()
    def post(self):
                args = concept_parser.parse_args()
                module_id = args['module_id']
                name = args['name']
                description = args.get('description')
                date_str = args.get('date')
                live = args.get('live', False)
                max_marks = args.get('max_marks')
                current_user_id = get_jwt_identity()
                try:
                    existing_concept = Concept.query.filter_by(name=name).first()
                    if existing_concept:
                        return{"message": "Concept With this name already exists."}
                    
                    concept_date = datetime.strptime(date_str, "%d-%m-%Y").date()
                    acad_team_member = Acadteam.query.filter_by(user_id=current_user_id).first()
                    if not acad_team_member:
                        return{"message": "Academic team member is required for this action."}, 404
                    new_concept = Concept(
                        module_id=module_id,
                        name=name,
                        description=description,
                        date=concept_date,
                        live=live,
                        created_by=acad_team_member.id,
                        max_marks=max_marks
                    )
                    db.session.add(new_concept)
                    db.session.commit()
                    return {"message": "Concept created successfully."}, 200
                except SQLAlchemyError as e:
                    return{"error": str(e)}, 500


class ConceptResource(Resource):
    @jwt_required()
    def get(self, concept_id):
        try:
            concepts = Concept.query.get(concept_id)
            if concepts:
                return marshal(concepts, concept_fields), 200
            else:
                return {"message": "No concept found."}, 404
        except SQLAlchemyError as e:
            return{"error": str(e)}, 500   

    @jwt_required()
    def put(self, concept_id):
                args = concept_parser.parse_args()
                module_id = args['module_id']
                name = args['name']
                description = args.get('description')
                date_str = args.get('date')
                live = args.get('live', False)
                max_marks = args.get('max_marks')
                try:
                    concept = Concept.query.get(concept_id)
                    if not concept:
                        return{"message": "Concept not found."}
                    
                    concept_date = datetime.strptime(date_str, "%d-%m-%Y").date()
                    
                    concept.module_id = module_id
                    concept.name = name
                    concept.description = description
                    concept.date = concept_date
                    concept.live = live
                    concept.max_marks = max_marks
                    db.session.commit()
                    return {"message": "Concept updated successfully."}, 200
                except SQLAlchemyError as e:
                    return{"error": str(e)}, 500

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
            return{"error": str(e)}, 500           
         
question_parser = reqparse.RequestParser()
question_parser.add_argument('module_id', type=int, required=True, help='Module ID is required.')
question_parser.add_argument('concept_id', type=int, required=True, help='Concept ID is required.')
question_parser.add_argument('user_question_prefix', type=str, required=False, help='User input for new question id.')
question_parser.add_argument('age_group', type=str, required=False, help='Age group for the question.')
question_parser.add_argument('type', type=str, required=False, help='Type of question.')
question_parser.add_argument('question_statement', type=str, required=True, help='Question Statement is required.')
question_parser.add_argument('answers', type=str, required=True, help='Answers are required.')
question_parser.add_argument('approvals', type=str, required=False, help='Approval of question.')
question_parser.add_argument('rejections', type=str, required=False, help='Rejection of question.')
question_parser.add_argument('marks', type=int, required=True, help='Marks of the question is required.')
question_parser.add_argument('flag', type=bool, required=False, help='Flag of question.')
question_parser.add_argument('audio_url', type=str, required=False, help='Audio url for question.')
question_parser.add_argument('image_url', type=str, required=False, help='Image Url for question.')

question_fields={
    'id':fields.Integer,
    'new_question_id':fields.String,
    'user_question_prefix':fields.String,
    'module_id':fields.Integer,
    'concept_id':fields.Integer,
    'age_group':fields.String,
    'type':fields.String,
    'question_statement':fields.String,
    'answers':fields.String,
    'approvals':fields.String,
    'rejections':fields.String,
    'marks':fields.Integer,
    'flag':fields.Boolean,
    'audio_url':fields.String,
    'img_url':fields.String,
}

class QuestionAPI(Resource):
    @jwt_required()
    def get(self):
        try:
            questions = Question.query.all()
            if questions:
                return marshal(questions, question_fields), 200
            else:
                return {"message": "No question found."}, 404
        except SQLAlchemyError as e:
            return{"error": str(e)}, 500
        
    @jwt_required()
    def post(self):
        args = question_parser.parse_args()
        module_id = args['module_id']
        concept_id = args['concept_id']
        user_question_prefix = args.get('user_question_prefix')
        age_group = args.get('age_group')
        type = args.get('type')
        question_statement = args.get('question_statement')
        answers = args.get('answers')
        approvals = args.get('approvals')
        rejections = args.get('rejections')
        marks = args.get('marks')
        flag = args.get('flag', False)
        audio_url = args.get('audio_url')
        img_url = args.get('img_url')
        try:
            existing_question = Question.query.filter_by(question_statement=question_statement).first()
            if existing_question:
                return{"message": "This question already exists."}
            
            new_question = Question(
                module_id=module_id,
                concept_id=concept_id,
                user_question_prefix=user_question_prefix,
                age_group=age_group,
                type=type,
                question_statement=question_statement,
                answers=answers,
                approvals=approvals,
                rejections=rejections,
                marks=marks,
                flag=flag,
                audio_url=audio_url,
                img_url=img_url
            )
            db.session.add(new_question)
            db.session.commit()
            if user_question_prefix:
                new_question.new_question_id = f"{user_question_prefix}-{new_question.id}"
            else:
                new_question.new_question_id = str(new_question.id)
            db.session.commit()
            return {"message": "Question created successfully."}, 200
        except SQLAlchemyError as e:
            return{"error": str(e)}, 500


class QuestionResource(Resource):
    @jwt_required()
    def get(self, question_id):
        try:
            questions = Question.query.get(question_id)
            if questions:
                return marshal(questions, question_fields), 200
            else:
                return {"message": "No question found."}, 404
        except SQLAlchemyError as e:
            return{"error": str(e)}, 500
        
    @jwt_required()
    def put(self, question_id):
        args = question_parser.parse_args()
        module_id = args['module_id']
        concept_id = args['concept_id']
        user_question_prefix = args.get('user_question_prefix')
        age_group = args.get('age_group')
        type = args.get('type')
        question_statement = args.get('question_statement')
        answers = args.get('answers')
        approvals = args.get('approvals')
        rejections = args.get('rejections')
        marks = args.get('marks')
        flag = args.get('flag', False)
        audio_url = args.get('audio_url')
        img_url = args.get('img_url')
        try:
            questions = Question.query.get(question_id)
            if not questions:
                return{"message": "Question not found."}, 404
            
            questions.module_id = module_id
            questions.concept_id = concept_id
            questions.age_group = age_group
            questions.type = type
            questions.question_statement = question_statement
            questions.answers = answers
            questions.approvals = approvals
            questions.rejections = rejections
            questions.marks = marks
            questions.flag = flag
            questions.audio_url = audio_url
            questions.img_url = img_url
            update_prefix = args.get('user_question_prefix')
            if update_prefix is not None and update_prefix != questions.user_question_prefix:
                questions.user_question_prefix = update_prefix
                if questions.user_question_prefix:
                    questions.new_question_id = f"{questions.user_question_prefix}-{questions.id}"
                else:
                    questions.new_question_id = str(questions.id)
            db.session.commit()
            return {"message": "Question updated successfully."}, 200
        except SQLAlchemyError as e:
            return{"error": str(e)}, 500
        
    @jwt_required()
    def delete(self, question_id):
        try:
            questions = Question.query.get(question_id)
            if not questions:
                return {"message": "Question not found."}, 404
            
            db.session.delete(questions)
            db.session.commit()
            return {"message": "Question deleted successfully."}, 200
        except SQLAlchemyError as e:
            return{"error": str(e)}, 500 