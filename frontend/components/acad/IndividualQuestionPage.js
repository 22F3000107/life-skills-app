import { fetchQuestionById } from "../../services/questionService.js";
import { LoadingState } from "../utils/LoadingState.js";
import { ErrorState } from "../utils/ErrorState.js";
import { QuestionHeader } from "../utils/QuestionHeader.js";
import { QuestionMetadata } from "../utils/QuestionMetaData.js";
import { MediaDisplay } from "../utils/MediaDisplay.js";
import { QuestionText } from "../utils/QuestionText.js";
import { AnswerOptionsForm } from "../utils/AnswerOptions.js";
import { ImageModal } from "../utils/ImageModel.js";

export default {
  name: "IndividualQuestionPage",
  components: {
    LoadingState,
    ErrorState,
    QuestionHeader,
    QuestionMetadata,
    MediaDisplay,
    QuestionText,
    AnswerOptionsForm,
    ImageModal,
  },
  data() {
    return {
      question: null,
      isLoading: true,
      error: null,
      showImageModal: false,
    };
  },
  async mounted() {
    await this.loadQuestion();
  },
  methods: {
    async loadQuestion() {
      const qcode = this.$route.params.qcode;
      try {
        const res = await fetchQuestionById(qcode);
        this.question = {
          qcode: res.id,
          type: res.type,
          module: res.module_name,
          age: res.age_group,
          text: res.question_statement,
          imageUrl: res.image_url,
          audioUrl: res.audio_url,
          audioName: res.audio_url?.split("/").pop() || "",
          options: res.answers || [],
          correctAnswer:
            res.answers?.[0]?.text === "True" ? res.answers[0].correct : null,
          status: res.status || "Active",
          createdAt: res.created_at || new Date().toISOString(),
        };
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },
    goBack() {
      this.$router.go(-1);
    },
    editQuestion() {
      this.$router.push(`/acad/question/edit/${this.question.qcode}`);
    },
    openImageModal() {
      this.showImageModal = true;
    },
    closeImageModal() {
      this.showImageModal = false;
    },
  },
  template: `
    <div class="question-viewer-container">
      <div class="container-fluid py-4">
        <!-- Loading State -->
        <LoadingState v-if="isLoading" />
        
        <!-- Error State -->
        <ErrorState v-else-if="error" :error="error" @go-back="goBack" />
        
        <!-- Question Content -->
        <div v-else class="question-content">
          <!-- Header -->
          <QuestionHeader 
            :question-code="question.qcode" 
            @go-back="goBack" 
            @edit-question="editQuestion" 
          />
          
          <!-- Question Metadata -->
          <QuestionMetadata :question="question" />
          
          <!-- Question Media and Text -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-light border-0">
                  <h6 class="mb-0 text-primary">
                    <i class="fas fa-question-circle me-2"></i>Question Content
                  </h6>
                </div>
                <div class="card-body p-4">
                  <div class="row">
                    <!-- Media Section -->
                    <MediaDisplay 
                      :image-url="question.imageUrl"
                      :audio-url="question.audioUrl"
                      :audio-name="question.audioName"
                      @open-image-modal="openImageModal"
                    />
                    
                    <!-- Question Text -->
                    <QuestionText :text="question.text" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Answer Options -->
          <AnswerOptionsForm :question="question" />
        </div>
        
        <!-- Image Modal -->
        <ImageModal 
          :show="showImageModal" 
          :image-url="question?.imageUrl" 
          @close="closeImageModal" 
        />
      </div>
    </div>
  `,
};
