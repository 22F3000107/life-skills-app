export const DeleteModal = {
  name: "DeleteModal",
  props: {
    show: Boolean,
    currentQuestion: Object,
    isProcessing: Boolean,
  },
  emits: ["close", "delete"],
  template: `
    <div v-if="show" class="modal d-block" style="background: rgba(0,0,0,0.5); z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
          <div class="modal-header bg-danger text-white" style="border-radius: 20px 20px 0 0;">
            <h5 class="modal-title">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Confirm Permanent Deletion
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
          </div>
          <div class="modal-body p-4">
            <div class="alert alert-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              <strong>Warning:</strong> This action cannot be undone. The question will be permanently deleted from the system.
            </div>
            <div v-if="currentQuestion">
              <strong>Question to delete:</strong> {{ currentQuestion.qcode }} - {{ currentQuestion.question_statement.substring(0, 100) }}...
            </div>
          </div>
          <div class="modal-footer p-4 border-0">
            <button class="btn btn-outline-secondary btn-lg" @click="$emit('close')">
              Cancel
            </button>
            <button 
              class="btn btn-danger btn-lg"
              @click="$emit('delete')"
              :disabled="isProcessing"
            >
              <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="bi bi-trash me-2"></i>
              Delete Permanently
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
};
