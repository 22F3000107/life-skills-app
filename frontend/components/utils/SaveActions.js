export const SaveActions = {
  name: "SaveActions",
  props: {
    isSaving: { type: Boolean, default: false },
    isValidForm: { type: Boolean, default: false },
    validationErrors: { type: Object, default: () => ({}) },
  },
  emits: ["save-question"],
  template: `
    <div class="card border-0 shadow-lg mb-4" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95);">
      <div class="card-header bg-transparent border-0 p-4">
        <h5 class="mb-0 fw-bold text-dark">
          <i class="bi bi-floppy text-primary me-2"></i>
          Save Question
        </h5>
      </div>
      <div class="card-body p-4">
        <div class="d-grid gap-3">
          <button 
            type="button"
            class="btn btn-primary btn-lg"
            @click="$emit('save-question')"
            :disabled="isSaving || !isValidForm"
            style="background: linear-gradient(45deg, #667eea, #764ba2); border: none;"
          >
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-check-circle me-2"></i>
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
        <div class="mt-3">
          <div class="validation-summary">
            <div v-if="Object.keys(validationErrors).length > 0" class="text-danger small">
              <i class="bi bi-exclamation-triangle me-1"></i>
              {{ Object.keys(validationErrors).length }} validation error(s) found
            </div>
            <div v-else-if="isValidForm" class="text-success small">
              <i class="bi bi-check-circle me-1"></i>
              All validations passed
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};
