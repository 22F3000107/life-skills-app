export const EditTrueFalseOptions = {
  name: "EditTrueFalseOptions",
  props: {
    options: {
      type: Array,
      required: true,
    },
  },
  emits: ["update:options"],
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
  methods: {
    setTrueCorrect() {
      this.localOptions[0].correct = true;
      this.localOptions[1].correct = false;
    },
    setFalseCorrect() {
      this.localOptions[1].correct = true;
      this.localOptions[0].correct = false;
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
          <div class="tf-option" :class="{ 'correct-option': localOptions[0]?.correct }">
            <div class="tf-content p-4">
              <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                  <input 
                    type="radio" 
                    name="tf_correct"
                    :checked="localOptions[0]?.correct"
                    @change="setTrueCorrect"
                    class="form-check-input me-3" 
                  />
                  <div class="tf-text">
                    <i class="bi bi-check-circle text-success fs-4 me-2"></i>
                    <span class="fw-bold fs-5">True</span>
                  </div>
                </div>
                <div v-if="localOptions[0]?.correct" class="correct-indicator">
                  <i class="bi bi-award text-warning fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="tf-option" :class="{ 'correct-option': localOptions[1]?.correct }">
            <div class="tf-content p-4">
              <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                  <input 
                    type="radio" 
                    name="tf_correct"
                    :checked="localOptions[1]?.correct"
                    @change="setFalseCorrect"
                    class="form-check-input me-3" 
                  />
                  <div class="tf-text">
                    <i class="bi bi-x-circle text-danger fs-4 me-2"></i>
                    <span class="fw-bold fs-5">False</span>
                  </div>
                </div>
                <div v-if="localOptions[1]?.correct" class="correct-indicator">
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
