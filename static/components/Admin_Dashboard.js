export default{
    template:`
    <div>
    <div class="pp-navbar" style="position:relative">
            <div class="brand">
                Welcome {{userData.username}}
            </div>
            <div class="nav-right">
                <div class="pp-search">
                    <input v-model="searchQuery" @keyup.enter="doSearch" placeholder="Search students, companies, drives...">
                    <button class="btn-pp-primary" @click="doSearch">Search</button>
                </div>
                <button class="btn-pp-primary" @click="getStatistics">
                    Statistics
                </button>
            </div>
    </div>

    <div class="pp-section" v-if="view==='dashboard'">
        <div class="row">
            <div class="col-md-6">
                <div class="pp-card mb-4">
                    <div class="pp-card-header">
                        <span>Pending Company Approvals</span>
                        <span class="badge-pending" v-if="userData.pending_companies.length>0">{{userData.pending_companies.length}}</span>
                    </div>
                    <div v-if="userData.pending_companies.length===0" class="empty-state">
                        <p>No pending approvals</p>
                    </div>
                    <div v-for="c in userData.pending_companies" :key="c.id" class="pp-row">
                        <div>
                            <div class="pp-row-name">{{c.name}}</div>
                        </div>
                        <div style="display:flex;gap:6px">
                            <button class="btn-pp-success"
                                @click="approveCompany(c.id)">
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
                <div class="pp-card mb-4">
                    <div class="pp-card-header">
                        <span>Companies List</span>
                    </div>
                    <div v-if="userData.companies.length===0" class="empty-state">
                        <p>No companies registered</p>
                    </div>
                    <div class="pp-table-scroll">
                        <div v-for="c in userData.companies" :key="c.id" class="pp-row">
                            <div>
                                <div class="pp-row-name">{{c.name}}</div>
                                <div class="pp-row-sub">
                                    <span :class="badgeClass(c.approval)">
                                        {{c.approval}}
                                    </span>
                                    <span v-if="c.blacklisted" class="badge-rejected ms-1">blacklisted</span>
                                </div>
                            </div>
                            <button :class="c.blacklisted?'btn-pp-success':'btn-pp-danger'" @click="ControlCompanyBlacklist(c.id)">
                                {{c.blacklisted?'Unblacklist':'Blacklist'}}
                            </button>
                        </div>
                    </div>
                </div>
                <div class="pp-card mb-4">
                    <div class="pp-card-header">
                        <span>Students List</span>
                    </div>
                    <div v-if="userData.students.length===0" class="empty-state">
                        <p>No students registered</p>
                    </div>
                    <div class="pp-table-scroll">
                        <div v-for="s in userData.students" :key="s.id" class="pp-row">
                            <div>
                                <div class="pp-row-name">{{s.name}}</div>
                                <div class="pp-row-sub">{{s.department}}
                                <span v-if="s.blacklisted" class="badge-rejected ms-1">blacklisted</span>
                                </div>
                            </div>
                            <button
                                :class="s.blacklisted?'btn-pp-success':'btn-pp-danger'"
                                @click="ControlStudentBlacklist(s.id)">
                                {{s.blacklisted?'Unblacklist':'Blacklist'}}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="pp-card mb-4">
                    <div class="pp-card-header">
                        <span>Pending Drive Approvals</span>
                        <span class="badge-pending" v-if="userData.pending_drives.length>0">{{userData.pending_drives.length}}</span>
                    </div>
                    <div v-if="userData.pending_drives.length===0" class="empty-state">
                        <p>No drives pending approval</p>
                    </div>
                    <div v-for="d in userData.pending_drives" :key="d.id" class="pp-row">
                        <div>
                            <div class="pp-row-name">{{d.name}}</div>
                            <div class="pp-row-sub">{{d.company}}</div>
                            <div class="pp-row-sub">{{d.job_title}}</div>
                        </div>
                        <div style="display:flex;gap:6px">
                            <button class="btn-pp-success"
                                @click="approveDrive(d.id)">
                               Approve
                            </button>
                        </div>
                    </div>
                </div>
                <div class="pp-card mb-4">
                    <div class="pp-card-header">
                        <span>Ongoing Drives</span>
                    </div>
                    <div v-if="userData.drives.length===0" class="empty-state">
                        <p>No ongoing drives</p>
                    </div>
                    <div v-for="d in userData.drives" :key="d.id" class="pp-row">
                        <div>
                            <div class="pp-row-name">{{d.name}}</div>
                            <div class="pp-row-sub">{{d.company}}</div>
                        </div>
                        <div style="display:flex;gap:6px">
                            <button class="btn-pp-primary" @click="viewDriveDetails(d.id)">
                                View details
                            </button>
                            <button class="btn-pp-outline" @click="closeDrive(d.id)">
                                Complete
                            </button>
                        </div>
                    </div>
                </div>
                <div class="pp-card">
                    <div class="pp-card-header">
                        <span>Completed Drives</span>
                        <span class="badge-closed" v-if="userData.closed_drives && userData.closed_drives.length>0">{{userData.closed_drives.length}}</span>
                    </div>
                    <div v-if="userData.closed_drives.length===0" class="empty-state">
                        <p>No completed drives</p>
                    </div>
                    <div v-else v-for="d in userData.closed_drives" :key="d.id" class="pp-row">
                        <div>
                            <div class="pp-row-name">{{d.name}}</div>
                            <div class="pp-row-sub">{{d.company}}</div>
                            <div class="pp-row-sub">{{d.job_title}}</div>
                        </div>
                        <button class="btn-pp-primary" @click="viewDriveDetails(d.id)">
                            Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="pp-section" v-if="view==='drive'">
        <div class="detail-card">
            <div class="detail-header">
                <span>{{selected_drive.name}}</span>
                <button class="btn-pp-outline1" @click="view='dashboard'">
                    Back
                </button>
            </div>
            <div class="detail-body">
                <div class="detail-row">
                    <span class="detail-label">Job Title</span>
                    <span class="detail-value">{{selected_drive.job_title}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Company</span>
                    <span class="detail-value">{{selected_drive.company}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Description</span>
                    <span class="detail-value">{{selected_drive.job_description}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Eligibility</span>
                    <span class="detail-value">{{ selected_drive.eligibility}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Salary</span>
                    <span class="detail-value">{{selected_drive.salary}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Location</span>
                    <span class="detail-value">{{selected_drive.location}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Deadline</span>
                    <span class="detail-value">{{selected_drive.deadline}}</span>
                </div>
                <hr style="border-color:#f3f4f6">
                <div style="font-weight:600;margin-bottom:12px">Applicants</div>
                <div v-if="selected_drive.applicants && selected_drive.applicants.length===0"
                    class="empty-state">
                    <p>No applicants yet</p>
                </div>
                <div v-for="a in selected_drive.applicants":key="a.id" class="pp-row"
                    style="padding:10px 0">
                    <span style="font-weight:500">{{a.name}}</span>
                    <span :class="badgeClass(a.status)">{{a.status}}</span>
                </div>
            </div>
        </div>
    </div>
    <div class="pp-section" v-if="view==='statistics'">
        <div class="detail-card" style="max-width:700px">
            <div class="detail-header">
                <span>Placement Statistics</span>
                <button class="btn-pp-outline1" @click="view='dashboard'">
                    Back
                </button>
            </div>
            <div class="pp-card-body">
                <table class="table table-sm mb-0" style="font-size:14px">
                    <tbody>
                        <tr>
                            <td style="padding:10px 14px;font-weight:500">Total Students</td>
                            <td style="padding:10px 14px">{{stats.total_students}}</td>
                        </tr>
                        <tr>
                            <td style="padding:10px 14px;font-weight:500">Total Companies</td>
                            <td style="padding:10px 14px">{{stats.total_companies}}</td>
                        </tr>
                        <tr>
                            <td style="padding:10px 14px;font-weight:500">Total Drives</td>
                            <td style="padding:10px 14px">{{stats.total_drives}}</td>
                        </tr>
                        <tr>
                            <td style="padding:10px 14px;font-weight:500">Total Applications</td>
                            <td style="padding:10px 14px">{{stats.total_applications}}</td>
                        </tr>
                        <tr>
                            <td style="padding:10px 14px;font-weight:500">Selected</td>
                            <td style="padding:10px 14px">{{stats.selected}}</td>
                        </tr>
                        <tr>
                            <td style="padding:10px 14px;font-weight:500">Shortlisted</td>
                            <td style="padding:10px 14px">{{stats.shortlisted}}</td>
                        </tr>
                        <tr>
                            <td style="padding:10px 14px;font-weight:500">Rejected</td>
                            <td style="padding:10px 14px">{{stats.rejected}}</td>
                        </tr>
                        <tr>
                            <td style="padding:10px 14px;font-weight:500">Waitlisted</td>
                            <td style="padding:10px 14px">{{stats.waitlisted}}</td>
                        </tr>
                        <tr>
                            <td style="padding:10px 14px;font-weight:500">Placement Rate</td>
                            <td style="padding:10px 14px">{{stats.placement_rate}}%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <div class="pp-section" v-if="view==='search'">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <div class="pp-section-title" style="margin-bottom:0">Results for "{{searchQuery}}"</div>
            <button class="btn-pp-outline" @click="view='dashboard'">Back</button>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="pp-card mb-4">
                    <div class="pp-card-header"><span>Students</span></div>
                    <div v-if="searchResults.students.length===0" class="empty-state"><p>No students found</p></div>
                    <div v-for="s in searchResults.students" :key="s.id" class="pp-row">
                        <div>
                            <div class="pp-row-name">{{s.name}}</div>
                            <div class="pp-row-sub">{{s.department}}
                                <span v-if="s.blacklisted" class="badge-rejected ms-1">blacklisted</span>
                            </div>
                        </div>
                        <button :class="s.blacklisted?'btn-pp-success':'btn-pp-danger'" @click="ControlStudentBlacklist(s.id)">
                            {{s.blacklisted?'Unblacklist':'Blacklist'}}
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="pp-card mb-4">
                    <div class="pp-card-header"><span>Companies</span></div>
                    <div v-if="searchResults.companies.length===0" class="empty-state"><p>No companies found</p></div>
                    <div v-for="c in searchResults.companies" :key="c.id" class="pp-row">
                        <div>
                            <div class="pp-row-name">{{c.name}}</div>
                            <div class="pp-row-sub">
                                <span :class="badgeClass(c.approval)">{{c.approval}}</span>
                                <span v-if="c.blacklisted" class="badge-rejected ms-1">blacklisted</span>
                            </div>
                        </div>
                        <button :class="c.blacklisted?'btn-pp-success':'btn-pp-danger'" @click="ControlCompanyBlacklist(c.id)">
                            {{c.blacklisted?'Unblacklist':'Blacklist'}}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="pp-card">
            <div class="pp-card-header"><span>Drives</span></div>
            <div v-if="searchResults.drives.length===0" class="empty-state"><p>No drives found</p></div>
            <div v-for="d in searchResults.drives" :key="d.id" class="pp-row">
                <div>
                    <div class="pp-row-name">{{d.name}}</div>
                    <div class="pp-row-sub">{{d.company}} — {{d.job_title}}</div>
                </div>
                <div style="display:flex;gap:6px">
                    <span :class="badgeClass(d.status)">{{d.status}}</span>
                    <button class="btn-pp-primary" @click="viewDriveDetails(d.id)">Details</button>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
    data:function(){
        return{
            view:"dashboard",
            userData:{username:"",pending_companies:[],students:[],companies:[],pending_drives:[],drives:[],closed_drives:[]},
            drive_data:{},
            selected_drive:{},
            stats:{
                total_students:"",
                total_companies:"",
                total_drives:"",
                total_applications:"",
                selected:"",
                shortlisted:"",
                waitlisted:"",
                rejected:"",
                placement_rate:""
            },
            searchQuery:"",
            searchResults:{ students:[], companies:[], drives:[] }
        }
    },
    mounted(){
        this.loadDashboard()
    },
    methods:{
        loadDashboard:function(){
            fetch('/api/admin/dashboard',
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
            this.userData=data,
            this.view="dashboard"
        })
        },
        getStatistics:function(){
             fetch('/api/admin/statistics',{
                method:'GET',
                headers:{
                    "Content-Type":'application/json',
                    "Authentication-Token":localStorage.getItem('auth-token')
                }
            })
            .then(response=>response.json())
            .then(data=>{
                this.stats=data
                this.view="statistics"
            })
        },
        sendReport:function(){},
        sendReminders:function(){},
        approveCompany:function(cid){
            fetch(`/api/companies/approve/${cid}`, {
                method:'PATCH',
                headers:{
                    "Content-Type":'application/json',
                    "Authentication-Token":localStorage.getItem('auth-token')
                },
                body:JSON.stringify({company_id:cid})
            })
            .then(response=>response.json())
            .then(data=>{
                alert(data.message)
                this.loadDashboard()
            })
        },
        ControlStudentBlacklist:function(sid){
            fetch(`/api/students/blacklist/${sid}`,{
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
        ControlCompanyBlacklist:function(cid){
            fetch(`/api/companies/blacklist/${cid}`,{
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
        approveDrive:function(did){
            fetch(`/api/drives/approve/${did}`,{
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
        viewDriveDetails:function(did){
            fetch(`/api/drives/${did}`,{
                method:'GET',
                headers:{
                    "Content-Type":'application/json',
                    "Authentication-Token":localStorage.getItem('auth-token')
                }
                })
                .then(response=>response.json())
                .then(data=>{
                    this.drive_data=data
                    this.view='drive'
                })
        },
        closeDrive:function(did){
            fetch(`/api/drives/close/${did}`,{
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
        viewDriveDetails:function(did){
            fetch(`/api/admin/drives/${did}`,{
                method:'GET',
                headers:{
                    "Content-Type":'application/json',
                    "Authentication-Token":localStorage.getItem('auth-token')
                }
            })
            .then(response=>response.json())
            .then(data=>{
                this.selected_drive=data
                this.view="drive"
            })
        },
        doSearch:function(){
            if (!this.searchQuery.trim()) return
            fetch(`/api/admin/search/${this.searchQuery}`,{
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