from .database import db
from flask_security import UserMixin, RoleMixin
import uuid

user_roles=db.Table('user_roles',
    db.Column('user_id',db.Integer,db.ForeignKey('user.id'),unique=True),
    db.Column('role_id', db.Integer,db.ForeignKey('role.id'))
)

class Role(db.Model,RoleMixin):
    id=db.Column(db.Integer,primary_key=True)
    name=db.Column(db.String, unique=True,nullable=False)
    description=db.Column(db.String)

class User(db.Model,UserMixin):
    id=db.Column(db.Integer,primary_key=True)
    username=db.Column(db.String,nullable=False)
    email=db.Column(db.String,unique=True,nullable=False)
    password=db.Column(db.String,nullable=False)
    fs_uniquifier=db.Column(db.String,unique=True,nullable=False,default=lambda:str(uuid.uuid4()))
    active=db.Column(db.Boolean,nullable=False,default=True)
    roles=db.relationship('Role',backref='users',secondary=user_roles)

    company_profile=db.relationship("Company",backref="user")
    student_profile=db.relationship("Student",backref="user")


class Student(db.Model):
    id=db.Column(db.Integer,primary_key=True)
    user_id=db.Column(db.Integer,db.ForeignKey('user.id'),nullable=False)
    department=db.Column(db.String,nullable=False)
    cgpa=db.Column(db.Float,nullable=False)
    year=db.Column(db.Integer,nullable=False)
    blacklisted=db.Column(db.Boolean,default=False)

    applications=db.relationship('Application',backref='student',lazy=True)

class Company(db.Model):
    id=db.Column(db.Integer,primary_key=True)
    user_id=db.Column(db.Integer,db.ForeignKey('user.id'),nullable=False)
    overview=db.Column(db.Text)
    hr_contact=db.Column(db.String)
    website=db.Column(db.String)
    approval=db.Column(db.String,default='pending')
    blacklisted=db.Column(db.Boolean,default=False)

    drives=db.relationship('Drive',backref='company',lazy=True)

class Drive(db.Model):
    id=db.Column(db.Integer,primary_key=True)
    company_id=db.Column(db.Integer,db.ForeignKey('company.id'),nullable=False)
    name=db.Column(db.String,nullable=False)
    job_title=db.Column(db.String,nullable=False)
    job_description=db.Column(db.Text)
    eligibility=db.Column(db.String,default='All')
    salary=db.Column(db.String)
    location=db.Column(db.String)
    deadline=db.Column(db.Date)
    status=db.Column(db.String,default='pending')

    applications=db.relationship("Application",backref="drive",lazy=True)
class Application(db.Model):
    id=db.Column(db.Integer,primary_key=True)
    student_id=db.Column(db.Integer,db.ForeignKey('student.id'),nullable=False)
    drive_id=db.Column(db.Integer,db.ForeignKey('drive.id'),nullable=False)
    status=db.Column(db.String,default='applied')
    remarks=db.Column(db.String)

