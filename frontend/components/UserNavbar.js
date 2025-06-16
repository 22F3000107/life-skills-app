// export default {
// 	template: `<div><nav class="navbar navbar-expand-lg bg-body-tertiary navbar bg-dark border-bottom border-body" data-bs-theme="dark">
//  			<div class="container-fluid">

//     			<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
//       			<span class="navbar-toggler-icon"></span></button>
//     			<div class="collapse navbar-collapse" id="navbarNavDropdown">
//       				<ul class="navbar-nav">
//         				<li class="nav-item">
//           					<a class="nav-link active" aria-current="page" href="/" @click="isquiz=false">Home</a>
//         				</li>
// 						<li class="nav-item">
//           					<a class="nav-link" href="/#/scores">Scores</a>
//         				</li>
//         				<li class="nav-item">
//           					<a class="nav-link" href="/#/summary">Summary</a>
//        					</li>
// 					<li class="nav-item">
//           					<a class="nav-link" href="/" @click="logout">Logout</a>
//         				</li>
//       				</ul>
//     			</div>
// 			<div class="d-flex"><h1 class="navbar-brand --bs-info" v-show="role=='user'">Welcome User</h1></div>
//   			</div>
// 			</nav></div>`,
// 	data(){
// 		return{
// 			isquiz: false,
// 			role: null,
// 			}
// 		},
// 	methods:{
// 		logout(){
// 			localStorage.removeItem('auth-token')
// 			localStorage.removeItem('role')
// 			}
// 		},
// 	async mounted(){
// 		if(this.$route.name=='Quiz'){
// 			this.isquiz=true
// 		}
// 		this.role = localStorage.getItem('role')
// 		},

// }