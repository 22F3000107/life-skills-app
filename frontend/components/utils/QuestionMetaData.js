export const QuestionMetadata = {
  name: "QuestionMetadata",
  props: {
    question: {
      type: Object,
      required: true,
    },
  },
  computed: {
    questionTypeIcon() {
      const iconMap = {
        MCQ: "fas fa-dot-circle",
        MSQ: "fas fa-check-square",
        "True/False": "fas fa-toggle-on",
        Matching: "fas fa-exchange-alt",
      };
      return iconMap[this.question.type] || "fas fa-question";
    },
    ageDisplay() {
      return Array.isArray(this.question.age)
        ? this.question.age.join(", ")
        : this.question.age;
    },
  },
  template: `
    <div class="row mb-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h6 class="text-muted text-uppercase mb-3">Question Information</h6>
            <div class="row g-4">
              <div class="col-md-3">
                <div class="info-item">
                  <div class="info-label">Question Code</div>
                  <div class="info-value">
                    <span class="badge bg-primary fs-6">{{ question.qcode }}</span>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="info-item">
                  <div class="info-label">Type</div>
                  <div class="info-value">
                    <i :class="questionTypeIcon + ' me-2'"></i>
                    {{ question.type }}
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="info-item">
                  <div class="info-label">Module</div>
                  <div class="info-value">
                    <i class="fas fa-book me-2 text-info"></i>
                    {{ question.module }}
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="info-item">
                  <div class="info-label">Age Group</div>
                  <div class="info-value">
                    <i class="fas fa-users me-2 text-success"></i>
                    {{ ageDisplay }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};
