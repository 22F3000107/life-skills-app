export default {
  name: "PublicNavbar",
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary px-3 shadow-sm">
      <div class="container-fluid">
        <router-link to="/" class="navbar-brand d-flex align-items-center gap-2">
          <img src="./images/lifeskills-logo.png" alt="Life Skills Logo" height="40" />
          <span class="fw-bold text-white">LifeSkills</span>
        </router-link>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <router-link to="/login" class="btn btn-outline-light btn-sm me-2">Login</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/register" class="btn btn-outline-light btn-sm me-2">Register</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `
};




// This code defines a Vue.js component for a public navigation bar.
// It includes links to the login and registration pages, styled with Bootstrap classes.
// The navbar has a primary background color and displays the app title "Life Skills App".
// The component is designed for use in a public-facing part of the application, where users can access login and registration functionalities.
