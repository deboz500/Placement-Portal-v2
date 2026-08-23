from celery import shared_task
import time
import csv
from .models import *
import datetime
from datetime import date,timedelta
from .utils import *
from .mail import send_email
import requests

@shared_task(ignore_results=False,name="download_csv_report")
def csv_report(user_id):
    user=User.query.get(user_id)
    student=user.student_profile[0]
    applications=Application.query.filter_by(student_id=student.id).all()
    csv_file_name=f"applications_{datetime.datetime.now().strftime('%Y-%m-%d')}.csv"
    with open(f'static/csvfiles/{csv_file_name}','w',newline="") as csvfile:
        sr_no=1
        csv_content=csv.writer(csvfile,delimiter=",")
        csv_content.writerow([
        "Application ID",
        "Student Name",
        "Company",
        "Drive Name",
        "Job Title",
        "Deadline",
        "Status",
        "Remarks"
        ])
        for i,a in enumerate(applications,1):
            remarks=a.remarks
            if not remarks or str(remarks).strip().lower() in {"none","-","—","–","n/a","na","not available"}:
                remarks=""

            csv_content.writerow([
                a.id,
                a.student.user.username,
                a.drive.company.user.username,
                a.drive.name,
                a.drive.job_title,
                str(a.drive.deadline),
                a.status,
                a.remarks
            ])
    return csv_file_name

@shared_task(ignore_results=False, name="download_monthly_report")
def monthly_report():
    today=date.today()
    total_students=Student.query.count()
    total_companies=Company.query.count()
    total_drives=Drive.query.count()
    total_applications=Application.query.count()

    selected=Application.query.filter_by(status='selected').count()
    shortlisted=Application.query.filter_by(status='shortlisted').count()
    rejected=Application.query.filter_by(status='rejected').count()
    waitlisted=Application.query.filter_by(status='waitlisted').count()
    applied=Application.query.filter_by(status='applied').count()

    placement_rate=0
    if total_students>0:
        placement_rate=round((selected/total_students)*100,2)

    content={
        "total_students":total_students,
        "total_companies":total_companies,
        "total_drives":total_drives,
        "total_applications":total_applications,
        "report_month":today.strftime("%B %Y"),
        "students":total_students,
        "companies":total_companies,
        "drives":total_drives,
        "applications":{
            "total":total_applications,
            "applied":applied,
            "shortlisted":shortlisted,
            "selected":selected,
            "rejected":rejected,
            "waitlisted":waitlisted
        },
        "placement_rate":placement_rate
    }
    message=format_report("templates/report.html",content)
    send_email('admin.placementportal@gmail.com',subject=f"Monthly Placement Report - {today.strftime('%B %Y')}",message=message)

@shared_task(ignore_results=False, name="status_update")
def status_update(student_email, student_name, company_name, drive_name, status, remarks=None):
    subject=f"Application Status Updated - {status.title()}"
    remarks_text = remarks or " "
    message=f"""Hello {student_name},

    The status of your application for {drive_name} at {company_name} has been updated to {status.title()}.

    Remarks: {remarks_text}

    Please log in to your dashboard at http://127.0.0.1:5000 for more details.
    """
    send_email(student_email, subject=subject, message=message, content="plain")
    return True

@shared_task(ignore_results=False,name="daily_reminder")
def daily_reminder():
    today = date.today()
    upcoming=today+timedelta(days=3) 
    upcoming_drives=Drive.query.filter(
        Drive.deadline>=today,
        Drive.deadline<=upcoming,
        Drive.status=='approved'
    ).all()
    drives="\n".join([
        f"->{d.name} at {d.company.user.username} — Deadline: {d.deadline.strftime('%d %B %Y')}"
        for d in upcoming_drives
    ])
    if not drives:
        return "No upcoming drives to send reminder"

    subject="HireWire — Daily Placement Reminder"
    message=f"""Hello Students!

    The following drives are closing soon:

    {drives}

    Log in now: http://127.0.0.1:5000
    """

    recipients=[student.user.email for student in Student.query.all() if student.user and student.user.email]
    for email in recipients:
        send_email(email,subject=subject,message=message,content="plain")

    return f"Sent reminder to {len(recipients)} students"

