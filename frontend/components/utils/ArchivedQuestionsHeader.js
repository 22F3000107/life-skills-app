export const ArchivedQuestionsHeader = {
  name: "ArchivedQuestionsHeader",
  props: {
    filteredQuestionsCount: Number,
    selectedQuestionsCount: Number,
    activeFiltersCount: Number,
  },
  emits: ["show-bulk-actions"],
  template: `
    <div class="card border-0 shadow-lg" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);">
      <div class="card-body p-4">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <div class="d-flex align-items-center gap-3">
              <div class="bg-danger bg-opacity-10 p-3 rounded-circle">
                <i class="bi bi-archive text-danger fs-2"></i>
              </div>
              <div>
                <h1 class="mb-1 fw-bold text-dark">Archived Questions</h1>
                <p class="text-muted mb-0">
                  <i class="bi bi-trash me-2"></i>
                  {{ filteredQuestionsCount }} archived questions
                  <span v-if="selectedQuestionsCount > 0" class="ms-3">
                    <i class="bi bi-check2-square me-1"></i>
                    {{ selectedQuestionsCount }} selected
                  </span>
                  <span v-if="activeFiltersCount > 0" class="ms-2">
                    <i class="bi bi-funnel-fill text-primary"></i>
                    {{ activeFiltersCount }} filter{{ activeFiltersCount > 1 ? 's' : '' }} applied
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="d-flex gap-2 justify-content-lg-end">
              <button 
                v-if="selectedQuestionsCount > 0"
                class="btn btn-warning btn-lg px-4"
                @click="$emit('show-bulk-actions')"
              >
                <i class="bi bi-arrow-clockwise me-2"></i>
                Bulk Actions ({{ selectedQuestionsCount }})
              </button>
              <router-link to="/acad/question-bank" class="btn btn-primary btn-lg px-4" style="background: linear-gradient(45deg, #667eea, #764ba2); border: none;">
                <i class="bi bi-collection me-2"></i>Question Bank
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};
