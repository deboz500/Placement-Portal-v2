export default{
    template:`
    <div class="home-body">
       <div class="home-inner">
            <div class="pp-login-container">
                <div class="card pp-login-card shadow-sm" style="max-width:218px;max-height:38vh;margin-left:-65px;padding:9px;margin-top:15px" >
                    <div class="card-body" style="text-align:center;margin-top:20px">
                        <h1 class="pp-login-title mb-4" @click="$router.push('/login')" style="cursor:pointer">Welcome</h1>
                    </div>
                </div>
            </div>
       </div>
    </div>
    `
}