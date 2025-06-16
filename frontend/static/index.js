// import router from "./utils/router.js"
// import AdminNavbar from './components/AdminNavbar.js'
// import UserNavbar from './components/UserNavbar.js'
// import store from './utils/store.js'

import LoginPage from "../components/LoginPage";

// router.beforeEach((to, from, next) => {
// 	if ((!(['Login','Regis'].includes(to.name))) && !localStorage.getItem('auth-token') ? true : false)
// 	next({ name: 'Login'})
// 	else next()
// })

// new Vue({
// 	el: '#app',
// 	template: `<div style="background-color: #C0C0C0;"><AdminNavbar v-if="userRole=='admin'" /><UserNavbar v-if="userRole=='user'" /><router-view /></div>`,
// 	data(){
// 		return{
// 			userRole:localStorage.getItem('role'),
// 			}
// 		},
// 	router,
// 	components:
// 		{
// 		AdminNavbar,
// 		UserNavbar,
// 		},
// 	updated(){
// 		this.userRole=localStorage.getItem('role')
// 	}
// 	})

// Assuming components and router are defined elsewhere
// Simulating simple component examples inline

const AdminNavbar = {
  template: `
    <nav class="navbar navbar-dark bg-dark p-2">
      <span class="navbar-brand">Admin Panel</span>
    </nav>
  `
};

const UserNavbar = {
  template: `
    <nav class="navbar navbar-light bg-light p-2">
      <span class="navbar-brand">User Dashboard</span>
    </nav>
  `
};

// Sample views
const Login = {
  template: '<div><h2>Login Page</h2><p>Please login to continue.</p></div>'
};
const Home = {
  template: '<div><h2>Welcome to the Life Skills App</h2><p>This is the home page.</p></div>'
};
const Habits = {
  template: '<div><h2>Healthy Habits</h2></div>'
};
const Goals = {
  template: '<div><h2>Goal Tracker</h2></div>'
};
const Admin = {
  template: '<div><h2>Admin Dashboard</h2></div>'
};

// Vue Router setup
const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/habits', name: 'Habits', component: Habits },
  { path: '/goals', name: 'Goals', component: Goals },
  { path: '/admin', name: 'Admin', component: Admin }
];

const router = new VueRouter({ routes });

// Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth-token');
  const publicPages = ['Login'];

  if (!publicPages.includes(to.name) && !token) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

// Vue Instance
new Vue({
  el: '#app',
  router,
  data() {
    return {
      userRole: localStorage.getItem('role') // 'admin' or 'user'
    };
  },
  template: `
    <div style="background-color: #C0C0C0;">
      <component :is="navbarComponent" />
      <router-view />
    </div>
  `,
  components: {
    AdminNavbar,
    UserNavbar
  },
  computed: {
    navbarComponent() {
      return this.userRole === 'admin' ? 'AdminNavbar' : 'UserNavbar';
    }
  },
  updated() {
    this.userRole = localStorage.getItem('role');
  }
});
