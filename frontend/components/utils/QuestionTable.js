export default {
  name: "QuestionTable",
  props: {
    paginatedQuestions: {
      type: Array,
      default: () => [],
    },
    sortKey: String,
    sortOrder: String,
    isLoading: Boolean,
    mode: {
      type: String,
      default: "simple", // 'simple' | 'advanced'
      validator: (value) => ["simple", "advanced"].includes(value),
    },
  },
  emits: [
    "goToQuestion",
    "editQuestion",
    "archiveQuestion",
    "setSort",
    "sortBy",
  ],
  methods: {
    getSortIcon(field) {
      const currentSortKey = this.sortKey || this.sortField;
      const currentSortOrder = this.sortOrder || this.sortDirection;

      if (currentSortKey !== field) return "bi-arrows-expand";
      return currentSortOrder === "asc"
        ? "bi-caret-up-fill"
        : "bi-caret-down-fill";
    },

    handleSort(field) {
      if (this.mode === "simple") {
        this.$emit("setSort", field);
      } else {
        this.$emit("sortBy", field);
      }
    },

    getStatusBadgeClass(status) {
      switch (status) {
        case "Approved":
          return "bg-success";
        case "Rejected":
          return "bg-danger";
        case "Pending":
          return "bg-warning text-dark";
        case "Archived":
          return "bg-secondary";
        default:
          return "bg-light text-dark";
      }
    },

    getTypeIcon(type) {
      switch (type) {
        case "MCQ":
          return "bi-list-check";
        case "MSQ":
          return "bi-check2-square";
        case "True/False":
          return "bi-toggle-on";
        default:
          return "bi-question-circle";
      }
    },

    getStatusLabel(is_approved) {
      if (is_approved === true) return "Approved";
      else if (is_approved === false) return "Rejected";
      else return "Pending";
    },

    formatId(id) {
      return this.mode === "simple" ? id : `Q${id}`;
    },
  },
  template: `
    <div class="card border-0 shadow-lg" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);">
      <div class="card-body p-0">
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center p-5">
          <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
          <p class="mt-3 text-muted">Loading questions...</p>
        </div>
        <!-- Questions Table -->
        <div v-else class="table-responsive" style="border-radius: 20px;">
          <table class="table table-hover align-middle mb-0">
            <thead style="background: linear-gradient(45deg, #667eea, #764ba2); color: white;">
              <tr>
                <th class="px-4 py-3 border-0" @click="handleSort(mode === 'simple' ? 'qcode' : 'id')" style="cursor: pointer;">
                  <div class="d-flex align-items-center gap-2">
                    <span class="fw-semibold">{{ mode === 'simple' ? 'QCode' : 'Qcode' }}</span>
                    <i :class="getSortIcon(mode === 'simple' ? 'qcode' : 'id')"></i>
                  </div>
                </th>
                <th class="px-4 py-3 border-0" @click="handleSort(mode === 'simple' ? 'question' : 'question_statement')" style="cursor: pointer;">
                  <div class="d-flex align-items-center gap-2">
                    <span class="fw-semibold">Question{{ mode === 'advanced' ? '' : ' Text' }}</span>
                    <i :class="getSortIcon(mode === 'simple' ? 'question' : 'question_statement')"></i>
                  </div>
                </th>
                <th class="px-4 py-3 border-0 text-center" @click="handleSort('type')" style="cursor: pointer;">
                  <div class="d-flex align-items-center justify-content-center gap-2">
                    <span class="fw-semibold">Type</span>
                    <i :class="getSortIcon('type')"></i>
                  </div>
                </th>
                <th class="px-4 py-3 border-0 text-center" @click="handleSort(mode === 'simple' ? 'age' : 'age_group')" style="cursor: pointer;">
                  <div class="d-flex align-items-center justify-content-center gap-2">
                    <span class="fw-semibold">Age Group</span>
                    <i :class="getSortIcon(mode === 'simple' ? 'age' : 'age_group')"></i>
                  </div>
                </th>
                <th v-if="mode === 'advanced'" class="px-4 py-3 border-0 text-center" @click="handleSort('module_name')" style="cursor: pointer;">
                  <div class="d-flex align-items-center justify-content-center gap-2">
                    <span class="fw-semibold">Module</span>
                    <i :class="getSortIcon('module_name')"></i>
                  </div>
                </th>
                <th class="px-4 py-3 border-0 text-center" @click="handleSort('status')" style="cursor: pointer;">
                  <div class="d-flex align-items-center justify-content-center gap-2">
                    <span class="fw-semibold">Status</span>
                    <i :class="getSortIcon('status')"></i>
                  </div>
                </th>
                <th class="px-4 py-3 border-0 text-center">
                  <span class="fw-semibold">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(q, index) in paginatedQuestions"
                :key="mode === 'simple' ? q.qcode : q.id"
                @click="$emit('goToQuestion', mode === 'simple' ? q.qcode : q.id)"
                class="question-row"
                style="cursor: pointer; transition: all 0.3s ease;"
                :style="{ 'animation-delay': (index * 0.05) + 's' }"
              >
                <td class="px-4 py-4">
                  <div class="d-flex align-items-center gap-3">
                    <div class="bg-primary bg-opacity-10 px-3 py-2 rounded-pill">
                      <span class="fw-bold text-primary">{{ mode === 'simple' ? q.qcode : formatId(q.id) }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="question-text" style="max-width: 400px;">
                    <p class="mb-0 fw-medium text-dark" style="line-height: 1.4;">
                      {{ mode === 'simple' ? 
                          (q.question && q.question.length > 80 ? q.question.substring(0, 80) + '...' : q.question) :
                          (q.question_statement && q.question_statement.length > 50 ? q.question_statement.substring(0, 50) + '...' : q.question_statement) 
                      }}
                    </p>
                  </div>
                </td>
                <td class="px-4 py-4 text-center">
                  <span
                    class="badge px-3 py-2 fs-6"
                    :class="mode === 'simple' ? {
                      'bg-info text-dark': q.type === 'MCQ',
                      'bg-warning text-dark': q.type === 'MSQ',
                      'bg-success': q.type === 'True/False',
                      'bg-info': q.type === 'Matching'
                    } : 'bg-info bg-opacity-20 text-dark'"
                    style="border-radius: 20px;"
                  >
                    <i v-if="mode === 'advanced'" :class="getTypeIcon(q.type) + ' me-1'"></i>
                    {{ q.type }}
                  </span>
                </td>
                <td class="px-4 py-4 text-center">
                  <span 
                    class="badge px-3 py-2 fs-6" 
                    :class="mode === 'simple' ? 'bg-secondary' : 'bg-secondary bg-opacity-20 text-white'"
                    style="border-radius: 20px;"
                  >
                    {{ mode === 'simple' ? q.age + ' years' : q.age_group.join(', ') }}
                  </span>
                </td>
                <td v-if="mode === 'advanced'" class="px-4 py-4 text-center">
                  <span class="badge bg-primary bg-opacity-20 text-white px-3 py-2" style="border-radius: 20px; font-size: 0.75rem;">
                    {{ q.module_name }}
                  </span>
                </td>
                <td class="px-4 py-4 text-center">
                  <span
                    class="badge px-3 py-2 fs-6 position-relative"
                     :class="getStatusBadgeClass(mode === 'simple' ? q.is_approved : getStatusLabel(q.is_approved))"
                    style="border-radius: 20px;"
                  >
                    <i v-if="mode === 'simple'"
                      class="me-2"
                      :class="{
                        'bi bi-check-circle': q.is_approved === true,
                        'bi bi-x-circle': q.is_approved ===false,
                        'bi bi-clock': q.is_approved ===null                      }"
                    ></i>
                    {{ mode === 'simple' ? q.is_approved : getStatusLabel(q.is_approved) }}
                  </span>
                </td>
                <td class="px-4 py-4 text-center">
                  <div class="btn-group" role="group">
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click.stop="$emit('editQuestion', mode === 'simple' ? q.qcode : q.id)"
                      title="Edit Question"
                      style="border-radius: 10px 0 0 10px;"
                    >
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click.stop="$emit('archiveQuestion', mode === 'simple' ? q.qcode : q.id)"
                      title="Archive Question"
                      style="border-radius: 0 10px 10px 0;"
                    >
                      <i class="bi bi-archive"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <!-- Empty State -->
              <tr v-if="paginatedQuestions.length === 0">
                <td :colspan="mode === 'simple' ? 6 : 7" class="text-center py-5">
                  <div class="empty-state">
                    <div class="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                      <i class="bi bi-search fs-1 text-muted"></i>
                    </div>
                    <h5 class="text-muted mb-2">No questions found</h5>
                    <p class="text-muted mb-0">Try adjusting your search criteria or filters</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
};
