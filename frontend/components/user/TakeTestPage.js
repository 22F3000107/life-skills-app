import {
  getQuizList,
  getStoriesList,
  getQuizById,
  submitQuiz,
} from "../../utils/api.js";
import { fetchQuestionById } from "../../services/questionService.js";

export default {
  name: "TakeTestPage",
  data() {
    return {
      learningItems: [],
      selectedQuiz: null,
      selectedStory: null,
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
      storyQuestions: [],
    };
  },

  async mounted() {
    try {
      this.loading = true;

      // Fetch quizzes
      const quizData = await getQuizList(this.token);
      const quizzes = Array.isArray(quizData?.quizzes) ? quizData.quizzes : [];

      // Fetch stories
      const storyData = await getStoriesList(this.token);
      const stories = Array.isArray(storyData) ? storyData : [];

      // Combine with type
      this.learningItems = [
        ...quizzes.map((q) => ({
          ...q,
          type: "quiz",
          is_flagged: q.is_flagged === true, // ensure boolean
        })),
        ...stories.map((s) => ({ ...s, type: "story" })),
      ];
    } catch (err) {
      console.error("Error fetching learning materials", err.message);
      this.learningItems = [];
    } finally {
      this.loading = false;
    }
  },

  methods: {
    async startQuiz(quiz) {
      if (quiz.is_flagged) return; // prevent starting locked quiz
      try {
        this.loading = true;
        const data = await getQuizById(quiz.id, this.token);
        this.questions = data.questions || [];
        this.selectedQuiz = data;
        this.selectedStory = null;
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

    async readStory(story) {
      this.selectedStory = story;
      this.selectedQuiz = null;
      this.storyQuestions = [];

      if (story.concept?.question_ids?.length) {
        try {
          this.loading = true;
          const fetched = await Promise.all(
            story.concept.question_ids.map((id) => fetchQuestionById(id))
          );
          this.storyQuestions = fetched;
        } catch (err) {
          console.error("Failed to fetch story questions", err.message);
        } finally {
          this.loading = false;
        }
      }
    },

    selectOption(index) {
      this.selectedOption = Number(index);
    },

    checkAnswer() {
      if (this.selectedOption !== null) {
        const current = this.questions[this.currentQuestionIndex];
        const isCorrect = this.selectedOption === current.correct_answer;
        this.correct = isCorrect;
        if (isCorrect) this.score++;
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
        this.currentHint =
          this.questions[this.currentQuestionIndex].hint || null;
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
      this.selectedStory = null;
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
    },

    closeStory() {
      this.selectedStory = null;
    }
  },

  template: `
    <div class="container mt-4 mb-5">
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary"></div>
      </div>

      <div v-else>
        <!-- Learning Materials List -->
        <div v-if="!selectedQuiz && !selectedStory">
          <h4 class="fw-bold mb-3">
            <i class="bi bi-list-task text-primary me-2"></i>Select a Quiz or Story
          </h4>

          <div v-if="learningItems.length === 0" class="alert alert-info">
            <i class="bi bi-info-circle me-1"></i> No learning materials available at the moment.
          </div>

          <ul class="list-group shadow-sm">
            <li
              v-for="item in learningItems"
              :key="item.id"
              class="list-group-item d-flex justify-content-between align-items-center"
              :class="{ 'opacity-50': item.is_flagged && item.type === 'quiz' }"
            >
              <div>
                <strong>{{ item.title }}</strong> 
                <span class="badge" :class="item.type === 'quiz' ? 'bg-info text-dark' : 'bg-success text-light'">
                  {{ item.type.toUpperCase() }}
                </span>
                <span v-if="item.is_flagged && item.type === 'quiz'" class="text-danger ms-2">
                  <i class="bi bi-lock-fill"></i> Locked
                </span>
              </div>
              <div>
                <button v-if="item.type === 'quiz'" 
        class="btn btn-sm" 
        :class="item.flag ? 'btn-secondary disabled' : 'btn-primary'"
        :disabled="item.flag"
        @click="!item.flag && startQuiz(item)">
  {{ item.flag ? 'Locked' : 'Attempt Quiz' }}
</button>

                <button v-else class="btn btn-sm btn-success" @click="readStory(item)">
                  Read Story
                </button>
              </div>
            </li>
          </ul>
        </div>

        
        <!-- Quiz Panel -->
        <div v-if="selectedQuiz && !quizFinished" class="card shadow-sm mt-4">
          <div class="card-body">
            <h5 class="card-title mb-3">
              <i class="bi bi-question-circle me-2 text-dark"></i>
              Q{{ currentQuestionIndex + 1 }}. {{ questions[currentQuestionIndex]?.question || 'Question text missing' }}
            </h5>

            <ul class="list-group mb-3">
              <li
                v-for="(option, index) in questions[currentQuestionIndex]?.options || []"
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

        <!-- Story Panel -->
        <div v-if="selectedStory" class="card shadow-sm mt-4">
          <div class="card-body">
            <h4>{{ selectedStory.title }}</h4>
            <div v-if="storyQuestions.length" class="mt-4">
              <div v-for="(q, i) in storyQuestions" :key="q.id" class="mb-3">
                <p>{{ q.question_statement }}</p>
              </div>
            </div>

            <button class="btn btn-secondary mt-3" @click="closeStory">
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
};



// This code defines a Vue.js component for a quiz page in a life skills application.
// It allows users to answer multiple-choice questions, check their answers, and view their score at the end.
// The quiz includes features like hints that can be purchased with in-app coins, and a summary of answers after completion.
// The component manages the quiz state, including the current question, selected answer, and whether the quiz is finished.
// It also provides methods to check answers, navigate through questions, use hints, and restart the quiz.
// The template includes a responsive layout with Bootstrap classes for styling,
// ensuring a clean and user-friendly interface.