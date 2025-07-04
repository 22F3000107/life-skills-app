from flask import jsonify, current_app
from flask_restful import Resource, request
from sqlalchemy.exc import SQLAlchemyError
from .models import db, User,roles_users,Acadteam,Habit,Goal,Rewards,Scores
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
import os
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func
from application.sec import datastore
import uuid
from datetime import datetime, date

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
            "id": user.id,
            "name": f"{user.first_name} {user.last_name}",
            "age": user.age,
            "email": user.email,
            "coins": rewards.coins if rewards else 0,
            "streak": rewards.streak if rewards else 0,
            "habitsCompletedToday": sum(1 for h in habits_today if h.completed)
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
        goal = Goal.query.filter_by(id=goal_id, user_id=current_user_id).first()
        if not goal:
            return {"error": "Goal not found"}, 404

        data = request.get_json()
        goal.status = data.get("status", goal.status)
        db.session.commit()

        return {"message": "Goal marked as done."}, 200
