export const RestoreModal = {
  name: "RestoreModal",
  props: {
    show: Boolean,
    currentQuestion: Object,
    restoreComment: String,
    isProcessing: Boolean,
  },
  emits: ["close", "restore", "update:restoreComment"],
  template: `
    <div v-if="show" class="modal d-block" style="background: rgba(0,0,0,0.5); z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
          <div class="modal-header bg-success text-white" style="border-radius: 20px 20px 0 0;">
            <h5 class="modal-title">
              <i class="bi bi-arrow-clockwise me-2"></i>
              Restore Question
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
          </div>
          <div class="modal-body p-4">
            <div class="alert alert-info">
              <i class="bi bi-info-circle me-2"></i>
              This will restore the question back to draft status and make it available for editing.
            </div>
            <div v-if="currentQuestion" class="mb-3">
              <strong>Question:</strong> {{ currentQuestion.qcode }} - {{ currentQuestion.question_statement.substring(0, 100) }}...
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Restore Comment (Optional)</label>
              <textarea
                :value="restoreComment"
                @input="$emit('update:restoreComment', $event.target.value)"
                class="form-control"
                rows="3"
                placeholder="Add a comment about why this question is being restored..."
                style="border-radius: 12px;"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer p-4 border-0">
            <button class="btn btn-outline-secondary btn-lg" @click="$emit('close')">
              Cancel
            </button>
            <button 
              class="btn btn-success btn-lg"
              @click="$emit('restore')"
              :disabled="isProcessing"
            >
              <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="bi bi-arrow-clockwise me-2"></i>
              Restore Question
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
};
