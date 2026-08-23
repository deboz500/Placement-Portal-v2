export default{
    props:['loggedIn'],
    template:`
    <nav class="pp-navbar">
        <div class="brand">
            HireWire
        </div>
        <div class="nav-right">
            <button v-if="loggedIn" class="nav-link" @click="logoutUser">Logout</button>
        </div>
    </nav>
    `,
    methods:{
        logoutUser:function(){
            fetch('/api/logout',{
                method:'POST',
                headers:{
                    "Content-Type":'application/json',
                    "Authentication-Token":localStorage.getItem('auth-token')
                }
            })
            .then(()=>{
                localStorage.clear()
                this.$emit('logout')
                this.$router.push('/')
            })
        }
    }
}
