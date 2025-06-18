export default {
  name: "SummaryPage",
  data() {
    return {
      summaryData: [
        { id: 1, skill: "Healthy Habits", current: 80, previous: 70 },
        { id: 2, skill: "Emotional Intelligence", current: 65, previous: 68 },
        { id: 3, skill: "Financial Literacy", current: 75, previous: 60 },
        { id: 4, skill: "Communication", current: 60, previous: 60 }
      ]
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
    }
  },
  methods: {
    trendIcon(current, previous) {
      if (current > previous) return "🔼";
      if (current < previous) return "🔽";
      return "➖";
    }
  },
  template: `
    <div class="container mt-4 mb-5">
      <div class="text-center mb-4">
        <h2 class="fw-bold">📊 My Progress Summary</h2>
        <p class="text-muted">Track how you're improving across different skills!</p>
      </div>

      <div class="card shadow-sm">
        <div class="card-body">
          <table class="table table-bordered text-center">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Skill</th>
                <th>Current Accuracy</th>
                <th>Previous Accuracy</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in summaryData" :key="row.id">
                <td>{{ index + 1 }}</td>
                <td>{{ row.skill }}</td>
                <td>{{ row.current }}%</td>
                <td>{{ row.previous }}%</td>
                <td>{{ trendIcon(row.current, row.previous) }}</td>
              </tr>
            </tbody>
            <tfoot class="table-light fw-bold">
              <tr>
                <td colspan="2">Overall</td>
                <td>{{ overall.current }}%</td>
                <td>{{ overall.previous }}%</td>
                <td>{{ trendIcon(overall.current, overall.previous) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  `
};
