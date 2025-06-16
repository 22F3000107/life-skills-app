// export default {
// 	template: `<div><nav class="navbar navbar-expand-lg bg-body-tertiary navbar bg-dark border-bottom border-body" data-bs-theme="dark">
//  			<div class="container-fluid">

//     			<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
//       			<span class="navbar-toggler-icon"></span></button>
//     			<div class="collapse navbar-collapse" id="navbarNavDropdown">
//       				<ul class="navbar-nav">
//         				<li class="nav-item">
//           					<a class="nav-link active" aria-current="page" href="/" >Home</a>
//         				</li>
//         				<li class="nav-item">
//           					<a class="nav-link" href="/#/quiz" >Quiz</a>
//         				</li>
// 					<li class="nav-item">
// 						<a class="nav-link" href="/#/create/subject" v-show="this.$route.name=='Home'" >Create Subject</a>
// 					</li>
// 					<li class="nav-item">
// 						<a class="nav-link" href="/#/create/quiz" v-show="this.$route.name=='Quiz'">Create Quiz</a>
// 					</li>
//         				<li class="nav-item">
//           					<a class="nav-link" href="/#/asummary">Summary</a>
//        					</li>
// 					<li class="nav-item">
//           					<a class="nav-link" href="/" @click="logout">Logout</a>
//         				</li>
//       				</ul>
//     			</div>
// 			<div class="d-flex"><h1 class="navbar-brand --bs-info" >Welcome Admin</h1></div>
//   			</div>
// 			</nav></div>`,
// 	methods:{
// 		logout(){
// 			localStorage.removeItem('auth-token')
// 			localStorage.removeItem('role')
// 			}
// 		},
// }