export default{
    template:`
    <div>
    <div class="pp-navbar" style="position:relative">
            <div class="brand">
                Welcome {{companyData.username}}
            </div>
            <div class="nav-right">
            <span v-if="companyData.approval==='pending'" class="badge-pending">
            Awaiting Admin Approval
            </span>
            <span v-else-if="companyData.approval==='approved'" class="badge-approved">
            Approved
            </span>
            <button class="btn-pp-primary" @click="loadProfile">
            Profile
            </button>
            <button class="btn-pp-primary" v-if="companyData.approval==='approved'" @click="view='createdrive'">
            Create Drive
            </button>
            </div>
    </div>
    <div class="pp-section" v-if="view==='dashboard'">
        <div class="pp-card mb-4">
            <div class="pp-card-header">
                <span>
                    Currently Ongoing Drives
                </span>
                <span v-if="companyData.current_drives.length>0" class="badge-applied">{{companyData.current_drives.length}}</span>
            </div>
            <div v-if="companyData.current_drives.length===0" class="empty-state">
                <p>No ongoing drives.</p>
            </div>
            <div v-else style="overflow-x:auto">
                <table class="table table-sm mb-0" style="font-size:14px">
                    <thead style="background:#f8f9ff">
                        <tr>
                            <th style="padding:12px 16px;color:#6b7280;font-weight:600">Drive ID</th>
                            <th style="padding:12px 16px;color:#6b7280;font-weight:600">Drive Name</th>
                            <th style="padding:12px 16px;color:#6b7280;font-weight:600">Job Title</th>
                            <th style="padding:12px 16px;color:#6b7280;font-weight:600;min-width:160px">Deadline</th>
                            <th style="padding:12px 16px;color:#6b7280;font-weight:600">Status</th>
                            <th style="padding:12px 16px;color:#6b7280;font-weight:600">No. of Applicants</th>
                            <th style="padding:12px 16px;color:#6b7280;font-weight:600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(d,i) in companyData.current_drives" :key="d.id"
                            style="border-bottom:1px solid #f3f4f6">
                            <td style="padding:12px 16px;color:#6b7280">{{d.id}}</td>
                            <td style="padding:12px 16px;font-weight:500;color:#1a1a2e">
                                {{d.name}}
                            </td>
                            <td style="padding:12px 16px;color:#6b7280;min-width:160px">{{d.job_title}}</td>
                            <td style="padding:12px 16px;color:#6b7280;min-width:160px">{{d.deadline}}</td>
                            <td style="padding:12px 16px">
                                <span :class="badgeClass(d.status)">{{d.status}}</span>
                            </td>
                            <td style="padding:12px 16px">
                                <span style="background:#e0f2fe;color:#0369a1;padding:3px 10px;border-radius:20px;font-size:12px" v-if="d.status==='approved'">
                                    {{ d.applicant_count }}
                                </span>
                            </td>
                            <td style="padding:12px 16px">
                                <div style="display:flex;gap:6px">
                                    <button class="btn-pp-primary" v-if="d.status==='approved'" @click="viewApplicants(d.id)">
                                        View Applicants
                                    </button>
                                    <button class="btn-pp-outline" v-if="d.status==='approved'" @click="closeDrive(d.id)">
                                        Complete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="pp-card">
            <div class="pp-card-header">
                <span>
                    Closed Drives
                </span>
                <span class="badge-closed" v-if="companyData.closed_drives.length>0">{{companyData.closed_drives.length}}</span>
            </div>
            <div v-if="companyData.closed_drives.length===0" class="empty-state">
                <p>No closed drives yet</p>
            </div>
            <div v-else style="overflow-x:auto">
                <table class="table table-sm mb-0" style="font-size:14px">
                    <thead style="background:#f8f9ff">
                        <tr>
                            <th style="padding:12px 16px;color:#6b7280;font-weight:600">ID</th>
                            <th style="padding:12px 16px;color:#6b7280;font-weight:600">Drive Name</th>
                            <th style="padding:12px 16px;color:#6b7280;font-weight:600;min-width:160px">Deadline</th>
                            <th style="padding:12px 16px;color:#6b7280;font-weight:600">Applicants</th>
                            <th style="padding:12px 16px;color:#6b7280;font-weight:600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="d in companyData.closed_drives" :key="d.id"
                            style="border-bottom:1px solid #f3f4f6">
                            <td style="padding:12px 16px;color:#6b7280">{{d.id}}</td>
                            <td style="padding:12px 16px;font-weight:500;color:#1a1a2e">
                                {{d.name}}
                            </td>
                            <td style="padding:12px 16px;color:#6b7280;min-width:160px">{{d.deadline}}</td>
                            <td style="padding:12px 16px">
                                <span style="background:#f3f4f6;color:#6b7280;padding:3px 10px;border-radius:20px;font-size:12px">
                                    {{d.applicant_count}} applied
                                </span>
                            </td>
                            <td style="padding:12px 16px">
                                <button class="btn-pp-primary" @click="viewApplicants(d.id)">
                                    View
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <div class="pp-section" v-if="view==='createdrive'">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;width:40%">
            <div class="pp-section-title" style="margin-bottom:0">Create a Drive</div>
            <button class="btn-pp-outline" style="border-color:black;color:black" @click="view='dashboard'">
            Back
            </button>
        </div>
        <div class="pp-card" style="max-width:560px">
            <div class="pp-card-body pp-form">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Drive Name</label>
                        <input class="form-control" v-model="newDrive.drive_name"
                            placeholder="e.g. Drive 2026" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Job Title</label>
                        <input class="form-control" v-model="newDrive.job_title"
                            placeholder="e.g. Full Stack Developer" required>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Job Description</label>
                    <textarea class="form-control" rows="3"
                        v-model="newDrive.job_description"
                        placeholder="Describe the role" required></textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label">Eligibility Criteria</label>
                    <input class="form-control" v-model="newDrive.eligibility"
                        placeholder="Enter CGPA criteria">
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Salary</label>
                        <input class="form-control" v-model="newDrive.salary"
                            placeholder="e.g. 15 LPA" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Location</label>
                        <input class="form-control" v-model="newDrive.location"
                            placeholder="e.g. Kolkata" required>
                    </div>
                </div>
                <div class="mb-4">
                    <label class="form-label">Application Deadline</label>
                    <input type="date" class="form-control" v-model="newDrive.deadline" required>
                </div>
                <button class="btn-pp-primary w-100" style="padding:10px;font-size:15px"
                    @click="submitDrive(companyData.id)">
                    Submit
                </button>
            </div>
        </div>
    </div>
    <div class="pp-section" v-if="view==='applicants'">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <div>   
                <div class="pp-section-title" style="margin-bottom:4px">
                    {{selectedDrive.name}}
                </div>
                <div style="color:#6b7280;font-size:14px">
                    {{ selectedDrive.job_title }}
                </div>
            </div>
            <button class="btn-pp-outline" @click="view='dashboard'">
                Back
            </button>
        </div>

        <div class="pp-card">
            <div v-if="selectedDrive.applicants.length===0"
                class="empty-state">
                <p>No applications received yet</p>
            </div>
            <div v-for="a in selectedDrive.applicants" :key="a.id" class="pp-row">
                <div>
                    <div class="pp-row-name">{{a.student_name}}</div>
                    <div class="pp-row-sub">
                        {{a.department}}
                        <span v-if="a.cgpa" class="ms-2">CGPA:{{a.cgpa}}</span>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:10px">
                    <span :class="badgeClass(a.status)">{{a.status}}</span>
                    <button class="btn-pp-primary"
                        @click="reviewApplication(a.id)">
                        Review
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="pp-section" v-if="view==='review'">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <div class="pp-section-title" style="margin-bottom:0">Review Application</div>
            <button class="btn-pp-outline" @click="view='applicants'">
                Back
            </button>
        </div>

        <div class="pp-card" style="max-width:480px">
            <div class="pp-card-body pp-form">
                <div style="background:#f8f9ff;border-radius:10px;padding:16px;margin-bottom:20px">
                    <div style="display:flex;align-items:center;gap:12px">
                        <div>
                            <div style="font-weight:600;color:#1a1a2e">
                                {{applicationData.student_name}}
                            </div>
                            <div style="font-size:13px;color:#6b7280">
                                {{applicationData.department}}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Drive</span>
                    <span class="detail-value">{{applicationData.drive_name}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Job Title</span>
                    <span class="detail-value">{{applicationData.job_title}}</span>
                </div>
                <div class="detail-row" style="margin-bottom:20px">
                    <span class="detail-label">Current Status</span>
                    <span :class="badgeClass(applicationData.status)">
                        {{applicationData.status}}
                    </span>
                </div>

                <div class="mb-3">
                    <label class="form-label">Candidate Status</label>
                    <select class="form-select" v-model="applicationData.status">
                        <option value="shortlisted">Shortlist</option>
                        <option value="waitlisted">Waitlist</option>
                        <option value="selected">Select</option>
                        <option value="rejected">Reject</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="form-label">Remarks</label>
                    <input class="form-control" v-model="applicationData.remarks" placeholder="Optional">
                </div>
                <button class="btn-pp-primary w-100" style="padding:10px;font-size:15px"@click="updateStatus">
                    Save Decision
                </button>
            </div>
        </div>
    </div>
    <div class="pp-section" v-if="view=='profile'">
        <div style="display:flex;justify-content:space-between;width:57%;align-items:center;margin-bottom:20px">
            <div class="pp-section-title" style="margin-bottom:0">Company Profile</div>
            <button class="btn-pp-outline" @click="view='dashboard'">
                Back
            </button>
        </div>

        <div class="row" style="max-width:960px">
            <div class="col-md-5 mb-4">
                <div class="pp-card">
                    <div class="pp-card-body" style="padding-top:44px;text-align:center">
                        <div style="font-size:18px;font-weight:700;color:#1a1a2e">
                            {{profile.name}}
                        </div>
                        <div style="margin-top:8px">
                            <span :class="badgeClass(profile.approval)">
                                {{profile.approval}}
                            </span>
                        </div>
                        <div style="margin-top:20px;text-align:left">
                            <div class="detail-row">
                                <span class="detail-label">
                                    HR Contact
                                </span>
                                <span class="detail-value">
                                    {{profile.hr_contact}}
                                </span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">
                                    Website
                                </span>
                                <span class="detail-value">
                                    <a v-if="profile.website" :href="profile.website" target="_blank" style="color:#4f8ef7;text-decoration:none;">
                                        {{profile.website}}
                                    </a>
                                </span>
                            </div>
                            <div class="detail-row" style="align-items:flex-start">
                                <span class="detail-label">
                                    Overview
                                </span>
                                <span class="detail-value" style="white-space:pre-line;line-height:1.6">
                                    {{profile.overview}}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-5 mb-4">
                <div class="pp-card">
                    <div class="pp-card-header">
                        <span>
                            Drives
                        </span>
                        <span style="background:#e0f2fe;color:#0369a1;padding:3px 10px;border-radius:20px;font-size:12px">
                            {{profile.drives.length}}
                        </span>
                    </div>
                    <div v-if="profile.drives.length===0" class="empty-state">
                        <p>No drives created yet</p>
                    </div>
                    <div v-for="d in profile.drives" :key="d.id" class="pp-row">
                        <div>
                            <div class="pp-row-name">{{d.drive_name}}</div>
                            <div class="pp-row-sub">
                                {{d.job_title}}
                                <span v-if="d.deadline"> · Deadline:{{d.deadline}}</span>
                            </div>
                        </div>
                        <span :class="badgeClass(d.status)">{{d.status}}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
    data:function(){
        return{
            view:"dashboard",
            companyData:{id:"",username:"",approval:"",current_drives:[],closed_drives:[]},
            selectedDrive:{name:"",job_title:"",applicants:[]},
            newDrive:{},
            applicationData:{},
            profile:{id:"",name:"",hr_contact:"",website:"",approval:"",overview:"",drives:[]},
        }
    },
    mounted(){
        fetch(`/api/company/dashboard`,
            {
                method:'GET',
                headers:{
                    "Content-Type":'application/json',
                    "Authentication-Token":localStorage.getItem('auth-token')
                },
            }
        )
    .then(response=>response.json())
    .then(data=>this.companyData=data)
    },
    methods:{
        loadDashboard:function(){
            fetch(`/api/company/dashboard`,
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
            this.companyData=data,
            this.view="dashboard"
        })
        },
        closeDrive:function(did){
            fetch(`/api/company/drives/close/${did}`,{
                method:'PATCH',
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
        viewApplicants:function(did){
            fetch(`/api/company/applications/view/${did}`,{
                method:'PATCH',
                headers:{
                    "Content-Type":'application/json',
                    "Authentication-Token":localStorage.getItem('auth-token')
                }
            })
            .then(response=>response.json())
            .then(data=>{
                this.selectedDrive=data
                this.view="applicants"
            })
        },
        submitDrive:function(cid){
            fetch(`/api/company/drives/create/${cid}`,{
                method:'POST',
                headers:{
                    "Content-Type":'application/json',
                    "Authentication-Token":localStorage.getItem('auth-token')   
                },
                body:JSON.stringify(this.newDrive) 
            })
            .then(response=>response.json())
            .then(data=>{
                alert(data.message)
                this.newDrive={}
                this.loadDashboard()
            })
        },
        reviewApplication:function(aid){
            fetch(`/api/company/applications/get/${aid}`,{
                method:'GET',
                headers:{
                    "Content-Type":'application/json',
                    "Authentication-Token":localStorage.getItem('auth-token')   
                }
            })
            .then(response=>response.json())
            .then(data=>{
                this.applicationData=data
                this.view='review'
            })
        },
        updateStatus:function(){
            fetch(`/api/company/applications/review/${this.applicationData.id}`,{
                method:'PATCH',
                headers:{
                    "Content-Type":'application/json',
                    "Authentication-Token":localStorage.getItem('auth-token')   
                },
                body:JSON.stringify(this.applicationData)
            })
            .then(response=>response.json())
            .then(data=>{
                alert(data.message)
                this.loadDashboard()
            })
        },
        loadProfile:function(){
            fetch(`/api/company/profile`,{
                method:'GET',
                headers:{
                    "Content-Type":'application/json',
                    "Authentication-Token":localStorage.getItem('auth-token')   
                },
            })
            .then(response=>response.json())
            .then(data=>{
                this.profile=data
                this.view="profile"
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