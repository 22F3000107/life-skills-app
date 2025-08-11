export const MediaUpload = {
  name: "MediaUpload",
  props: {
    type: { type: String, required: true }, // 'image' or 'audio'
    url: { type: String, default: "" },
    validationError: { type: String, default: null },
  },
  emits: ["file-upload", "remove-media"],
  computed: {
    isImage() {
      return this.type === "image";
    },
    isAudio() {
      return this.type === "audio";
    },
    acceptTypes() {
      return this.isImage ? "image/*" : "audio/*";
    },
    maxSize() {
      return this.isImage ? "5MB" : "10MB";
    },
    formats() {
      return this.isImage ? "JPG, PNG, GIF" : "MP3, WAV, M4A";
    },
    inputId() {
      return `${this.type}Input`;
    },
    icon() {
      return this.isImage ? "bi-image" : "bi-music-note";
    },
    title() {
      return this.isImage
        ? "Question Image (Optional)"
        : "Question Audio (Optional)";
    },
  },
  methods: {
    handleFileUpload(event) {
      this.$emit("file-upload", event);
    },
    removeMedia() {
      this.$emit("remove-media");
    },
  },
  template: `
    <div class="col-lg-6">
      <label class="form-label fw-semibold">{{ title }}</label>
      <div class="media-upload-section">
        <!-- Image Preview -->
        <div v-if="url && isImage" class="image-preview mb-3">
          <img :src="url" alt="Question Image" class="img-fluid rounded" style="max-height: 200px;">
          <button type="button" class="btn btn-sm btn-outline-danger mt-2" @click="removeMedia">
            <i class="bi bi-trash"></i> Remove Image
          </button>
        </div>
        
        <!-- Audio Preview -->
        <div v-else-if="url && isAudio" class="audio-preview mb-3">
          <div class="d-flex align-items-center p-3 bg-light rounded">
            <i class="bi bi-music-note-beamed text-primary fs-4 me-3"></i>
            <div class="flex-grow-1">
              <div class="fw-medium">Audio File</div>
              <audio :src="url" controls class="w-100 mt-2"></audio>
            </div>
          </div>
          <button type="button" class="btn btn-sm btn-outline-danger mt-2" @click="removeMedia">
            <i class="bi bi-trash"></i> Remove Audio
          </button>
        </div>
        
        <!-- Empty State -->
        <div v-else>
          <div class="upload-placeholder mb-3">
            <i :class="icon + ' text-muted fs-1'"></i>
            <p class="text-muted">No {{ type }} selected</p>
          </div>
        </div>
        
        <input 
          type="file" 
          :id="inputId"
          @change="handleFileUpload" 
          :accept="acceptTypes" 
          class="form-control"
          style="border-radius: 12px;"
        />
        <small class="text-muted">Supported formats: {{ formats }} (Max {{ maxSize }})</small>
        <div v-if="validationError" class="text-danger small">
          {{ validationError }}
        </div>
      </div>
    </div>
  `,
};
