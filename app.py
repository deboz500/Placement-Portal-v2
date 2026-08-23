from flask import Flask
from application.database import db
from application.models import *
from application.config import LocalDevelopmentConfig
from flask_security import Security,SQLAlchemyUserDatastore,hash_password
from flask_cache import cache
import os
from application.celery_init import celery_init_app
from celery.schedules import crontab

path=os.path.join(os.path.dirname(__file__),'instance')
os.makedirs(path,exist_ok=True)

def create_app():
    app=Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)    
    cache.init_app(app) 
    datastore=SQLAlchemyUserDatastore(db,User,Role)
    app.security=Security(app,datastore)
    
    app.app_context().push()
    return app

app=create_app()
celery=celery_init_app(app)
celery.autodiscover_tasks()

#creating app context to make database operations in app.py 
with app.app_context():
    db.create_all()
    app.security.datastore.find_or_create_role(name='admin',description='superuser of app')
    app.security.datastore.find_or_create_role(name='student',description='Student applying in placement cell')
    app.security.datastore.find_or_create_role(name='company',description='Company conducting drive')
    db.session.commit()
    if not app.security.datastore.find_user(email="admin@gmail.com"):
        app.security.datastore.create_user(
            email="admin@gmail.com",
            username="admin",
            password=hash_password("admin123"),
            roles=['admin']
            )
    db.session.commit()

from application.routes import *

@celery.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(0, 0, day_of_month='1'),
        #crontab(),
        monthly_report.s(),
    )
    sender.add_periodic_task(
        crontab(minute=11,hour=2),
        #crontab(),
        daily_reminder.s(),
    )


app.register_blueprint(admin_bp)
app.register_blueprint(student_bp)
app.register_blueprint(company_bp)
app.register_blueprint(auth_bp)

#to prevent flask from intercepting user-defined routes 
@app.route('/', defaults={'path':''})
@app.route('/<path:path>')
def catch_all(path):
    return render_template('index.html')

if __name__ =='__main__':
    app.run()
