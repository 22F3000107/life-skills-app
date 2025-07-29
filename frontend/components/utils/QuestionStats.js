export const QuestionStats = {
  name: "QuestionStats",
  props: {
    question: { type: Object, required: true },
  },
  template: `
    <div class="card border-0 shadow-lg" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95);">
      <div class="card-header bg-transparent border-0 p-4">
        <h5 class="mb-0 fw-bold text-dark">
          <i class="bi bi-bar-chart text-primary me-2"></i>
          Question Stats
        </h5>
      </div>
      <div class="card-body p-4">
        <div class="stats-grid">
          <div class="stat-item mb-3">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-type text-info"></i>
              <span class="stat-label">Type:</span>
              <span class="stat-value">{{ question.type }}</span>
            </div>
          </div>
          <div class="stat-item mb-3">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-people text-success"></i>
              <span class="stat-label">Age Groups:</span>
              <span class="stat-value">{{ question.age.length }}</span>
            </div>
          </div>
          <div class="stat-item mb-3" v-if="question.type !== 'Matching'">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-list text-warning"></i>
              <span class="stat-label">Options:</span>
              <span class="stat-value">{{ question.options.length }}</span>
            </div>
          </div>
          <div class="stat-item mb-3" v-if="question.type === 'Matching'">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-diagram-2 text-warning"></i>
              <span class="stat-label">Pairs:</span>
              <span class="stat-value">{{ question.matchPairs.length }}</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-flag text-danger"></i>
              <span class="stat-label">Status:</span>
              <span class="badge" :class="{
                'bg-success': question.status === 'Approved',
                'bg-warning text-dark': question.status === 'Review',
                'bg-danger': question.status === 'Rejected'
              }">{{ question.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};
