from flask_restful import Resource, Api
from .models import User,db
from flask_security import roles_required,auth_required, current_user
from .instances import cache
from .adminapi import LoginAPI
from .acadapi import AcademicRegisterAPI
from .userapi import RegisterAPI, UserProfile,TodayHabits, SubmitHabits, WeeklyGoals, AddGoal, UpdateGoalStatus
from .userapi import QuizDetailAPI,QuizListAPI, QuizSubmitAPI, UserSkillSummaryAPI
from .adminapi import AdminUsersAPI, AdminBlockUserAPI, AdminUnblockUserAPI,AdminStoriesAPI, AdminUpdateStoryAPI, AdminDeleteStoryAPI,AdminGetStoryAPI
from .adminapi import AdminQuizzesAPI, AdminCreateQuizAPI, AdminUpdateQuizAPI, AdminDeleteQuizAPI,AdminEditStoryAPI
from .adminapi import AdminFlaggedContentAPI,AdminUnflagContentAPI,AdminDeleteFlaggedContentAPI

api = Api(prefix='/api')
api.add_resource(LoginAPI, '/login')
api.add_resource(RegisterAPI, '/register/user')
api.add_resource(AcademicRegisterAPI, '/register/academic')
api.add_resource(UserProfile, '/user/profile')
api.add_resource(TodayHabits, "/habits/today")
api.add_resource(SubmitHabits, "/habits/submit")
api.add_resource(WeeklyGoals, "/weekly/goals")
api.add_resource(AddGoal, "/add/goals")
api.add_resource(UpdateGoalStatus, "/goals/<int:goal_id>")
api.add_resource(QuizListAPI, '/quizzes')
api.add_resource(QuizDetailAPI, '/quiz/<int:quiz_id>')
api.add_resource(QuizSubmitAPI, '/quiz/<int:quiz_id>/submit')# it gives error
api.add_resource(UserSkillSummaryAPI, '/user/summary')
api.add_resource(AdminUsersAPI, '/admin/users')
api.add_resource(AdminBlockUserAPI, '/admin/user/<int:user_id>/block')
api.add_resource(AdminUnblockUserAPI, '/admin/user/<int:user_id>/unblock')

api.add_resource(AdminStoriesAPI, '/admin/stories')
api.add_resource(AdminGetStoryAPI, '/admin/story/<int:story_id>')
api.add_resource(AdminUpdateStoryAPI, '/admin/story/<int:story_id>/status')
api.add_resource(AdminEditStoryAPI, '/admin/story/<int:story_id>/edit')
api.add_resource(AdminDeleteStoryAPI, '/admin/story/<int:story_id>')

api.add_resource(AdminQuizzesAPI, '/admin/quizzes')
api.add_resource(AdminCreateQuizAPI, '/admin/quiz')
api.add_resource(AdminUpdateQuizAPI, '/admin/quiz/<int:quiz_id>')
api.add_resource(AdminDeleteQuizAPI, '/admin/quiz/<int:quiz_id>')

api.add_resource(AdminFlaggedContentAPI, '/admin/flagged-content')
api.add_resource(AdminUnflagContentAPI, '/admin/flagged-content/<string:content_type>/<int:content_id>/unflag')
api.add_resource(AdminDeleteFlaggedContentAPI, '/admin/flagged-content/<string:content_type>/<int:content_id>')