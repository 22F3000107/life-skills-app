export default {
  name: "FlaggedContent",
  data() {
    return {
      activeTab: 'stories',
      flaggedStories: [
        {
          id: 1,
          title: "Story about Sugar Addiction",
          skill: "Healthy Habits",
          flaggedBy: "Parent",
          status: "Flagged"
        }
      ],
      flaggedQuizzes: [
        {
          id: 1,
          title: "Financial Tricks Quiz",
          skill: "Financial Literacy",
          flaggedBy: "Academic Team",
          status: "Flagged"
        }
      ],
      previewItem: null
    };
  },
  methods: {
    setTab(tab) {
      this.activeTab = tab;
    },
    unflagItem(item, type) {
      if (confirm("Unflag this item and restore it to Published?")) {
        item.status = "Published";
        if (type === 'story') {
          this.flaggedStories = this.flaggedStories.filter(i => i.status === 'Flagged');
        } else {
          this.flaggedQuizzes = this.flaggedQuizzes.filter(i => i.status === 'Flagged');
        }
      }
    },
    deleteItem(index, type) {
      if (confirm("Are you sure you want to delete this flagged item?")) {
        if (type === 'story') this.flaggedStories.splice(index, 1);
        else this.flaggedQuizzes.splice(index, 1);
      }
    },
    viewItem(item) {
      this.previewItem = item;
      new bootstrap.Modal(document.getElementById('flaggedPreviewModal')).show();
    }
  },
  template: `
    <div class="container mt-4 mb-5">
      <h2 class="text-center fw-bold mb-4">🚩 Flagged Content</h2>

      <!-- Tab Buttons -->
      <div class="btn-group mb-4 w-100">
        <button class="btn" :class="{'btn-primary': activeTab === 'stories', 'btn-outline-primary': activeTab !== 'stories'}" @click="setTab('stories')">📘 Flagged Stories</button>
        <button class="btn" :class="{'btn-primary': activeTab === 'quizzes', 'btn-outline-primary': activeTab !== 'quizzes'}" @click="setTab('quizzes')">📝 Flagged Quizzes</button>
      </div>

      <!-- Flagged Stories Table -->
      <div v-if="activeTab === 'stories'" class="table-responsive">
        <table class="table table-bordered text-center align-middle">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Skill</th>
              <th>Flagged By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(story, index) in flaggedStories" :key="story.id">
              <td>{{ index + 1 }}</td>
              <td>{{ story.title }}</td>
              <td>{{ story.skill }}</td>
              <td>{{ story.flaggedBy }}</td>
              <td>
                <button class="btn btn-sm btn-outline-info me-1" @click="viewItem(story)">👁️ View</button>
                <button class="btn btn-sm btn-outline-success me-1" @click="unflagItem(story, 'story')">✅ Unflag</button>
                <button class="btn btn-sm btn-outline-danger" @click="deleteItem(index, 'story')">🗑️ Delete</button>
              </td>
            </tr>
            <tr v-if="flaggedStories.length === 0">
              <td colspan="5" class="text-muted">No flagged stories.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Flagged Quizzes Table -->
      <div v-if="activeTab === 'quizzes'" class="table-responsive">
        <table class="table table-bordered text-center align-middle">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Skill</th>
              <th>Flagged By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(quiz, index) in flaggedQuizzes" :key="quiz.id">
              <td>{{ index + 1 }}</td>
              <td>{{ quiz.title }}</td>
              <td>{{ quiz.skill }}</td>
              <td>{{ quiz.flaggedBy }}</td>
              <td>
                <button class="btn btn-sm btn-outline-info me-1" @click="viewItem(quiz)">👁️ View</button>
                <button class="btn btn-sm btn-outline-success me-1" @click="unflagItem(quiz, 'quiz')">✅ Unflag</button>
                <button class="btn btn-sm btn-outline-danger" @click="deleteItem(index, 'quiz')">🗑️ Delete</button>
              </td>
            </tr>
            <tr v-if="flaggedQuizzes.length === 0">
              <td colspan="5" class="text-muted">No flagged quizzes.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Preview -->
      <div class="modal fade" id="flaggedPreviewModal" tabindex="-1" aria-labelledby="flaggedPreviewLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="flaggedPreviewLabel">👁️ Preview</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div class="modal-body" v-if="previewItem">
              <h5>{{ previewItem.title }}</h5>
              <p><strong>Skill:</strong> {{ previewItem.skill }}</p>
              <p><strong>Flagged By:</strong> {{ previewItem.flaggedBy }}</p>
              <p><strong>Status:</strong> {{ previewItem.status }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};
// This code defines a Vue.js component for managing flagged content, including stories and quizzes.
// It allows admins to view, unflag, and delete flagged items, and provides a modal for previewing details of flagged stories and quizzes.
// The component uses Bootstrap for styling and modal functionality,
// and it includes methods for handling tab switching, unflagging items, deleting items, and viewing item details in a modal.
// The flagged items are stored in arrays, and the component dynamically updates the displayed content based on the selected tab (stories or quizzes).
// The component is designed to be used in an admin dashboard context, providing a user-friendly interface for managing flagged content effectively.