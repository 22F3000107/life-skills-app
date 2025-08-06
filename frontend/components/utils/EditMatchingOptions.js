export const EditMatchingOptions = {
  name: "EditMatchingOptions",
  props: {
    matchPairs: {
      type: Array,
      required: true,
    },
    validationErrors: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["update:matchPairs", "add-match-pair", "remove-match-pair"],
  computed: {
    localMatchPairs: {
      get() {
        return this.matchPairs;
      },
      set(value) {
        this.$emit("update:matchPairs", value);
      },
    },
  },
  template: `
    <div>
      <div class="mb-3">
        <div class="alert alert-info" style="border-radius: 12px;">
          <i class="bi bi-info-circle me-2"></i>
          <strong>Matching:</strong> Create pairs that match together
        </div>
      </div>
      
      <div class="matching-editor">
        <div v-for="(pair, index) in localMatchPairs" :key="index" class="matching-pair-editor mb-4">
          <div class="pair-header">
            <span class="pair-number">Pair {{ index + 1 }}</span>
            <button 
              v-if="localMatchPairs.length > 1"
              type="button" 
              class="btn btn-sm btn-outline-danger"
              @click="$emit('remove-match-pair', index)"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
          <div class="row g-3">
            <div class="col-md-5">
              <label class="form-label fw-medium">Left Side</label>
              <textarea
                v-model="pair.left"
                class="form-control"
                rows="2"
                placeholder="Enter left side text..."
                style="border-radius: 8px;"
                :class="{ 'is-invalid': validationErrors['pair_left_' + index] }"
              ></textarea>
              <div v-if="validationErrors['pair_left_' + index]" class="invalid-feedback">
                {{ validationErrors['pair_left_' + index] }}
              </div>
            </div>
            <div class="col-md-2 d-flex align-items-center justify-content-center">
              <i class="bi bi-arrow-left-right text-primary fs-3"></i>
            </div>
            <div class="col-md-5">
              <label class="form-label fw-medium">Right Side</label>
              <textarea
                v-model="pair.right"
                class="form-control"
                rows="2"
                placeholder="Enter right side text..."
                style="border-radius: 8px;"
                :class="{ 'is-invalid': validationErrors['pair_right_' + index] }"
              ></textarea>
              <div v-if="validationErrors['pair_right_' + index]" class="invalid-feedback">
                {{ validationErrors['pair_right_' + index] }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        v-if="localMatchPairs.length < 8"
        type="button" 
        class="btn btn-outline-primary"
        @click="$emit('add-match-pair')"
      >
        <i class="bi bi-plus-circle me-2"></i>Add Pair
      </button>
    </div>
  `,
};
