from jinja2 import Template

def roles_list(roles):
    roles_list=[]
    for role in roles:
        roles_list.append(role.name)
    return roles_list

def student_meets_eligibility(student,eligibility):
    if eligibility is "All":
        return True
    student_cgpa=float(student.cgpa)
    eligibility=float(eligibility)
    if student_cgpa is not None:
        if student_cgpa>=eligibility:
            return True
        else:
            return False

def format_report(html_template,data):
    with open(html_template) as file:
        template=Template(file.read())
        return template.render(data=data)

    
