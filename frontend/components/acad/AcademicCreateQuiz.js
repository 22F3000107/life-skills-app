// import { createAcademicQuiz } from "/utils/api.js";

// export default {
//   name: "AcademicCreateQuiz",
//   data() {
//     return {
//       title: "",
//       skill: "",
//       questions: [
//         // Sample initial question structure
//         {
//           question: "",
//           options: ["", "", "", ""], // 4 options default
//           correct_answer: null // index of correct option (0-3)
//         }
//       ],
//       loading: false,
//       message: null,
//       error: null
//     };
//   },
//   methods: {
//     addQuestion() {
//       this.questions.push({
//         question: "",
//         options: ["", "", "", ""],
//         correct_answer: null
//       });
//     },
//     removeQuestion(index) {
//       this.questions.splice(index, 1);
//     },
//     async submitQuiz() {
//       this.message = null;
//       this.error = null;

//       // Basic validation
//       if (!this.title || !this.skill || this.questions.length === 0) {
//         this.error = "Please fill in the quiz title, skill, and add at least one question.";
//         return;
//       }

//       for (const [i, q] of this.questions.entries()) {
//         if (!q.question || q.options.some(opt => !opt) || q.correct_answer === null) {
//           this.error = `Please complete all fields for question ${i + 1}`;
//           return;
//         }
//       }

//       this.loading = true;
//       try {
//         const token = localStorage.getItem("auth-token");
//         const payload = {
//           title: this.title,
//           skill: this.skill,
//           createdBy: localStorage.getItem("user_id"), // store after login
//           questions: this.questions.map(q => ({
//             question: q.question,
//             options: q.options,
//             correct_answer: q.correct_answer
//           }))
//         };

//         const res = await createAcademicQuiz(payload, token);
//         this.message = res.message || "Quiz created successfully!";
//         this.title = "";
//         this.skill = "";
//         this.questions = [
//           {
//             question: "",
//             options: ["", "", "", ""],
//             correct_answer: null
//           }
//         ];
//       } catch (err) {
//         console.error("Error creating quiz:", err);
//         this.error = "Failed to create quiz.";
//       } finally {
//         this.loading = false;
//       }
//     }
//   },
//   template: `
//     <div class="container mt-4">
//       <h2 class="fw-bold mb-3">Create Academic Quiz</h2>
//       <p>Fill in the details below to create a new quiz.</p>

//       <div v-if="message" class="alert alert-success">{{ message }}</div>
//       <div v-if="error" class="alert alert-danger">{{ error }}</div>

//       <form @submit.prevent="submitQuiz">
//         <div class="mb-3">
//           <label class="form-label">Title</label>
//           <input v-model="title" type="text" class="form-control" placeholder="Quiz title" required />
//         </div>

//         <div class="mb-3">
//           <label class="form-label">Skill</label>
//           <input v-model="skill" type="text" class="form-control" placeholder="Skill name" required />
//         </div>

//         <div v-for="(q, index) in questions" :key="index" class="mb-4 border p-3 rounded">
//           <label class="form-label">Question {{ index + 1 }}</label>
//           <input v-model="q.question" type="text" class="form-control mb-2" placeholder="Enter question" required />

//           <div v-for="(option, optIndex) in q.options" :key="optIndex" class="input-group mb-2">
//             <span class="input-group-text">Option {{ optIndex + 1 }}</span>
//             <input v-model="q.options[optIndex]" type="text" class="form-control" placeholder="Option text" required />
//           </div>

//           <div class="form-check">
//             <label class="form-check-label mb-2">Select correct answer:</label>
//             <div v-for="(option, optIndex) in q.options" :key="'correct-'+optIndex" class="form-check">
//               <input
//                 class="form-check-input"
//                 type="radio"
//                 :name="'correct-answer-'+index"
//                 :value="optIndex"
//                 v-model.number="q.correct_answer"
//                 required
//               />
//               <label class="form-check-label">Option {{ optIndex + 1 }}</label>
//             </div>
//           </div>

//           <button type="button" class="btn btn-danger btn-sm mt-2" @click="removeQuestion(index)" v-if="questions.length > 1">
//             Remove Question
//           </button>
//         </div>

//         <button type="button" class="btn btn-secondary mb-3" @click="addQuestion">Add Question</button>
//         <br />

//         <button type="submit" class="btn btn-primary" :disabled="loading">
//           {{ loading ? "Creating..." : "Create Quiz" }}
//         </button>
//       </form>
//     </div>
//   `
// };

