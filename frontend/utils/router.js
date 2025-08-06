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

// Acad
import AcadDashboard from "../components/acad/AcadDashboard.js";
import AcadHomePage from "../components/acad/AcadHomePage.js";
import ModulesPage from "../components/acad/ModulesPage.js";
import IndividualModulePage from "../components/acad/IndividualModulePage.js";
import QuestionBankPage from "../components/acad/QuestionBankPage.js";
import ConceptPage from "../components/acad/ConceptPage.js";
import ConceptQuestionsPage from "../components/acad/ConceptQuestionsPage.js";
import QuestionCreationPage from "../components/acad/QuestionCreationPage.js";
import IndividualQuestionPage from "../components/acad/IndividualQuestionPage.js";
import EditQuestionPage from "../components/acad/EditQuestionPage.js";
import ReviewPage from "../components/acad/ReviewPage.js";
import ArchivedQuestionsPage from "../components/acad/ArchivedQuestionsPage.js";

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
  { path: '/admin/settings', name: 'AdminSettings', component: AdminSettings }, { path: "/acad-dashboard", name: "AcadDashboard", component: AcadDashboard },
  { path: "/acad/home", name: "AcadHomePage", component: AcadHomePage },
  { path: "/acad/modules", name: "ModulePage", component: ModulesPage },

  {
    path: "/acad/module/:mcode",
    component: IndividualModulePage,
    props: (route) => ({
      mcode: route.params.mcode,
      filter: route.query.filter || "all",
    }),
  },
  {
    path: "/acad/question-bank",
    name: "QuestionBankPage",
    component: QuestionBankPage,
  },
  { path: "/acad/concepts", name: "ConceptPage", component: ConceptPage },

  {
    path: "/acad/concept/:ccode",
    component: ConceptQuestionsPage,
    props: (route) => ({ ccode: route.params.ccode }),
  },
  {
    path: "/acad/question/create",
    name: "QuestionCreationPage",
    component: QuestionCreationPage,
  },
  {
    path: "/acad/question/:qcode",
    name: "IndividualQuestionPage",
    component: IndividualQuestionPage,
  },
  {
    path: "/acad/question/edit/:qcode",
    name: "EditQuestionPage",
    component: EditQuestionPage,
  },
  {
    path: "/acad/questions/review",
    name: "ReviewPage",
    component: ReviewPage,
  },
  {
    path: "/acad/archived-questions",
    name: "ArchivedQuestionsPage",
    component: ArchivedQuestionsPage,
  },
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
// router.beforeEach((to, from, next) => {
//   const token = localStorage.getItem('auth-token');
//   const role = localStorage.getItem('role'); // 'user' or 'admin'
//   const publicPages = ['Login', 'Register'];

//   // Public pages can be accessed without auth
//   if (publicPages.includes(to.name)) {
//     return next();
//   }

//   // Block any private route if not logged in
//   if (!token) {
//     return next({ name: 'Login' });
//   }

//   // Admin pages access restriction
//   if (to.path.startsWith('/admin') && role !== 'admin') {
//     return next({ name: 'Home' }); // redirect to user dashboard/home
//   }
//   next();
// });
// // Navigation guard to protect private routes
// router.beforeEach((to, from, next) => {
//   const token = localStorage.getItem("auth-token");
//   const publicPages = ["Login", "Register"];

//   if (!publicPages.includes(to.name) && !token) {
//     next({ name: "Login" });
//   } else {
//     next();
//   }
// });

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("auth-token");
  const role = localStorage.getItem("role"); // 'user', 'admin', 'academic'
  const publicPages = ["Login", "Register"];

  if (publicPages.includes(to.name)) {
    return next();
  }

  if (!token) {
    return next({ name: "Login" });
  }

  // Role-based protection
  if (to.path.startsWith("/admin") && role !== "admin") {
    return next({ name: "Home" });
  }

  if (to.path.startsWith("/acad") && role !== "academic") {
    return next({ name: "Home" });
  }

  next();
});


export default router;
