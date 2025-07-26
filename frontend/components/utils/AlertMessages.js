export const AlertMessages = {
  name: "AlertMessages",
  props: {
    error: String,
    successMessage: String,
  },
  emits: ["clear-error", "clear-success"],
  template: `
    <div>
      <div v-if="error" class="row mb-4">
        <div class="col">
          <div class="alert alert-danger alert-dismissible fade show" style="border-radius: 15px;">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ error }}
            <button type="button" class="btn-close" @click="$emit('clear-error')"></button>
          </div>
        </div>
      </div>

      <div v-if="successMessage" class="row mb-4">
        <div class="col">
          <div class="alert alert-success alert-dismissible fade show" style="border-radius: 15px;">
            <i class="bi bi-check-circle me-2"></i>
            {{ successMessage }}
            <button type="button" class="btn-close" @click="$emit('clear-success')"></button>
          </div>
        </div>
      </div>
    </div>
  `,
};
