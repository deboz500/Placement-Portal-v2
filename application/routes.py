from flask import Blueprint,jsonify,current_app as app,request,render_template,send_from_directory
from flask_security import auth_required,roles_required,current_user,hash_password,roles_accepted,login_user,verify_password
from .database import db
from .models import *
from .utils import *
from datetime import datetime
from celery.result import AsyncResult
from .tasks import *
from flask_cache import cache

admin_bp=Blueprint('admin',__name__)
student_bp=Blueprint('student',__name__)
company_bp=Blueprint('company',__name__)
auth_bp=Blueprint('auth',__name__)

#AUTHENTICATION AND AUTHORIZATION
@auth_bp.route('/api/logout', methods=['POST'])
@auth_required('token')
def logout():
    from app import cache
    user=current_user
    cache.clear()
    return jsonify({"message":"Logged out"}),200

@app.route('/api/home')
@auth_required('token')
@roles_accepted('student','company','admin')
def user_home():
    user = current_user
    return jsonify({
        "username":user.username,
        "email":user.email,
        "roles":roles_list(user.roles)
    })

@auth_bp.route('/api/register/student',methods=['POST'])
def create_student():
    creds=request.get_json()
    if not app.security.datastore.find_user(email=creds["email"]):
        user=app.security.datastore.create_user(
            email=creds["email"],
            username=creds["username"],
            password=hash_password(creds["password"]),
            roles=['student']
            )
        db.session.commit()
        
        student=Student(
            user_id=user.id,
            department=creds["department"],
            cgpa=creds["cgpa"],
            year=creds["year"]
        )
        db.session.add(student)
        db.session.commit()
        
        return jsonify({
            "message":"Student registered successfully!"
        }),201
    return jsonify({
        "message":"Student already exists!"
    }),400

@auth_bp.route('/api/register/company',methods=['POST'])
def create_company():
    creds=request.get_json()
    if not app.security.datastore.find_user(email=creds["email"]):
        user=app.security.datastore.create_user(
            email=creds["email"],
            username=creds["username"],
            password=hash_password(creds["password"]),
            roles=['company']
            )
        db.session.commit()
        
        company=Company(
            user_id=user.id,
            overview=creds["overview"],
            hr_contact=creds["hr_contact"],
            website=creds["website"]
        )
        db.session.add(company)
        db.session.commit()
        
        return jsonify({
            "message":"Company registered successfully! Waiting for Approval"
        }),201
    return jsonify({
        "message":"Company already exists!"
    }),400

@admin_bp.route('/api/admin')
@auth_required('token')
@roles_required('admin')
def admin_home():
    return jsonify({
            "message":"admin logged in successfully"
    })

@auth_bp.route('/api/login',methods=['POST'])
def login():
    creds=request.get_json()
    email=creds["email"]
    pwd=creds["password"]
    
    user=app.security.datastore.find_user(email=email)
    
    if user:
        if user.active:
            if verify_password(pwd,user.password):
                login_user(user)
                return jsonify({
                    "id":user.id,
                    "username":user.username,
                    "auth-token":user.get_auth_token(),
                    "roles":roles_list(user.roles)
                })
            else:
                return jsonify({
                    "message":"Incorrect Password"
                }),400
        else:
            return jsonify({
                "message":"Account has been Deactivated"
            })
    else:
        return jsonify({
            "message":"Incorrect Email!"
        }),404
    
#ADMIN

