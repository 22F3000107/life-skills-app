from flask_restful import Resource, Api
from .models import User,db
from flask_security import roles_required,auth_required, current_user
from .instances import cache
from .adminapi import LoginAPI, RegisterAPI,AcademyRegisterAPI


api = Api(prefix='/api')
api.add_resource(LoginAPI, '/login')
api.add_resource(RegisterAPI, '/register/student')
api.add_resource(AcademyRegisterAPI, '/register/academy')
