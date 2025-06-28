export default {
  name: "SummaryPage",
  data() {
    return {
      summaryData: [
        { id: 1, skill: "Healthy Habits", current: 85, previous: 70 },
        { id: 2, skill: "Emotional Intelligence", current: 70, previous: 68 },
        { id: 3, skill: "Financial Literacy", current: 75, previous: 60 },
        { id: 4, skill: "Communication", current: 60, previous: 60 }
      ],
      coins: 120,
      testsTaken: 6,
      currentStreak: 4,
      habitsCompletedToday: 4,
      lastUpdated: new Date().toLocaleString(),
      chart: null
    };
  },
  computed: {
    overall() {
      const total = this.summaryData.length;
      const curr = this.summaryData.reduce((sum, s) => sum + s.current, 0) / total;
      const prev = this.summaryData.reduce((sum, s) => sum + s.previous, 0) / total;
      return {
        current: Math.round(curr),
        previous: Math.round(prev)
      };
    },
    motivationalMessage() {
      const percent = this.overall.current;
      if (percent >= 85) return "🌟 Fantastic! You’re making awesome progress!";
      if (percent >= 70) return "🔥 Great effort! Keep up the good work!";
      if (percent >= 50) return "💪 You're getting there. Focus on consistency!";
      return "⏳ Let's make next week stronger!";
    }
  },
  methods: {
    getFeedback(current, previous) {
      if (current > previous) return "Improved from last quiz!";
      if (current < previous) return "Slight drop, let’s review again!";
      return "Same as before, keep practicing!";
    },
    trendClass(current, previous) {
      if (current > previous) return "text-success fw-bold";
      if (current < previous) return "text-danger fw-bold";
      return "text-muted";
    },
    exportCSV() {
      let csv = 'Skill,Current Score,Previous Score\n';
      this.summaryData.forEach(row => {
        csv += `${row.skill},${row.current}%,${row.previous}%\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "summary_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    renderChart() {
      if (this.chart) this.chart.destroy();
      const ctx = document.getElementById("skillChart").getContext("2d");
      const labels = this.summaryData.map(item => item.skill);
      const currentData = this.summaryData.map(item => item.current);
      const previousData = this.summaryData.map(item => item.previous);

      this.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Current Score",
              data: currentData,
              backgroundColor: "rgba(13, 110, 253, 0.8)"
            },
            {
              label: "Previous Score",
              data: previousData,
              backgroundColor: "rgba(220, 53, 69, 0.8)"
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" }
          },
          scales: {
            y: { beginAtZero: true, max: 100 }
          }
        }
      });
    }
  },
  mounted() {
    this.renderChart();
  },
  updated() {
    this.renderChart();
  },
  template: `
    <div class="container mt-4 mb-5">
      <!-- Page Header -->
      <div class="text-center mb-4">
        <h2 class="fw-bold">
          <i class="bi bi-bar-chart-line-fill text-primary me-2"></i>Progress Summary
        </h2>
        <p class="text-muted">See how you're growing in your life skills journey!</p>
        <p class="text-secondary small">
          <i class="bi bi-clock me-1"></i>Last updated: {{ lastUpdated }}
        </p>
      </div>

      <!-- Dashboard Cards -->
      <div class="row text-center g-3 mb-4">
        <div class="col-md-3">
          <div class="card p-3 bg-light shadow-sm">
            <h6><i class="bi bi-coin me-1 text-warning"></i>Coins Earned</h6>
            <p class="fw-bold fs-5 text-success">{{ coins }}</p>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3 bg-light shadow-sm">
            <h6><i class="bi bi-patch-question-fill me-1 text-primary"></i>Tests Taken</h6>
            <p class="fw-bold fs-5 text-primary">{{ testsTaken }}</p>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3 bg-light shadow-sm">
            <h6><i class="bi bi-lightning-charge-fill me-1 text-warning"></i>Streak</h6>
            <p class="fw-bold fs-5 text-warning">{{ currentStreak }} Days</p>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3 bg-light shadow-sm">
            <h6><i class="bi bi-check2-circle me-1 text-info"></i>Habits Today</h6>
            <p class="fw-bold fs-5 text-info">{{ habitsCompletedToday }}</p>
          </div>
        </div>
      </div>

      <!-- Motivational Message -->
      <div class="alert alert-info text-center fw-semibold mb-4">
        <i class="bi bi-stars me-2"></i>{{ motivationalMessage }}
      </div>

      <!-- Export Button -->
      <div class="text-end mb-2">
        <button class="btn btn-outline-secondary btn-sm" @click="exportCSV">
          <i class="bi bi-download me-1"></i>Export as CSV
        </button>
      </div>

      <!-- Summary Table -->
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <table class="table table-bordered text-center">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Skill</th>
                <th>Current Score</th>
                <th>Previous Score</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in summaryData" :key="row.id">
                <td>{{ index + 1 }}</td>
                <td>{{ row.skill }}</td>
                <td>{{ row.current }}%</td>
                <td>{{ row.previous }}%</td>
                <td :class="trendClass(row.current, row.previous)">
                  {{ getFeedback(row.current, row.previous) }}
                </td>
              </tr>
            </tbody>
            <tfoot class="table-light fw-bold">
              <tr>
                <td colspan="2">Overall</td>
                <td>{{ overall.current }}%</td>
                <td>{{ overall.previous }}%</td>
                <td :class="trendClass(overall.current, overall.previous)">
                  {{ getFeedback(overall.current, overall.previous) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="card shadow-sm">
        <div class="card-body">
          <h5 class="card-title text-center mb-3">
            <i class="bi bi-bar-chart-fill me-2 text-dark"></i>Skill Progress Chart
          </h5>
          <canvas id="skillChart" height="120"></canvas>
        </div>
      </div>
    </div>
  `
};


// This code defines a Vue.js component for a summary page that displays a user's progress across various life skills.
// It includes a table showing current and previous accuracy for each skill, an overall summary, and a button to export the data as a CSV file.
// The component uses computed properties to calculate overall scores and methods to determine trend icons and classes based on performance changes.
// The template is structured with Bootstrap classes for styling, ensuring a clean and responsive layout.
// The summary data is hardcoded for demonstration purposes, but in a real application, it would likely be fetched from an API or database.
// The component also includes a last updated timestamp to indicate when the data was last refreshed, enhancing user experience by providing context
// for the displayed information. The export functionality allows users to download their progress data for offline review or sharing.