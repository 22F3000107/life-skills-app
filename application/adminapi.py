from flask import jsonify, current_app
from flask_restful import Resource, request, reqparse, fields, marshal
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timedelta
from sqlalchemy import func

from .models import db, User,roles_users,Acadteam,Habit,Goal,Rewards,Scores,Quiz, QuizQuestion, Story,Module,QuizAttempt

from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
import os
from sqlalchemy import func
from application.sec import datastore
import uuid

class LoginAPI(Resource):

    def options(self):
        return {},200

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
        # if not user.active:
        #     return {"error": "Account is blocked."}, 403
        
        roles = [role.name for role in user.roles]
        
        access_token = create_access_token(identity=str(user.id))

        
        return {
            "access_token": access_token,
            "user_id": user.id,
            "roles": roles[0]
        }, 200
    


class AdminUsersAPI(Resource):
    @jwt_required()
    def get(self):
        users = User.query.all()
        return {"users": [
            {"id": u.id, "name": f"{u.first_name} {u.last_name}", "email": u.email, "roles": [role.name for role in u.roles] if u.roles else [], "active": u.active, "coins": getattr(u, "coins", 0), "tests": getattr(u, "tests", 0),"registered": u.registered.strftime("%Y-%m-%d") if u.registered else None}
            for u in users
        ]}, 200

class AdminBlockUserAPI(Resource):
    @jwt_required()
    def put(self, user_id):
        user = User.query.get(user_id)
        if user:
            user.active = False
            db.session.commit()
            return {"message": "User blocked"}, 200
        return {"error": "User not found"}, 404

class AdminUnblockUserAPI(Resource):
    @jwt_required()
    def put(self, user_id):
        user = User.query.get(user_id)
        if user:
            user.active = True
            db.session.commit()
            return {"message": "User unblocked"}, 200
        return {"error": "User not found"}, 404

class AdminDeleteUserAPI(Resource):
    @jwt_required()
    def delete(self, user_id):
        try:
            user = User.query.get(user_id)
            if not user:
                return {'message': 'User not found'}, 404

            # Manually delete entries linked to this user in acadteam
            Acadteam.query.filter_by(user_id=user_id).delete()

            db.session.delete(user)
            db.session.commit()
            return {'message': 'User deleted'}, 200
        except Exception as e:
            print("Delete error:", str(e))
            return {'error': 'Internal Server Error'}, 500

class AdminStoriesAPI(Resource):
    @jwt_required()
    def get(self):
        stories = Story.query.all()
        return [{
            "id": s.id,
            "title": s.title,
            "status": s.status,
            "created_by": s.created_by,
            "flag": s.flag,
            "flag_reason": s.flag_reason
        } for s in stories], 200


class AdminGetStoryAPI(Resource):
    @jwt_required()
    def get(self, story_id):
        story = Story.query.get(story_id)
        if not story:
            return {"error": "Story not found"}, 404

        return {
            "id": story.id,
            "title": story.title,
            "content": story.content,
            "created_by": story.created_by,
            "status": story.status,
            "flag": story.flag,
            "flag_reason": story.flag_reason
        }, 200



class AdminUpdateStoryAPI(Resource):
    @jwt_required()
    def put(self, story_id):
        payload = request.get_json(silent=True) or {}
        new_status = (payload.get("status") or "").strip().lower()

        allowed = {"draft", "published", "flagged"}
        if new_status not in allowed:
            return {"error": "Invalid status. Allowed: draft, published, flagged"}, 400

        story = Story.query.get(story_id)
        if story is None:
            return {"error": "Story not found"}, 404

        story.status = new_status
        db.session.commit()

        return {"message": "Story status updated", "id": story.id, "status": story.status}, 200
    
