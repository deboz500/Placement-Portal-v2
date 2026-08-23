export default{
    template:`
    <div class="home-body">
       <div class="home-inner">
            <div class="pp-login-container">
                <div class="card pp-login-card shadow-sm">
                    <div class="card-body">
                        <h1 class="pp-login-title mb-4">Welcome</h1>
                        <div class="pp-login-form">
                            <div class="mb-3">
                                <label for="email" class="form-label pp-form-label">Email Address</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    class="form-control pp-form-control" 
                                    style="cursor:text"
                                    @keyup.enter="loginUser"
                                    placeholder="Enter your email"
                                    v-model="formData.email"
                                    required
                                >
                            </div>

                            <div class="mb-3">
                                <label for="password" class="form-label pp-form-label">Password</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    class="form-control pp-form-control" 
                                    style="cursor:text"
                                    placeholder="Enter your password"
                                    v-model="formData.password"
                                    @keyup.enter="loginUser"
                                    required
                                >
                            </div>

                            <button class="btn btn-primary w-100 pp-login-btn" @click="loginUser">Login</button>
                        </div>

                        <p class="text-center mt-3 pp-signup-link">
                            Don't have an account? 
                            <a href="#/register" class="pp-link">Sign up here</a>
                        </p>
                    </div>
                </div>
            </div>
       </div>
    </div>
    `,
    data:function(){
        return{
            formData:{
                email:"",
                password:""
            }
        }
    },
    methods:{
        loginUser:function(){
            fetch('/api/login',{
                method:'POST',
                headers:{
                    "Content-Type":'application/json'
                },
                body:JSON.stringify(this.formData)//content goes to backend as json string
            })
            //fetch() will return promise
            .then(response=>response.json())
            .then(data=>{
                console.log(data)
                if (!Object.keys(data).includes("auth-token")){
                alert(data.message)
                return
                }
                localStorage.setItem("auth-token", data["auth-token"])
                localStorage.setItem("username", data.username)
                this.$emit('login')
                if (data.roles.includes("student")){
                    this.$router.push('/student/dashboard')
                }
                else if (data.roles.includes("company")){
                    this.$router.push('/company/dashboard')
                }
                else if (data.roles.includes("admin")){
                    this.$router.push('/admin/dashboard')
                }       
            })
        }
    }
}
