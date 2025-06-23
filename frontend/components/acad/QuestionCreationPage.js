import { createQuestion } from "../../services/questionService.js";

export default {
  name: "QuestionCreatePage",
  data() {
    return {
      questionType: "",
      selectedModule: "",
      selectedAges: [],
      moduleList: ["Time Management", "Stress Control", "Communication"],
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
    };
  },
  methods: {
    addPair() {
      this.matchPairs.push({ left: "", right: "" });
    },
    removePair(index) {
      this.matchPairs.splice(index, 1);
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
      if (this.questionType === "MCQ") {
        this.options.forEach((opt, i) => (opt.correct = i === index));
      } else if (this.questionType === "MSQ") {
        this.options[index].correct = !this.options[index].correct;
      }
    },
    saveQuestion() {
      if (
        !this.questionType ||
        !this.selectedModule ||
        !this.questionText ||
        this.selectedAges.length === 0
      ) {
        alert("Please fill in all fields before saving.");
        return;
      }
      this.showSaveConfirm = true;
    },
    async confirmSave() {
      try {
        const payload = {
          qcode: "Q" + Math.floor(Math.random() * 1000 + 100), // Replace with server-generated ID if needed
          question_text: this.questionText,
          question_type: this.questionType,
          module_name: this.selectedModule,
          age_groups: this.selectedAges,
          options: ["MCQ", "MSQ"].includes(this.questionType)
            ? this.options
            : null,
          match_pairs:
            this.questionType === "Matching" ? this.matchPairs : null,
          image_url: this.selectedImage,
          audio_url: this.audioUrl,
          status: "Pending",
        };

        const result = await createQuestion(payload);
        this.generatedQCode = result.qcode || payload.qcode;
        this.showSuccessPopup = true;
      } catch (err) {
        alert("Failed to save question: " + err.message);
      } finally {
        this.showSaveConfirm = false;
      }
    },
    closeSuccessPopup() {
      this.showSuccessPopup = false;
    },
    viewQuestion() {
      this.$router.push(`/acad/question/${this.generatedQCode}`);
    },
  },
  template: `
    <div class="container mt-4">
      <div class="bg-white p-3 shadow-sm rounded">
        <div class="d-flex gap-3 flex-wrap mb-3">
          <select v-model="questionType" class="form-select form-select-sm" style="max-width: 160px">
            <option disabled value="">Select Type</option>
            <option v-for="type in questionTypes" :key="type" :value="type">{{ type }}</option>
          </select>
          <select v-model="selectedModule" class="form-select form-select-sm" style="max-width: 160px">
            <option disabled value="">Select Module</option>
            <option v-for="mod in moduleList" :key="mod" :value="mod">{{ mod }}</option>
          </select>
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">Select Age</button>
            <ul class="dropdown-menu p-2">
              <li v-for="age in ageGroups" :key="age">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" :value="age" v-model="selectedAges" :id="'age_' + age">
                  <label class="form-check-label" :for="'age_' + age">{{ age }}</label>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div class="d-flex p-3 mb-3 bg-light rounded border shadow-sm" style="height: 200px;">
          <div class="flex-fill border border-dashed rounded d-flex justify-content-center align-items-center text-center me-3 position-relative overflow-hidden" style="flex: 2; border-style: dashed; height: 160px;" @dragover.prevent @drop.prevent="handleDrop">
            <div v-if="!selectedImage" class="text-center">
              <p class="mb-1">Drag and drop or</p>
              <button class="btn btn-sm btn-outline-primary" @click="selectFile">Select a file</button>
              <input type="file" ref="fileInput" @change="handleFileChange" style="display: none;" accept="image/*" />
            </div>
            <div v-else class="position-relative w-100 h-100 d-flex justify-content-center align-items-center">
              <img :src="selectedImage" alt="Selected Image" class="mw-100 mh-100" style="object-fit: contain; max-height: 100%; max-width: 100%;" />
              <button class="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-1" @click="removeImage">✖</button>
            </div>
          </div>
          <div class="flex-fill d-flex flex-column" style="flex: 3;">
            <div class="d-flex align-items-center gap-2 mb-2">
              <button class="btn btn-sm btn-outline-secondary" @click="selectAudio">Upload MP3</button>
              <span v-if="audioFileName" class="text-muted small">{{ audioFileName }}</span>
              <audio v-if="audioUrl" :src="audioUrl" controls style="height: 30px;"></audio>
              <input type="file" ref="audioInput" @change="handleAudioUpload" accept="audio/mp3" style="display: none;" />
            </div>
            <textarea v-model="questionText" class="form-control form-control-sm flex-fill" rows="3" placeholder="Enter your question here..." style="resize: none;"></textarea>
          </div>
        </div>

        <div v-if="questionType === 'MCQ' || questionType === 'MSQ'">
          <div class="row g-2">
            <div v-for="(option, index) in options" :key="index" class="col-md-6">
              <div class="p-2 rounded d-flex align-items-center gap-2" :class="{ 'bg-success text-white': option.correct }">
                <input :type="questionType === 'MCQ' ? 'radio' : 'checkbox'" :name="'opt_' + questionType" class="form-check-input" :checked="option.correct" @change="updateCorrectAnswer(index)"/>
                <input v-if="!option.submitted" v-model="option.text" class="form-control form-control-sm" placeholder="Option text">
                <span v-else>{{ option.text }}</span>
                <button class="btn btn-sm btn-outline-success" v-if="!option.submitted" @click="option.submitted = true">✔</button>
                <button class="btn btn-sm btn-outline-warning" v-else @click="option.submitted = false">✎</button>
                <button class="btn btn-sm btn-outline-danger" @click="option.text = ''; option.submitted = false">🗑️</button>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="questionType === 'True/False'">
          <div class="d-flex gap-3">
            <div class="p-2 border rounded d-flex align-items-center gap-2">
              <input type="radio" name="tf" class="form-check-input" checked>
              True
            </div>
            <div class="p-2 border rounded d-flex align-items-center gap-2">
              <input type="radio" name="tf" class="form-check-input">
              False
            </div>
          </div>
        </div>

        <div v-else-if="questionType === 'Matching'">
          <div v-for="(pair, i) in matchPairs" :key="i" class="d-flex gap-3 align-items-center mb-2">
            <div class="d-flex gap-2 align-items-center">
              <input v-model="pair.left" class="form-control form-control-sm" placeholder="Left" style="max-width: 120px">
              <button class="btn btn-sm btn-outline-secondary">📁</button>
              <button class="btn btn-sm btn-outline-warning">✎</button>
              <button class="btn btn-sm btn-outline-danger" @click="removePair(i)">🗑️</button>
            </div>
            <span>➡️</span>
            <div class="d-flex gap-2 align-items-center">
              <input v-model="pair.right" class="form-control form-control-sm" placeholder="Right" style="max-width: 120px">
              <button class="btn btn-sm btn-outline-secondary">📁</button>
              <button class="btn btn-sm btn-outline-warning">✎</button>
              <button class="btn btn-sm btn-outline-danger" @click="removePair(i)">🗑️</button>
            </div>
          </div>
          <button class="btn btn-sm btn-outline-primary mt-2" @click="addPair">+ Add Option</button>
        </div>

        <div class="text-end mt-4">
          <button class="btn btn-sm btn-success" @click="saveQuestion">Save</button>
        </div>

        <div v-if="showSaveConfirm" class="modal d-block" style="background-color: rgba(0,0,0,0.5);">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h6 class="modal-title">Confirm Save</h6>
                <button type="button" class="btn-close" @click="showSaveConfirm = false"></button>
              </div>
              <div class="modal-body">
                <p>Are you sure you want to save this question?</p>
              </div>
              <div class="modal-footer">
                <button class="btn btn-sm btn-secondary" @click="showSaveConfirm = false">Cancel</button>
                <button class="btn btn-sm btn-success" @click="confirmSave">Yes, Save</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="showSuccessPopup" class="modal d-block" style="background-color: rgba(0,0,0,0.5);">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h6 class="modal-title">Question Created</h6>
                <button type="button" class="btn-close" @click="closeSuccessPopup"></button>
              </div>
              <div class="modal-body">
                <p>Question has been successfully created with QCode <strong>{{ generatedQCode }}</strong>.</p>
              </div>
              <div class="modal-footer">
                <button class="btn btn-sm btn-outline-secondary" @click="closeSuccessPopup">Close</button>
                <button class="btn btn-sm btn-primary" @click="viewQuestion">View Question</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
};