@admin_bp.route('/api/admin/dashboard',methods=['GET'])
@roles_required('admin')
@cache.cached(timeout=300,key_prefix='admin_dashboard')
def admin_dashboard():
    companies=Company.query.all()
    students=Student.query.all()
    pending_companies=Company.query.filter_by(approval='pending').all()
    drives=Drive.query.filter_by(status='approved').all()
    applications=Application.query.all()
    closed_drives=Drive.query.filter_by(status='closed').all()
    pending_drives=Drive.query.filter_by(status='pending').all()

    content={
        "username":current_user.username,
        "pending_companies":[
            {
                "id":c.id,
                "name":c.user.username
            }
            for c in pending_companies
        ],
        "companies":[{
            "id":c.id,
            "name":c.user.username,
            "approval":c.approval,
            "blacklisted":c.blacklisted
        } for c in companies
        ],
        "students":[{
            "id":s.id,
            "name":s.user.username,
            "department":s.department,
            "cgpa":s.cgpa,
            "year":s.year,
            "blacklisted":s.blacklisted
        } for s in students
        ],
        "drives":[{
            "id":d.id,
            "name":d.name,
            "company":d.company.user.username,
            "job_title":d.job_title,
            "status":d.status
        } for d in drives
        ],
        "closed_drives":[{
            "id":d.id,
            "name":d.name,
            "company":d.company.user.username, 
            "job_title":d.job_title,
            "status":d.status
        }for d in closed_drives],
        "pending_drives":[{
            "id":d.id,
            "name":d.name,
            "company":d.company.user.username,
            "job_title":d.job_title,
            "status":d.status
        }for d in pending_drives],
        "applications":[{
            "id":a.id,
            "student":a.student.user.username,
            "drive":a.drive.name,
            "company":a.drive.company.user.username,
            "status":a.status
        }for a in applications
        ]
    }
    return jsonify(content),200

@admin_bp.route('/api/companies/approve/<int:c_id>',methods=['PATCH'])
@roles_required('admin')
def approve_company(c_id):
    c=Company.query.get(c_id)
    c.approval='approved'
    db.session.commit()
    cache.delete('admin_dashboard')
    cache.delete('admin_statistics')
    return jsonify(
        {  
            "message":"Approved"
        }
    ),200

@admin_bp.route('/api/companies/blacklist/<int:c_id>',methods=['PATCH'])
@roles_required('admin')
def blacklist_company(c_id):
    c=Company.query.get(c_id)
    c.blacklisted=not c.blacklisted
    c.user.active=not c.blacklisted
    if c.blacklisted:
        drives=Drive.query.filter(Drive.company_id==c.id,Drive.status!='closed').all()
        for d in drives:
            d.status='cancelled'
    else:
        drives=Drive.query.filter(Drive.company_id==c.id,Drive.status=='cancelled').all()
        for d in drives:
            d.status='approved'
    db.session.commit()
    action='Blacklisted' if c.blacklisted else 'Reactivated'
    cache.delete('admin_dashboard')
    cache.delete('admin_statistics')
    return jsonify(
        {
        'message':f"{action}"
        }
    ),200

@admin_bp.route('/api/students/blacklist/<int:s_id>',methods=['PATCH'])
@roles_required('admin')
def blacklist_student(s_id):
    s=Student.query.get(s_id)
    s.blacklisted=not s.blacklisted
    s.user.active=not s.blacklisted
    db.session.commit()
    action='Blacklisted' if s.blacklisted else 'Reactivated'
    cache.delete('admin_dashboard')
    cache.delete('admin_statistics')
    cache.delete(f'student_dashboard_{s.id}')
    return jsonify(
        {
            'message':f"{action}"
        }
    ),200


@admin_bp.route('/api/drives/approve/<int:d_id>',methods=['PATCH'])
@roles_required('admin')
def approve_drive(d_id):
    d=Drive.query.get(d_id)
    d.status='approved'
    db.session.commit()
    cache.delete('admin_dashboard')
    cache.delete('admin_statistics')
    return jsonify({
        'message':'Approved'
    }),200

@admin_bp.route('/api/drives/close/<int:d_id>',methods=['PATCH'])
@roles_required('admin')
def close_drive(d_id):
    d=Drive.query.get(d_id)
    d.status='closed'
    db.session.commit()
    cache.delete('admin_dashboard')
    cache.delete('admin_statistics')
    return jsonify({
        "message":"Drive closed"
    }),200

@admin_bp.route('/api/admin/drives/<int:d_id>',methods=["GET"])
@roles_required('admin')
def drive_details(d_id):
    d=Drive.query.get(d_id)
    content={
        "id":d.id,
        "name":d.name,
        "job_title":d.job_title,
        "job_description":d.job_description,
        "eligibility":d.eligibility,
        "salary":d.salary,
        "location":d.location,
        "deadline":d.deadline,
        "company":d.company.user.username,
        "status":d.status,
        "applicants":[
            {
                "id":a.id,
                "name":a.student.user.username,
                "status":a.status
            }
            for a in d.applications
        ]
    }
    return jsonify(content),200

