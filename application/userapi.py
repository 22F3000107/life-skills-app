from flask import jsonify, current_app
from flask_restful import Resource, request
from sqlalchemy.exc import SQLAlchemyError
from .models import db, User,roles_users,Acadteam,Habit,Goal,Rewards,Scores,Quiz, QuizQuestion, QuizAttempt, Story, Concept, Question
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
import os
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func, select
from application.sec import datastore
import uuid
from datetime import datetime, date, timedelta
import json, pickle
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
        try:
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            if not user:
                return {"message": "User not found"}, 404

            # Compose full name
            name = f"{user.first_name} {user.last_name}"

            # Use age directly from User model
            age = user.age

            # Get rewards info (coins, streak)
            rewards = user.rewards
            coins = rewards.coins if rewards else 0
            streak = rewards.streak if rewards else 0

            # Count habits completed today for this user
            habits_completed_today = Habit.query.filter_by(user_id=user.id, completed=True, date=date.today()).count()

            user_profile = {
                "name": name,
                "age": age,
                "coins": coins,
                "streak": streak,
                "habitsCompletedToday": habits_completed_today,
                "email": user.email
            }
            return user_profile, 200
        except Exception as e:
            print(f"Error in UserProfile.get: {e}")
            return {"message": "Internal Server Error"}, 500



class TodayHabits(Resource):
    @jwt_required()
    def get(self):
        current_user_id = get_jwt_identity()

        habits = Habit.query.filter_by(user_id=current_user_id, date=date.today()).all()

        if not habits:
            concept = Concept.query.filter(func.lower(Concept.name) == "healthy habits").first()
            if concept:
                questions = Question.query.filter_by(
                    concept_id=concept.id,
                    is_approved=True,
                    is_archived=False
                ).all()

                if questions:
                    for q in questions:
                        new_habit = Habit(
                            user_id=current_user_id,
                            name = q.question_statement.strip() if q.question_statement else None,
                            completed=False,
                            date=date.today()
                        )
                        db.session.add(new_habit)
                    db.session.commit()

                    habits = Habit.query.filter_by(user_id=current_user_id, date=date.today()).all()

        habits_data = [{"name": h.name, "completed": h.completed} for h in habits]
        return {"habits": habits_data}, 200


class SubmitHabits(Resource):
    @jwt_required()
    def post(self):
        current_user_id = get_jwt_identity()
        data = request.get_json()

        habits_list = data.get("habits", [])
        if not habits_list or not isinstance(habits_list, list):
            return {"error": "Invalid or missing habits data."}, 400

        completed_count = 0

        # Update or create today's habits
        for habit_data in habits_list:
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
                db.session.add(Habit(
                    user_id=current_user_id,
                    name=name,
                    completed=completed,
                    date=date.today()
                ))

            if completed:
                completed_count += 1

        # Fetch or create rewards record
        rewards = Rewards.query.filter_by(user_id=current_user_id).first()
        if not rewards:
            rewards = Rewards(user_id=current_user_id, coins=0, streak=0, last_completed_date=None)
            db.session.add(rewards)

        # Coin calculation
        coins_awarded = completed_count * 10
        rewards.coins = (rewards.coins or 0) + coins_awarded

        # Streak logic — only if ALL habits are completed today
        total_habits_today = Habit.query.filter_by(user_id=current_user_id, date=date.today()).count()
        if total_habits_today > 0 and completed_count == total_habits_today:
            # Check if yesterday was last streak date (continuous)
            if rewards.last_completed_date == date.today() - timedelta(days=1):
                rewards.streak += 1
            else:
                rewards.streak = 1  # reset to 1
            rewards.last_completed_date = date.today()

        db.session.commit()

        return {
            "message": "Habits submitted successfully.",
            "reward_earned": completed_count > 0,
            "coins_awarded": coins_awarded,
            "streak": rewards.streak
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
                "questions": question_count,
                "status": quiz.status,   #  status
                "flag": quiz.flag        #  flag
            })
        return {"quizzes": quiz_list}, 200


