export default {
  name: "IndividualQuestionPage",
  data() {
    return {
      question: {
        qcode: "Q101",
        type: "Matching", // Can be "MCQ", "MSQ", "True/False", "Matching"
        module: "Time Management",
        age: "9-11",
        text: "What is the best way to manage your time?",
        imageUrl: "https://via.placeholder.com/150",
        audioName: "example.mp3",
        audioUrl:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        options: [
          { text: "Make a schedule", correct: true },
          { text: "Do whatever you feel like", correct: false },
          { text: "Skip important things", correct: false },
          { text: "Waste time", correct: false },
        ],
        correctAnswer: true,
        matchPairs: [
          { left: "Wake up early", right: "Start the day on time" },
          { left: "Make a plan", right: "Stay organized" },
        ],
      },
    };
  },
  template: `
    <div class="container mt-4">
      <div class="bg-white p-3 shadow-sm rounded">

        <!-- Metadata -->
        <div class="d-flex gap-3 flex-wrap mb-3">
          <div><strong>Type:</strong> {{ question.type }}</div>
          <div><strong>Module:</strong> {{ question.module }}</div>
          <div><strong>Age Group:</strong> {{ question.age }}</div>
          <div><strong>QCode:</strong> {{ question.qcode }}</div>
        </div>

        <!-- Media and Question -->
        <div class="d-flex p-3 mb-3 bg-light rounded border shadow-sm" style="height: 200px;">
          <!-- Image -->
          <div class="flex-fill d-flex justify-content-center align-items-center me-3" style="flex: 2;">
            <img 
              v-if="question.imageUrl" 
              :src="question.imageUrl" 
              class="mw-100 mh-100" 
              style="object-fit: contain; max-height: 100%; max-width: 100%;" 
            />
            <p v-else class="text-muted">No image uploaded</p>
          </div>

          <!-- Audio and Question -->
          <div class="flex-fill d-flex flex-column justify-content-start" style="flex: 3;">
            <div class="mb-2">
              <span v-if="question.audioName" class="text-muted small">{{ question.audioName }}</span>
              <audio v-if="question.audioUrl" :src="question.audioUrl" controls style="height: 30px;"></audio>
            </div>
            <p class="form-control form-control-sm bg-light">{{ question.text }}</p>
          </div>
        </div>

        <!-- Options -->
        <div v-if="question.type === 'MCQ' || question.type === 'MSQ'">
          <div class="row g-2">
            <div v-for="(option, index) in question.options" :key="index" class="col-md-6">
              <div 
                class="p-2 rounded d-flex align-items-center gap-2" 
                :class="{ 'bg-success text-white': option.correct }"
              >
                <input 
                  :type="question.type === 'MCQ' ? 'radio' : 'checkbox'" 
                  disabled 
                  :checked="option.correct" 
                  class="form-check-input"
                />
                <span>{{ option.text }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="question.type === 'True/False'">
          <div class="d-flex gap-3">
            <div 
              class="p-2 border rounded" 
              :class="{ 'bg-success text-white': question.correctAnswer === true }"
            >
              <input type="radio" disabled :checked="question.correctAnswer === true" class="form-check-input" />
              True
            </div>
            <div 
              class="p-2 border rounded" 
              :class="{ 'bg-success text-white': question.correctAnswer === false }"
            >
              <input type="radio" disabled :checked="question.correctAnswer === false" class="form-check-input" />
              False
            </div>
          </div>
        </div>

        <div v-else-if="question.type === 'Matching'">
          <div v-for="(pair, i) in question.matchPairs" :key="i" class="d-flex gap-3 align-items-center mb-2">
            <div class="form-control form-control-sm bg-light" style="max-width: 150px;">{{ pair.left }}</div>
            <span>➡️</span>
            <div class="form-control form-control-sm bg-light" style="max-width: 150px;">{{ pair.right }}</div>
          </div>
        </div>

      </div>
    </div>
  `,
};