class AdminEditStoryAPI(Resource):
    @jwt_required()
    def put(self, story_id):
        data = request.get_json(silent=True) or {}
        title = data.get("title")
        content = data.get("content")

        if not title and not content:
            return {"error": "Provide at least one field to update (title or content)."}, 400

        story = Story.query.get(story_id)
        if not story:
            return {"error": "Story not found."}, 404

        if title:
            story.title = title
        if content:
            story.content = content

        db.session.commit()

        return {
            "message": "Story updated successfully.",
            "story": {
                "id": story.id,
                "title": story.title,
                "content": story.content,
                "status": story.status
            }
        }, 200



class AdminDeleteStoryAPI(Resource):
    @jwt_required()
    def delete(self, story_id):
        story = Story.query.get(story_id)
        if not story:
            return {"error": "Story not found"}, 404

        db.session.delete(story)
        db.session.commit()
        return {"message": "Story deleted successfully"}, 200


# ---------------- QUIZZES MANAGEMENT ----------------

class AdminQuizzesAPI(Resource):
    @jwt_required()
    def get(self):
        quizzes = Quiz.query.all()
        result = []

        for q in quizzes:
            quiz_data = {
                "id": q.id,
                "title": q.title,
                "skill": q.skill,
                "created_by": q.created_by,
                "status": q.status,
                "flag": q.flag,
                "flag_reason": q.flag_reason
            }
            result.append(quiz_data)

        return {"quizzes": result}, 200


