// Import components
import LoginPage from '../components/LoginPage.js';
import RegistrationPage from '../components/RegistrationPage.js';
import HomePage from '../components/HomePage.js';
import GoalTrackerPage from '../components/GoalTrackerPage.js';
import HealthyHabitsPage from '../components/HealthyHabitsPage.js';
import TakeTestPage from '../components/TakeTestPage.js';
import SummaryPage from '../components/SummaryPage.js';
import SettingsPage from '../components/SettingsPage.js';

// Basic page components


const Admin = {
  template: '<div><h2>Admin Dashboard</h2><p>[Admin tools and stats go here]</p></div>'
};

// Define routes
const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegistrationPage },
  { path: '/habits', name: 'Habits', component: HealthyHabitsPage },
  { path: '/goals', name: 'Goals', component: GoalTrackerPage  },
  { path: '/test', name: 'Test', component: TakeTestPage },
  { path: '/result', name: 'Result', component: SummaryPage },
  { path: '/settings', name: 'Settings', component: SettingsPage },
  { path: '/admin', name: 'Admin', component: Admin }
];

// Create router instance
const router = new VueRouter({ 
  mode: 'hash',
  routes
});

// Navigation guard to protect private routes
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth-token');
  const publicPages = ['Login', 'Register'];

  if (!publicPages.includes(to.name) && !token) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;
// This code sets up a Vue.js router for a life skills application.
// It includes routes for home, login, registration, habits, goals, a test page,
// results, and an admin dashboard.
// It also implements a navigation guard to protect private routes, ensuring that users must be logged in
// to access certain pages. The login and registration components are imported from separate files.
// The router is exported for use in the main Vue instance.
// This allows the application to navigate between different pages and components based on user actions.