@admin_bp.route('/api/admin/statistics',methods=['GET'])
@roles_required('admin')
@cache.cached(timeout=120, key_prefix='admin_statistics')
def admin_statistics():

    total_students=Student.query.count()
    total_companies=Company.query.count()
    total_drives=Drive.query.count()
    total_applications=Application.query.count()

    selected=Application.query.filter_by(status='selected').count()
    shortlisted=Application.query.filter_by(status='shortlisted').count()
    rejected=Application.query.filter_by(status='rejected').count()
    waitlisted=Application.query.filter_by(status='waitlisted').count()

    placement_rate=0
    if total_students>0:
        placement_rate=round((selected/total_students)*100,2)
    content={
        "total_students":total_students,
        "total_companies":total_companies,
        "total_drives":total_drives,
        "total_applications":total_applications,
        "selected":selected,
        "shortlisted":shortlisted,
        "waitlisted":waitlisted,
        "rejected":rejected,
        "placement_rate":placement_rate
    }
    return jsonify(content),200

@admin_bp.route('/api/admin/search/<string:q>',methods=['GET'])
@roles_required('admin')
def admin_search(q):
    q=q.strip()
    if not q:
        content={"students":[], "companies":[], "drives":[]}
        return jsonify(content),200

    students=Student.query.join(User).filter(User.username.ilike(f'%{q}%')).all()
    companies=Company.query.join(User).filter(User.username.ilike(f'%{q}%')).all()
    drives=Drive.query.join(Company).join(User,Company.user_id==User.id).filter(
        db.or_(
            Drive.name.ilike(f"%{q}%"),
            Drive.job_title.ilike(f"%{q}%"),
            Drive.eligibility.ilike(f"%{q}%"),
            Drive.location.ilike(f"%{q}%"),
            User.username.ilike(f"%{q}%")
        )
    ).all()

    return jsonify({
        "students":[{
            "id":s.id,
            "name":s.user.username,
            "department":s.department,
            "blacklisted":s.blacklisted
        } for s in students],
        "companies":[{
            "id":c.id,
            "name":c.user.username,
            "approval":c.approval,
            "blacklisted":c.blacklisted
        } for c in companies],
        "drives":[{
            "id":d.id,
            "name":d.name,
            "job_title":d.job_title,
            "company":d.company.user.username,
            "status":d.status
        } for d in drives]
    }), 200
#STUDENT

@student_bp.route('/api/student/dashboard',methods=['GET'])
@roles_required('student')
def student_dashboard():
    user=current_user
    student=user.student_profile[0]
    cache_key=f"student_dashboard_{student.id}"
    cached_data=cache.get(cache_key)
    if cached_data:
        return jsonify(cached_data),200
    companies=Company.query.filter_by(approval='approved',blacklisted=False).all()
    applications=Application.query.filter_by(student_id=student.id).all()
    applied_drives=[]
    for a in applications:
        applied_drives.append({
            "application_id":a.id,
            "drive_id":a.drive_id,
            "drive_name":a.drive.name,             
            "company":a.drive.company.user.username,
            "status":a.status 
        })

    content={
        "id":user.id,
        "username":user.username,                  
        "department":student.department,
        "cgpa":student.cgpa,
        "year":student.year,
        "blacklisted":student.blacklisted,
        "companies":[{
                "id":c.id,
                "name":c.user.username,           
                "website":c.website,
                "overview":c.overview
            }
            for c in companies
        ],
        "applied_drives":applied_drives
    }
    cache.set(cache_key,content,timeout=300)
    return jsonify(content),200

@student_bp.route("/api/student/companies/<int:cid>",methods=["GET"])
@roles_required('student')
def company_detail(cid):
    company=Company.query.get(cid)

    drivelist=Drive.query.filter_by(
        company_id=cid,
        status="approved"
    ).all()

    content={
        "id":company.id,
        "name":company.user.username,
        "overview":company.overview,
        "website":company.website,
        "drives":[
            {
            "id":d.id,
            "drive_name":d.name,
            "job_title":d.job_title,
            "deadline":str(d.deadline),
            "eligibility":d.eligibility
            }
            for d in drivelist
        ]
    }
    return jsonify(content),200

