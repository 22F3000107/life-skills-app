from flask_restful import Resource, Api
from .models import User,db
from flask_security import roles_required,auth_required, current_user
from .instances import cache
from .adminapi import LoginAPI
from .acadapi import AcademicRegisterAPI
from .userapi import RegisterAPI, UserProfile,TodayHabits, SubmitHabits, WeeklyGoals, AddGoal, UpdateGoalStatus

api = Api(prefix='/api')
api.add_resource(LoginAPI, '/login')
api.add_resource(RegisterAPI, '/register/user')
api.add_resource(AcademicRegisterAPI, '/register/academic')
api.add_resource(UserProfile, '/user/profile')
api.add_resource(TodayHabits, "/habits/today")
api.add_resource(SubmitHabits, "/habits/submit")
api.add_resource(WeeklyGoals, "/weekly/goals")
api.add_resource(AddGoal, "/add/goals")
api.add_resource(UpdateGoalStatus, "/api/goals/<int:goal_id>")