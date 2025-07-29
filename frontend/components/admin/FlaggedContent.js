import { getFlaggedContent, unflagContent, deleteFlaggedContent } from "../utils/api.js";

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
  template: `<!-- keep your existing template, no change needed -->`
};




// This code defines a Vue.js component for managing flagged content, including stories and quizzes.
// It allows admins to view, unflag, and delete flagged items, and provides a modal for previewing details of flagged stories and quizzes.
// The component uses Bootstrap for styling and modal functionality,
// and it includes methods for handling tab switching, unflagging items, deleting items, and viewing item details in a modal.
// The flagged items are stored in arrays, and the component dynamically updates the displayed content based on the selected tab (stories or quizzes).
// The component is designed to be used in an admin dashboard context, providing a user-friendly interface for managing flagged content effectively.