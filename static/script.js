import Home from './components/Home.js'
import Login from './components/Login.js'
import Register from './components/Register.js'
import Navbar from './components/Navbar.js'
import Admin_Dashboard from './components/Admin_Dashboard.js'
import Student_Dashboard from './components/Student_Dashboard.js'
import Company_Dashboard from './components/Company_Dashboard.js'

const routes=[
    {path:'/',component:Home},
    {path:'/login',component:Login},
    {path:'/register',component:Register},
    {path:'/admin/dashboard',component:Admin_Dashboard},
    {path:'/student/dashboard',component:Student_Dashboard},
    {path:'/company/dashboard',component:Company_Dashboard}
]
const router=new VueRouter({
    routes
})
const app=new Vue({
    el:"#app",
    router,
    template:`
    <div>
        <nav-bar :loggedIn='loggedIn' @logout="handleLogout"></nav-bar>
        <router-view :loggedIn='loggedIn' @login="handleLogin"></router-view>
    </div>
    `,
    data:{
       loggedIn:!!localStorage.getItem('auth-token')
    },
    components:{
        "nav-bar":Navbar
    },
    methods:{
        handleLogout(){
            this.loggedIn=false
        },
        handleLogin(){
            this.loggedIn=true
        }
    }
})