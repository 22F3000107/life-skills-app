import {
  getQuizList,
  getQuizById,
  submitQuiz
} from "/utils/api.js";

export default {
  name: "TakeTestPage",
  data() {
    return {
      quizList: [],
      selectedQuiz: null,
      questions: [],
      currentQuestionIndex: 0,
      selectedOption: null,
      showFeedback: false,
      correct: false,
      score: 0,
      quizFinished: false,
      hintUsed: false,
      coins: 10,
      feedbackCoins: 0,
      answers: [],
      loading: false,
      token: localStorage.getItem("auth-token"),
      feedback: "",
      showResults: false,
      currentHint: null,
    };
  },
  async mounted() {
    try {
      this.loading = true;
      const data = await getQuizList(this.token);
      console.log("Quiz List API Response:", data);

      if (Array.isArray(data?.quizzes)) {
        this.quizList = data.quizzes;
      } else {
        console.error("Unexpected quiz list format", data);
        this.quizList = [];
      }
    } catch (err) {
      console.error("Error fetching quiz list", err.message);
    } finally {
      this.loading = false;
    }
  },
    methods: {
  async startQuiz(quiz) {
    try {
      this.loading = true;
      const data = await getQuizById(quiz.id, this.token);
      this.questions = data.questions;
      this.selectedQuiz = data;
      this.currentQuestionIndex = 0;
      this.selectedOption = null;
      this.showFeedback = false;
      this.quizFinished = false;
      this.answers = [];
      this.score = 0;
      this.hintUsed = false;
      this.coins = 10;
      this.showResults = false;
      this.currentHint = null;
    } catch (err) {
      console.error("Failed to fetch quiz", err.message);
    } finally {
      this.loading = false;
    }
  },

  selectOption(index) {
    this.selectedOption = Number(index);
  },

  checkAnswer() {
  if (this.selectedOption !== null) {
    const current = this.questions[this.currentQuestionIndex];
    const correctAnswerIndex = current.correct_answer; // e.g., 2

    const isCorrect = this.selectedOption === correctAnswerIndex;
    this.correct = isCorrect;
    if (isCorrect) this.score++;

    // Push the index (not the option text) for backend
    this.answers.push(this.selectedOption);

    this.showFeedback = true;
  }
},



  nextQuestion() {
    this.selectedOption = null;
    this.showFeedback = false;
    this.hintUsed = false;
    this.currentHint = null;
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.submitQuiz();
    }
  },

  useHint() {
    const hintCost = 3;
    if (this.coins >= hintCost && !this.hintUsed) {
      this.coins -= hintCost;
      this.hintUsed = true;
      this.currentHint = this.questions[this.currentQuestionIndex].hint || null;
    }
  },

  async submitQuiz() {
  try {
    const quizId = this.selectedQuiz.quiz_id || this.selectedQuiz.id;
    const result = await submitQuiz(quizId, this.answers, this.token);

    this.feedback = result.feedback || "Good job!";
    this.feedbackCoins = result.coins_awarded || 0;
    this.coins += this.feedbackCoins;
    this.quizFinished = true;
    this.showResults = true;
  } catch (err) {
    console.error("Quiz submission failed", err.message);
  }
},

  restartQuiz() {
    this.selectedQuiz = null;
    this.questions = [];
    this.answers = [];
    this.showResults = false;
    this.score = 0;
    this.coins = 10;
    this.currentHint = null;
    this.currentQuestionIndex = 0;
    this.selectedOption = null;
    this.showFeedback = false;
    this.correct = false;
    this.quizFinished = false;
    this.hintUsed = false;
    this.feedback = "";
  }
},
  template: `
    <div class="container mt-4 mb-5">
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary"></div>
      </div>

      <div v-else>
        <!-- Quiz Selection -->
        <div v-if="!selectedQuiz">
          <h4 class="fw-bold mb-3">
            <i class="bi bi-list-task text-primary me-2"></i>Select a Quiz
          </h4>

          <div v-if="quizList.length === 0" class="alert alert-info">
            <i class="bi bi-info-circle me-1"></i> No quizzes available at the moment.
          </div>

          <ul class="list-group shadow-sm">
            <li
              v-for="quiz in quizList"
              :key="quiz.id"
              class="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>{{ quiz.title }} <span class="badge bg-info text-dark ms-2">{{ quiz.skill }}</span></span>
              <button class="btn btn-sm btn-primary" @click="startQuiz(quiz)">
                Start
              </button>
            </li>
          </ul>
        </div>

        <!-- Quiz Panel -->
        <div v-if="selectedQuiz && !quizFinished" class="card shadow-sm mt-4">
          <div class="card-body">
            <h5 class="card-title mb-3">
              <i class="bi bi-question-circle me-2 text-dark"></i>
              Q{{ currentQuestionIndex + 1 }}. {{ questions[currentQuestionIndex].question }}
            </h5>

            <ul class="list-group mb-3">
              <li
                v-for="(option, index) in questions[currentQuestionIndex].options"
                :key="index"
                class="list-group-item"
                :class="{ 'active': selectedOption === index }"
                style="cursor: pointer;"
                @click="selectOption(index)"
              >
                {{ option }}
              </li>
            </ul>

            <div class="d-flex gap-2 flex-wrap">
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

            <div v-if="hintUsed" class="alert mt-3" :class="currentHint ? 'alert-info' : 'alert-warning'">
              <i class="bi bi-info-circle me-1"></i>
              {{ currentHint || "Hint not available from backend." }}
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
        <div v-if="showResults" class="mt-4 text-center">
          <h3 class="mb-3"><i class="bi bi-flag-fill text-success me-2"></i>Quiz Completed!</h3>
          <p class="fs-5">Your Score: <strong>{{ score }} / {{ questions.length }}</strong></p>
          <p class="text-info"><i class="bi bi-star-fill me-1"></i>{{ feedback }}</p>
          <p class="text-warning"><i class="bi bi-coin me-1"></i>Coins Earned: {{ feedbackCoins }}</p>


          <button class="btn btn-success mt-3" @click="restartQuiz">
            <i class="bi bi-arrow-repeat me-1"></i>Back to Quiz List
          </button>
        </div>
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