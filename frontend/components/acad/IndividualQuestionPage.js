import { fetchQuestionById } from "../../services/questionService.js";

export default {
  name: "IndividualQuestionPage",
  data() {
    return {
      question: null,
      isLoading: true,
      error: null,
      showImageModal: false,
    };
  },
  computed: {
    questionTypeDisplay() {
      if (!this.question) return "";
      const typeMap = {
        MCQ: "Multiple Choice (Single Answer)",
        MSQ: "Multiple Choice (Multiple Answers)",
        "True/False": "True or False",
        Matching: "Matching Pairs",
      };
      return typeMap[this.question.type] || this.question.type;
    },
    questionTypeIcon() {
      if (!this.question) return "fas fa-question";
      const iconMap = {
        MCQ: "fas fa-dot-circle",
        MSQ: "fas fa-check-square",
        "True/False": "fas fa-toggle-on",
        Matching: "fas fa-exchange-alt",
      };
      return iconMap[this.question.type] || "fas fa-question";
    },
  },
  async mounted() {
    const qcode = this.$route.params.qcode;
    try {
      const res = await fetchQuestionById(qcode);
      this.question = {
        qcode: res.qcode,
        type: res.question_type,
        module: res.module_name,
        age: res.age_groups.join(", "),
        text: res.question_text,
        imageUrl: res.image_url,
        audioUrl: res.audio_url,
        audioName: res.audio_url?.split("/").pop() || "",
        options: res.options || [],
        correctAnswer:
          res.options?.[0]?.text === "True" ? res.options[0].correct : null,
        matchPairs: res.match_pairs || [],
        status: res.status || "Active",
        createdAt: res.created_at || new Date().toISOString(),
      };
    } catch (err) {
      this.error = err.message;
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
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
        <div v-if="isLoading" class="loading-container">
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

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
          <div class="card border-0 shadow-sm border-danger">
            <div class="card-body text-center p-5">
              <i class="fas fa-exclamation-triangle text-danger mb-3" style="font-size: 3rem;"></i>
              <h5 class="text-danger">Error Loading Question</h5>
              <p class="text-muted mb-4">{{ error }}</p>
              <button class="btn btn-primary" @click="$router.go(-1)">
                <i class="fas fa-arrow-left me-2"></i>Go Back
              </button>
            </div>
          </div>
        </div>

        <!-- Question Content -->
        <div v-else class="question-content">
          <!-- Header -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="card border-0 shadow-sm">
                <div class="card-body">
                  <div class="row align-items-center">
                    <div class="col-md-8">
                      <nav aria-label="breadcrumb" class="mb-2">
                        <ol class="breadcrumb mb-0">
                          <li class="breadcrumb-item">
                            <a href="#" @click.prevent="goBack" class="text-decoration-none">
                              <i class="fas fa-arrow-left me-1"></i>Questions
                            </a>
                          </li>
                          <li class="breadcrumb-item active">{{ question.qcode }}</li>
                        </ol>
                      </nav>
                      <h4 class="mb-1 text-primary">
                        <i :class="questionTypeIcon + ' me-2'"></i>
                        Question Details
                      </h4>
                      <p class="text-muted mb-0">{{ questionTypeDisplay }}</p>
                    </div>
                    <div class="col-md-4 text-md-end">
                      <div class="btn-group" role="group">

                        <button class="btn btn-outline-primary btn-sm" @click="editQuestion" title="Edit Question">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Question Metadata -->
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
                          {{ question.age }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                    <div class="col-lg-5 mb-4 mb-lg-0">
                      <h6 class="text-muted mb-3">
                        <i class="fas fa-file-image me-2"></i>Media Attachments
                      </h6>
                      
                      <!-- Image Display -->
                      <div class="media-section mb-4">
                        <div class="image-container">
                          <div v-if="question.imageUrl" class="image-preview-card">
                            <img 
                              :src="question.imageUrl" 
                              alt="Question Image" 
                              class="question-image"
                              @click="openImageModal"
                            />
                            <div class="image-overlay">
                              <button class="btn btn-light btn-sm" @click="openImageModal">
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
                        <div v-if="question.audioUrl" class="audio-player-card">
                          <div class="audio-header">
                            <i class="fas fa-volume-up text-primary me-2"></i>
                            <span class="fw-bold">Audio File</span>
                          </div>
                          <div class="audio-info">
                            <small class="text-muted">{{ question.audioName }}</small>
                          </div>
                          <audio :src="question.audioUrl" controls class="w-100 mt-2"></audio>
                        </div>
                        <div v-else class="no-audio-placeholder">
                          <i class="fas fa-volume-mute text-muted"></i>
                          <span class="text-muted ms-2">No audio attached</span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Question Text -->
                    <div class="col-lg-7">
                      <h6 class="text-muted mb-3">
                        <i class="fas fa-align-left me-2"></i>Question Text
                      </h6>
                      <div class="question-text-display">
                        <div class="question-text-content">
                          {{ question.text }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Answer Options -->
          <div class="row">
            <div class="col-12">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-light border-0">
                  <h6 class="mb-0 text-primary">
                    <i class="fas fa-list-check me-2"></i>Answer Options
                  </h6>
                </div>
                <div class="card-body p-4">
                  
                  <!-- MCQ/MSQ Options -->
                  <div v-if="question.type === 'MCQ' || question.type === 'MSQ'" class="answer-section">
                    <div class="mb-3">
                      <span class="badge bg-info text-white">
                        {{ question.type === 'MCQ' ? 'Single Correct Answer' : 'Multiple Correct Answers' }}
                      </span>
                    </div>
                    <div class="row g-3">
                      <div v-for="(option, index) in question.options" :key="index" class="col-lg-6">
                        <div class="option-display-card" :class="{ 'correct-option': option.correct }">
                          <div class="option-header">
                            <div class="option-indicator">
                              <input
                                :type="question.type === 'MCQ' ? 'radio' : 'checkbox'"
                                disabled
                                :checked="option.correct"
                                class="form-check-input"
                                :id="'option_' + index"
                              />
                              <label class="form-check-label fw-bold ms-2" :for="'option_' + index">
                                Option {{ String.fromCharCode(65 + index) }}
                              </label>
                            </div>
                            <div v-if="option.correct" class="correct-badge">
                              <i class="fas fa-check-circle text-success me-1"></i>
                              <span class="badge bg-success">Correct</span>
                            </div>
                          </div>
                          <div class="option-text">
                            {{ option.text }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- True/False Options -->
                  <div v-else-if="question.type === 'True/False'" class="answer-section">
                    <div class="mb-3">
                      <span class="badge bg-info text-white">Select the correct answer</span>
                    </div>
                    <div class="row g-4">
                      <div class="col-md-6">
                        <div class="tf-display-card" :class="{ 'correct-option': question.correctAnswer === true }">
                          <div class="tf-content">
                            <input type="radio" disabled :checked="question.correctAnswer === true" class="form-check-input me-3" />
                            <div class="tf-text">
                              <i class="fas fa-check-circle text-success me-2"></i>
                              <span class="fw-bold">True</span>
                            </div>
                            <div v-if="question.correctAnswer === true" class="correct-indicator">
                              <i class="fas fa-trophy text-warning"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="tf-display-card" :class="{ 'correct-option': question.correctAnswer === false }">
                          <div class="tf-content">
                            <input type="radio" disabled :checked="question.correctAnswer === false" class="form-check-input me-3" />
                            <div class="tf-text">
                              <i class="fas fa-times-circle text-danger me-2"></i>
                              <span class="fw-bold">False</span>
                            </div>
                            <div v-if="question.correctAnswer === false" class="correct-indicator">
                              <i class="fas fa-trophy text-warning"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Matching Pairs -->
                  <div v-else-if="question.type === 'Matching'" class="answer-section">
                    <div class="mb-3">
                      <span class="badge bg-info text-white">Match the following pairs</span>
                    </div>
                    <div class="matching-display">
                      <div v-for="(pair, i) in question.matchPairs" :key="i" class="matching-pair-display">
                        <div class="pair-number">
                          {{ i + 1 }}
                        </div>
                        <div class="pair-content">
                          <div class="left-item">
                            <div class="match-item-label">Left Side</div>
                            <div class="match-item-content">{{ pair.left }}</div>
                          </div>
                          <div class="connection-display">
                            <i class="fas fa-arrows-alt-h text-primary"></i>
                          </div>
                          <div class="right-item">
                            <div class="match-item-label">Right Side</div>
                            <div class="match-item-content">{{ pair.right }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Image Modal -->
        <div v-if="showImageModal && question.imageUrl" class="modal d-block" style="background-color: rgba(0,0,0,0.8);">
          <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content border-0">
              <div class="modal-header border-0">
                <h6 class="modal-title text-primary">
                  <i class="fas fa-image me-2"></i>Question Image
                </h6>
                <button type="button" class="btn-close" @click="closeImageModal"></button>
              </div>
              <div class="modal-body p-0">
                <img :src="question.imageUrl" alt="Question Image" class="w-100" style="max-height: 70vh; object-fit: contain;" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};
