export default{
template:`
<div>
    <div class="pp-navbar" style="position:relative">
        <div class="brand">
            Welcome {{studentData.username}}
        </div>
        <div class="nav-right">
            <button class="btn-pp-primary" @click="view='profile'">
                Edit Profile
            </button>   
            <button class="btn-pp-primary" @click="loadHistory">
                History
            </button>
            <button class="btn-pp-primary" @click="exportCSV(studentData.id)">
                Export History
            </button>
        </div>
    </div>
    <div class="pp-section" v-if="view==='dashboard'">
        <div style="background:#e8f0fe;border-radius:10px;padding:12px 20px; margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
            <div style="display:flex;gap:24px;font-size:14px;flex-wrap:wrap">
                <span>
                    <strong>Department:</strong> {{studentData.department}}
                </span>
                <span>
                    <strong>CGPA:</strong> {{studentData.cgpa}}
                </span>
                <span>
                    <strong>Year:</strong> {{studentData.year}}
                </span>
            </div>
            <div class="pp-search" style="margin-left:auto;min-width:260px">
                <input v-model="searchQuery" placeholder="Search drives,companies..." @keyup.enter="doSearch">
                <button class="btn-pp-primary" @click="doSearch">
                    Find
                </button>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <div class="pp-card">
                    <div class="pp-card-header">
                        <span>
                           Companies
                        </span>
                        <span style="background:#e0f2fe;color:#0369a1;padding:3px 10px;border-radius:20px;font-size:12px" v-if="studentData.companies.length>0">
                            {{studentData.companies.length}}
                        </span>
                    </div>
                    <div v-if="studentData.companies.length===0" class="empty-state">
                        <p>No approved companies yet</p>
                    </div>
                    <div class="pp-table-scroll">
                        <div v-for="c in studentData.companies" :key="c.id" class="pp-row">
                            <div class="pp-row-name">{{c.name}}</div>
                            <button class="btn-pp-primary" @click="viewCompany(c.id)">
                                Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-8">
                <div class="pp-card">
                    <div class="pp-card-header">
                        <span>
                            Applied Drives 
                        </span>
                        <span class="badge-applied" v-if="studentData.applied_drives.length>0">{{studentData.applied_drives.length}}</span>
                    </div>
                    <div v-if="studentData.applied_drives.length===0" class="empty-state">
                        <p>You haven't applied to any drives yet</p>
                    </div>
                    <div v-else style="overflow-x:auto">
                        <table class="table table-sm mb-0" style="font-size:14px">
                            <thead style="background:#f8f9ff">
                                <tr>
                                    <th style="padding:12px 16px;color:#6b7280;font-weight:600">
                                        ID
                                    </th>
                                    <th style="padding:12px 16px;color:#6b7280;font-weight:600">
                                        Drive Name
                                    </th>
                                    <th style="padding:12px 16px;color:#6b7280;font-weight:600">
                                        Company
                                    </th>
                                    <th style="padding:12px 16px;color:#6b7280;font-weight:600">
                                        Status
                                    </th>
                                    <th style="padding:12px 16px;color:#6b7280;font-weight:600">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(a,i) in studentData.applied_drives" :key="a.application_id" style="border-bottom:1px solid #f3f4f6">
                                    <td style="padding:12px 16px;color:#6b7280">{{a.application_id}}</td>
                                    <td style="padding:12px 16px;font-weight:500;color:#1a1a2e">
                                        {{a.drive_name}}
                                    </td>
                                    <td style="padding:12px 16px;color:#6b7280">
                                        {{a.company}}
                                    </td>
                                    <td style="padding:12px 16px">
                                        <span :class="badgeClass(a.status)">
                                            {{a.status}}
                                        </span>
                                    </td>
                                    <td style="padding:12px 16px">
                                        <button class="btn-pp-primary" @click="viewDrive(a.drive_id)">
                                            View
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="pp-section" v-if="view==='search'">
        <div style="display:flex;justify-content:space-between;width:100%;align-items:center;margin-bottom:20px">
        <div class="pp-section-title">Results for "{{searchQuery}}"</div>
        <button class="btn-pp-outline" @click="view='dashboard'">
               Back
        </button>
        </div>
        <div class="pp-card mb-4">
            <div class="pp-card-header"><span>Drives</span></div>
            <div v-if="searchResults.drives.length===0" class="empty-state">
                <p>No drives found</p>
            </div>
            <div v-for="d in searchResults.drives" :key="d.id" class="pp-row">
                <div>
                    <div class="pp-row-name">{{d.drive_name}}</div>
                    <div class="pp-row-sub">{{d.company}} - {{d.job_title}}</div>
                </div>
                <div style="display:flex;align-items:center;gap:8px">
                    <span style="font-size:12px;color:black">{{d.deadline}}</span>
                    <button class="btn-pp-primary" @click="viewDrive(d.id)">View</button>
                </div>
            </div>
        </div>

        <div class="pp-card">
            <div class="pp-card-header"><span>Companies</span></div>
            <div v-if="searchResults.companies.length===0" class="empty-state">
                <p>No companies found</p>
            </div>
            <div v-for="c in searchResults.companies" :key="c.id" class="pp-row">
                <div class="pp-row-name">{{c.name}}</div>
                <button class="btn-pp-primary" @click="viewCompany(c.id)">View Details</button>
            </div>
        </div>
    </div>
    <div class="pp-section" v-if="view==='company'">
        <div style="display:flex;justify-content:space-between;width:43%;align-items:center;margin-bottom:20px">
            <div class="pp-section-title" style="margin-bottom:0">
                {{company.name}}
            </div>
            <button class="btn-pp-outline" @click="view='dashboard'">
                Back
            </button>
        </div>

        <div class="pp-card" style="max-width:600px">
            <div class="pp-card-body">
                <div style="background:#f8f9ff;border-radius:10px;padding:16px;margin-bottom:20px">
                    <div style="font-size:13px;color:#6b7280;margin-bottom:4px">Overview</div>
                    <p style="color:#1a1a2e;font-size:14px;margin:0">
                        {{company.overview}}
                    </p>
                    <a v-if="company.website" :href="company.website" target="_blank"
                        style="font-size:13px;color:#4f8ef7;text-decoration:none;margin-top:8px;display:block">
                        {{company.website}}
                    </a>
                </div>

                <div style="font-weight:600;margin-bottom:12px;color:#1a1a2e">
                    Ongoing Drives
                </div>

                <div v-if="company.drives.length===0"
                    class="empty-state" style="padding:20px">
                    <p>
                        <span>No ongoing drives</span>
                    </p>
                </div>
                <div v-for="d in company.drives" :key="d.id" class="pp-row">
                    <div>
                        <div class="pp-row-name">{{d.drive_name}}</div>
                        <div class="pp-row-sub">
                            {{d.job_title}}   Deadline:{{d.deadline}}
                        </div>
                        <div class="pp-row-sub" style="margin-top:6px;color:#4f8ef7">
                            Eligibility:{{d.eligibility}}
                        </div>
                    </div>
                    <button class="btn-pp-primary" @click="viewDrive(d.id)">
                        Details
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="pp-section" v-if="view==='drive'">
        <div style="display:flex;justify-content:space-between;width:38%;align-items:center;margin-bottom:20px">
            <div class="pp-section-title" style="margin-bottom:0">Drive Details</div>
            <button class="btn-pp-outline" @click="view='dashboard'">
               Back
            </button>
        </div>

        <div class="pp-card" style="max-width:520px">
            <div class="pp-card-body">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
                    <div>
                        <div style="font-size:20px;font-weight:700;color:#1a1a2e">
                            {{drive.job_title}}
                        </div>
                        <div style="color:#6b7280;font-size:14px;margin-top:4px">
                            {{drive.company_name}}
                        </div>
                    </div>
                    <div style="background:rgb(65 94 162/84%);color:rgb(251 251 251);padding:8px 14px; border-radius:8px;font-size:12px;font-weight:600">
                        {{drive.drive_name}}
                    </div>
                </div>

                <div class="detail-row">
                    <span class="detail-label">
                        Description
                    </span>
                    <span class="detail-value">{{drive.job_description}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">
                        Eligibility
                    </span>
                    <span class="detail-value">{{drive.eligibility}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">
                        Salary
                    </span>
                    <span class="detail-value">{{drive.salary}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">
                        Location
                    </span>
                    <span class="detail-value">{{drive.location}}</span>
                </div>
                <div class="detail-row" style="margin-bottom:20px">
                    <span class="detail-label">
                        Deadline
                    </span>
                    <span class="detail-value">{{drive.deadline}}</span>
                </div>

                <button v-if="!drive.already_applied"
                    class="btn-pp-primary w-100" style="padding:10px;font-size:15px" :disabled="drive.eligible===false" @click="applyDrive(drive.id)">
                    {{drive.eligible?'Apply Now':'Not Eligible'}}
                </button>
                <div v-if="!drive.eligible && !drive.already_applied" style="margin-top:12px;padding:12px;background:#fee2e2;border-radius:8px;color:#b91c1c;font-weight:600">
                    You do not meet the eligibility criteria for this drive.
                </div>
                <div v-else-if="drive.already_applied" style="text-align:center;padding:10px;background:#dcfce7;border-radius:8px;color:#16a34a;font-weight:600">
                    Already Applied
                </div>
            </div>
        </div>
    </div>
    <div class="pp-section" v-if="view==='profile'">
        <div style="display:flex;justify-content:space-between;width:66%;align-items:center; margin-bottom:20px">
            <div class="pp-section-title" style="margin-bottom:0">Edit Profile</div>
            <button class="btn-pp-outline" @click="view='dashboard'">
                Back
            </button>
        </div>
        <div class="row">
            <div class="col-md-4">
                <div class="pp-card" style="max-width:440px">
                    <div class="pp-card-body pp-form">
                        <div class="mb-3">
                            <label class="form-label">Full Name</label>
                            <input class="form-control" v-model="profile.name">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Department</label>
                            <input class="form-control" v-model="profile.department">
                        </div>
                        <div class="row">
                            <div class="col mb-3">
                                <label class="form-label">CGPA</label>
                                <input type="number" step="0.1" max="10" class="form-control" v-model="profile.cgpa">
                            </div>
                            <div class="col mb-3">
                                <label class="form-label">Year</label>
                                <input type="number" min="1" max="5" class="form-control" v-model="profile.year">
                            </div>
                        </div>
                        <button class="btn-pp-primary w-100" style="padding:10px;font-size:15px" @click="saveProfile">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="pp-card" style="max-width:440px">
                    <div class="pp-card-body pp-form">
                        <div class="mb-3">
                            <strong>Full Name:</strong> {{profile.name}}
                        </div>
                        <div class="mb-3">
                            <strong>Department:</strong> {{profile.department}}
                        </div>
                        <div class="row">
                            <div class="col mb-3">
                                <strong>CGPA:</strong> {{profile.cgpa}}
                            </div>
                            <div class="col mb-3">
                                <strong>Year:</strong> {{profile.year}}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="pp-section" v-if="view==='history'">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <div class="pp-section-title" style="margin-bottom:0">Application History</div>
            <button class="btn-pp-outline" @click="view='dashboard'" >
                Back
            </button>
        </div>

        <div class="pp-card">
            <div style="background:#f8f9ff;padding:14px 20px;border-bottom:1px solid #eef0f4">
                <span style="font-weight:600;color:#1a1a2e">{{studentData.username}}</span>
                <span style="color:#6b7280;font-size:13px;margin-left:12px">
                    {{studentData.department}}
                </span>
            </div>
            <div v-if="historyData.history.length===0" class="empty-state">
                <p>No application history yet</p>
            </div>
            <div v-else style="overflow-x:auto">
                <table class="table table-sm mb-0" style="font-size:14px">
                    <thead style="background:#f8f9ff">
                        <tr>
                            <th style="padding:12px 16px;color:#6b7280;font-weight:600">
                                Drive ID
                            </th>
                            <th style="padding:12px 16px;color:#6b7280;font-weight:600">
                                Company
                            </th>
                            <th style="padding:12px 16px;color:#6b7280;font-weight:600">
                                Job Title
                            </th>
                            <th style="padding:12px 16px;color:#6b7280;font-weight:600">
                                Result
                            </th>
                            <th style="padding:12px 16px;color:#6b7280;font-weight:600">
                                Remarks
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="h in historyData.history" :key="h.drive_id" style="border-bottom:1px solid #f3f4f6">
                            <td style="padding:12px 16px;color:#6b7280">{{h.drive_id}}</td>
                            <td style="padding:12px 16px;font-weight:500;color:#1a1a2e">{{h.company}}</td>
                            <td style="padding:12px 16px;color:#6b7280">{{h.job_title}}</td>
                            <td style="padding:12px 16px">
                                <span :class="badgeClass(h.status)">{{h.status}}</span>
                            </td>
                            <td style="padding:12px 16px;color:#6b7280">{{h.remarks}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>  
    `,
    data:function(){
        return{
            view:"dashboard",
            studentData:{id:"",username:"",department:"",cgpa:"",year:"",applied_drives:[],companies:[]},
            searchQuery:"",
            searchResults:{drives:[],companies:[]},
            company:{drives: [],name:"",overview:"",website:""},
            drive:{},
            profile:{name:"",department:"",cgpa:null,year:null},
            prev_view:'dashboard',
            historyData:{student_name:"",department:"",history:[]}
        }
    },
    mounted(){
        fetch('/api/student/dashboard',
            {
                method:'GET',
                headers:{
                    "Content-Type":'application/json',
                    "Authentication-Token":localStorage.getItem('auth-token')
                },
            }
        )
    .then(response=>response.json())
    .then(data=>{
        this.studentData=data,
        this.profile.name=this.studentData.username,
        this.profile.department=this.studentData.department,
        this.profile.cgpa=this.studentData.cgpa,
        this.profile.year=this.studentData.year,
        this.view="dashboard"
    })
    },
    methods:{
        loadDashboard:function(){
            fetch(`/api/student/dashboard`,
            {
                method:'GET',
                headers:{
                    "Content-Type":'application/json',
                    "Authentication-Token":localStorage.getItem('auth-token')
                },
            }
        )
        .then(response=>response.json())
        .then(data=>{
            this.studentData=data,
            this.profile.name=this.studentData.username,
            this.profile.department=this.studentData.department,
            this.profile.cgpa=this.studentData.cgpa,
            this.profile.year=this.studentData.year,
            this.view="dashboard"
        })
        },
        exportCSV:function(id){
             fetch( `/api/export/${id}`,{
                method:'GET',
                headers:{
                    "Content-Type":'application/json',
                    "Authentication-Token":localStorage.getItem('auth-token')
                }
            })
            .then(response=>response.json())
            .then(data=>{
                window.location.href=`/api/csv_result/${data.id}`
            })
        },
        viewCompany:function(cid){
            fetch( `/api/student/companies/${cid}`,{
                method:'GET',
                headers:{
                    "Content-Type":'application/json',
                    "Authentication-Token":localStorage.getItem('auth-token')
                }
            })
            .then(response=>response.json())
            .then(data=>{
                this.company=data
                this.view='company'
            })
        },
        viewDrive:function(did){
            fetch(`/api/student/drives/view/${did}`,{
                method:'GET',
                headers:{
                    "Content-Type":'application/json',
                    "Authentication-Token":localStorage.getItem('auth-token')
                }
            })
            .then(response=>response.json())
            .then(data=>{
                this.drive=data
                this.prev_view='company'
                this.view='drive'
            })
        },
        applyDrive:function(did){
            fetch(`/api/student/drives/apply/${did}`,{
                method:'POST',
                headers:{
                    "Content-Type":'application/json',
                    "Authentication-Token":localStorage.getItem('auth-token')
                }
            })
            .then(response=>response.json())
            .then(data=>{
                alert(data.message)
                this.loadDashboard()
            })
        },
        doSearch:function(){
            if (!this.searchQuery.trim()) return
            fetch(`/api/student/search/${this.searchQuery}`,{
                method:'GET',
                headers:{
                    "Content-Type":'application/json',
                    "Authentication-Token":localStorage.getItem('auth-token')
                }
            })
            .then(response=>response.json())
            .then(data=>{
                this.searchResults=data
                this.view='search'
            })
        },
        saveProfile:function(){
            fetch(`/api/student/profile`,{
                method:'PATCH',
                headers:{
                    "Content-Type":'application/json',
                    "Authentication-Token":localStorage.getItem('auth-token')
                },
                body:JSON.stringify(this.profile)
            })
            .then(response=>response.json())
            .then(data=>{
            this.studentData.username=this.profile.name
            this.studentData.department=this.profile.department
            this.studentData.cgpa=this.profile.cgpa
            this.studentData.year=this.profile.year
            alert(data.message)
            this.loadDashboard()
            })
        },
        loadHistory:function(){
            fetch(`/api/student/history`,{
                method:'GET',
                headers:{
                    "Content-Type":'application/json',
                    "Authentication-Token":localStorage.getItem('auth-token')
                },
            })
            .then(response=>response.json())
            .then(data=>{
                this.historyData=data
                this.view='history'
            })
        },
        badgeClass:function(status){
            switch(status){
                case 'approved':
                    return 'badge-approved'
                case 'pending':
                    return 'badge-pending'
                case 'rejected':
                    return 'badge-rejected'
                case 'applied':
                    return 'badge-applied'
                case 'shortlisted':
                    return 'badge-shortlisted'
                case 'selected':
                    return 'badge-selected'
                case 'waitlisted':
                    return 'badge-waitlisted'
                case 'closed':
                    return 'badge-closed'
                default:
                    return 'badge-pending'
            }
        }
    }
}