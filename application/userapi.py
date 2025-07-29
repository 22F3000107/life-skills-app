from flask import jsonify, current_app
from flask_restful import Resource, request
from sqlalchemy.exc import SQLAlchemyError
from .models import db, User,roles_users,Acadteam,Habit,Goal,Rewards,Scores,Quiz, QuizQuestion
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
import os
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func, select
from application.sec import datastore
import uuid
from datetime import datetime, date
import json
from sqlalchemy import text
class RegisterAPI(Resource):
    def post(self):
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        phone_number = data.get("phone_number")
        age = data.get("age")
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
            age=age,
            roles=[user_role],
            fs_uniquifier=str(uuid.uuid4())
        )
        db.session.commit()

        return {
            "message": "User registered successfully.",
            "user_id": user.id,
            "email": user.email
        }, 201


class UserProfile(Resource):
    @jwt_required()
    def get(self):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return {"message": "User not found"}, 404

        rewards = user.rewards
        habits_today = Habit.query.filter_by(user_id=user.id, date=date.today()).all()
        user_profile = {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email
        }
        return user_profile, 200


class TodayHabits(Resource):
    @jwt_required()
    def get(self):
        current_user_id = get_jwt_identity()
        habits = Habit.query.filter_by(user_id=current_user_id, date=date.today()).all()
        habits_data = [{"name": h.name, "completed": h.completed} for h in habits]
        return {"habits": habits_data}, 200


class SubmitHabits(Resource):
    @jwt_required()
    def post(self):
        current_user_id = get_jwt_identity()
        data = request.get_json()

        habits = data.get("habits", [])
        if not habits or not isinstance(habits, list):
            return {"error": "Invalid or missing habits data."}, 400

        completed_count = 0
        for habit_data in habits:
            name = habit_data.get("name")
            completed = habit_data.get("completed", False)

            if not name:
                continue  

            habit = Habit.query.filter_by(
                user_id=current_user_id,
                name=name,
                date=date.today()
            ).first()

            if habit:
                habit.completed = completed
            else:
                habit = Habit(
                    user_id=current_user_id,
                    name=name,
                    completed=completed,
                    date=date.today()
                )
                db.session.add(habit)

            if completed:
                completed_count += 1

        rewards = Rewards.query.filter_by(user_id=current_user_id).first()
        if not rewards:
            rewards = Rewards(user_id=current_user_id, coins=0, streak=0)
            db.session.add(rewards)

        rewards.coins = rewards.coins or 0
        rewards.streak = rewards.streak or 0

        coins_awarded = completed_count * 10
        rewards.coins += coins_awarded

        db.session.commit()

        return {
            "message": "Habits submitted successfully.",
            "reward_earned": completed_count > 0,
            "coins_awarded": coins_awarded
        }, 200


class WeeklyGoals(Resource):
    @jwt_required()
    def get(self):
        current_user_id = get_jwt_identity()
        goals = Goal.query.filter_by(user_id=current_user_id).all()
        goals_data = [
            {
                "id": g.id,
                "text": g.text,
                "status": g.status,
                "due_date": g.due_date.strftime("%Y-%m-%d")
            }
            for g in goals
        ]
        return {"goals": goals_data}, 200


class AddGoal(Resource):
    @jwt_required()
    def post(self):
        current_user_id = get_jwt_identity()
        data = request.get_json()
        new_goal = Goal(
            user_id=current_user_id,
            text=data["text"],
            due_date=date.fromisoformat(data["due_date"])
        )
        db.session.add(new_goal)
        db.session.commit()
        return {
            "message": "Goal added successfully.",
            "goal_id": new_goal.id
        }, 201

class UpdateGoalStatus(Resource):
    @jwt_required()
    def put(self, goal_id):
        current_user_id = get_jwt_identity()
        current_app.logger.debug(f"Updating goal {goal_id} for user {current_user_id}")
        goal = Goal.query.filter_by(id=goal_id, user_id=current_user_id).first()
        if not goal:
            return {"error": "Goal not found"}, 404

        data = request.get_json() or {}
        new_status = data.get("status")

        if new_status not in ("done", "active"):
            return {"error": "Invalid status. Allowed: 'done' or 'active'."}, 400

        goal.status = new_status
        db.session.commit()
        return {"message": "Goal marked as done."}, 200
    

class QuizListAPI(Resource):
    @jwt_required()
    def get(self):
        quizzes = Quiz.query.all()
        quiz_list = []
        for quiz in quizzes:
            question_count = db.session.query(QuizQuestion).filter_by(quiz_id=quiz.id).count()
            quiz_list.append({
                "id": quiz.id,
                "title": quiz.title,
                "skill": quiz.skill,
                "questions": question_count
            })
        return {"quizzes": quiz_list}, 200


class QuizDetailAPI(Resource):
    @jwt_required()
    def get(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"error": "Quiz not found"}, 404

        rows = db.session.execute(
            text("SELECT id, question, options FROM quiz_question WHERE quiz_id = :quiz_id"),
            {"quiz_id": quiz_id}
        ).mappings().all()

        questions_data = []
        for row in rows:
            try:
                opts = json.loads(row["options"])
            except Exception:
                opts = [row["options"]]
            questions_data.append({
                "id": row["id"],
                "question": row["question"],
                "options": opts
            })

        return {
            "quiz_id": quiz.id,
            "title": quiz.title,
            "questions": questions_data
        }, 200


class QuizSubmitAPI(Resource):
    @jwt_required()
    def post(self, quiz_id):
        data = request.get_json()
        answers = data.get("answers", [])

        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"message": "Quiz not found"}, 404

        questions = quiz.questions
        max_score = len(questions)
        score = 0

        for idx, question in enumerate(questions):
            if idx < len(answers) and answers[idx] == question.correct_answer:
                score += 1

        feedback = "Excellent!" if score == max_score else "Good job!" if score >= max_score // 2 else "Keep practicing!"
        coins_awarded = score * 5

        user_id = get_jwt_identity()
        rewards = Rewards.query.filter_by(user_id=user_id).first()
        if rewards:
            rewards.coins += coins_awarded
        else:
            rewards = Rewards(user_id=user_id, coins=coins_awarded)
            db.session.add(rewards)

        db.session.commit()

        return {
            "score": score,
            "max_score": max_score,
            "feedback": feedback,
            "coins_awarded": coins_awarded
        }, 200


    

class UserSkillSummaryAPI(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        rewards = Rewards.query.filter_by(user_id=user_id).first()
        coins = rewards.coins if rewards else 0
        streak = rewards.streak if rewards else 0
        habits_today = Habit.query.filter_by(user_id=user_id, completed=True).count()
        # replace with actual skill data retrieval logic
        skills = [
            {
                "name": "Healthy Habits",
                "current": 85,
                "previous": 70,
                "feedback": "Improved from last quiz!"
            },
            {
                "name": "Emotional Intelligence",
                "current": 60,
                "previous": 68,
                "feedback": "Slight drop, let’s review again!"
            }
        ]

        return {
            "skills": skills,
            "overall": {
                "current": 72,
                "previous": 69
            },
            "coins": coins,
            "tests_taken": 5, 
            "current_streak": streak,
            "habits_completed_today": habits_today
        }, 200

class ChangePasswordAPI(Resource):
    @jwt_required()
    def put(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        new_password = data.get("new_password")
        user = User.query.get(user_id)
        if not user:
            return {"error": "User not found"}, 404
        user.password = generate_password_hash(new_password)
        db.session.commit()
        return {"message": "Password updated successfully"}, 200
