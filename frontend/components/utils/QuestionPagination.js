export default {
  name: "QuestionPagination",
  props: {
    currentPage: Number,
    totalPages: Number,
    showingRangeText: String,
    isLoading: Boolean,
    // Additional props for advanced mode
    questionsPerPage: Number,
    filteredQuestionsCount: Number,
    mode: {
      type: String,
      default: "simple",
    },
  },
  emits: ["changePage"],
  computed: {
    visiblePages() {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, this.currentPage - delta);
        i <= Math.min(this.totalPages - 1, this.currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (this.currentPage - delta > 2) {
        rangeWithDots.push(1, "...");
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (this.currentPage + delta < this.totalPages - 1) {
        rangeWithDots.push("...", this.totalPages);
      } else {
        if (this.totalPages > 1) rangeWithDots.push(this.totalPages);
      }

      return rangeWithDots;
    },

    computedShowingRangeText() {
      if (this.showingRangeText) {
        return this.showingRangeText;
      }

      // For advanced mode
      const start = (this.currentPage - 1) * this.questionsPerPage + 1;
      const end = Math.min(
        this.currentPage * this.questionsPerPage,
        this.filteredQuestionsCount
      );
      return `Showing ${start} to ${end} of ${this.filteredQuestionsCount.toLocaleString()} questions`;
    },
  },
  template: `
    <div v-if="!isLoading && totalPages > 1" :class="mode === 'simple' ? 'px-4 py-4 border-top' : 'pt-3 border-top'">
      <div class="row align-items-center" :class="mode === 'simple' ? '' : 'gy-2'">
        <div class="col-md-6" :class="mode === 'simple' ? '' : 'text-center text-md-start'">
          <p class="text-muted mb-0 small" :style="mode === 'advanced' ? 'font-size: 0.85rem;' : ''">
            <i v-if="mode === 'advanced'" class="bi bi-info-circle me-1 text-primary"></i>
            {{ computedShowingRangeText }}
          </p>
        </div>
        <div class="col-md-6">
          <nav class="d-flex justify-content-md-end justify-content-center mt-3 mt-md-0">
            <ul class="pagination mb-0" :class="mode === 'simple' ? 'pagination-lg' : 'pagination-sm'" style="--bs-pagination-border-radius: 15px;">
              <!-- Previous Button -->
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" :class="mode === 'simple' ? '' : 'px-2 py-1'" @click="$emit('changePage', currentPage - 1)" :disabled="currentPage === 1">
                  <i class="bi bi-chevron-left" :class="mode === 'advanced' ? 'small' : ''"></i>
                </button>
              </li>
              <!-- Page Numbers -->
              <li
                v-for="page in visiblePages"
                :key="page"
                class="page-item"
                :class="{ active: page === currentPage, disabled: page === '...' }"
              >
                <button
                  v-if="page !== '...'"
                  class="page-link"
                  :class="mode === 'simple' ? (page === currentPage ? 'bg-gradient' : '') : 'px-2 py-1'"
                  @click="$emit('changePage', page)"
                  :style="page === currentPage ? 'background: linear-gradient(45deg, #667eea, #764ba2); border-color: #667eea; color: white;' + (mode === 'advanced' ? ' font-size: 0.85rem;' : '') : (mode === 'advanced' ? 'font-size: 0.85rem;' : '')"
                >
                  {{ page }}
                </button>
                <span v-else class="page-link" :class="mode === 'simple' ? '' : 'px-2 py-1'" :style="mode === 'advanced' ? 'font-size: 0.85rem;' : ''">{{ mode === 'simple' ? '...' : '…' }}</span>
              </li>
              <!-- Next Button -->
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" :class="mode === 'simple' ? '' : 'px-2 py-1'" @click="$emit('changePage', currentPage + 1)" :disabled="currentPage === totalPages">
                  <i class="bi bi-chevron-right" :class="mode === 'advanced' ? 'small' : ''"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  `,
};
