export const ArchivedQuestionsStats = {
  name: "ArchivedQuestionsStats",
  props: {
    stats: {
      type: Object,
      default: () => ({
        total: 0,
        thisMonth: 0,
        thisYear: 0,
      }),
    },
    selectedQuestionsCount: Number,
  },
  template: `
    <div class="row g-3 mb-4">
      <div class="col-lg-3 col-md-6">
        <div class="card border-0 shadow-sm h-100" style="border-radius: 15px; background: rgba(255, 255, 255, 0.95);">
          <div class="card-body p-3">
            <div class="d-flex align-items-center">
              <div class="bg-danger bg-opacity-10 p-2 rounded-circle me-3">
                <i class="bi bi-archive text-danger fs-5"></i>
              </div>
              <div>
                <h6 class="mb-0 text-danger">{{ stats.total }}</h6>
                <small class="text-muted">Total Archived</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="card border-0 shadow-sm h-100" style="border-radius: 15px; background: rgba(255, 255, 255, 0.95);">
          <div class="card-body p-3">
            <div class="d-flex align-items-center">
              <div class="bg-warning bg-opacity-10 p-2 rounded-circle me-3">
                <i class="bi bi-calendar-month text-warning fs-5"></i>
              </div>
              <div>
                <h6 class="mb-0 text-warning">{{ stats.thisMonth }}</h6>
                <small class="text-muted">This Month</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="card border-0 shadow-sm h-100" style="border-radius: 15px; background: rgba(255, 255, 255, 0.95);">
          <div class="card-body p-3">
            <div class="d-flex align-items-center">
              <div class="bg-info bg-opacity-10 p-2 rounded-circle me-3">
                <i class="bi bi-calendar-year text-info fs-5"></i>
              </div>
              <div>
                <h6 class="mb-0 text-info">{{ stats.thisYear }}</h6>
                <small class="text-muted">This Year</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="card border-0 shadow-sm h-100" style="border-radius: 15px; background: rgba(255, 255, 255, 0.95);">
          <div class="card-body p-3">
            <div class="d-flex align-items-center">
              <div class="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                <i class="bi bi-arrow-clockwise text-success fs-5"></i>
              </div>
              <div>
                <h6 class="mb-0 text-success">{{ selectedQuestionsCount }}</h6>
                <small class="text-muted">Selected</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};
