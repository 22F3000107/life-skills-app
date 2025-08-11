export const BulkActionsModal = {
  name: "BulkActionsModal",
  props: {
    show: Boolean,
    selectedQuestionsCount: Number,
    restoreComment: String,
    isProcessing: Boolean,
  },
  emits: ["close", "bulk-restore", "bulk-delete", "update:restoreComment"],
  template: `
    <div v-if="show" class="modal d-block" style="background: rgba(0,0,0,0.5); z-index: 1050;">
      <div class="modal-dialog modal-lg">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
          <div class="modal-header bg-primary text-white" style="border-radius: 20px 20px 0 0;">
            <h5 class="modal-title">
              <i class="bi bi-check2-all me-2"></i>
              Bulk Actions ({{ selectedQuestionsCount }} questions)
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-4">
              <label class="form-label fw-semibold">Comment (Optional)</label>
              <textarea
                :value="restoreComment"
                @input="$emit('update:restoreComment', $event.target.value)"
                class="form-control"
                rows="3"
                placeholder="Add a comment for all selected questions..."
                style="border-radius: 12px;"
              ></textarea>
            </div>
            <div class="row g-3">
              <div class="col-md-6">
                <div class="d-grid">
                  <button 
                    class="btn btn-success btn-lg"
                    @click="$emit('bulk-restore')"
                    :disabled="isProcessing"
                  >
                    <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="bi bi-arrow-clockwise me-2"></i>
                    Restore All
                  </button>
                </div>
              </div>
              <div class="col-md-6">
                <div class="d-grid">
                  <button 
                    class="btn btn-danger btn-lg"
                    @click="$emit('bulk-delete')"
                    :disabled="isProcessing"
                  >
                    <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="bi bi-trash me-2"></i>
                    Delete All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};
