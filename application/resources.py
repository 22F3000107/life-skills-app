from flask_restful import Resource, Api
from .models import User,db
from flask_security import roles_required,auth_required, current_user
from .instances import cache
from .adminapi import LoginAPI, ModuleAPI, ModuleResource
from .acadapi import AcademicRegisterAPI, ConceptAPI, ConceptResource, QuestionAPI, QuestionResource
from .userapi import RegisterAPI, UserProfile,TodayHabits, SubmitHabits, WeeklyGoals, AddGoal, UpdateGoalStatus
from .userapi import QuizDetailAPI,QuizListAPI, QuizSubmitAPI, UserSkillSummaryAPI
from .adminapi import AdminUsersAPI, AdminBlockUserAPI, AdminUnblockUserAPI, AdminDeleteUserAPI, AdminStoriesAPI, AdminUpdateStoryAPI, AdminDeleteStoryAPI,AdminGetStoryAPI
from .adminapi import AdminQuizzesAPI, AdminCreateQuizAPI, AdminUpdateQuizAPI, AdminDeleteQuizAPI,AdminEditStoryAPI
from .adminapi import AdminFlaggedContentAPI,AdminUnflagContentAPI,AdminDeleteFlaggedContentAPI
from .userapi import ChangePasswordAPI
from .adminapi import AdminStatsAPI,AdminStatsOverviewAPI,AdminQuizAttemptsAPI, AdminSkillEngagementAPI
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
api.add_resource(QuizSubmitAPI, '/quiz/<int:quiz_id>/submit')
api.add_resource(UserSkillSummaryAPI, '/user/summary')
api.add_resource(AdminUsersAPI, '/admin/users')
api.add_resource(AdminBlockUserAPI, '/admin/user/<int:user_id>/block')
api.add_resource(AdminUnblockUserAPI, '/admin/user/<int:user_id>/unblock')
api.add_resource(AdminDeleteUserAPI, '/admin/user/<int:user_id>/delete')


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

#Admin access
api.add_resource(ModuleAPI, "/module")
api.add_resource(ModuleResource, "/module/<int:module_id>")

# Academic Team access
api.add_resource(ConceptAPI, "/concept")
api.add_resource(ConceptResource, "/concept/<int:concept_id>")

api.add_resource(QuestionAPI, "/question")
api.add_resource(QuestionResource, "/question/<int:question_id>")
# addition api required for user and admin
api.add_resource(ChangePasswordAPI, '/change-password')#for user and admin
api.add_resource(AdminStatsAPI, '/admin/stats')
api.add_resource(AdminStatsOverviewAPI, '/admin/stats-overview')
api.add_resource(AdminQuizAttemptsAPI, '/admin/quiz-attempts')
api.add_resource(AdminSkillEngagementAPI, '/admin/skill-engagement')