@student_bp.route("/api/student/drives/view/<int:did>",methods=["GET"])
@roles_required('student')
def drive_detail(did):
    user=current_user
    student=user.student_profile[0]
    drive=Drive.query.get(did)

    already_applied=Application.query.filter_by(
        student_id=student.id,
        drive_id=did
    ).first()

    if already_applied:
        is_eligible=True
    else:
        is_eligible=student_meets_eligibility(student,drive.eligibility)
    content={
        "id":drive.id,
        "drive_name":drive.name,
        "job_title":drive.job_title,
        "job_description":drive.job_description,
        "eligibility":drive.eligibility,
        "salary":drive.salary,
        "location":drive.location,
        "deadline":str(drive.deadline),
        "company_name":drive.company.user.username,
        "already_applied":already_applied is not None,
        "eligible":is_eligible
    }

    return jsonify(content),200

@student_bp.route("/api/student/drives/apply/<int:did>",methods=['POST'])
def apply_drive(did):
    user=current_user
    student=user.student_profile[0]
    drive=Drive.query.get(did)
    a=Application(student_id=student.id,drive_id=did)
    db.session.add(a)
    db.session.commit()
    cache.delete(f'student_dashboard_{student.id}')
    return jsonify({"message":"Applied Successfully!"}),200

@student_bp.route("/api/student/search/<string:q>",methods=["GET"])
@roles_required('student')
def search(q):
    q=q.strip()
    if not q:
        content={"drives":[],"companies":[]}
        return jsonify(content),200
    
    drives=(Drive.query.join(Company,Drive.company_id==Company.id).join(User,Company.user_id==User.id).filter(Drive.status=="approved",
        db.or_(
            Drive.name.ilike(f"%{q}%"),
            Drive.job_title.ilike(f"%{q}%"),
            Drive.eligibility.ilike(f"%{q}%"),
            Drive.location.ilike(f"%{q}%"),
            User.username.ilike(f"%{q}%")
        )
    ).all()
    )

    companies=(Company.query.join(User).filter(
        Company.approval=="approved",
        Company.blacklisted==False,
        User.username.ilike(f"%{q}%")
    ).all()
    )

    content={
        "drives":[
            {
            "id":d.id,
            "drive_name":d.name,
            "job_title":d.job_title,
            "company":d.company.user.username,
            "deadline":str(d.deadline),
            "eligibility":d.eligibility
            }
            for d in drives
        ],
        "companies":[
            {"id":c.id,"name":c.user.username}
            for c in companies
        ]
    }
    return jsonify(content),200

@student_bp.route("/api/student/profile",methods=["PATCH"])
@roles_required('student')
def update_profile():
    user=current_user
    student=user.student_profile[0]
    creds=request.get_json()

    if "name" in creds:
        student.user.username =creds["name"]
    if "department" in creds:
        student.department=creds["department"]
    if "cgpa" in creds:
        student.cgpa=creds["cgpa"]
    if "year" in creds:
        student.year=creds["year"]

    db.session.commit()
    content={
        "message":"Profile updated!"
        }
    cache.delete(f'student_dashboard_{student.id}')
    return jsonify(content),200

@student_bp.route("/api/student/history",methods=["GET"])
@roles_required("student")
def get_history():
    user=current_user
    student=user.student_profile[0]
    applications=Application.query.filter_by(student_id=student.id).all()
    content={
        "student_name":user.username,
        "department":student.department,
        "history":[
            {
            "application_id":a.id,
            "drive_id":a.drive.id,
            "drive_name":a.drive.name,
            "job_title":a.drive.job_title,
            "company":a.drive.company.user.username,
            "status":a.status,
            "remarks":a.remarks or ""
            }
            for a in applications
        ]
    }
    return jsonify(content),200

#COMPANY

@company_bp.route('/api/company/dashboard',methods=['GET'])
@roles_required('company')
def company_dashboard():
    user=current_user
    company=user.query.filter_by(id=user.id).first().company_profile[0]
    current_drives=Drive.query.filter(Drive.company_id==company.id,Drive.status.in_(['approved','pending'])).all()
    closed_drives=Drive.query.filter(Drive.company_id==company.id,Drive.status=='closed').all()

    def data(d):
        return{
            "id":d.id,
            "name":d.name,
            "job_title":d.job_title,
            "job_description":d.job_description,
            "eligibility":d.eligibility,
            "salary":d.salary,
            "location":d.location,
            "deadline":d.deadline,
            "status":d.status,
            "applicant_count":Application.query.filter_by(drive_id=d.id).count()
        }
    content={
        "id":company.id,
        "username":user.username,
        "roles":roles_list(user.roles),
        "blacklisted":company.blacklisted,
        "approval":company.approval,
        "current_drives":[data(d) for d in current_drives],
        "closed_drives":[data(d) for d in closed_drives]
    }
    return jsonify(content),200

