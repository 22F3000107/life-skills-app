import { QuestionFormHeader } from "../utils/QuestionFormHeader.js";
import { AlertMessages } from "../utils/AlertMessages.js";
import { QuestionDetailsForm } from "../utils/QuestionDetailsForm.js";
import { QuestionContentForm } from "../utils/QuestionContentForm.js";
import { AnswerOptionsForm } from "../utils/AnswerOptions.js";
import { SaveActions } from "../utils/SaveActions.js";
import { QuestionStats } from "../utils/QuestionStats.js";
import { LoadingState } from "../utils/LoadingState.js";
import { ErrorState } from "../utils/ErrorState.js";
import { fetchQuestionById, updateQuestion } from "../../services/questionService.js";
import { fetchModules } from "../../services/moduleService.js";


export default {
  name: "EditQuestionPage",
  components: {
    QuestionFormHeader,
    AlertMessages,
    QuestionDetailsForm,
    QuestionContentForm,
    AnswerOptionsForm,
    SaveActions,
    QuestionStats,
    LoadingState,
    ErrorState,
  },
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
        status: "Pending",
      },
      questionTypes: ["MCQ", "MSQ", "True/False", "Matching"],
      moduleOptions: [],
      ageGroups: ["6-8", "9-11", "12-14", "15-18"],
      statusOptions: ["Review", "Approved", "Rejected"],
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
    await this.loadModules();
  },
  beforeUnmount() {
    window.removeEventListener("beforeunload", this.handleBeforeUnload);
  },
  methods: {
    // Data loading methods
    async loadModules() {
      try {
        this.moduleOptions = await fetchModules();
      } catch (error) {
        console.error("Failed to load modules:", error);
        this.moduleOptions = [];
      }
    },
    async loadQuestion() {
      const qcode = this.$route.params.qcode;
      try {
        this.isLoading = true;
        const res = await fetchQuestionById(qcode);
        this.question = {
          qcode: res.id,
          type: res.type,
          module: res.module_id,
          age: res.age_group || [],
          text: res.question_statement || "",
          imageUrl: res.image_url || "",
          audioUrl: res.audio_url || "",
          options: res.answers,
          status: this.getStatusLabel(res.is_approved),
        };
        this.isDirty = false;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },
    getStatusLabel(status) {
      if (status === true) return "Approved";
      else if (status === false) return "Rejected";
      else return "Pending";
    },

    // Validation methods
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

    // Question type and options handling
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
        this.question.options.forEach((opt, i) => {
          opt.correct = i === index;
        });
      }
    },

    // Media handling methods
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
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

    // Save and navigation methods
    async saveQuestion() {
      this.validateForm();
      if (!this.isValidForm) {
        this.error = "Please fix all validation errors before saving";
        return;
      }

      try {
        this.isSaving = true;
        this.error = null;

        const formData = new FormData();
        formData.append("id", this.question.qcode);
        formData.append("type", this.question.type);
        formData.append("module_id", this.question.module);
        formData.append("age_group", JSON.stringify(this.question.age));
        formData.append("question_statement", this.question.text);
        formData.append("is_approved", this.question.status);

        let cleanedAnswers = [];
        if (this.question.type === "Matching") {
          cleanedAnswers = this.question.matchPairs.map((pair) => ({
            text: null,
            correct: null,
            submitted: null,
            left: pair.left || "",
            right: pair.right || "",
          }));
        } else {
          cleanedAnswers = this.question.options.map((option) => ({
            text: option.text || "",
            correct: !!option.correct,
            submitted: !!option.submitted,
            left: null,
            right: null,
          }));
        }

        formData.append("answers", JSON.stringify(cleanedAnswers));

        if (this.imageFile) {
          formData.append("image_url", this.imageFile);
        } else if (this.question.imageUrl) {
          formData.append("image_url", this.question.imageUrl);
        }

        if (this.audioFile) {
          formData.append("audio_url", this.audioFile);
        } else if (this.question.audioUrl) {
          formData.append("audio_url", this.question.audioUrl);
        }

        await updateQuestion(this.question.qcode, formData);
        this.successMessage = "Question updated successfully!";
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

    // Navigation and lifecycle methods
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

    // Event handlers for child components
    clearError() {
      this.error = null;
    },
    clearSuccess() {
      this.successMessage = "";
    },
    updateQuestion(updatedQuestion) {
      this.question = { ...updatedQuestion };
    },
  },

  template: `
    <div class="min-vh-100" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div class="container-fluid py-4">
        <!-- Loading State -->
        <LoadingState v-if="isLoading" />

        <!-- Error State -->
        <ErrorState 
          v-else-if="error && !question" 
          :error="error"
          @go-back="goBack"
        />

        <!-- Edit Form -->
        <div v-else>
          <!-- Header -->
          <QuestionFormHeader
            :question="question"
            :is-dirty="isDirty"
            :is-loading="isLoading"
            @go-back="goBack"
            @preview-question="previewQuestion"
          />

          <!-- Alert Messages -->
          <AlertMessages
            :error="error"
            :success-message="successMessage"
            @clear-error="clearError"
            @clear-success="clearSuccess"
          />

          <!-- Form -->
          <div class="row">
            <div class="col-lg-8">
              <!-- Question Details -->
              <QuestionDetailsForm
                :question="question"
                :question-types="questionTypes"
                :module-options="moduleOptions"
                :age-groups="ageGroups"
                :status-options="statusOptions"
                :validation-errors="validationErrors"
                @update:question="updateQuestion"
                @question-type-change="onQuestionTypeChange"
              />

              <!-- Question Content -->
              <QuestionContentForm
                :question="question"
                :validation-errors="validationErrors"
                @update:question="updateQuestion"
                @image-upload="handleImageUpload"
                @audio-upload="handleAudioUpload"
                @remove-image="removeImage"
                @remove-audio="removeAudio"
              />

              <!-- Answer Options -->
              <AnswerOptionsForm
                :question="question"
                :validation-errors="validationErrors"
                @update:question="updateQuestion"
                @mcq-option-change="onMCQOptionChange"
                @add-option="addOption"
                @remove-option="removeOption"
                @add-match-pair="addMatchPair"
                @remove-match-pair="removeMatchPair"
              />
            </div>

            <!-- Sidebar -->
            <div class="col-lg-4">
              <!-- Save Actions -->
              <SaveActions
                :is-saving="isSaving"
                :is-valid-form="isValidForm"
                :validation-errors="validationErrors"
                @save-question="saveQuestion"
              />

              <!-- Question Stats -->
              <QuestionStats :question="question" />
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};