class AdminCreateQuizAPI(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()
        title = data.get("title")
        skill = data.get("skill")

        if not title or not skill:
            return {"error": "Title and skill are required"}, 400

        quiz = Quiz(title=title, skill=skill, status="draft")
        db.session.add(quiz)
        db.session.commit()
        return {"message": "Quiz created successfully", "id": quiz.id}, 201


class AdminUpdateQuizAPI(Resource):
    @jwt_required()
    def put(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"error": "Quiz not found"}, 404

        data = request.get_json()
        quiz.title = data.get("title", quiz.title)
        quiz.skill = data.get("skill", quiz.skill)
        quiz.status = data.get("status", quiz.status)
        db.session.commit()
        return {"message": "Quiz updated successfully"}, 200


class AdminDeleteQuizAPI(Resource):
    @jwt_required()
    def delete(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"error": "Quiz not found"}, 404

        db.session.delete(quiz)
        db.session.commit()
        return {"message": "Quiz deleted successfully"}, 200


# ---------------- FLAGGED CONTENT ----------------

class AdminFlaggedContentAPI(Resource):
    @jwt_required()
    def get(self):
        flagged_stories = Story.query.filter_by(flag=True).all()
        flagged_quizzes = Quiz.query.filter_by(flag=True).all()

        return {
            "flagged_stories": [
                {
                    "id": s.id,
                    "title": s.title,
                    "flagged_by": None,
                    "reason": s.flag_reason,
                    "status": s.status if hasattr(s, "status") else "flagged",
                    "type": "story"
                } for s in flagged_stories
            ],
            "flagged_quizzes": [
                {
                    "id": q.id,
                    "title": q.title,
                    "flagged_by": None,
                    "reason": q.flag_reason,
                    "status": q.status if hasattr(q, "status") else "flagged",
                    "type": "quiz"
                } for q in flagged_quizzes
            ]
        }, 200


class AdminUnflagContentAPI(Resource):
    @jwt_required()
    def put(self, content_type, content_id):
        model = None
        if content_type == "story":
            model = Story
        elif content_type == "quiz":
            model = Quiz
        elif content_type == "question":
            model = QuizQuestion
        else:
            return {"error": "Invalid content type"}, 400

        content = model.query.get(content_id)
        if not content:
            return {"error": f"{content_type.capitalize()} not found"}, 404

        content.flag = False
        content.flag_reason = None
        db.session.commit()
        return {"message": f"{content_type.capitalize()} unflagged successfully"}, 200


class AdminDeleteFlaggedContentAPI(Resource):
    @jwt_required()
    def delete(self, content_type, content_id):
        model = None
        if content_type == "story":
            model = Story
        elif content_type == "quiz":
            model = Quiz
        elif content_type == "question":
            model = QuizQuestion
        else:
            return {"error": "Invalid content type"}, 400

        content = model.query.get(content_id)
        if not content:
            return {"error": f"{content_type.capitalize()} not found"}, 404

        db.session.delete(content)
        db.session.commit()
        return {"message": f"{content_type.capitalize()} deleted successfully"}, 200


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
        


class AdminStatsAPI(Resource):
    @jwt_required()
    def get(self):
        total_users = User.query.count()
        total_quizzes = Quiz.query.count()

        flagged_stories = Story.query.filter_by(flag=True).count()
        flagged_quizzes = Quiz.query.filter_by(flag=True).count()
        flagged_items = flagged_stories + flagged_quizzes

        stories_added = Story.query.filter(Story.status.in_(["draft", "published"])).count()
        academic_members = Acadteam.query.count()

        return {
            "total_users": total_users,
            "total_quizzes": total_quizzes,
            "flagged_items": flagged_items,
            "stories_added": stories_added,
            "academic_members": academic_members
        }, 200

class AdminStatsOverviewAPI(Resource):
    @jwt_required()
    def get(self):
        users = User.query.count()
        academics = Acadteam.query.count()
        quizzes = Quiz.query.count()
        stories = Story.query.count()

        return {
            "users": users-1,
            "academics": academics,
            "quizzes": quizzes,
            "stories": stories
        }, 200


class AdminQuizAttemptsAPI(Resource):
    @jwt_required()
    def get(self):
        time_range = request.args.get("range", "Week")
        now = datetime.utcnow()

        labels, data = [], []

        if time_range == "Day":
            labels = [f"{hour}:00" for hour in range(24)]
            start_time = now.replace(hour=0, minute=0, second=0, microsecond=0)
            attempts = db.session.query(
                func.extract('hour', QuizAttempt.attempted_on).label('hour'),
                func.count(QuizAttempt.id)
            ).filter(QuizAttempt.attempted_on >= start_time).group_by('hour').all()
            data = [0]*24
            for hour, count in attempts:
                data[int(hour)] = count

        elif time_range == "Week":
            labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            start_time = now - timedelta(days=now.weekday())
            attempts = db.session.query(
                func.extract('dow', QuizAttempt.attempted_on).label('day'),
                func.count(QuizAttempt.id)
            ).filter(QuizAttempt.attempted_on >= start_time).group_by('day').all()
            data = [0]*7
            for day, count in attempts:
                data[int(day)] = count

        elif time_range == "Month":
            labels = [str(i) for i in range(1, 32)]
            start_time = now.replace(day=1)
            attempts = db.session.query(
                func.extract('day', QuizAttempt.attempted_on).label('day'),
                func.count(QuizAttempt.id)
            ).filter(QuizAttempt.attempted_on >= start_time).group_by('day').all()
            data = [0]*31
            for day, count in attempts:
                data[int(day)-1] = count

        elif time_range == "Year":
            labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            start_time = now.replace(month=1, day=1)
            attempts = db.session.query(
                func.extract('month', QuizAttempt.attempted_on).label('month'),
                func.count(QuizAttempt.id)
            ).filter(QuizAttempt.attempted_on >= start_time).group_by('month').all()
            data = [0]*12
            for month, count in attempts:
                data[int(month)-1] = count

        return {"labels": labels, "data": data}, 200
    
class AdminSkillEngagementAPI(Resource):
    @jwt_required()
    def get(self):
        results = db.session.query(
            Quiz.skill,
            func.count(QuizAttempt.id)
        ).join(Quiz, QuizAttempt.quiz_id == Quiz.id)\
         .group_by(Quiz.skill).all()

        skills = [row[0] for row in results]
        counts = [row[1] for row in results]

        return {"skills": skills, "counts": counts}, 200
    