import { MCQMSQOptions } from "./MCQOptions.js";
import { TrueFalseOptions } from "./TrueFalseOptions.js";
import { MatchingOptions } from "./MatchingOptions.js";

export const AnswerOptionsForm = {
  name: "AnswerOptionsForm",
  props: {
    question: { type: Object, required: true },
    validationErrors: { type: Object, default: () => ({}) },
  },
  emits: [
    "update:question",
    "mcq-option-change",
    "add-option",
    "remove-option",
    "add-match-pair",
    "remove-match-pair",
  ],
  components: {
    MCQMSQOptions,
    TrueFalseOptions,
    MatchingOptions,
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
        <MCQMSQOptions
          v-if="question.type === 'MCQ' || question.type === 'MSQ'"
          :question="question"
          :validation-errors="validationErrors"
          @update:question="$emit('update:question', $event)"
          @mcq-option-change="$emit('mcq-option-change', $event)"
          @add-option="$emit('add-option')"
          @remove-option="$emit('remove-option', $event)"
        />

        <!-- True/False Options -->
        <TrueFalseOptions
          v-else-if="question.type === 'True/False'"
          :question="question"
          @update:question="$emit('update:question', $event)"
        />

        <!-- Matching Pairs -->
        <MatchingOptions
          v-else-if="question.type === 'Matching'"
          :question="question"
          :validation-errors="validationErrors"
          @update:question="$emit('update:question', $event)"
          @add-match-pair="$emit('add-match-pair')"
          @remove-match-pair="$emit('remove-match-pair', $event)"
        />
      </div>
    </div>
  `,
};
