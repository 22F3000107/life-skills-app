export const TrueFalseOptions = {
  name: "TrueFalseOptions",
  props: {
    question: { type: Object, required: true },
  },
  emits: ["update:question"],
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
  methods: {
    setTrueCorrect() {
      this.localQuestion.options[0].correct = true;
      this.localQuestion.options[1].correct = false;
    },
    setFalseCorrect() {
      this.localQuestion.options[1].correct = true;
      this.localQuestion.options[0].correct = false;
    },
  },
  template: `
    <div>
      <div class="mb-3">
        <div class="alert alert-info" style="border-radius: 12px;">
          <i class="bi bi-info-circle me-2"></i>
          <strong>True or False:</strong> Select the correct answer
        </div>
      </div>
      
      <div class="row g-4">
        <div class="col-md-6">
          <div class="tf-option" :class="{ 'correct-option': question.options[0]?.correct }">
            <div class="tf-content p-4">
              <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                  <input 
                    type="radio" 
                    name="tf_correct"
                    :checked="question.options[0]?.correct"
                    @change="setTrueCorrect"
                    class="form-check-input me-3" 
                  />
                  <div class="tf-text">
                    <i class="bi bi-check-circle text-success fs-4 me-2"></i>
                    <span class="fw-bold fs-5">True</span>
                  </div>
                </div>
                <div v-if="question.options[0]?.correct" class="correct-indicator">
                  <i class="bi bi-award text-warning fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="tf-option" :class="{ 'correct-option': question.options[1]?.correct }">
            <div class="tf-content p-4">
              <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                  <input 
                    type="radio" 
                    name="tf_correct"
                    :checked="question.options[1]?.correct"
                    @change="setFalseCorrect"
                    class="form-check-input me-3" 
                  />
                  <div class="tf-text">
                    <i class="bi bi-x-circle text-danger fs-4 me-2"></i>
                    <span class="fw-bold fs-5">False</span>
                  </div>
                </div>
                <div v-if="question.options[1]?.correct" class="correct-indicator">
                  <i class="bi bi-award text-warning fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};
