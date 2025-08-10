from flask import jsonify, current_app
from flask_restful import Resource, request, reqparse, fields, marshal
from sqlalchemy.exc import SQLAlchemyError
from .models import db, User,roles_users,Acadteam, Role, Concept, Module, Question, Story, Quiz, QuizQuestion
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
question_parser.add_argument('question_id', type=int, required=False, help='Question id.')
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
    'question_id':fields.Integer,
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
        question_id = args.get('question_id')
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
                question_id=question_id,
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
        parent_question_id = args.get('question_id')
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
            questions.question_id= parent_question_id
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
        
#Deepak Kumar
#SE May 34
#Soft Engg Project May 2025
#Acadapi.py

class AcademicCreateStoryAPI(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()
        
        title = data.get("title")
        skill = data.get("skill")
        content = data.get("content")
        created_by = data.get("createdBy")

        if not title or not skill or not content:
            return {"error": "Missing required fields"}, 400
        
        try:
            story = Story(
                title=title,
                skill=skill,
                content=content,
                created_by=created_by
            )
            db.session.add(story)
            db.session.commit()

            return {"message": "Story created successfully", "id": story.id}, 201
        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": str(e)}, 500

class AcademicStoryListAPI(Resource):
    @jwt_required()
    def get(self):
        try:
            stories = Story.query.all()
            result = [
                {
                    "id": s.id,
                    "title": s.title,
                    "skill": s.skill,
                    "created_by": s.created_by,
                    "status": s.status
                }
                for s in stories
            ]
            return {"stories": result}, 200
        except SQLAlchemyError as e:
            return {"error": str(e)}, 500

class AcademicCreateQuizAPI(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()  # logged in user id from token
        data = request.get_json(silent=True) or {}

        title = data.get("title", "").strip()
        skill = data.get("skill", "").strip()
        questions_data = data.get("questions", [])

        if not title or not skill or not questions_data:
            return {"error": "Title, skill and questions are required"}, 400

        # Create new quiz object
        new_quiz = Quiz(
            title=title,
            skill=skill,
            created_by=user_id,
            status="draft",  # created quizzes start as draft
            flag=False
        )
        db.session.add(new_quiz)
        db.session.flush()  # flush to get new_quiz.id

        # Create QuizQuestion entries
        for q in questions_data:
            question_text = q.get("question", "").strip()
            options = q.get("options", [])
            correct_answer = q.get("correct_answer")
            hint = q.get("hint", "").strip() 

            if not question_text or not options or correct_answer is None:
                db.session.rollback()
                return {"error": "Each question requires question text, options and correct answer"}, 400

            if not isinstance(options, list) or len(options) < 2:
                db.session.rollback()
                return {"error": "Options must be a list with at least two items"}, 400

            quiz_question = QuizQuestion(
                quiz_id=new_quiz.id,
                question=question_text,
                options=options,
                correct_answer=correct_answer,
                hint=hint if hint else None  
            )
            db.session.add(quiz_question)

        db.session.commit()

        return {"message": "Quiz created successfully", "quiz_id": new_quiz.id}, 201
    
class AcademicQuizzesAPI(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        quizzes = Quiz.query.filter_by(created_by=user_id).all()

        return [
            {
                "id": q.id,
                "title": q.title,
                "skill": q.skill,
                "status": q.status,
                "flag": q.flag
            }
            for q in quizzes
        ], 200

class AcademicQuizDetailAPI(Resource):
    @jwt_required()
    def get(self, quiz_id):
        user_id = get_jwt_identity()
        quiz = Quiz.query.filter_by(id=quiz_id, created_by=user_id).first()
        if not quiz:
            return {"error": "Quiz not found or access denied"}, 404

        return {
            "id": quiz.id,
            "title": quiz.title,
            "skill": quiz.skill,
            "status": quiz.status,
            "flag": quiz.flag,
            "questions": [
                {
                    "id": q.id,
                    "question": q.question,
                    "options": q.options,
                    "correct_answer": q.correct_answer
                }
                for q in quiz.questions
            ]
        }, 200

class AcademicUpdateQuizAPI(Resource):
    @jwt_required()
    def put(self, quiz_id):
        user_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}

        quiz = Quiz.query.filter_by(id=quiz_id, created_by=user_id).first()
        if not quiz:
            return {"error": "Quiz not found or access denied"}, 404

        title = data.get("title", "").strip()
        skill = data.get("skill", "").strip()
        questions_data = data.get("questions", [])

        if not title or not skill or not questions_data:
            return {"error": "Title, skill and questions are required"}, 400

        # Update quiz fields
        quiz.title = title
        quiz.skill = skill

        # Delete existing questions
        QuizQuestion.query.filter_by(quiz_id=quiz.id).delete()

        # Add new questions
        for q in questions_data:
            question_text = q.get("question", "").strip()
            options = q.get("options", [])
            correct_answer = q.get("correct_answer")

            if not question_text or not options or correct_answer is None:
                db.session.rollback()
                return {"error": "Each question requires question text, options and correct answer"}, 400

            quiz_question = QuizQuestion(
                quiz_id=quiz.id,
                question=question_text,
                options=options,
                correct_answer=correct_answer
            )
            db.session.add(quiz_question)

        db.session.commit()
        return {"message": "Quiz updated successfully"}, 200

class AcademicDeleteQuizAPI(Resource):
    @jwt_required()
    def delete(self, quiz_id):
        user_id = get_jwt_identity()
        quiz = Quiz.query.filter_by(id=quiz_id, created_by=user_id).first()
        if not quiz:
            return {"error": "Quiz not found or access denied"}, 404

        # Delete all quiz questions first
        QuizQuestion.query.filter_by(quiz_id=quiz.id).delete()
        db.session.delete(quiz)
        db.session.commit()

        return {"message": "Quiz deleted successfully"}, 200





