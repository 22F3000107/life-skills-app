import { getUserSummary } from "../../utils/api.js";

export default {
  name: "SummaryPage",
  data() {
    return {
      summaryData: [],
      coins: 0,
      testsTaken: 0,
      currentStreak: 0,
      habitsCompletedToday: 0,
      lastUpdated: new Date().toLocaleString(),
      overall: { current: 0, previous: 0 },
      chart: null,
      token: localStorage.getItem("auth-token")
    };
  },
  computed: {
    motivationalMessage() {
      const percent = this.overall.current;
      if (percent >= 85) return "🌟 Fantastic! You’re making awesome progress!";
      if (percent >= 70) return "🔥 Great effort! Keep up the good work!";
      if (percent >= 50) return "💪 You're getting there. Focus on consistency!";
      return "⏳ Let's make next week stronger!";
    }
  },
  methods: {
    async fetchSummary() {
      try {
        const data = await getUserSummary(this.token);
        this.summaryData = data.skills.map((s, i) => ({
          id: i + 1,
          skill: s.name,
          current: s.current,
          previous: s.previous,
          feedback: s.feedback
        }));
        this.coins = data.coins;
        this.testsTaken = data.tests_taken;
        this.currentStreak = data.current_streak;
        this.habitsCompletedToday = data.habits_completed_today;
        this.overall = data.overall;
        this.$nextTick(() => this.renderChart());
      } catch (err) {
        console.error("Failed to load summary data", err.message);
      }
    },
    trendClass(current, previous) {
      if (current > previous) return "text-success fw-bold";
      if (current < previous) return "text-danger fw-bold";
      return "text-muted";
    },
    getFeedback(current, previous) {
      if (current > previous) return "Improved from last quiz!";
      if (current < previous) return "Slight drop, let’s review again!";
      return "Same as before, keep practicing!";
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

      const canvas = this.$refs.skillChart;
      if (!canvas) {
        console.error("Canvas not found");
        return;
      }

      const ctx = canvas.getContext("2d");
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
    this.fetchSummary();
  },
  template: `
    <div class="container mt-4">
      <h2>User Summary</h2>
      <p class="text-muted">Last updated: {{ lastUpdated }}</p>
      <div class="alert alert-info">{{ motivationalMessage }}</div>

      <div class="row mb-4">
        <div class="col-md-3"><strong>Coins:</strong> {{ coins }}</div>
        <div class="col-md-3"><strong>Tests Taken:</strong> {{ testsTaken }}</div>
        <div class="col-md-3"><strong>Current Streak:</strong> {{ currentStreak }} days</div>
        <div class="col-md-3"><strong>Habits Today:</strong> {{ habitsCompletedToday }}</div>
      </div>

      <div class="table-responsive">
        <table class="table table-bordered">
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
            <tr v-for="row in summaryData" :key="row.id">
              <td>{{ row.id }}</td>
              <td>{{ row.skill }}</td>
              <td :class="trendClass(row.current, row.previous)">{{ row.current }}%</td>
              <td :class="trendClass(row.previous, row.current)">{{ row.previous }}%</td>
              <td>{{ getFeedback(row.current, row.previous) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mb-4">
        <button class="btn btn-primary" @click="exportCSV">Export Summary as CSV</button>
      </div>

      <div class="card p-3">
        <canvas ref="skillChart" v-if="summaryData.length"></canvas>
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