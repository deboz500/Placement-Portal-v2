export default{
    template:`
    <div class="home-body">
       <div class="home-inner">
            <div class="pp-login-container" style="padding:40px 0">
                <div class="card pp-login-card shadow-sm" style="border-radius:30px;width:460px;padding-top:20px">
                    <div class="card-body">
                        <div style="text-align:center;margin-bottom:24px">
                            <h1 class="pp-login-title mb-1">Join HireWire</h1>
                            <div class="subtitle" style="color:#9ca3af;font-size:14px">Create an account</div>
                        </div>

                        <div v-if="message" :class="'pp-alert '+category">{{message}}</div>

                        <div class="mb-4" style="display:flex;gap:8px">
                            <button type="button" @click="role='student'"
                                :style="role==='student'
                                    ? 'flex:1;padding:9px;border-radius:8px;border:none;background:#1a1a2e;color:#fff;font-weight:600;cursor:pointer'
                                    :'flex:1;padding:9px;border-radius:8px;border:1.5px solid #e5e7eb;background:#fff;color:#6b7280;cursor:pointer'">
                                Student
                            </button>
                            <button type="button" @click="role='company'"
                                :style="role==='company'
                                    ?'flex:1;padding:9px;border-radius:8px;border:none;background:#1a1a2e;color:#fff;font-weight:600;cursor:pointer'
                                    :'flex:1;padding:9px;border-radius:8px;border:1.5px solid #e5e7eb;background:#fff;color:#6b7280;cursor:pointer'">
                                Company
                            </button>
                        </div>

                        <div class="pp-login-form">
                            <div class="mb-3">
                                <label class="form-label pp-form-label">Username</label>
                                <input type="text" class="form-control pp-form-control" style="cursor:text" v-model="formData.username">
                            </div>
                            <div class="mb-3">
                                <label class="form-label pp-form-label">Email Address</label>
                                <input type="email" class="form-control pp-form-control" style="cursor:text" v-model="formData.email">
                            </div>
                            <div class="mb-3">
                                <label class="form-label pp-form-label">Password</label>
                                <input type="password" class="form-control pp-form-control" style="cursor:text" v-model="formData.password">
                            </div>

                            <template v-if="role==='student'">
                                <div class="mb-3">
                                    <label class="form-label pp-form-label">Department</label>
                                    <select class="form-select pp-form-control" style="cursor:pointer" v-model="formData.department">
                                        <option value="">Select Department</option>
                                        <option value="Computer Science">Computer Science</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Mechanical">Mechanical</option>
                                        <option value="Civil">Civil</option>
                                        <option value="Electrical">Electrical</option>
                                        <option value="Chemical">Chemical</option>
                                    </select>
                                </div>
                                <div class="row">
                                    <div class="col-sm-6 mb-3">
                                        <label class="form-label pp-form-label">CGPA</label>
                                        <input type="number" step="0.01" min="0" max="10" class="form-control pp-form-control" style="cursor:text" v-model="formData.cgpa">
                                    </div>
                                    <div class="col-sm-6 mb-3">
                                        <label class="form-label pp-form-label">Year</label>
                                        <select class="form-select pp-form-control" style="cursor:pointer" v-model="formData.year">
                                            <option value="">Select Year</option>
                                            <option value="1">1st Year</option>
                                            <option value="2">2nd Year</option>
                                            <option value="3">3rd Year</option>
                                            <option value="4">4th Year</option>
                                        </select>
                                    </div>
                                </div>
                            </template>

                            <template v-if="role==='company'">
                                <div class="mb-3">
                                    <label class="form-label pp-form-label">HR Contact</label>
                                    <input type="text" class="form-control pp-form-control" style="cursor:text" v-model="formData.hrContact">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label pp-form-label">Website</label>
                                    <input type="url" class="form-control pp-form-control" style="cursor:text" v-model="formData.website">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label pp-form-label">Company Overview</label>
                                    <textarea class="form-control pp-form-control" rows="3" style="cursor:text" v-model="formData.overview"></textarea>
                                </div>
                            </template>
                            <button class="btn btn-primary w-100 pp-login-btn" :disabled="loading" @click="addUser">
                                {{'Create Account'}}
                            </button>
                        </div>
                        <p class="text-center mt-3 pp-signup-link">
                            Already have an account? 
                            <a href="#/login" class="pp-link">Login here</a>
                        </p>
                    </div>
                </div>
            </div>
       </div>
    </div>
    `,
    data:function(){
        return{
            role:"student",
            message:null,
            category:null,
            formData:{
                email:"",
                password:"",
                username:"",
                department:"",
                cgpa:"",
                year:"",
                hrContact:"",
                website:"",
                overview:""
            }
        }
    },
    methods:{
    addUser:function(){
        this.formData.username=this.formData.username.trim()
        this.formData.email=this.formData.email.trim()
        this.formData.password=this.formData.password.trim()

        if (!this.formData.username||!this.formData.email||!this.formData.password){
            this.message="Please fill in username, email and password"
            this.category="danger"
            return
        }
        this.loading=true
        let url
        if (this.role==="student"){
            url="/api/register/student"
        } else{
            url="/api/register/company"
        }

        let body
        if (this.role==="student"){
        body={
                username:this.formData.username,
                email:this.formData.email,
                password:this.formData.password,
                department:this.formData.department,
                year:this.formData.year,
                cgpa:this.formData.cgpa
            }
        } 
        else 
        {
            body={
                username:this.formData.username,
                email:this.formData.email,
                password:this.formData.password,
                overview:this.formData.overview,
                hr_contact:this.formData.hrContact,
                website:this.formData.website
            }
        }

        fetch(url,{
            method:'POST',
            headers:{"Content-Type": 'application/json' },
            body:JSON.stringify(body)
        })
        .then(response=>response.json())
        .then(data=>{
            this.message=data.message
            this.category="success"
            this.loading=false
            alert(data.message)
            this.$router.push('/login')
        })
        .catch(err=>{
            this.message="Could not connect to server."
            this.category="danger"
            this.loading=false
        })
    }
}
    
}