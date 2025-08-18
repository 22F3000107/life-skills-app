export const QuestionDetailsForm = {
  name: "QuestionDetailsForm",
  props: {
    question: {
      type: Object,
      default: () => ({
        qcode: "",
        type: "MCQ",
        module: "",
        age: [],
        text: "",
        status: "Pending",
      }),
    },
    questionTypes: { type: Array, default: () => [] },
    moduleOptions: { type: Array, default: () => [] },
    ageGroups: { type: Array, default: () => [] },
    statusOptions: { type: Array, default: () => [] },
    validationErrors: { type: Object, default: () => ({}) },
  },
  emits: ["update:question", "question-type-change"],
  computed: {
    localQuestion: {
      get() {
        return this.question;
      },
      set(value) {
        this.$emit("update:question", value);
      },
    },
  },
  template: `
    <div class="card border-0 shadow-lg mb-4" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95);">
      <div class="card-header bg-transparent border-0 p-4">
        <h5 class="mb-0 fw-bold text-dark">
          <i class="bi bi-info-circle text-primary me-2"></i>
          Question Details
        </h5>
      </div>
      <div class="card-body p-4">
        <div class="row g-4">
          <!-- Question Type -->
          <div class="col-md-6">
            <label class="form-label fw-semibold">Question Type</label>
            <select 
              v-model="localQuestion.type" 
              @change="$emit('question-type-change')"
              class="form-select form-select-lg"
              style="border-radius: 12px;"
            >
              <option v-for="type in questionTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>

          <!-- Module -->
          <div class="col-md-6">
            <label class="form-label fw-semibold">Module</label>
            <select 
              v-model="localQuestion.module"
              class="form-select form-select-lg"
              style="border-radius: 12px;"
              :class="{ 'is-invalid': validationErrors.module }"
            >
              <option value="">Select Module</option>
              <option v-for="module in moduleOptions" :key="module.id" :value="module.id">{{ module.name }}</option>
            </select>
            <div v-if="validationErrors.module" class="invalid-feedback">
              {{ validationErrors.module }}
            </div>
          </div>

          <!-- Age Groups -->
          <div class="col-12">
            <label class="form-label fw-semibold">Age Groups</label>
            <div class="row g-2">
              <div v-for="age in ageGroups" :key="age" class="col-md-3">
                <div class="form-check form-check-lg">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :value="age"
                    v-model="localQuestion.age"
                    :id="'age_' + age"
                  />
                  <label class="form-check-label fw-medium" :for="'age_' + age">
                    {{ age }} years
                  </label>
                </div>
              </div>
            </div>
            <div v-if="validationErrors.age" class="text-danger small mt-1">
              {{ validationErrors.age }}
            </div>
          </div>

          <!-- Status -->
          <div class="col-md-6">
            <label class="form-label fw-semibold">Status</label>
            <select v-model="question.status" class="form-select">
            <option v-for="opt in statusOptions" :key="opt.label" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>

          </div>
        </div>
      </div>
    </div>
  `,
};
