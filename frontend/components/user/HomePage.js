export default {
  name: "HomePage",
  template: `
    <div class="container mt-4">
      <div class="text-center mb-4">
        <h2 class="fw-bold">
          <i class="bi bi-stars text-primary me-2"></i>Welcome to Life Skills App
        </h2>
        <p class="text-muted">Let's build your daily habits and life skills together!</p>
      </div>

      <div class="row g-4">
        <div class="col-md-6">
          <div class="card h-100 shadow-sm">
            <div class="card-body text-center">
              <h5 class="card-title">
                <i class="bi bi-bullseye text-danger me-2"></i>Goal Tracker
              </h5>
              <p class="card-text">Set and track your weekly personal goals easily.</p>
              <router-link to="/goals" class="btn btn-outline-primary btn-sm">Go to Goals</router-link>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card h-100 shadow-sm">
            <div class="card-body text-center">
              <h5 class="card-title">
                <i class="bi bi-heart-pulse text-success me-2"></i>Healthy Habits
              </h5>
              <p class="card-text">Practice good daily habits and track your progress.</p>
              <router-link to="/habits" class="btn btn-outline-success btn-sm">Daily Habits</router-link>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card h-100 shadow-sm">
            <div class="card-body text-center">
              <h5 class="card-title">
                <i class="bi bi-patch-question text-warning me-2"></i>Take Test
              </h5>
              <p class="card-text">Test your learning with fun quizzes and challenges.</p>
              <router-link to="/test" class="btn btn-outline-warning btn-sm">Take a Test</router-link>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card h-100 shadow-sm">
            <div class="card-body text-center">
              <h5 class="card-title">
                <i class="bi bi-graph-up-arrow text-dark me-2"></i>Summary
              </h5>
              <p class="card-text">Check how you're doing and get your progress report.</p>
              <router-link to="/result" class="btn btn-outline-dark btn-sm">View Summary</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};


// This code defines a Vue.js component for the home page of a life skills application.
// It includes a welcome message and four main sections: Goal Tracker, Healthy Habits, Take Test, and Summary.
// Each section is represented as a card with a title, description, and a button that links to the respective page.
// The layout is responsive, using Bootstrap classes for styling and spacing.
// The component is designed to provide users with quick access to the main features of the application, encouraging them to engage with the content and tools available for personal development.
// The use of icons and concise text enhances the user experience, making it visually appealing and easy to navigate.
// This home page serves as a central hub for users to start their journey in building life skills and improving their daily habits. 
