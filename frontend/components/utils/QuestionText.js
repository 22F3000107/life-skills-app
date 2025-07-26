export const QuestionText = {
  name: "QuestionText",
  props: {
    text: {
      type: String,
      required: true,
    },
  },
  template: `
    <div class="col-lg-7">
      <h6 class="text-muted mb-3">
        <i class="fas fa-align-left me-2"></i>Question Text
      </h6>
      <div class="question-text-display">
        <div class="question-text-content">
          {{ text }}
        </div>
      </div>
    </div>
  `,
};
