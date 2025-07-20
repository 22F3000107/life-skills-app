from flask_restful import Resource, Api
from .models import User,db
from flask_security import roles_required,auth_required, current_user
from .instances import cache
from .adminapi import LoginAPI, ModuleAPI, ModuleResource
from .acadapi import AcademicRegisterAPI, ConceptAPI, ConceptResource, QuestionAPI, QuestionResource,QuestionsByModuleAPI
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

#Admin access
api.add_resource(ModuleAPI, "/module")
api.add_resource(ModuleResource, "/module/<int:module_id>")

# Academic Team access
api.add_resource(ConceptAPI, "/concept")
api.add_resource(ConceptResource, "/concept/<int:concept_id>")

api.add_resource(QuestionAPI, "/question")
api.add_resource(QuestionResource, "/question/<int:question_id>")
api.add_resource(QuestionsByModuleAPI, "/module/<string:module_id>/questions")




