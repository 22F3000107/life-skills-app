export const QuestionFormHeader = {
  name: "QuestionFormHeader",
  props: {
    question: {
      type: Object,
      default: () => ({
        qcode: "",
        type: "",
        module: "",
        age: [],
        text: "",
        status: "Pending",
      }),
    },
    isDirty: { type: Boolean, default: false },
    isLoading: { type: Boolean, default: false },
  },
  emits: ["go-back", "preview-question"],
  template: `
    <div class="row mb-4">
      <div class="col">
        <div class="card border-0 shadow-lg" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);">
          <div class="card-body p-4">
            <div class="row align-items-center">
              <div class="col-lg-8">
                <div class="d-flex align-items-center gap-3">
                  <div class="bg-primary bg-opacity-10 p-3 rounded-circle">
                    <i class="bi bi-pencil-square text-primary fs-2"></i>
                  </div>
                  <div>
                    <h1 class="mb-1 fw-bold text-dark">Edit Question</h1>
                    <p class="text-muted mb-0">
                      <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill me-2">
                        Q{{ question.qcode || '...' }}
                      </span>
                      <i class="bi bi-info-circle me-2"></i>
                      Make changes to your question and save when ready
                      <span v-if="isDirty" class="text-warning ms-2">
                        <i class="bi bi-dot"></i>Unsaved changes
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div class="col-lg-4">
                <div class="d-flex gap-2 justify-content-lg-end">
                  <button class="btn btn-outline-secondary btn-lg" @click="$emit('go-back')">
                    <i class="bi bi-arrow-left me-2"></i>Cancel
                  </button>
                  <button class="btn btn-outline-primary btn-lg" @click="$emit('preview-question')">
                    <i class="bi bi-eye me-2"></i>Preview
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
