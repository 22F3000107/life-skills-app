import {EditMCQOptions} from "./EditMCQOptions.js";
import {EditTrueFalseOptions} from "./EditTrueFalseOptions.js";
import {EditMatchingOptions} from "./EditMatchingOptions.js";

export const EditAnswerOptions = {
  name: "EditAnswerOptions",
  components: {
    EditMCQOptions,
    EditTrueFalseOptions,
    EditMatchingOptions,
  },
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
  emits: [
    "update:question",
    "add-option",
    "remove-option",
    "mcq-option-change",
    "add-match-pair",
    "remove-match-pair",
  ],
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
          <i class="bi bi-list-check text-primary me-2"></i>
          Answer Options
        </h5>
      </div>
      <div class="card-body p-4">
        <!-- MCQ/MSQ Options -->
        <EditMCQOptions
          v-if="localQuestion.type === 'MCQ' || localQuestion.type === 'MSQ'"
          v-model:options="localQuestion.options"
          :question-type="localQuestion.type"
          :validation-errors="validationErrors"
          @add-option="$emit('add-option')"
          @remove-option="$emit('remove-option', $event)"
          @mcq-option-change="$emit('mcq-option-change', $event)"
        />

        <!-- True/False Options -->
        <EditTrueFalseOptions
          v-else-if="localQuestion.type === 'True/False'"
          v-model:options="localQuestion.options"
        />

        <!-- Matching Pairs -->
        <EditMatchingOptions
          v-else-if="localQuestion.type === 'Matching'"
          v-model:matchPairs="localQuestion.matchPairs"
          :validation-errors="validationErrors"
          @add-match-pair="$emit('add-match-pair')"
          @remove-match-pair="$emit('remove-match-pair', $event)"
        />
      </div>
    </div>
  `,
};
