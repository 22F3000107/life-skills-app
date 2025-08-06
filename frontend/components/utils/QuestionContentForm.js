import { MediaUpload } from "./MediaUpload.js";

export const QuestionContentForm = {
  name: "QuestionContentForm",
  props: {
    question: { type: Object, required: true },
    validationErrors: { type: Object, default: () => ({}) },
  },
  emits: [
    "update:question",
    "image-upload",
    "audio-upload",
    "remove-image",
    "remove-audio",
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
  components: {
    MediaUpload,
  },
  template: `
    <div class="card border-0 shadow-lg mb-4" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95);">
      <div class="card-header bg-transparent border-0 p-4">
        <h5 class="mb-0 fw-bold text-dark">
          <i class="bi bi-chat-quote text-primary me-2"></i>
          Question Content
        </h5>
      </div>
      <div class="card-body p-4">
        <!-- Question Text -->
        <div class="mb-4">
          <label class="form-label fw-semibold">Question Text</label>
          <textarea
            v-model="localQuestion.text"
            class="form-control form-control-lg"
            rows="4"
            placeholder="Enter your question here..."
            style="border-radius: 12px;"
            :class="{ 'is-invalid': validationErrors.text }"
          ></textarea>
          <div v-if="validationErrors.text" class="invalid-feedback">
            {{ validationErrors.text }}
          </div>
        </div>

        <!-- Media Uploads -->
        <div class="row g-4">
          <MediaUpload 
            type="image"
            :url="question.imageUrl"
            :validation-error="validationErrors.image"
            @file-upload="$emit('image-upload', $event)"
            @remove-media="$emit('remove-image')"
          />
          
          <MediaUpload 
            type="audio"
            :url="question.audioUrl"
            :validation-error="validationErrors.audio"
            @file-upload="$emit('audio-upload', $event)"
            @remove-media="$emit('remove-audio')"
          />
        </div>
      </div>
    </div>
  `,
};
