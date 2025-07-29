export const LoadingState = {
  name: "LoadingState",
  template: `
    <div class="loading-container">
      <div class="card border-0 shadow-sm">
        <div class="card-body text-center p-5">
          <div class="spinner-border text-primary mb-3" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <h5>Loading Question...</h5>
          <p class="text-muted">Please wait while we fetch the question details.</p>
        </div>
      </div>
    </div>
  `,
};
