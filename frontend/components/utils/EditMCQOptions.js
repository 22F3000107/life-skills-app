export const EditMCQOptions = {
  name: "EditMCQOptions",
  props: {
    options: {
      type: Array,
      required: true,
    },
    questionType: {
      type: String,
      required: true,
    },
    validationErrors: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["update:options", "add-option", "remove-option", "mcq-option-change"],
  computed: {
    localOptions: {
      get() {
        return this.options;
      },
      set(value) {
        this.$emit("update:options", value);
      },
    },
  },
  template: `
    <div>
      <div class="mb-3">
        <div class="alert alert-info" style="border-radius: 12px;">
          <i class="bi bi-info-circle me-2"></i>
          <strong>{{ questionType === 'MCQ' ? 'Single Choice:' : 'Multiple Choice:' }}</strong>
          {{ questionType === 'MCQ' ? 'Select exactly one correct answer' : 'Select one or more correct answers' }}
        </div>
      </div>
      
      <div class="row g-3">
        <div v-for="(option, index) in localOptions" :key="index" class="col-lg-6">
          <div class="option-editor" :class="{ 'correct-option': option.correct }">
            <div class="option-header p-3">
              <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                  <input
                    :type="questionType === 'MCQ' ? 'radio' : 'checkbox'"
                    :name="questionType === 'MCQ' ? 'mcq_correct' : ''"
                    v-model="option.correct"
                    @change="questionType === 'MCQ' ? $emit('mcq-option-change', index) : null"
                    class="form-check-input me-3"
                    :id="'option_' + index"
                  />
                  <label class="form-check-label fw-bold" :for="'option_' + index">
                    Option {{ String.fromCharCode(65 + index) }}
                  </label>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <span v-if="option.correct" class="badge bg-success">
                    <i class="bi bi-check-circle me-1"></i>Correct
                  </span>
                  <button 
                    v-if="localOptions.length > 2"
                    type="button" 
                    class="btn btn-sm btn-outline-danger"
                    @click="$emit('remove-option', index)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="option-content p-3">
              <textarea
                v-model="option.text"
                class="form-control"
                rows="2"
                placeholder="Enter option text..."
                style="border-radius: 8px;"
                :class="{ 'is-invalid': validationErrors['option_' + index] }"
              ></textarea>
              <div v-if="validationErrors['option_' + index]" class="invalid-feedback">
                {{ validationErrors['option_' + index] }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-3 d-flex justify-content-between align-items-center">
        <button 
          v-if="localOptions.length < 6"
          type="button" 
          class="btn btn-outline-primary"
          @click="$emit('add-option')"
        >
          <i class="bi bi-plus-circle me-2"></i>Add Option
        </button>
        <div class="text-end">
          <div v-if="validationErrors.correct_mcq" class="text-danger small">
            {{ validationErrors.correct_mcq }}
          </div>
          <div v-if="validationErrors.correct_msq" class="text-danger small">
            {{ validationErrors.correct_msq }}
          </div>
        </div>
      </div>
    </div>
  `,
};
