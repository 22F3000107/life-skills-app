export default {
  name: "TakeTestPage",
  data() {
    return {
      questions: [],
      questionBank: [
        {
          text: "What is a good time to sleep for kids?",
          options: ["12:00 AM", "9:00 PM", "2:00 AM", "10:30 PM"],
          correctIndex: 1,
          hint: "Most kids need to sleep before 10 PM!"
        },
        {
          text: "Which of these is a healthy habit?",
          options: ["Skipping breakfast", "Brushing twice a day", "Sleeping late", "Eating only candy"],
          correctIndex: 1,
          hint: "Your dentist would be proud!"
        },
        {
          text: "What should you do after playing outside?",
          options: ["Watch TV", "Eat junk food", "Wash your hands", "Sleep late"],
          correctIndex: 2,
          hint: "Clean hands keep germs away!"
        },
        {
          text: "Why is breakfast important?",
          options: ["It keeps you sleepy", "It starts your day with energy", "It helps you skip lunch", "It makes you tired"],
          correctIndex: 1,
          hint: "It gives energy to your brain!"
        },
        {
          text: "How often should you brush your teeth?",
          options: ["Once a week", "Every night", "Twice a day", "Only after dinner"],
          correctIndex: 2,
          hint: "Morning and night is best!"
        }
      ],
      currentQuestionIndex: 0,
      selectedOption: null,
      showFeedback: false,
      correct: false,
      score: 0,
      quizFinished: false,
      hintUsed: false,
      coins: 10,
      answers: []
    };
  },
  created() {
    const shuffled = [...this.questionBank].sort(() => 0.5 - Math.random());
    this.questions = shuffled.slice(0, 3);
  },
  methods: {
    checkAnswer() {
      if (this.selectedOption !== null) {
        const current = this.questions[this.currentQuestionIndex];
        const isCorrect = this.selectedOption === current.correctIndex;
        this.correct = isCorrect;
        if (isCorrect) this.score++;

        this.answers.push({
          question: current.text,
          selected: this.selectedOption,
          correct: current.correctIndex
        });

        this.showFeedback = true;
      }
    },
    nextQuestion() {
      this.selectedOption = null;
      this.showFeedback = false;
      this.hintUsed = false;
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
      } else {
        this.quizFinished = true;
      }
    },
    useHint() {
      const hintCost = 3;
      if (this.coins >= hintCost && !this.hintUsed) {
        this.coins -= hintCost;
        this.hintUsed = true;
      }
    },
    restartQuiz() {
      const shuffled = [...this.questionBank].sort(() => 0.5 - Math.random());
      this.questions = shuffled.slice(0, 3);
      this.currentQuestionIndex = 0;
      this.selectedOption = null;
      this.showFeedback = false;
      this.correct = false;
      this.score = 0;
      this.quizFinished = false;
      this.hintUsed = false;
      this.coins = 10;
      this.answers = [];
    }
  },
  template: `
    <div class="container mt-4 mb-5">
      <!-- Header -->
      <div class="text-center mb-4">
        <h2 class="fw-bold">
          <i class="bi bi-patch-question-fill text-primary me-2"></i>Take a Test
        </h2>
        <p class="text-muted">Answer questions and test your life skills!</p>
        <p><i class="bi bi-coin text-warning me-1"></i><strong>{{ coins }}</strong> Coins</p>
      </div>

      <!-- Quiz Panel -->
      <div v-if="!quizFinished" class="card shadow-sm">
        <div class="card-body">
          <h5 class="card-title mb-3">
            <i class="bi bi-question-circle me-2 text-dark"></i>
            Q{{ currentQuestionIndex + 1 }}. {{ questions[currentQuestionIndex].text }}
          </h5>

          <ul class="list-group mb-3">
            <li
              v-for="(option, index) in questions[currentQuestionIndex].options"
              :key="index"
              class="list-group-item"
              :class="{ 'active': selectedOption === index }"
              style="cursor: pointer;"
              @click="selectedOption = index"
            >
              {{ option }}
            </li>
          </ul>

          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-outline-warning" @click="useHint" :disabled="hintUsed || coins < 3">
              <i class="bi bi-lightbulb me-1"></i>Use Hint (3 Coins)
            </button>

            <button class="btn btn-primary" @click="checkAnswer" :disabled="selectedOption === null || showFeedback">
              <i class="bi bi-check-circle me-1"></i>Check Answer
            </button>

            <button class="btn btn-secondary" @click="nextQuestion" v-if="showFeedback">
              <i class="bi bi-arrow-right-circle me-1"></i>Next
            </button>
          </div>

          <div v-if="hintUsed" class="alert alert-warning mt-3">
            <i class="bi bi-info-circle me-1"></i>Hint: {{ questions[currentQuestionIndex].hint }}
          </div>

          <div v-if="showFeedback" class="mt-3">
            <div v-if="correct" class="alert alert-success">
              <i class="bi bi-emoji-smile me-1"></i>Correct! Great job!
            </div>
            <div v-else class="alert alert-danger">
              <i class="bi bi-emoji-frown me-1"></i>Oops! That's not right. Keep practicing!
            </div>
          </div>
        </div>
      </div>

      <!-- Quiz Results -->
      <div v-else class="mt-4 text-center">
        <h3 class="mb-3">
          <i class="bi bi-flag-fill text-success me-2"></i>Quiz Completed!
        </h3>
        <p class="fs-5">Your Score: <strong>{{ score }} / {{ questions.length }}</strong></p>

        <!-- Results Table -->
        <div class="table-responsive mt-4">
          <table class="table table-bordered">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Question</th>
                <th>Your Answer</th>
                <th>Correct Answer</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(ans, index) in answers" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ ans.question }}</td>
                <td>{{ questions[index].options[ans.selected] || '—' }}</td>
                <td>{{ questions[index].options[ans.correct] }}</td>
                <td>
                  <i v-if="ans.selected === ans.correct" class="bi bi-check-circle-fill text-success"></i>
                  <i v-else class="bi bi-x-circle-fill text-danger"></i>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <button class="btn btn-success mt-3" @click="restartQuiz">
          <i class="bi bi-arrow-repeat me-1"></i>Restart Quiz
        </button>
      </div>
    </div>
  `
};

// This code defines a Vue.js component for a quiz page in a life skills application.
// It allows users to answer multiple-choice questions, check their answers, and view their score at the end.
// The quiz includes features like hints that can be purchased with in-app coins, and a summary of answers after completion.
// The component manages the quiz state, including the current question, selected answer, and whether the quiz is finished.
// It also provides methods to check answers, navigate through questions, use hints, and restart the quiz.
// The template includes a responsive layout with Bootstrap classes for styling,
// ensuring a clean and user-friendly interface.