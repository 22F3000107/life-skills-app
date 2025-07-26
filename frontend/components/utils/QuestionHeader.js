export const QuestionHeader = {
  name: "QuestionHeader",
  props: {
    questionCode: {
      type: [String, Number],
      required: true,
    },
  },
  emits: ["go-back", "edit-question"],
  template: `
    <div class="row mb-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-md-8">
                <nav aria-label="breadcrumb" class="mb-2">
                  <ol class="breadcrumb mb-0">
                    <li class="breadcrumb-item">
                      <a href="#" @click.prevent="$emit('go-back')" class="text-decoration-none">
                        <i class="fas fa-arrow-left me-1"></i>Questions
                      </a>
                    </li>
                    <li class="breadcrumb-item active">Q{{ questionCode }}</li>
                  </ol>
                </nav>   
              </div>
              <div class="col-md-4 text-md-end">
                <div class="btn-group" role="group">
                  <button class="btn btn-outline-primary btn-sm" @click="$emit('edit-question')" title="Edit Question">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};
