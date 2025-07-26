export const MatchingOptions = {
  name: "MatchingOptions",
  props: {
    question: {
      type: Object,
      required: true,
    },
    validationErrors: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["update:question", "add-match-pair", "remove-match-pair"],
  computed: {
    matchPairs() {
      return Array.isArray(this.question.options) ? this.question.options : [];
    },
  },
  methods: {
    addMatchPair() {
      const updatedAnswers = [...this.matchPairs, { left: "", right: "" }];
      this.$emit("update:question", {
        ...this.question,
        answers: updatedAnswers,
      });
      this.$emit("add-match-pair");
    },
    updatePair(index, key, value) {
      const updated = [...this.matchPairs];
      updated[index] = { ...updated[index], [key]: value };
      this.$emit("update:question", {
        ...this.question,
        options: updated, // keep syncing to `options`
      });
    },
    removeMatchPair(index) {
      const updated = [...this.matchPairs];
      updated.splice(index, 1);
      this.$emit("update:question", {
        ...this.question,
        options: updated,
      });
      this.$emit("remove-match-pair", index);
    },
  },
  template: `
    <div>
      <h5 class="mb-3">Match the Pairs</h5>

      <div
  v-for="(pair, index) in matchPairs"
  :key="index"
  class="d-flex align-items-center mb-2"
>
  <input
    type="text"
    class="form-control me-2"
    :value="pair.left"
    @input="updatePair(index, 'left', $event.target.value)"
    placeholder="Left item"
  />
  <span class="mx-2">→</span>
  <input
    type="text"
    class="form-control me-2"
    :value="pair.right"
    @input="updatePair(index, 'right', $event.target.value)"
    placeholder="Right item"
  />
  <button
    class="btn btn-danger btn-sm"
    @click="removeMatchPair(index)"
  >
    Remove
  </button>
</div>


      <button class="btn btn-secondary mt-2" @click="addMatchPair">
        + Add Pair
      </button>

      <div v-if="validationErrors?.answers" class="text-danger mt-2">
        {{ validationErrors.answers }}
      </div>
    </div>
  `,
};
