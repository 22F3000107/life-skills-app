// Import components
import LoginPage from "../components/common/LoginPage.js";
import RegistrationPage from "../components/common/RegistrationPage.js";
import HomePage from "../components/user/HomePage.js";
import GoalTrackerPage from "../components/user/GoalTrackerPage.js";
import HealthyHabitsPage from "../components/user/HealthyHabitsPage.js";
import TakeTestPage from "../components/user/TakeTestPage.js";
import SummaryPage from "../components/user/SummaryPage.js";
import SettingsPage from "../components/user/SettingsPage.js";
import AcadDashboard from "../components/acad/AcadDashboard.js";
import AcadHomePage from "../components/acad/AcadHomePage.js";
import ModulesPage from "../components/acad/ModulesPage.js";
import IndividualModulePage from "../components/acad/IndividualModulePage.js";
import QuestionBankPage from "../components/acad/QuestionBankPage.js";
import ConceptPage from "../components/acad/ConceptPage.js";
import ConceptQuestionsPage from "../components/acad/ConceptQuestionsPage.js";
import QuestionCreationPage from "../components/acad/QuestionCreationPage.js";
import IndividualQuestionPage from "../components/acad/IndividualQuestionPage.js";
// Basic page components

const Admin = {
  template:
    "<div><h2>Admin Dashboard</h2><p>[Admin tools and stats go here]</p></div>",
};

// Define routes
const routes = [
  { path: "/", name: "Home", component: HomePage },
  { path: "/login", name: "Login", component: LoginPage },
  { path: "/register", name: "Register", component: RegistrationPage },
  { path: "/habits", name: "Habits", component: HealthyHabitsPage },
  { path: "/goals", name: "Goals", component: GoalTrackerPage },
  { path: "/test", name: "Test", component: TakeTestPage },
  { path: "/result", name: "Result", component: SummaryPage },
  { path: "/settings", name: "Settings", component: SettingsPage },
  { path: "/admin", name: "Admin", component: Admin },
  { path: "/acad-dashboard", name: "AcadDashboard", component: AcadDashboard },
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
];

// Create router instance
const router = new VueRouter({
  mode: "hash",
  routes,
});

// Navigation guard to protect private routes
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("auth-token");
  const publicPages = ["Login", "Register"];

  if (!publicPages.includes(to.name) && !token) {
    next({ name: "Login" });
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
