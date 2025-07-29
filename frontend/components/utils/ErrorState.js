export const ErrorState = {
  name: "ErrorState",
  props: {
    error: {
      type: String,
      required: true,
    },
  },
  emits: ["go-back"],
  template: `
    <div class="error-container">
      <div class="card border-0 shadow-sm border-danger">
        <div class="card-body text-center p-5">
          <i class="fas fa-exclamation-triangle text-danger mb-3" style="font-size: 3rem;"></i>
          <h5 class="text-danger">Error Loading Question</h5>
          <p class="text-muted mb-4">{{ error }}</p>
          <button class="btn btn-primary" @click="$emit('go-back')">
            <i class="fas fa-arrow-left me-2"></i>Go Back
          </button>
        </div>
      </div>
    </div>
  `,
};