@company_bp.route('/api/company/drives/create/<int:cid>',methods=['POST'])
@roles_required('company')
def create_drive(cid):
    from datetime import datetime
    company=Company.query.filter_by(id=cid)
    data=request.get_json()
    drive=Drive(
        company_id=cid,
        name=data['drive_name'],
        job_title=data['job_title'],
        job_description=data['job_description'],
        eligibility=data['eligibility'],
        salary=data['salary'],
        location=data['location'],
        deadline=datetime.strptime(data["deadline"],"%Y-%m-%d").date(),
        status="pending"
    )
    db.session.add(drive)
    db.session.commit()
    return jsonify({
        "message": "Drive created!Waiting for Approval."
    }),200


@company_bp.route('/api/company/drives/close/<int:d_id>',methods=['PATCH'])
@roles_required('company')
def company_close_drive(d_id):
    d=Drive.query.get(d_id)
    d.status='closed'
    db.session.commit()
    return jsonify({
        "message":"Drive closed"
    }),200

@company_bp.route('/api/company/applications/view/<int:did>',methods=['PATCH'])
@roles_required('company')
def view_applicants(did):
    d=Drive.query.filter_by(id=did).first()
    a=Application.query.filter_by(drive_id=did).all()
    def data(a):
        return{
            "id":a.id,
            "student_name":a.student.user.username,
            "department":a.student.department,
            "cgpa":a.student.cgpa,
            "status":a.status
        }
    content={
        "name":d.name,
        "job_title":d.job_title,
        "applicants":[data(a) for a in a]
    }
    return jsonify(content),200

@company_bp.route('/api/company/applications/get/<int:aid>',methods=['GET'])
@roles_required('company')
def get_application(aid):
    application=Application.query.get(aid)
    content={
        "id":application.id,
        "student_name":application.student.user.username,
        "department":application.student.department,
        "drive_name":application.drive.name,
        "job_title":application.drive.job_title,
        "status":application.status,
        "remarks":application.remarks
    }
    return jsonify(content),200

@company_bp.route("/api/company/applications/review/<int:aid>",methods=["PATCH"])
@roles_required('company')
def update_status(aid):
    user=current_user
    company=user.company_profile[0]
    application=Application.query.get(aid)
    drive=Drive.query.filter_by(id=application.drive_id,company_id=company.id).first()
    data=request.get_json()
    status=data["status"]
    application.status=status
    application.remarks=data.get("remarks", "")
    db.session.commit()
    status_update.delay(
        application.student.user.email,
        application.student.user.username,
        application.drive.company.user.username,
        application.drive.name,
        status,
        application.remarks
    )

    return jsonify({"message":f"Application marked as {status}"}),200

@company_bp.route("/api/company/profile", methods=["GET"])
@auth_required("token")
@roles_required("company")
def company_profile():
    user=current_user
    company=user.company_profile[0]
    content={
        "id":company.id,
        "name":user.username,
        "overview":company.overview,
        "hr_contact":company.hr_contact,
        "website":company.website,
        "approval":company.approval,
        "drives":[
            {
            "id":d.id,
            "drive_name":d.name,
            "job_title":d.job_title,
            "deadline":str(d.deadline),
            "status":d.status,
            "applications":len(d.applications)
            }
            for d in company.drives
        ]
    }
    return jsonify(content),200


#TRIGGERS

@app.route('/api/export/<string:id>',methods=['GET'])#manually trigger the job
def export_csv(id):
    result=csv_report.delay(id)#async object
    return jsonify({
        "id":result.id,
        "result":result.result
    })

@app.route('/api/csv_result/<id>')#test the status of result
def csv_result(id):
    result=AsyncResult(id)
    return send_from_directory('static/csvfiles',result.result)

@app.route('/api/mail')
def send_reports():
    result=monthly_report.delay()
    return {
        "result":result.result
    }