import { createAcademicQuiz } from "/utils/api.js";

export default {
  name: "AcademicCreateQuiz",
  data() {
    return {
      title: "",
      skill: "",
      questions: [
        {
          question: "",
          options: ["", "", "", ""],
          correct_answer: null,
          hint: ""  // Optional hint for each question
        }
      ],
      loading: false,
      message: null,
      error: null
    };
  },
  methods: {
    addQuestion() {
      this.questions.push({
        question: "",
        options: ["", "", "", ""],
        correct_answer: null,
        hint: ""
      });
    },
    removeQuestion(index) {
      if (this.questions.length > 1) {
        this.questions.splice(index, 1);
      }
    },
    validateQuiz() {
      if (!this.title.trim() || !this.skill.trim()) {
        this.error = "Quiz title and skill are required.";
        return false;
      }
      if (this.questions.length === 0) {
        this.error = "At least one question is required.";
        return false;
      }
      for (const [i, q] of this.questions.entries()) {
        if (!q.question.trim()) {
          this.error = `Question ${i + 1} cannot be empty.`;
          return false;
        }
        if (q.options.some(opt => !opt.trim())) {
          this.error = `All options in question ${i + 1} must be filled.`;
          return false;
        }
        if (q.correct_answer === null || q.correct_answer < 0 || q.correct_answer >= q.options.length) {
          this.error = `Please select a valid correct answer for question ${i + 1}.`;
          return false;
        }
      }
      return true;
    },
    async submitQuiz() {
      this.message = null;
      this.error = null;

      if (!this.validateQuiz()) {
        return;
      }

      this.loading = true;
      try {
        const token = localStorage.getItem("auth-token");
        const payload = {
          title: this.title.trim(),
          skill: this.skill.trim(),
          createdBy: localStorage.getItem("user_id"),
          questions: this.questions.map(q => ({
            question: q.question.trim(),
            options: q.options.map(opt => opt.trim()),
            correct_answer: q.correct_answer,
            hint: q.hint.trim() || null
          }))
        };

        const res = await createAcademicQuiz(payload, token);
        this.message = res.message || "Quiz created successfully!";
        this.resetForm();
      } catch (err) {
        console.error("Error creating quiz:", err);
        this.error = "Failed to create quiz. Please try again.";
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.title = "";
      this.skill = "";
      this.questions = [
        {
          question: "",
          options: ["", "", "", ""],
          correct_answer: null,
          hint: ""
        }
      ];
    }
  },
  template: `
    <div class="container mt-4">
      <h2 class="fw-bold mb-3">Create Academic Quiz</h2>
      <p>Fill in the details below to create a new quiz.</p>

      <div v-if="message" class="alert alert-success" role="alert">{{ message }}</div>
      <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

      <form @submit.prevent="submitQuiz" novalidate>
        <div class="mb-3">
          <label for="quizTitle" class="form-label fw-semibold">Title</label>
          <input
            id="quizTitle"
            v-model="title"
            type="text"
            class="form-control"
            placeholder="Quiz title"
            required
            autocomplete="off"
          />
        </div>

        <div class="mb-4">
          <label for="quizSkill" class="form-label fw-semibold">Skill</label>
          <input
            id="quizSkill"
            v-model="skill"
            type="text"
            class="form-control"
            placeholder="Skill name"
            required
            autocomplete="off"
          />
        </div>

        <div
          v-for="(q, index) in questions"
          :key="index"
          class="mb-4 border rounded p-3 shadow-sm"
          :aria-labelledby="'question-label-' + index"
        >
          <label :id="'question-label-' + index" class="form-label fw-semibold">
            Question {{ index + 1 }}
          </label>
          <input
            v-model="q.question"
            type="text"
            class="form-control mb-3"
            placeholder="Enter question"
            required
            autocomplete="off"
          />

          <div v-for="(option, optIndex) in q.options" :key="optIndex" class="input-group mb-2">
            <span class="input-group-text" :id="'option-label-' + index + '-' + optIndex">
              Option {{ optIndex + 1 }}
            </span>
            <input
              v-model="q.options[optIndex]"
              type="text"
              class="form-control"
              :aria-labelledby="'option-label-' + index + '-' + optIndex"
              placeholder="Option text"
              required
              autocomplete="off"
            />
          </div>

          <fieldset class="mb-3">
            <legend class="form-label fw-semibold mb-2">Select correct answer</legend>
            <div
              v-for="(option, optIndex) in q.options"
              :key="'correct-' + optIndex"
              class="form-check"
            >
              <input
                class="form-check-input"
                type="radio"
                :name="'correct-answer-' + index"
                :id="'correct-answer-' + index + '-' + optIndex"
                :value="optIndex"
                v-model.number="q.correct_answer"
                required
              />
              <label
                class="form-check-label"
                :for="'correct-answer-' + index + '-' + optIndex"
              >
                Option {{ optIndex + 1 }}
              </label>
            </div>
          </fieldset>

          <div class="mb-3">
            <label :for="'hint-' + index" class="form-label fw-semibold">Hint (optional)</label>
            <input
              :id="'hint-' + index"
              v-model="q.hint"
              type="text"
              class="form-control"
              placeholder="Enter a hint for this question"
              autocomplete="off"
            />
          </div>

          <button
            type="button"
            class="btn btn-danger btn-sm"
            @click="removeQuestion(index)"
            :disabled="questions.length === 1"
          >
            Remove Question
          </button>
        </div>

        <button
          type="button"
          class="btn btn-secondary mb-3"
          @click="addQuestion"
          :disabled="loading"
        >
          Add Question
        </button>

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading"
          aria-live="polite"
          aria-busy="loading"
        >
          {{ loading ? "Creating..." : "Create Quiz" }}
        </button>
      </form>
    </div>
  `
};


// import { 
//   fetchAcademicQuizzes, 
//   fetchAcademicQuizDetail, 
//   updateAcademicQuiz, 
//   deleteAcademicQuiz 
// } from "/utils/api.js";

// export default {
//   name: "AcademicManageQuizzes",
//   data() {
//     return {
//       quizzes: [],
//       selectedQuiz: null,
//       editMode: false,
//       loading: false,
//       message: null,
//       error: null,
//     };
//   },
//   methods: {
//     async loadQuizzes() {
//       this.loading = true;
//       this.error = null;
//       try {
//         const token = localStorage.getItem("auth-token");
//         this.quizzes = await fetchAcademicQuizzes(token);
//       } catch (err) {
//         this.error = "Failed to load quizzes.";
//       } finally {
//         this.loading = false;
//       }
//     },

//     async viewQuiz(quizId) {
//       this.loading = true;
//       this.error = null;
//       try {
//         const token = localStorage.getItem("auth-token");
//         this.selectedQuiz = await fetchAcademicQuizDetail(quizId, token);
//         this.editMode = false;
//       } catch (err) {
//         this.error = "Failed to load quiz details.";
//       } finally {
//         this.loading = false;
//       }
//     },

//     startEdit() {
//       this.editMode = true;
//       // You might want to deep copy selectedQuiz to avoid mutating original data directly
//       this.editQuiz = JSON.parse(JSON.stringify(this.selectedQuiz));
//     },

//     cancelEdit() {
//       this.editMode = false;
//       this.editQuiz = null;
//     },

//     addQuestion() {
//       if (!this.editQuiz.questions) {
//         this.editQuiz.questions = [];
//       }
//       this.editQuiz.questions.push({
//         question: "",
//         options: ["", "", "", ""],
//         correct_answer: 0,
//       });
//     },

//     removeQuestion(index) {
//       this.editQuiz.questions.splice(index, 1);
//     },

//     async saveQuiz() {
//       this.loading = true;
//       this.message = null;
//       this.error = null;
//       try {
//         const token = localStorage.getItem("auth-token");

//         // Validate before sending (simple example)
//         if (!this.editQuiz.title || !this.editQuiz.skill || !this.editQuiz.questions.length) {
//           this.error = "Title, skill and at least one question are required.";
//           this.loading = false;
//           return;
//         }

//         // Validate each question
//         for (const q of this.editQuiz.questions) {
//           if (!q.question || !q.options || q.options.length < 1 || q.correct_answer === undefined) {
//             this.error = "All questions must have text, options, and a correct answer.";
//             this.loading = false;
//             return;
//           }
//         }

//         await updateAcademicQuiz(this.editQuiz.id, this.editQuiz, token);
//         this.message = "Quiz updated successfully!";
//         this.editMode = false;
//         this.selectedQuiz = JSON.parse(JSON.stringify(this.editQuiz));
//         this.loadQuizzes();
//       } catch (err) {
//         this.error = "Failed to update quiz.";
//       } finally {
//         this.loading = false;
//       }
//     },

//     async deleteQuiz(quizId) {
//       if (!confirm("Are you sure you want to delete this quiz?")) return;
//       this.loading = true;
//       this.error = null;
//       try {
//         const token = localStorage.getItem("auth-token");
//         await deleteAcademicQuiz(quizId, token);
//         this.message = "Quiz deleted successfully.";
//         this.selectedQuiz = null;
//         this.loadQuizzes();
//       } catch (err) {
//         this.error = "Failed to delete quiz.";
//       } finally {
//         this.loading = false;
//       }
//     }
//   },
//   mounted() {
//     this.loadQuizzes();
//   },
//   template: `
//     <div class="container mt-4">
//       <h2>Manage Your Quizzes</h2>

//       <div v-if="error" class="alert alert-danger">{{ error }}</div>
//       <div v-if="message" class="alert alert-success">{{ message }}</div>

//       <div v-if="loading" class="mb-3">Loading...</div>

//       <div class="row">
//         <div class="col-md-4">
//           <h4>Your Quizzes</h4>
//           <ul class="list-group">
//             <li v-for="quiz in quizzes" :key="quiz.id" 
//                 class="list-group-item d-flex justify-content-between align-items-center">
//               <span @click="viewQuiz(quiz.id)" style="cursor:pointer">{{ quiz.title }}</span>
//               <button class="btn btn-danger btn-sm" @click="deleteQuiz(quiz.id)">Delete</button>
//             </li>
//           </ul>
//         </div>

//         <div class="col-md-8" v-if="selectedQuiz">
//           <h4>Quiz Details</h4>

//           <div v-if="!editMode">
//             <p><strong>Title:</strong> {{ selectedQuiz.title }}</p>
//             <p><strong>Skill:</strong> {{ selectedQuiz.skill }}</p>
//             <h5>Questions:</h5>
//             <ul>
//               <li v-for="(q, idx) in selectedQuiz.questions" :key="q.id || idx">
//                 <p><strong>Q{{ idx + 1 }}:</strong> {{ q.question }}</p>
//                 <ul>
//                   <li v-for="(opt, i) in q.options" :key="i">
//                     {{ String.fromCharCode(65 + i) }}. {{ opt }} 
//                     <span v-if="i === q.correct_answer">(Correct)</span>
//                   </li>
//                 </ul>
//               </li>
//             </ul>
//             <button class="btn btn-primary" @click="startEdit">Edit Quiz</button>
//           </div>

//           <div v-else>
//             <form @submit.prevent="saveQuiz">
//               <div class="mb-3">
//                 <label class="form-label">Title</label>
//                 <input v-model="editQuiz.title" type="text" class="form-control" required />
//               </div>

//               <div class="mb-3">
//                 <label class="form-label">Skill</label>
//                 <input v-model="editQuiz.skill" type="text" class="form-control" required />
//               </div>

//               <h5>Questions</h5>
//               <div v-for="(q, idx) in editQuiz.questions" :key="q.id || idx" class="mb-3 border p-3 rounded">
//                 <label>Question {{ idx + 1 }}</label>
//                 <input v-model="q.question" type="text" class="form-control mb-2" required />

//                 <div v-for="(opt, i) in q.options" :key="i" class="input-group mb-1">
//                   <span class="input-group-text">{{ String.fromCharCode(65 + i) }}</span>
//                   <input v-model="q.options[i]" type="text" class="form-control" required />
//                 </div>

//                 <div class="mb-2">
//                   <label>Correct Answer</label>
//                   <select v-model.number="q.correct_answer" class="form-select" required>
//                     <option v-for="(opt, i) in q.options" :key="i" :value="i">
//                       {{ String.fromCharCode(65 + i) }}
//                     </option>
//                   </select>
//                 </div>

//                 <button type="button" class="btn btn-danger btn-sm" @click="removeQuestion(idx)">
//                   Remove Question
//                 </button>
//               </div>

//               <button type="button" class="btn btn-secondary mb-3" @click="addQuestion">
//                 Add Question
//               </button>

//               <div>
//                 <button type="submit" class="btn btn-success" :disabled="loading">
//                   {{ loading ? "Saving..." : "Save Quiz" }}
//                 </button>
//                 <button type="button" class="btn btn-warning ms-2" @click="cancelEdit">Cancel</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   `
// };
