// Import components
import LoginPage from '../components/common/LoginPage.js';
import RegistrationPage from '../components/common/RegistrationPage.js';
import HomePage from '../components/user/HomePage.js';
import GoalTrackerPage from '../components/user/GoalTrackerPage.js';
import HealthyHabitsPage from '../components/user/HealthyHabitsPage.js';
import TakeTestPage from '../components/user/TakeTestPage.js';
import SummaryPage from '../components/user/SummaryPage.js';
import SettingsPage from '../components/user/SettingsPage.js';

// Admin component
import AdminDashboard from '../components/admin/AdminDashboard.js';
import ManageUsers from '../components/admin/ManageUsers.js';
import ManageStories from '../components/admin/ManageStories.js';
import ManageQuizzes from '../components/admin/ManageQuizzes.js';
import FlaggedContent from '../components/admin/FlaggedContent.js';
import ReportsAnalytics from '../components/admin/ReportsAnalytics.js';
import ReminderSettings from '../components/admin/ReminderSettings.js';
import AdminSettings from '../components/admin/AdminSettings.js';



// Define routes
const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegistrationPage },
  // User routes
  { path: '/habits', name: 'Habits', component: HealthyHabitsPage },
  { path: '/goals', name: 'Goals', component: GoalTrackerPage  },
  { path: '/test', name: 'Test', component: TakeTestPage },
  { path: '/result', name: 'Result', component: SummaryPage },
  { path: '/settings', name: 'Settings', component: SettingsPage },
  // Admin routes
  { path: '/admin', name: 'AdminDashboard', component: AdminDashboard },
  { path: '/admin/users', name: 'ManageUsers', component: ManageUsers },
  { path: '/admin/stories', name: 'ManageStories', component: ManageStories },
  { path: '/admin/quizzes', name: 'ManageQuizzes', component: ManageQuizzes },
  { path: '/admin/flagged', name: 'FlaggedContent', component: FlaggedContent },
  { path: '/admin/reports', name: 'ReportsAnalytics', component: ReportsAnalytics },
  { path: '/admin/reminders', name: 'ReminderSettings', component: ReminderSettings },
  { path: '/admin/settings', name: 'AdminSettings', component: AdminSettings }
];


// Create router instance
const router = new VueRouter({ 
  mode: 'hash',
  routes
});

// Navigation guard to protect private routes
// router.beforeEach((to, from, next) => {
//   const token = localStorage.getItem('auth-token');
//   const publicPages = ['Login', 'Register'];

//   if (!publicPages.includes(to.name) && !token) {
//     next({ name: 'Login' });
//   } else {
//     next();
//   }
// });

// Navigation guard to protect private routes and enforce role-based access
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth-token');
  const role = localStorage.getItem('role'); // 'user' or 'admin'
  const publicPages = ['Login', 'Register'];

  // Public pages can be accessed without auth
  if (publicPages.includes(to.name)) {
    return next();
  }

  // Block any private route if not logged in
  if (!token) {
    return next({ name: 'Login' });
  }

  // Admin pages access restriction
  if (to.path.startsWith('/admin') && role !== 'admin') {
    return next({ name: 'Home' }); // redirect to user dashboard/home
  }
  next();
});


export default router;
// This code sets up a Vue.js router for a life skills application.
// It includes routes for home, login, registration, habits, goals, a test page,
// results, and an admin dashboard.
// It also implements a navigation guard to protect private routes, ensuring that users must be logged in
// to access certain pages. The login and registration components are imported from separate files.
// The router is exported for use in the main Vue instance.
// This allows the application to navigate between different pages and components based on user actions.