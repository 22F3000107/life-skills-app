import {
  getFlaggedContent,
  unflagContent,
  deleteFlaggedContent,
} from "../../utils/api.js";

export default {
  name: "FlaggedContent",
  data() {
    return {
      activeTab: 'stories',
      flaggedStories: [],
      flaggedQuizzes: [],
      previewItem: null
    };
  },
  methods: {
    setTab(tab) {
      this.activeTab = tab;
    },

    async fetchFlaggedContent() {
      try {
        const token = localStorage.getItem("auth-token");
        const data = await getFlaggedContent(token);
        this.flaggedStories = data.flagged_stories || [];
        this.flaggedQuizzes = data.flagged_quizzes || [];
      } catch (err) {
        console.error("Error fetching flagged content:", err);
      }
    },

    async unflagItem(item, type) {
      if (confirm("Unflag this item and restore it to Published?")) {
        try {
          const token = localStorage.getItem("auth-token");
          await unflagContent(type, item.id, token);
          alert(`${type} unflagged successfully`);
          this.fetchFlaggedContent();
        } catch (err) {
          alert("Failed to unflag item.");
          console.error(err);
        }
      }
    },

    async deleteItem(index, type) {
      if (confirm("Are you sure you want to delete this flagged item?")) {
        try {
          const token = localStorage.getItem("auth-token");
          const id = type === "story" ? this.flaggedStories[index].id : this.flaggedQuizzes[index].id;
          await deleteFlaggedContent(type, id, token);
          alert(`${type} deleted successfully`);
          this.fetchFlaggedContent();
        } catch (err) {
          alert("Failed to delete item.");
          console.error(err);
        }
      }
    },

    viewItem(item) {
      this.previewItem = item;
      new bootstrap.Modal(document.getElementById('flaggedPreviewModal')).show();
    }
  },
  mounted() {
    this.fetchFlaggedContent();
  },
  template: `
  <div class="container mt-4">
    <h3>Flagged Content</h3>

    <div v-if="flaggedStories.length === 0 && flaggedQuizzes.length === 0" class="alert alert-info">
      No flagged contents available.
    </div>

    <template v-else>
      <div class="btn-group mb-3">
        <button class="btn btn-outline-primary" :class="{ active: activeTab === 'stories' }" @click="setTab('stories')">Stories</button>
        <button class="btn btn-outline-primary" :class="{ active: activeTab === 'quizzes' }" @click="setTab('quizzes')">Quizzes</button>
      </div>

      <div v-if="activeTab === 'stories'">
        <div v-if="flaggedStories.length === 0">No flagged stories available.</div>
        <ul class="list-group">
          <li v-for="(story, index) in flaggedStories" :key="story.id" class="list-group-item d-flex justify-content-between align-items-center">
            {{ story.title }}
            <div>
              <button class="btn btn-sm btn-info me-1" @click="viewItem(story)">Preview</button>
              <button class="btn btn-sm btn-success me-1" @click="unflagItem(story, 'story')">Unflag</button>
              <button class="btn btn-sm btn-danger" @click="deleteItem(index, 'story')">Delete</button>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="activeTab === 'quizzes'">
        <div v-if="flaggedQuizzes.length === 0">No flagged quizzes available.</div>
        <ul class="list-group">
          <li v-for="(quiz, index) in flaggedQuizzes" :key="quiz.id" class="list-group-item d-flex justify-content-between align-items-center">
            {{ quiz.title }}
            <div>
              <button class="btn btn-sm btn-info me-1" @click="viewItem(quiz)">Preview</button>
              <button class="btn btn-sm btn-success me-1" @click="unflagItem(quiz, 'quiz')">Unflag</button>
              <button class="btn btn-sm btn-danger" @click="deleteItem(index, 'quiz')">Delete</button>
            </div>
          </li>
        </ul>
      </div>
    </template>

    <!-- Modal for Preview -->
    <div class="modal fade" id="flaggedPreviewModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Preview</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <pre>{{ previewItem }}</pre>
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