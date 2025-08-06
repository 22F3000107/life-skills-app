export const MediaDisplay = {
  name: "MediaDisplay",
  props: {
    imageUrl: String,
    audioUrl: String,
    audioName: String,
  },
  emits: ["open-image-modal"],
  template: `
    <div class="col-lg-5 mb-4 mb-lg-0">
      <h6 class="text-muted mb-3">
        <i class="fas fa-file-image me-2"></i>Media Attachments
      </h6>
      
      <!-- Image Display -->
      <div class="media-section mb-4">
        <div class="image-container">
          <div v-if="imageUrl" class="image-preview-card">
            <img 
              :src="imageUrl" 
              alt="Question Image" 
              class="question-image"
              @click="$emit('open-image-modal')"
            />
            <div class="image-overlay">
              <button class="btn btn-light btn-sm" @click="$emit('open-image-modal')">
                <i class="fas fa-search-plus"></i> View Full Size
              </button>
            </div>
          </div>
          <div v-else class="no-image-placeholder">
            <i class="fas fa-image text-muted mb-2" style="font-size: 2rem;"></i>
            <p class="text-muted mb-0">No image attached</p>
          </div>
        </div>
      </div>
      
      <!-- Audio Display -->
      <div class="audio-section">
        <div v-if="audioUrl" class="audio-player-card">
          <div class="audio-header">
            <i class="fas fa-volume-up text-primary me-2"></i>
            <span class="fw-bold">Audio File</span>
          </div>
          <div class="audio-info">
            <small class="text-muted">{{ audioName }}</small>
          </div>
          <audio :src="audioUrl" controls class="w-100 mt-2"></audio>
        </div>
        <div v-else class="no-audio-placeholder">
          <i class="fas fa-volume-mute text-muted"></i>
          <span class="text-muted ms-2">No audio attached</span>
        </div>
      </div>
    </div>
  `,
};
