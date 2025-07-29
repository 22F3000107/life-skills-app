export default {
  name: "ModuleHeader",
  props: {
    selectedModule: String,
    filteredQuestionsCount: Number,
    activeFiltersCount: Number,
  },
  template: `
    <div class="card border-0 shadow-lg mb-4" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);">
      <div class="card-body p-4">
        <div class="row align-items-center">
          <div class="col">
            <div class="d-flex align-items-center gap-3">
              <div class="bg-primary bg-opacity-10 p-3 rounded-circle">
                <i class="bi bi-journal-bookmark text-primary fs-4"></i>
              </div>
              <div>
                <h1 class="mb-1 fw-bold text-dark">{{ selectedModule }}</h1>
                <p class="text-muted mb-0">
                  <i class="bi bi-collection me-2"></i>
                  {{ filteredQuestionsCount }} questions available
                  <span v-if="activeFiltersCount > 0" class="ms-2">
                    <i class="bi bi-funnel-fill text-primary"></i>
                    {{ activeFiltersCount }} filter{{ activeFiltersCount > 1 ? 's' : '' }} applied
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div class="col-auto">
            <div class="d-flex gap-2">
    <router-link
  to="/acad/question/create"
  class="btn btn-primary btn-lg px-4"
  style="background: linear-gradient(45deg, #667eea, #764ba2); border: none;"
>
  <i class="bi bi-plus-circle me-2"></i>Create Question
</router-link>

            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};
