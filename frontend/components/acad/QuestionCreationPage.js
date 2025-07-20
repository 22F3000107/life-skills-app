import { createQuestion } from "../../services/questionService.js";
import { fetchModules } from "../../services/moduleService.js";

export default {
  name: "QuestionCreatePage",
  data() {
    return {
      questionType: "",
      selectedModuleId: "",
      selectedAges: [],
      moduleList: [],
      ageGroups: ["6-8", "9-11", "12-14", "15-18"],
      questionTypes: ["MCQ", "MSQ", "True/False", "Matching"],
      options: [
        { text: "", correct: false, submitted: false },
        { text: "", correct: false, submitted: false },
        { text: "", correct: false, submitted: false },
        { text: "", correct: false, submitted: false },
      ],
      matchPairs: [
        { left: "", right: "" },
        { left: "", right: "" },
      ],
      audioFileName: "",
      audioUrl: null,
      selectedImage: null,
      showSaveConfirm: false,
      showSuccessPopup: false,
      generatedQCode: "",
      questionText: "",
      isLoading: false,
      currentStep: 1,
      maxSteps: 3,
    };
  },
  computed: {
    canProceedToStep2() {
      return (
        this.questionType &&
        this.selectedModuleId &&
        this.selectedAges.length > 0
      );
    },
    canProceedToStep3() {
      return this.canProceedToStep2 && this.questionText.trim();
    },
    canSave() {
      let hasValidAnswers = false;

      if (this.questionType === "MCQ" || this.questionType === "MSQ") {
        hasValidAnswers = this.options.some(
          (opt) => opt.text.trim() && opt.correct
        );
      } else if (this.questionType === "True/False") {
        hasValidAnswers = true; // Always valid for True/False
      } else if (this.questionType === "Matching") {
        hasValidAnswers = this.matchPairs.every(
          (pair) => pair.left.trim() && pair.right.trim()
        );
      }

      return this.canProceedToStep3 && hasValidAnswers;
    },

    selectedModuleName() {
      const mod = this.moduleList.find((m) => m.id === this.selectedModuleId);
      return mod ? mod.name : "";
    },
  },
  methods: {
    nextStep() {
      if (this.currentStep < this.maxSteps) {
        this.currentStep++;
      }
    },
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    addPair() {
      this.matchPairs.push({ left: "", right: "" });
    },
    removePair(index) {
      if (this.matchPairs.length > 2) {
        this.matchPairs.splice(index, 1);
      }
    },
    addOption() {
      if (this.options.length < 6) {
        this.options.push({ text: "", correct: false, submitted: false });
      }
    },
    removeOption(index) {
      if (this.options.length > 2) {
        this.options.splice(index, 1);
      }
    },
    selectAudio() {
      this.$refs.audioInput.click();
    },
    handleAudioUpload(event) {
      const file = event.target.files[0];
      if (file && file.type === "audio/mp3") {
        this.audioFileName = file.name;
        this.audioUrl = URL.createObjectURL(file);
      }
    },
    selectFile() {
      this.$refs.fileInput.click();
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.selectedImage = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    handleDrop(event) {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.selectedImage = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    removeImage() {
      this.selectedImage = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = "";
      }
    },
    updateCorrectAnswer(index) {
      if (this.questionType === "MCQ" || this.questionType === "True/False") {
        this.options.forEach((opt, i) => (opt.correct = i === index));
      } else if (this.questionType === "MSQ") {
        this.options[index].correct = !this.options[index].correct;
      }
    },
    saveQuestion() {
      if (!this.canSave) {
        alert("Please complete all required fields before saving.");
        return;
      }
      this.showSaveConfirm = true;
    },
    async confirmSave(event) {
      if (event) event.preventDefault();
      this.isLoading = true;
      try {
        const payload = {
          module_id: this.selectedModuleId, // ✅ module_id (int)
          question_statement: this.questionText,
          type: this.questionType,
          age_group: this.selectedAges.join(","), // or however you store age_group
          ...(this.questionType === "Matching"
            ? { answers: this.matchPairs }
            : { answers: this.options }),
          marks: 5, // or whatever marks you're using
          audio_url: this.audioUrl,
          image_url: this.selectedImage,
        };

        const result = await createQuestion(payload);
        this.generatedQCode = result.qcode || payload.qcode;
        this.showSuccessPopup = true;
        console.log("saved");
      } catch (err) {
        alert("Failed to save question: " + err.message);
      } finally {
        this.isLoading = false;
        this.showSaveConfirm = false;
      }
    },
    closeSuccessPopup() {
      this.showSuccessPopup = false;
    },
    viewQuestion() {
      this.$router.push(`/acad/question/${this.generatedQCode}`);
    },
    async loadModules() {
      try {
        this.moduleList = await fetchModules();
      } catch (error) {
        console.error("Failed to load modules:", error);
        this.moduleList = [];
      }
    },
  },

  watch: {
    questionType(newType) {
      if (newType === "True/False") {
        this.options = [
          { text: "True", correct: false, submitted: false },
          { text: "False", correct: false, submitted: false },
        ];
      } else if (["MCQ", "MSQ"].includes(newType)) {
        this.options = [
          { text: "", correct: false, submitted: false },
          { text: "", correct: false, submitted: false },
          { text: "", correct: false, submitted: false },
          { text: "", correct: false, submitted: false },
        ];
      }
    },
  },
  mounted() {
    this.loadModules();
  },

  template: `
    <div class="question-creator-container">
      <div class="container-fluid py-4">
        <!-- Header -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-md-8">
                    <h4 class="mb-1 text-primary">
                      <i class="fas fa-plus-circle me-2"></i>Create New Question
                    </h4>
                    <p class="text-muted mb-0">Build engaging questions for your students</p>
                  </div>
                  <div class="col-md-4 text-md-end">
                    <div class="progress-wrapper">
                      <small class="text-muted d-block mb-1">Progress: Step {{ currentStep }} of {{ maxSteps }}</small>
                      <div class="progress" style="height: 6px;">
                        <div class="progress-bar bg-primary" :style="{ width: (currentStep / maxSteps) * 100 + '%' }"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 1: Question Configuration -->
        <div v-show="currentStep === 1" class="step-content">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-light border-0">
              <h5 class="mb-0 text-primary">
                <i class="fas fa-cog me-2"></i>Step 1: Question Configuration
              </h5>
            </div>
            <div class="card-body p-4">
              <div class="row g-4">
                <div class="col-md-4">
                  <label class="form-label fw-bold">Question Type <span class="text-danger">*</span></label>
                  <select v-model="questionType" class="form-select form-select-lg">
                    <option disabled value="">Choose question type...</option>
                    <option v-for="type in questionTypes" :key="type" :value="type">
                      {{ type === 'MCQ' ? 'Multiple Choice (Single Answer)' : 
                         type === 'MSQ' ? 'Multiple Choice (Multiple Answers)' : 
                         type === 'True/False' ? 'True or False' : 
                         'Matching Pairs' }}
                    </option>
                  </select>
                  <div class="form-text">Select the type of question you want to create</div>
                </div>
                
                <div class="col-md-4">
                  <label class="form-label fw-bold">Module <span class="text-danger">*</span></label>
                  <select v-model="selectedModuleId" class="form-select form-select-lg">
                    <option disabled value="">Select module...</option>
                    <option v-for="mod in moduleList" :key="mod.id" :value="mod.id">{{ mod.name }}</option>
                  </select>
                  <div class="form-text">Choose the subject module</div>
                </div>
                
                <div class="col-md-4">
                  <label class="form-label fw-bold">Target Age Groups <span class="text-danger">*</span></label>
                  <div class="dropdown">
                    <button class="btn btn-lg btn-outline-secondary dropdown-toggle w-100 text-start" type="button" data-bs-toggle="dropdown">
                      {{ selectedAges.length ? selectedAges.join(', ') : 'Select age groups...' }}
                    </button>
                    <ul class="dropdown-menu w-100 p-3">
                      <li v-for="age in ageGroups" :key="age" class="mb-2">
                        <div class="form-check">
                          <input class="form-check-input" type="checkbox" :value="age" v-model="selectedAges" :id="'age_' + age">
                          <label class="form-check-label" :for="'age_' + age">{{ age }} years old</label>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div class="form-text">Select appropriate age groups</div>
                </div>
              </div>
              
              <div class="d-flex justify-content-end mt-4">
                <button class="btn btn-primary btn-lg" @click="nextStep" :disabled="!canProceedToStep2">
                  Continue <i class="fas fa-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Question Content -->
        <div v-show="currentStep === 2" class="step-content">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-light border-0">
              <h5 class="mb-0 text-primary">
                <i class="fas fa-edit me-2"></i>Step 2: Question Content
              </h5>
            </div>
            <div class="card-body p-4">
              <div class="row">
                <div class="col-md-5">
                  <h6 class="fw-bold mb-3">Media Attachments</h6>
                  
             <!-- Image Upload Area -->
<div class="media-upload-area mb-4">
  <label class="form-label fw-bold">Question Image (Optional)</label>
  <div class="image-drop-zone position-relative border rounded p-3 text-center"
       @dragover.prevent 
       @drop.prevent="handleDrop"
       :class="{ 'has-image': selectedImage }"
       style="min-height: 200px; background-color: #f8f9fa;">
       
    <!-- No Image Placeholder -->
    <div v-if="!selectedImage" class="upload-placeholder">
      <i class="fas fa-cloud-upload-alt fa-3x text-muted mb-3"></i>
      <h6>Drag & drop an image here</h6>
      <p class="text-muted">or</p>
      <button class="btn btn-outline-primary" @click="selectFile">
        <i class="fas fa-folder-open me-2"></i>Browse Files
      </button>
      <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" style="display: none;" />
      <div class="form-text mt-2">Supports: JPG, PNG, GIF (Max 5MB)</div>
    </div>

    <!-- Image Preview -->
    <div v-else class="image-preview position-relative w-100 h-100 d-flex justify-content-center align-items-center">
      <img :src="selectedImage" alt="Uploaded Image"
           style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 6px;" />
      <button class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2" @click="removeImage" title="Remove image">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</div>


                  <!-- Audio Upload -->
<div class="audio-upload-area">
  <label class="form-label fw-bold">Audio File (Optional)</label>
  <div class="audio-controls mb-2">
    <button class="btn btn-outline-secondary" @click="selectAudio">
      <i class="fas fa-microphone me-2"></i>Upload MP3
    </button>
    <input type="file" ref="audioInput" @change="handleAudioUpload" accept="audio/mp3" style="display: none;" />
  </div>

  <div v-if="audioFileName" class="audio-preview mt-2">
    <div class="audio-file-info d-flex align-items-center gap-2">
      <i class="fas fa-music text-primary"></i>
      <span class="text-muted">{{ audioFileName }}</span>
    </div>
    <audio :src="audioUrl" controls class="w-100 mt-2" style="max-height: 40px;"></audio>
  </div>
</div>

                </div>
                
                <div class="col-md-7">
                  <h6 class="fw-bold mb-3">Question Text</h6>
                  <div class="question-text-editor">
                    <label class="form-label fw-bold">Enter your question <span class="text-danger">*</span></label>
                    <textarea 
                      v-model="questionText" 
                      class="form-control form-control-lg" 
                      rows="8" 
                      placeholder="Type your question here... Be clear and concise."
                      style="resize: vertical;"
                    ></textarea>
                    <div class="form-text">
                      <span :class="{ 'text-danger': questionText.length > 500 }">
                        {{ questionText.length }}/500 characters
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="d-flex justify-content-between mt-4">
                <button class="btn btn-outline-secondary btn-lg" @click="prevStep">
                  <i class="fas fa-arrow-left me-2"></i>Back
                </button>
                <button class="btn btn-primary btn-lg" @click="nextStep" :disabled="!canProceedToStep3">
                  Continue <i class="fas fa-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Answer Options -->
        <div v-show="currentStep === 3" class="step-content">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-light border-0">
              <h5 class="mb-0 text-primary">
                <i class="fas fa-list-check me-2"></i>Step 3: Answer Options
              </h5>
            </div>
            <div class="card-body p-4">
              
              <div v-if="['MCQ', 'MSQ', 'True/False'].includes(questionType)" class="answer-options">
  <div class="d-flex justify-content-between align-items-center mb-4" v-if="questionType !== 'True/False'">
    <h6 class="fw-bold mb-0">
      {{ questionType === 'MCQ' ? 'Multiple Choice (Select one correct answer)' : 
         questionType === 'MSQ' ? 'Multiple Select (Select all correct answers)' : 
         'True/False' }}
    </h6>
    <button 
      class="btn btn-outline-primary btn-sm" 
      @click="addOption" 
      :disabled="options.length >= 6 || questionType === 'True/False'">
      <i class="fas fa-plus me-1"></i>Add Option
    </button>
  </div>

 <div class="row g-3">
  <div v-for="(option, index) in options" :key="index" class="col-md-6">
    
    <!-- Wrapper changes depending on questionType -->
    <div 
      :class="[
        questionType === 'True/False' ? 'tf-option' : 'option-card',
        option.correct ? 'correct-answer' : ''
      ]"
    >
      <div class="form-check">
        <input 
          :type="questionType === 'MCQ' || questionType === 'True/False' ? 'radio' : 'checkbox'" 
          :name="'opt_' + questionType" 
          class="form-check-input"
          :checked="option.correct" 
          @change="updateCorrectAnswer(index)"
          :id="'option_' + index"
        />

        <!-- Label changes for True/False -->
        <label class="form-check-label fw-bold" :for="'option_' + index">
          <template v-if="questionType === 'True/False'">
            <i 
              :class="[
                index === 0 ? 'fas fa-check-circle text-success me-2' : 'fas fa-times-circle text-danger me-2'
              ]"
            ></i>
            {{ option.text }}
            <span v-if="option.correct" class="badge bg-success ms-2">Correct</span>
          </template>

          <template v-else>
            Option {{ String.fromCharCode(65 + index) }}
            <span v-if="option.correct" class="badge bg-success ms-2">Correct</span>
          </template>
        </label>
      </div>

      <!-- Optional delete icon for non-True/False -->
      <div v-if="questionType !== 'True/False'" class="option-actions mt-2">
        <button 
          class="btn btn-sm btn-outline-danger" 
          @click="removeOption(index)" 
          :disabled="options.length <= 2"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>

      <!-- Option input -->
      <div v-if="questionType !== 'True/False'" class="option-content mt-2">
        <input 
          v-model="option.text" 
          class="form-control" 
          :placeholder="'Enter option ' + String.fromCharCode(65 + index) + '...'"
        />
      </div>
    </div>
  </div>
</div>

</div>


              <!-- Matching Pairs -->
              <div v-else-if="questionType === 'Matching'" class="answer-options">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <h6 class="fw-bold mb-0">Create matching pairs</h6>
                  <button class="btn btn-outline-primary btn-sm" @click="addPair">
                    <i class="fas fa-plus me-1"></i>Add Pair
                  </button>
                </div>
                
                <div class="matching-pairs">
                  <div v-for="(pair, i) in matchPairs" :key="i" class="matching-pair">
                    <div class="pair-number">{{ i + 1 }}</div>
                    <div class="pair-content">
                      <div class="left-side">
                        <label class="form-label">Left Side</label>
                        <input v-model="pair.left" class="form-control" placeholder="Enter text or concept...">
                      </div>
                      <div class="connection-arrow">
                        <i class="fas fa-exchange-alt"></i>
                      </div>
                      <div class="right-side">
                        <label class="form-label">Right Side</label>
                        <input v-model="pair.right" class="form-control" placeholder="Enter matching text...">
                      </div>
                      <div class="pair-actions">
                        <button class="btn btn-outline-danger btn-sm" @click="removePair(i)" :disabled="matchPairs.length <= 2" title="Remove pair">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="d-flex justify-content-between mt-5">
                <button class="btn btn-outline-secondary btn-lg" @click="prevStep">
                  <i class="fas fa-arrow-left me-2"></i>Back
                </button>
                <button type="button" class="btn btn-success btn-lg" @click="saveQuestion" :disabled="!canSave || isLoading">
                  <i v-if="isLoading" class="fas fa-spinner fa-spin me-2"></i>
                  <i v-else class="fas fa-save me-2"></i>
                  {{ isLoading ? 'Saving...' : 'Save Question' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Confirmation Modal -->
        <div v-if="showSaveConfirm" class="modal d-block" style="background-color: rgba(0,0,0,0.5);">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow">
              <div class="modal-header border-0 bg-light">
                <h5 class="modal-title text-primary">
                  <i class="fas fa-question-circle me-2"></i>Confirm Save
                </h5>
                <button type="button" class="btn-close" @click="showSaveConfirm = false"></button>
              </div>
              <div class="modal-body p-4">
                <p class="mb-3">Are you ready to save this question?</p>
                <div class="question-summary">
                  <small class="text-muted">
                    <strong>Type:</strong> {{ questionType }}<br>
                    <strong>Module:</strong> {{  selectedModuleName }}<br>
                    <strong>Age Groups:</strong> {{ selectedAges.join(', ') }}
                  </small>
                </div>
              </div>
              <div class="modal-footer border-0">
                <button class="btn btn-outline-secondary" @click="showSaveConfirm = false">
                  <i class="fas fa-times me-2"></i>Cancel
                </button>
                <button type="button" class="btn btn-success"  @click.prevent="confirmSave($event)" :disabled="isLoading">
                  <i v-if="isLoading" class="fas fa-spinner fa-spin me-2"></i>
                  <i v-else class="fas fa-check me-2"></i>
                  {{ isLoading ? 'Saving...' : 'Yes, Save' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Success Modal -->
        <div v-if="showSuccessPopup" class="modal d-block" style="background-color: rgba(0,0,0,0.5);">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow">
              <div class="modal-header border-0 bg-success text-white">
                <h5 class="modal-title">
                  <i class="fas fa-check-circle me-2"></i>Success!
                </h5>
                <button type="button" class="btn-close btn-close-white" @click="closeSuccessPopup"></button>
              </div>
              <div class="modal-body p-4 text-center">
                <div class="success-animation mb-3">
                  <i class="fas fa-check-circle text-success" style="font-size: 3rem;"></i>
                </div>
                <h6>Question Created Successfully!</h6>
                <p class="mb-3">Your question has been created with QCode:</p>
                <div class="qcode-display">
                  <code class="bg-light p-2 rounded">{{ generatedQCode }}</code>
                </div>
              </div>
              <div class="modal-footer border-0 justify-content-center">
                <button class="btn btn-outline-secondary" @click="closeSuccessPopup">
                  <i class="fas fa-times me-2"></i>Close
                </button>
                <button class="btn btn-primary" @click="viewQuestion">
                  <i class="fas fa-eye me-2"></i>View Question
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
};
