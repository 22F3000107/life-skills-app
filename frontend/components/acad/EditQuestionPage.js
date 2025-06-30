import {
  fetchQuestionById,
  updateQuestion,
} from "../../services/questionService.js";

export default {
  name: "EditQuestionPage",
  data() {
    return {
      question: {
        qcode: "",
        type: "MCQ",
        module: "",
        age: [],
        text: "",
        imageUrl: "",
        audioUrl: "",
        options: [
          { text: "", correct: false },
          { text: "", correct: false },
          { text: "", correct: false },
          { text: "", correct: false },
        ],
        matchPairs: [{ left: "", right: "" }],
        status: "Draft",
      },
      questionTypes: ["MCQ", "MSQ", "True/False", "Matching"],
      moduleOptions: [
        "Time Management",
        "Stress Control",
        "Communication",
        "Leadership",
      ],
      ageGroups: ["6-8", "9-11", "12-14", "15-18"],
      statusOptions: ["Draft", "Review", "Approved", "Rejected"],
      isLoading: true,
      isSaving: false,
      error: null,
      successMessage: "",
      imageFile: null,
      audioFile: null,
      showImagePreview: false,
      validationErrors: {},
      isDirty: false,
    };
  },
  computed: {
    hasCorrectAnswer() {
      if (this.question.type === "MCQ") {
        return this.question.options.filter((opt) => opt.correct).length === 1;
      } else if (this.question.type === "MSQ") {
        return this.question.options.filter((opt) => opt.correct).length >= 1;
      } else if (this.question.type === "True/False") {
        return (
          this.question.options.length === 2 &&
          this.question.options.filter((opt) => opt.correct).length === 1
        );
      } else if (this.question.type === "Matching") {
        return this.question.matchPairs.every(
          (pair) => pair.left.trim() && pair.right.trim()
        );
      }
      return false;
    },
    isValidForm() {
      return (
        this.question.text.trim() &&
        this.question.module &&
        this.question.age.length > 0 &&
        this.hasCorrectAnswer &&
        Object.keys(this.validationErrors).length === 0
      );
    },
  },
  watch: {
    question: {
      handler() {
        this.isDirty = true;
        this.validateForm();
      },
      deep: true,
    },
  },
  async mounted() {
    await this.loadQuestion();
    this.setupBeforeUnload();
  },
  beforeUnmount() {
    window.removeEventListener("beforeunload", this.handleBeforeUnload);
  },
  methods: {
    async loadQuestion() {
      const qcode = this.$route.params.qcode;
      try {
        this.isLoading = true;
        const res = await fetchQuestionById(qcode);

        this.question = {
          qcode: res.qcode,
          type: res.question_type,
          module: res.module_name,
          age: res.age_groups || [],
          text: res.question_text || "",
          imageUrl: res.image_url || "",
          audioUrl: res.audio_url || "",
          options: this.formatOptions(res),
          matchPairs: res.match_pairs || [{ left: "", right: "" }],
          status: res.status || "Draft",
        };

        this.isDirty = false;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    formatOptions(res) {
      if (res.question_type === "True/False") {
        return [
          { text: "True", correct: res.correct_answer === "True" },
          { text: "False", correct: res.correct_answer === "False" },
        ];
      } else if (res.options) {
        return res.options;
      } else {
        return Array(4)
          .fill()
          .map(() => ({ text: "", correct: false }));
      }
    },

    validateForm() {
      this.validationErrors = {};

      if (!this.question.text.trim()) {
        this.validationErrors.text = "Question text is required";
      }

      if (!this.question.module) {
        this.validationErrors.module = "Module selection is required";
      }

      if (this.question.age.length === 0) {
        this.validationErrors.age = "At least one age group must be selected";
      }

      if (this.question.type === "MCQ" || this.question.type === "MSQ") {
        this.question.options.forEach((option, index) => {
          if (!option.text.trim()) {
            this.validationErrors[`option_${index}`] =
              "Option text is required";
          }
        });

        const correctCount = this.question.options.filter(
          (opt) => opt.correct
        ).length;
        if (this.question.type === "MCQ" && correctCount !== 1) {
          this.validationErrors.correct_mcq =
            "Exactly one option must be correct for MCQ";
        } else if (this.question.type === "MSQ" && correctCount === 0) {
          this.validationErrors.correct_msq =
            "At least one option must be correct for MSQ";
        }
      }

      if (this.question.type === "Matching") {
        this.question.matchPairs.forEach((pair, index) => {
          if (!pair.left.trim()) {
            this.validationErrors[`pair_left_${index}`] =
              "Left side text is required";
          }
          if (!pair.right.trim()) {
            this.validationErrors[`pair_right_${index}`] =
              "Right side text is required";
          }
        });
      }
    },

    onQuestionTypeChange() {
      if (this.question.type === "MCQ" || this.question.type === "MSQ") {
        this.question.options = Array(4)
          .fill()
          .map(() => ({ text: "", correct: false }));
        this.question.matchPairs = [];
      } else if (this.question.type === "True/False") {
        this.question.options = [
          { text: "True", correct: false },
          { text: "False", correct: false },
        ];
        this.question.matchPairs = [];
      } else if (this.question.type === "Matching") {
        this.question.options = [];
        this.question.matchPairs = [{ left: "", right: "" }];
      }
    },

    addOption() {
      if (this.question.options.length < 6) {
        this.question.options.push({ text: "", correct: false });
      }
    },

    removeOption(index) {
      if (this.question.options.length > 2) {
        this.question.options.splice(index, 1);
      }
    },

    addMatchPair() {
      if (this.question.matchPairs.length < 8) {
        this.question.matchPairs.push({ left: "", right: "" });
      }
    },

    removeMatchPair(index) {
      if (this.question.matchPairs.length > 1) {
        this.question.matchPairs.splice(index, 1);
      }
    },

    onMCQOptionChange(index) {
      if (this.question.type === "MCQ") {
        // Only one option can be correct for MCQ
        this.question.options.forEach((opt, i) => {
          opt.correct = i === index;
        });
      }
    },

    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          // 5MB limit
          this.validationErrors.image = "Image file size must be less than 5MB";
          return;
        }

        this.imageFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.question.imageUrl = e.target.result;
        };
        reader.readAsDataURL(file);
        delete this.validationErrors.image;
      }
    },

    handleAudioUpload(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          this.validationErrors.audio =
            "Audio file size must be less than 10MB";
          return;
        }

        this.audioFile = file;
        this.question.audioUrl = URL.createObjectURL(file);
        delete this.validationErrors.audio;
      }
    },

    removeImage() {
      this.question.imageUrl = "";
      this.imageFile = null;
      document.getElementById("imageInput").value = "";
    },

    removeAudio() {
      this.question.audioUrl = "";
      this.audioFile = null;
      document.getElementById("audioInput").value = "";
    },

    async saveQuestion(isDraft = false) {
      this.validateForm();

      if (!this.isValidForm && !isDraft) {
        this.error = "Please fix all validation errors before saving";
        return;
      }

      try {
        this.isSaving = true;
        this.error = null;

        const formData = new FormData();
        formData.append("qcode", this.question.qcode);
        formData.append("question_type", this.question.type);
        formData.append("module_name", this.question.module);
        formData.append("age_groups", JSON.stringify(this.question.age));
        formData.append("question_text", this.question.text);
        formData.append("status", isDraft ? "Draft" : this.question.status);

        if (this.question.type === "Matching") {
          formData.append(
            "match_pairs",
            JSON.stringify(this.question.matchPairs)
          );
        } else {
          formData.append("options", JSON.stringify(this.question.options));
        }

        if (this.imageFile) {
          formData.append("image", this.imageFile);
        } else if (this.question.imageUrl) {
          formData.append("existing_image_url", this.question.imageUrl);
        }

        if (this.audioFile) {
          formData.append("audio", this.audioFile);
        } else if (this.question.audioUrl) {
          formData.append("existing_audio_url", this.question.audioUrl);
        }

        await updateQuestion(this.question.qcode, formData);

        this.successMessage = `Question ${
          isDraft ? "saved as draft" : "updated"
        } successfully!`;
        this.isDirty = false;

        setTimeout(() => {
          this.successMessage = "";
        }, 3000);
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isSaving = false;
      }
    },

    setupBeforeUnload() {
      window.addEventListener("beforeunload", this.handleBeforeUnload);
    },

    handleBeforeUnload(event) {
      if (this.isDirty) {
        const message =
          "You have unsaved changes. Are you sure you want to leave?";
        event.returnValue = message;
        return message;
      }
    },

    goBack() {
      if (this.isDirty) {
        if (
          confirm("You have unsaved changes. Are you sure you want to leave?")
        ) {
          this.$router.go(-1);
        }
      } else {
        this.$router.go(-1);
      }
    },

    previewQuestion() {
      this.$router.push(`/acad/question/${this.question.qcode}`);
    },
  },

  template: `
    <div class="min-vh-100" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div class="container-fluid py-4">
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center">
          <div class="card border-0 shadow-lg" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95);">
            <div class="card-body p-5">
              <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
              <p class="mt-3 text-muted">Loading question for editing...</p>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error && !question" class="text-center">
          <div class="card border-0 shadow-lg border-danger" style="border-radius: 20px;">
            <div class="card-body p-5">
              <i class="bi bi-exclamation-triangle text-danger fs-1 mb-3"></i>
              <h5 class="text-danger">Error Loading Question</h5>
              <p class="text-muted">{{ error }}</p>
              <button class="btn btn-primary" @click="goBack">
                <i class="bi bi-arrow-left me-2"></i>Go Back
              </button>
            </div>
          </div>
        </div>

        <!-- Edit Form -->
        <div v-else>
          <!-- Header -->
          <div class="row mb-4">
            <div class="col">
              <div class="card border-0 shadow-lg" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);">
                <div class="card-body p-4">
                  <div class="row align-items-center">
                    <div class="col-lg-8">
                      <div class="d-flex align-items-center gap-3">
                        <div class="bg-primary bg-opacity-10 p-3 rounded-circle">
                          <i class="bi bi-pencil-square text-primary fs-2"></i>
                        </div>
                        <div>
                          <h1 class="mb-1 fw-bold text-dark">Edit Question</h1>
                          <p class="text-muted mb-0">
                            <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill me-2">
                              {{ question.qcode }}
                            </span>
                            <i class="bi bi-info-circle me-2"></i>
                            Make changes to your question and save when ready
                            <span v-if="isDirty" class="text-warning ms-2">
                              <i class="bi bi-dot"></i>Unsaved changes
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div class="col-lg-4">
                      <div class="d-flex gap-2 justify-content-lg-end">
                        <button class="btn btn-outline-secondary btn-lg" @click="goBack">
                          <i class="bi bi-arrow-left me-2"></i>Cancel
                        </button>
                        <button class="btn btn-outline-primary btn-lg" @click="previewQuestion">
                          <i class="bi bi-eye me-2"></i>Preview
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Alert Messages -->
          <div v-if="error" class="row mb-4">
            <div class="col">
              <div class="alert alert-danger alert-dismissible fade show" style="border-radius: 15px;">
                <i class="bi bi-exclamation-triangle me-2"></i>
                {{ error }}
                <button type="button" class="btn-close" @click="error = null"></button>
              </div>
            </div>
          </div>

          <div v-if="successMessage" class="row mb-4">
            <div class="col">
              <div class="alert alert-success alert-dismissible fade show" style="border-radius: 15px;">
                <i class="bi bi-check-circle me-2"></i>
                {{ successMessage }}
                <button type="button" class="btn-close" @click="successMessage = ''"></button>
              </div>
            </div>
          </div>

          <!-- Form -->
          <div class="row">
            <div class="col-lg-8">
              <!-- Question Details -->
              <div class="card border-0 shadow-lg mb-4" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95);">
                <div class="card-header bg-transparent border-0 p-4">
                  <h5 class="mb-0 fw-bold text-dark">
                    <i class="bi bi-info-circle text-primary me-2"></i>
                    Question Details
                  </h5>
                </div>
                <div class="card-body p-4">
                  <div class="row g-4">
                    <!-- Question Type -->
                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Question Type</label>
                      <select 
                        v-model="question.type" 
                        @change="onQuestionTypeChange"
                        class="form-select form-select-lg"
                        style="border-radius: 12px;"
                      >
                        <option v-for="type in questionTypes" :key="type" :value="type">{{ type }}</option>
                      </select>
                    </div>

                    <!-- Module -->
                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Module</label>
                      <select 
                        v-model="question.module"
                        class="form-select form-select-lg"
                        style="border-radius: 12px;"
                        :class="{ 'is-invalid': validationErrors.module }"
                      >
                        <option value="">Select Module</option>
                        <option v-for="module in moduleOptions" :key="module" :value="module">{{ module }}</option>
                      </select>
                      <div v-if="validationErrors.module" class="invalid-feedback">
                        {{ validationErrors.module }}
                      </div>
                    </div>

                    <!-- Age Groups -->
                    <div class="col-12">
                      <label class="form-label fw-semibold">Age Groups</label>
                      <div class="row g-2">
                        <div v-for="age in ageGroups" :key="age" class="col-md-3">
                          <div class="form-check form-check-lg">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              :value="age"
                              v-model="question.age"
                              :id="'age_' + age"
                            />
                            <label class="form-check-label fw-medium" :for="'age_' + age">
                              {{ age }} years
                            </label>
                          </div>
                        </div>
                      </div>
                      <div v-if="validationErrors.age" class="text-danger small mt-1">
                        {{ validationErrors.age }}
                      </div>
                    </div>

                    <!-- Status -->
                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Status</label>
                      <select 
                        v-model="question.status"
                        class="form-select form-select-lg"
                        style="border-radius: 12px;"
                      >
                        <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Question Content -->
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
                      v-model="question.text"
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
                    <!-- Image Upload -->
                    <div class="col-lg-6">
                      <label class="form-label fw-semibold">Question Image (Optional)</label>
                      <div class="media-upload-section">
                        <div v-if="question.imageUrl" class="image-preview mb-3">
                          <img :src="question.imageUrl" alt="Question Image" class="img-fluid rounded" style="max-height: 200px;">
                          <button type="button" class="btn btn-sm btn-outline-danger mt-2" @click="removeImage">
                            <i class="bi bi-trash"></i> Remove Image
                          </button>
                        </div>
                        <div v-else>
                          <div class="upload-placeholder mb-3">
                            <i class="bi bi-image text-muted fs-1"></i>
                            <p class="text-muted">No image selected</p>
                          </div>
                        </div>
                        <input 
                          type="file" 
                          id="imageInput"
                          @change="handleImageUpload" 
                          accept="image/*" 
                          class="form-control"
                          style="border-radius: 12px;"
                        />
                        <small class="text-muted">Supported formats: JPG, PNG, GIF (Max 5MB)</small>
                        <div v-if="validationErrors.image" class="text-danger small">
                          {{ validationErrors.image }}
                        </div>
                      </div>
                    </div>

                    <!-- Audio Upload -->
                    <div class="col-lg-6">
                      <label class="form-label fw-semibold">Question Audio (Optional)</label>
                      <div class="media-upload-section">
                        <div v-if="question.audioUrl" class="audio-preview mb-3">
                          <div class="d-flex align-items-center p-3 bg-light rounded">
                            <i class="bi bi-music-note-beamed text-primary fs-4 me-3"></i>
                            <div class="flex-grow-1">
                              <div class="fw-medium">Audio File</div>
                              <audio :src="question.audioUrl" controls class="w-100 mt-2"></audio>
                            </div>
                          </div>
                          <button type="button" class="btn btn-sm btn-outline-danger mt-2" @click="removeAudio">
                            <i class="bi bi-trash"></i> Remove Audio
                          </button>
                        </div>
                        <div v-else>
                          <div class="upload-placeholder mb-3">
                            <i class="bi bi-music-note text-muted fs-1"></i>
                            <p class="text-muted">No audio selected</p>
                          </div>
                        </div>
                        <input 
                          type="file" 
                          id="audioInput"
                          @change="handleAudioUpload" 
                          accept="audio/*" 
                          class="form-control"
                          style="border-radius: 12px;"
                        />
                        <small class="text-muted">Supported formats: MP3, WAV, M4A (Max 10MB)</small>
                        <div v-if="validationErrors.audio" class="text-danger small">
                          {{ validationErrors.audio }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Answer Options -->
              <div class="card border-0 shadow-lg mb-4" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95);">
                <div class="card-header bg-transparent border-0 p-4">
                  <h5 class="mb-0 fw-bold text-dark">
                    <i class="bi bi-list-check text-primary me-2"></i>
                    Answer Options
                  </h5>
                </div>
                <div class="card-body p-4">
                  <!-- MCQ/MSQ Options -->
                  <div v-if="question.type === 'MCQ' || question.type === 'MSQ'">
                    <div class="mb-3">
                      <div class="alert alert-info" style="border-radius: 12px;">
                        <i class="bi bi-info-circle me-2"></i>
                        <strong>{{ question.type === 'MCQ' ? 'Single Choice:' : 'Multiple Choice:' }}</strong>
                        {{ question.type === 'MCQ' ? 'Select exactly one correct answer' : 'Select one or more correct answers' }}
                      </div>
                    </div>
                    
                    <div class="row g-3">
                      <div v-for="(option, index) in question.options" :key="index" class="col-lg-6">
                        <div class="option-editor" :class="{ 'correct-option': option.correct }">
                          <div class="option-header p-3">
                            <div class="d-flex align-items-center justify-content-between">
                              <div class="d-flex align-items-center">
                                <input
                                  :type="question.type === 'MCQ' ? 'radio' : 'checkbox'"
                                  :name="question.type === 'MCQ' ? 'mcq_correct' : ''"
                                  v-model="option.correct"
                                  @change="question.type === 'MCQ' ? onMCQOptionChange(index) : null"
                                  class="form-check-input me-3"
                                  :id="'option_' + index"
                                />
                                <label class="form-check-label fw-bold" :for="'option_' + index">
                                  Option {{ String.fromCharCode(65 + index) }}
                                </label>
                              </div>
                              <div class="d-flex align-items-center gap-2">
                                <span v-if="option.correct" class="badge bg-success">
                                  <i class="bi bi-check-circle me-1"></i>Correct
                                </span>
                                <button 
                                  v-if="question.options.length > 2"
                                  type="button" 
                                  class="btn btn-sm btn-outline-danger"
                                  @click="removeOption(index)"
                                >
                                  <i class="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                          <div class="option-content p-3">
                            <textarea
                              v-model="option.text"
                              class="form-control"
                              rows="2"
                              placeholder="Enter option text..."
                              style="border-radius: 8px;"
                              :class="{ 'is-invalid': validationErrors['option_' + index] }"
                            ></textarea>
                            <div v-if="validationErrors['option_' + index]" class="invalid-feedback">
                              {{ validationErrors['option_' + index] }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="mt-3 d-flex justify-content-between align-items-center">
                      <button 
                        v-if="question.options.length < 6"
                        type="button" 
                        class="btn btn-outline-primary"
                        @click="addOption"
                      >
                        <i class="bi bi-plus-circle me-2"></i>Add Option
                      </button>
                      <div class="text-end">
                        <div v-if="validationErrors.correct_mcq" class="text-danger small">
                          {{ validationErrors.correct_mcq }}
                        </div>
                        <div v-if="validationErrors.correct_msq" class="text-danger small">
                          {{ validationErrors.correct_msq }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- True/False Options -->
                  <div v-else-if="question.type === 'True/False'">
                    <div class="mb-3">
                      <div class="alert alert-info" style="border-radius: 12px;">
                        <i class="bi bi-info-circle me-2"></i>
                        <strong>True or False:</strong> Select the correct answer
                      </div>
                    </div>
                    
                    <div class="row g-4">
                      <div class="col-md-6">
                        <div class="tf-option" :class="{ 'correct-option': question.options[0]?.correct }">
                          <div class="tf-content p-4">
                            <div class="d-flex align-items-center justify-content-between">
                              <div class="d-flex align-items-center">
                                <input 
                                  type="radio" 
                                  name="tf_correct"
                                  v-model="question.options[0].correct"
                                  :value="true"
                                  @change="question.options[1].correct = false"
                                  class="form-check-input me-3" 
                                />
                                <div class="tf-text">
                                  <i class="bi bi-check-circle text-success fs-4 me-2"></i>
                                  <span class="fw-bold fs-5">True</span>
                                </div>
                              </div>
                              <div v-if="question.options[0]?.correct" class="correct-indicator">
                                <i class="bi bi-award text-warning fs-4"></i>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="tf-option" :class="{ 'correct-option': question.options[1]?.correct }">
                          <div class="tf-content p-4">
                            <div class="d-flex align-items-center justify-content-between">
                              <div class="d-flex align-items-center">
                                <input 
                                  type="radio" 
                                  name="tf_correct"
                                  v-model="question.options[1].correct"
                                  :value="true"
                                  @change="question.options[0].correct = false"
                                  class="form-check-input me-3" 
                                />
                                <div class="tf-text">
                                  <i class="bi bi-x-circle text-danger fs-4 me-2"></i>
                                  <span class="fw-bold fs-5">False</span>
                                </div>
                              </div>
                              <div v-if="question.options[1]?.correct" class="correct-indicator">
                                <i class="bi bi-award text-warning fs-4"></i>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Matching Pairs -->
                  <div v-else-if="question.type === 'Matching'">
                    <div class="mb-3">
                      <div class="alert alert-info" style="border-radius: 12px;">
                        <i class="bi bi-info-circle me-2"></i>
                        <strong>Matching:</strong> Create pairs that match together
                      </div>
                    </div>
                    
                    <div class="matching-editor">
                      <div v-for="(pair, index) in question.matchPairs" :key="index" class="matching-pair-editor mb-4">
                        <div class="pair-header">
                          <span class="pair-number">Pair {{ index + 1 }}</span>
                          <button 
                            v-if="question.matchPairs.length > 1"
                            type="button" 
                            class="btn btn-sm btn-outline-danger"
                            @click="removeMatchPair(index)"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                        <div class="row g-3">
                          <div class="col-md-5">
                            <label class="form-label fw-medium">Left Side</label>
                            <textarea
                              v-model="pair.left"
                              class="form-control"
                              rows="2"
                              placeholder="Enter left side text..."
                              style="border-radius: 8px;"
                              :class="{ 'is-invalid': validationErrors['pair_left_' + index] }"
                            ></textarea>
                            <div v-if="validationErrors['pair_left_' + index]" class="invalid-feedback">
                              {{ validationErrors['pair_left_' + index] }}
                            </div>
                          </div>
                          <div class="col-md-2 d-flex align-items-center justify-content-center">
                            <i class="bi bi-arrow-left-right text-primary fs-3"></i>
                          </div>
                          <div class="col-md-5">
                            <label class="form-label fw-medium">Right Side</label>
                            <textarea
                              v-model="pair.right"
                              class="form-control"
                              rows="2"
                              placeholder="Enter right side text..."
                              style="border-radius: 8px;"
                              :class="{ 'is-invalid': validationErrors['pair_right_' + index] }"
                            ></textarea>
                            <div v-if="validationErrors['pair_right_' + index]" class="invalid-feedback">
                              {{ validationErrors['pair_right_' + index] }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      v-if="question.matchPairs.length < 8"
                      type="button" 
                      class="btn btn-outline-primary"
                      @click="addMatchPair"
                    >
                      <i class="bi bi-plus-circle me-2"></i>Add Pair
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="col-lg-4">
              <!-- Save Actions -->
              <div class="card border-0 shadow-lg mb-4" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95);">
                <div class="card-header bg-transparent border-0 p-4">
                  <h5 class="mb-0 fw-bold text-dark">
                    <i class="bi bi-floppy text-primary me-2"></i>
                    Save Question
                  </h5>
                </div>
                <div class="card-body p-4">
                  <div class="d-grid gap-3">
                    <button 
                      type="button"
                      class="btn btn-outline-secondary btn-lg"
                      @click="saveQuestion(true)"
                      :disabled="isSaving"
                      v-if="question.status === 'Draft'"
                    >
                      <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                      <i v-else class="bi bi-file-earmark me-2"></i>
                      Save as Draft
                    </button>
                    <button 
                      type="button"
                      class="btn btn-primary btn-lg"
                      @click="saveQuestion(false)"
                      :disabled="isSaving || !isValidForm"
                      style="background: linear-gradient(45deg, #667eea, #764ba2); border: none;"
                    >
                      <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                      <i v-else class="bi bi-check-circle me-2"></i>
                      {{ isSaving ? 'Saving...' : 'Save Changes' }}
                    </button>
                  </div>
                  <div class="mt-3">
                    <div class="validation-summary">
                      <div v-if="Object.keys(validationErrors).length > 0" class="text-danger small">
                        <i class="bi bi-exclamation-triangle me-1"></i>
                        {{ Object.keys(validationErrors).length }} validation error(s) found
                      </div>
                      <div v-else-if="isValidForm" class="text-success small">
                        <i class="bi bi-check-circle me-1"></i>
                        All validations passed
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Question Stats -->
              <div class="card border-0 shadow-lg" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95);">
                <div class="card-header bg-transparent border-0 p-4">
                  <h5 class="mb-0 fw-bold text-dark">
                    <i class="bi bi-bar-chart text-primary me-2"></i>
                    Question Stats
                  </h5>
                </div>
                <div class="card-body p-4">
                  <div class="stats-grid">
                    <div class="stat-item mb-3">
                      <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-type text-info"></i>
                        <span class="stat-label">Type:</span>
                        <span class="stat-value">{{ question.type }}</span>
                      </div>
                    </div>
                    <div class="stat-item mb-3">
                      <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-people text-success"></i>
                        <span class="stat-label">Age Groups:</span>
                        <span class="stat-value">{{ question.age.length }}</span>
                      </div>
                    </div>
                    <div class="stat-item mb-3" v-if="question.type !== 'Matching'">
                      <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-list text-warning"></i>
                        <span class="stat-label">Options:</span>
                        <span class="stat-value">{{ question.options.length }}</span>
                      </div>
                    </div>
                    <div class="stat-item mb-3" v-if="question.type === 'Matching'">
                      <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-diagram-2 text-warning"></i>
                        <span class="stat-label">Pairs:</span>
                        <span class="stat-value">{{ question.matchPairs.length }}</span>
                      </div>
                    </div>
                    <div class="stat-item">
                      <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-flag text-danger"></i>
                        <span class="stat-label">Status:</span>
                        <span class="badge" :class="{
                          'bg-success': question.status === 'Approved',
                          'bg-warning text-dark': question.status === 'Review',
                          'bg-secondary': question.status === 'Draft',
                          'bg-danger': question.status === 'Rejected'
                        }">{{ question.status }}</span>
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
  `,
};
