export default {
  name: "AdminDashboard",
  data() {
    return {
      adminName: "Admin",
      stats: {
        totalUsers: 120,
        totalQuizzes: 45,
        flaggedItems: 6,
        pendingApprovals: 3,
        academicMembers: 8,
        activeToday: 23
      },
      reminders: [
        { title: "Reminder to complete quiz", date: "2025-06-18" },
        { title: "New weekly habit starts", date: "2025-06-20" }
      ],
      logs: [
        "📌 User A completed a quiz",
        "🧠 New story added by Academic Member",
        "⚠️ User B flagged a question",
        "✅ Reminder sent to 5 inactive users"
      ]
    };
  },
  mounted() {
    // Later: fetch real stats from backend here
  },
  template: `
    <div class="container mt-4 mb-5">
      <!-- Welcome -->
      <div class="text-center mb-4">
        <h2 class="fw-bold">Welcome, {{ adminName }}</h2>
        <p class="text-muted">This is your control panel for managing the Life Skills App.</p>
      </div>

      <!-- Dashboard Cards -->
      <div class="row text-center g-4 mb-4">
        <div class="col-md-4">
          <div class="card shadow-sm p-3 bg-light">
            <h6>👥 Total Users</h6>
            <p class="fw-bold fs-4 text-primary">{{ stats.totalUsers }}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card shadow-sm p-3 bg-light">
            <h6>🧠 Quizzes Created</h6>
            <p class="fw-bold fs-4 text-success">{{ stats.totalQuizzes }}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card shadow-sm p-3 bg-light">
            <h6>🚩 Flagged Content</h6>
            <p class="fw-bold fs-4 text-danger">{{ stats.flaggedItems }}</p>
          </div>
        </div>
      </div>

      <!-- Second Row -->
      <div class="row text-center g-4 mb-4">
        <div class="col-md-4">
          <div class="card shadow-sm p-3 bg-light">
            <h6>🕵️ Pending Approvals</h6>
            <p class="fw-bold fs-4 text-warning">{{ stats.pendingApprovals }}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card shadow-sm p-3 bg-light">
            <h6>👨‍🏫 Academic Members</h6>
            <p class="fw-bold fs-4 text-secondary">{{ stats.academicMembers }}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card shadow-sm p-3 bg-light">
            <h6>🌐 Active Users Today</h6>
            <p class="fw-bold fs-4 text-info">{{ stats.activeToday }}</p>
          </div>
        </div>
      </div>

      <!-- Reminders + Logs -->
      <div class="row g-4">
        <div class="col-md-6">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-warning text-white fw-bold">⏰ Scheduled Reminders</div>
            <div class="card-body">
              <ul class="list-group">
                <li v-for="(rem, i) in reminders" :key="i" class="list-group-item d-flex justify-content-between">
                  <span>{{ rem.title }}</span>
                  <small class="text-muted">{{ rem.date }}</small>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-secondary text-white fw-bold">📜 Recent Activity Logs</div>
            <div class="card-body">
              <ul class="list-group">
                <li v-for="(log, i) in logs" :key="i" class="list-group-item">
                  {{ log }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-4">
        <h5 class="mb-3 fw-semibold">⚡ Quick Actions</h5>
        <div class="d-flex flex-wrap gap-3">
          <router-link to="/admin/stories" class="btn btn-outline-primary">📘 Add New Story</router-link>
          <router-link to="/admin/quizzes" class="btn btn-outline-success">➕ Create Quiz</router-link>
          <router-link to="/admin/users" class="btn btn-outline-dark">🔎 Manage Users</router-link>
        </div>
      </div>
    </div>
  `
};


// This code defines an Admin Dashboard component for a Vue.js application.
// It provides a summary of platform activity with statistics on total users, quizzes, and flagged content.
// The dashboard includes quick access links to manage users, stories, quizzes, flagged content, reports,
// and reminder settings.
// The component uses Bootstrap classes for styling and Vue Router for navigation.
// The admin's name is displayed at the top, and the statistics are dynamically populated from the `data` object.
// The layout is responsive, adapting to different screen sizes using Bootstrap's grid system.
// This component serves as a central hub for administrators to monitor and manage the platform effectively.