export default {
  name: "ReportsAnalytics",
  data() {
    return {
      stats: {
        users: 150,
        academics: 8,
        quizzes: 22,
        stories: 18
      },
      timeView: 'Week',
      chartLoaded: false
    };
  },
  methods: {
    setView(view) {
      this.timeView = view;
      this.updateCharts();  // Update chart when view changes
    },
    updateCharts() {
      // Dummy logic for now, can be replaced with API later
      this.initCharts();
    },
    initCharts() {
      // Destroy any previous charts (if using dynamic update later)

      // Line Chart: Quiz Attempts by Time View
      const ctx1 = document.getElementById("lineChart").getContext("2d");
      new Chart(ctx1, {
        type: "line",
        data: {
          labels: this.timeView === 'Week' ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] :
                  this.timeView === 'Month' ? ["Week 1", "Week 2", "Week 3", "Week 4"] :
                  this.timeView === 'Year' ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"] :
                  ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
          datasets: [{
            label: "Quiz Attempts",
            data: [12, 19, 10, 14, 20, 23, 17].slice(0, this.timeView === 'Month' ? 4 : this.timeView === 'Year' ? 7 : 7),
            fill: false,
            borderColor: "#0d6efd",
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: true } }
        }
      });

      // Bar Chart: Skill Engagement
      const ctx2 = document.getElementById("barChart").getContext("2d");
      new Chart(ctx2, {
        type: "bar",
        data: {
          labels: ["Healthy Habits", "Emotional Intelligence", "Finance", "Communication"],
          datasets: [{
            label: "Quizzes Taken",
            data: [30, 22, 18, 25],
            backgroundColor: ["#198754", "#fd7e14", "#0dcaf0", "#6610f2"]
          }]
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true } }
        }
      });

      this.chartLoaded = true;
    }
  },
  mounted() {
    this.initCharts();
  },
  template: `
    <div class="container mt-4 mb-5">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="fw-bold">📊 Reports & Analytics</h2>
        
        <!-- View Toggle Dropdown -->
        <div class="dropdown">
          <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
            View: {{ timeView }}
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="#" @click.prevent="setView('Day')">Day</a></li>
            <li><a class="dropdown-item" href="#" @click.prevent="setView('Week')">Week</a></li>
            <li><a class="dropdown-item" href="#" @click.prevent="setView('Month')">Month</a></li>
            <li><a class="dropdown-item" href="#" @click.prevent="setView('Year')">Year</a></li>
          </ul>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="row text-center mb-4">
        <div class="col-md-3 mb-3">
          <div class="card shadow-sm border-start border-primary border-4">
            <div class="card-body">
              <h5>👤 Total Users</h5>
              <h2>{{ stats.users }}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card shadow-sm border-start border-success border-4">
            <div class="card-body">
              <h5>🎓 Academic Members</h5>
              <h2>{{ stats.academics }}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card shadow-sm border-start border-warning border-4">
            <div class="card-body">
              <h5>📝 Total Quizzes</h5>
              <h2>{{ stats.quizzes }}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card shadow-sm border-start border-danger border-4">
            <div class="card-body">
              <h5>📘 Total Stories</h5>
              <h2>{{ stats.stories }}</h2>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="row">
        <div class="col-md-6 mb-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="text-center">📈 Quiz Attempts ({{ timeView }})</h5>
              <canvas id="lineChart" height="200"></canvas>
            </div>
          </div>
        </div>

        <div class="col-md-6 mb-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="text-center">📊 Skill-wise Engagement</h5>
              <canvas id="barChart" height="200"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};


// This code defines a Vue.js component for the Reports & Analytics page in an admin dashboard.
// It includes summary cards for total users, academic members, quizzes, and stories,
// as well as charts for quiz attempts and skill-wise engagement.
// It allows the admin to toggle between different time views (Day, Week, Month, Year),
// and initializes the charts using Chart.js when the component is mounted.
// The component uses Bootstrap for styling and layout, and includes methods to update the charts based on the selected view.
// The template structure includes a header, summary cards, and two charts displayed side byside.
// The charts are dynamically updated based on the selected time view, providing a visual representation of user engagement and activity on the platform.
// The component is designed to be user-friendly and visually appealing, making it easy for admins to monitor and analyze platform performance and user engagement effectively.
// This code sets up a Vue.js component for the Reports & Analytics page in an admin dashboard.
// It includes summary statistics and interactive charts to visualize user engagement and activity over different time periods.
// The component allows admins to switch between daily, weekly, monthly, and yearly views,
// and it initializes the charts using Chart.js when the component is mounted.