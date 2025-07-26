export const ImageModal = {
  name: "ImageModal",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    imageUrl: String,
  },
  emits: ["close"],
  template: `
    <div v-if="show && imageUrl" class="modal d-block" style="background-color: rgba(0,0,0,0.8);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0">
          <div class="modal-header border-0">
            <h6 class="modal-title text-primary">
              <i class="fas fa-image me-2"></i>Question Image
            </h6>
            <button type="button" class="btn-close" @click="$emit('close')"></button>
          </div>
          <div class="modal-body p-0">
            <img :src="imageUrl" alt="Question Image" class="w-100" style="max-height: 70vh; object-fit: contain;" />
          </div>
        </div>
      </div>
    </div>
  `,
};
