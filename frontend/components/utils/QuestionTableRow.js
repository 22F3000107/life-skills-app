
export const QuestionTableRow = {
  name: "QuestionTableRow",
  props: {
    question: Object,
    index: Number,
    isSelected: Boolean,
    isProcessing: Boolean,
  },
  emits: [
    "toggle-selection",
    "view-question",
    "restore-question",
    "delete-question",
  ],
  methods: {
    getTypeIcon(type) {
      switch (type) {
        case "MCQ":
          return "bi-list-check";
        case "MSQ":
          return "bi-check2-square";
        case "True/False":
          return "bi-toggle-on";
        case "Matching":
          return "bi-diagram-2";
        default:
          return "bi-question-circle";
      }
    },
    getArchiveReasonColor(reason) {
      const colors = {
        "Outdated Content": "warning",
        Duplicate: "info",
        "Low Quality": "danger",
        "Policy Change": "secondary",
        Other: "dark",
      };
      return colors[reason] || "secondary";
    },
    formatDate(dateString) {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  template: `
    <tr
      class="question-row"
      style="transition: all 0.3s ease;"
      :style="{ 'animation-delay': (index * 0.05) + 's' }"
    >
      <td class="px-4 py-3">
        <input 
          type="checkbox" 
          class="form-check-input"
          :checked="isSelected"
          @change="$emit('toggle-selection', question.id)"
        />
      </td>
      <td class="px-4 py-4">
        <div class="bg-danger bg-opacity-10 px-3 py-2 rounded-pill d-inline-block">
          <span class="fw-bold text-danger">Q{{ question.id }}</span>
        </div>
      </td>
      <td class="px-4 py-4">
        <div class="question-text" style="max-width: 400px;">
          <p class="mb-1 fw-medium text-dark" style="line-height: 1.4;">
            {{ question.question_statement.length > 80 ? question.question_statement.substring(0, 80) + '...' : question.question_statement }}
          </p>
          <div class="d-flex align-items-center gap-2 mt-2">
            <span class="badge bg-info bg-opacity-20 text-black px-2 py-1 small">
              <i :class="getTypeIcon(question.type)" class="me-1"></i>
              {{ question.type }}
            </span>
            <span class="badge bg-secondary bg-opacity-20 text-white px-2 py-1 small">
              {{ question.module_name }}
            </span>
          </div>
        </div>
      </td>
      <td class="px-4 py-4 text-center">
        <span 
          class="badge px-3 py-2 fs-6"
          :class="'bg-' + getArchiveReasonColor(question.archive_reason)"
          style="border-radius: 20px;"
        >
          {{ question.archive_reason }}
        </span>
      </td>
      <td class="px-4 py-4 text-center">
        <div class="text-muted small">{{ formatDate(question.archived_date) }}</div>
      </td>
      <td class="px-4 py-4 text-center">
        <div class="text-muted small">{{ question.archived_by }}</div>
      </td>
      <td class="px-4 py-4 text-center">
        <div class="btn-group" role="group">
          <button
            class="btn btn-sm btn-outline-primary"
            @click="$emit('view-question', question.id)"
            title="View Details"
          >
            <i class="bi bi-eye"></i>
          </button>
          <button
  class="btn btn-sm btn-outline-success"
  @click="$emit('restore-question', question)"
  title="Restore Question"
>
  <i class="bi bi-arrow-clockwise"></i>
</button>

<button
  class="btn btn-sm btn-outline-danger"
  @click="$emit('delete-question', question)"
  title="Delete Permanently"
>
  <i class="bi bi-trash"></i>
</button>

        </div>
      </td>
    </tr>
  `,
};