class QuizDetailAPI(Resource):
    @jwt_required()
    def get(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"error": "Quiz not found"}, 404

        if quiz.flag:  # If flagged, lock it
            return {"error": "This quiz is currently unavailable."}, 403

        questions = QuizQuestion.query.filter_by(quiz_id=quiz_id).all()

        questions_data = []
        for q in questions:
            options_text = [opt['text'] if isinstance(opt, dict) else str(opt) for opt in q.options]
            questions_data.append({
                "id": q.id,
                "question": q.question,
                "options": options_text,
                "hint": q.hint or "",
                "correct_answer": q.correct_answer
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

        questions = quiz.quiz_questions
        max_score = len(questions)
        correct_count = 0

        for idx, question in enumerate(questions):
            if idx < len(answers) and answers[idx] == question.correct_answer:
                correct_count += 1

        marks = correct_count * 10  # 10 marks per correct answer
        feedback = (
            "Excellent!" if correct_count == max_score else
            "Good job!" if correct_count >= max_score // 2 else
            "Keep practicing!"
        )
        coins_awarded = correct_count * 5

        user_id = get_jwt_identity()

        # Update rewards
        rewards = Rewards.query.filter_by(user_id=user_id).first()
        if rewards:
            rewards.coins += coins_awarded
        else:
            rewards = Rewards(user_id=user_id, coins=coins_awarded)
            db.session.add(rewards)

        # Save quiz attempt with score only
        attempt = QuizAttempt(
            user_id=user_id,
            quiz_id=quiz_id,
            score=marks
        )
        db.session.add(attempt)

        db.session.commit()

        return {
            "score": marks,
            "max_score": max_score * 10,
            "feedback": feedback,
            "coins_awarded": coins_awarded
        }, 200


class UserSkillSummaryAPI(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()

        # Get rewards info
        rewards = Rewards.query.filter_by(user_id=user_id).first()
        coins = rewards.coins if rewards else 0
        streak = rewards.streak if rewards else 0
        habits_today = Habit.query.filter_by(user_id=user_id, completed=True).count()

        # Get all quiz attempts by user, join with quiz to get skill
        attempts = (
            db.session.query(QuizAttempt, Quiz.skill)
            .join(Quiz, QuizAttempt.quiz_id == Quiz.id)
            .filter(QuizAttempt.user_id == user_id)
            .all()
        )

        # Aggregate attempts by skill
        skill_scores = {}
        for attempt, skill in attempts:
            if skill not in skill_scores:
                skill_scores[skill] = []
            skill_scores[skill].append(attempt.score)

        
        skills_summary = []
        for skill, scores in skill_scores.items():
            mid = len(scores) // 2
            previous_avg = sum(scores[:mid]) / max(mid, 1)
            current_avg = sum(scores[mid:]) / max(len(scores) - mid, 1)
            feedback = "Improved from last quiz!" if current_avg > previous_avg else \
                       "Slight drop, let’s review again!" if current_avg < previous_avg else \
                       "Same as before, keep practicing!"

            skills_summary.append({
                "name": skill,
                "current": round(current_avg),
                "previous": round(previous_avg),
                "feedback": feedback
            })

        tests_taken = len(attempts)

        # Overall percentage can be computed across all attempts
        all_scores = [a.score for a, _ in attempts]
        overall_current = round(sum(all_scores) / max(len(all_scores), 1)) if all_scores else 0
        overall_previous = overall_current  # Simplification; adjust as needed

        return {
            "skills": skills_summary,
            "overall": {
                "current": overall_current,
                "previous": overall_previous
            },
            "coins": coins,
            "tests_taken": tests_taken,
            "current_streak": streak,
            "habits_completed_today": habits_today
        }, 200


class ChangePasswordAPI(Resource):
    @jwt_required()
    def put(self):
        user_id = get_jwt_identity()
        data = request.get_json()

        old_password = data.get("old_password")
        new_password = data.get("new_password")

        if not old_password or not new_password:
            return {"error": "Old and new passwords are required"}, 400

        user = User.query.get(user_id)
        if not user:
            return {"error": "User not found"}, 404

        # Verify old password
        if not user.check_password(old_password):
            return {"error": "Old password does not match"}, 400

        # Update password securely
        user.set_password(new_password)
        db.session.commit()

        return {"message": "Password updated successfully"}, 200
    

class StoriesListAPI(Resource):
    @jwt_required()
    def get(self):
        # Query all published stories
        stories = Story.query.filter_by(status="published").all()

        # Serialize to list of dicts
        stories_data = []
        for story in stories:
            stories_data.append({
                "id": story.id,
                "title": story.title,
                "content": story.content,
                "skill": story.skill,  # if you have a skill field
            })

        return jsonify({"stories": stories_data})