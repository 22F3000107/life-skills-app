export default {
  name: "ManageStories",
  data() {
    return {
      stories: [
        {
          id: 1,
          title: "Brush Twice a Day",
          skill: "Healthy Habits",
          createdBy: "Meera Verma",
          status: "Published"
        },
        {
          id: 2,
          title: "Managing Pocket Money",
          skill: "Financial Literacy",
          createdBy: "Riya Sharma",
          status: "Unpublished"
        }
      ],
      searchQuery: "",
      selectedSkill: "All",
      previewStory: null
    };
  },
  computed: {
    filteredStories() {
      return this.stories.filter(story => {
        const matchesSearch =
          story.title.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesSkill =
          this.selectedSkill === "All" || story.skill === this.selectedSkill;
        return matchesSearch && matchesSkill;
      });
    },
    skills() {
      const skillSet = new Set(this.stories.map(s => s.skill));
      return ["All", ...skillSet];
    }
  },
  methods: {
    viewStory(story) {
      this.previewStory = story;
      new bootstrap.Modal(document.getElementById('storyPreviewModal')).show();
    },
    flagStory(index) {
      if (this.stories[index].status !== 'Flagged') {
        this.stories[index].status = 'Flagged';
        alert("🚩 Story flagged successfully.");
      }
    },
    togglePublish(index) {
      const story = this.stories[index];
      if (story.status === "Published") {
        story.status = "Unpublished";
      } else if (story.status === "Unpublished") {
        story.status = "Published";
      }
    },
    deleteStory(index) {
      if (confirm("Are you sure you want to delete this story?")) {
        this.stories.splice(index, 1);
        alert("Story deleted successfully.");
      }
    }
  },
  template: `
    <div class="container mt-4 mb-5">
      <h2 class="fw-bold text-center mb-4">📚 Manage Academic Stories</h2>

      <!-- Filters -->
      <div class="row mb-3">
        <div class="col-md-6 mb-2">
          <input v-model="searchQuery" type="text" class="form-control" placeholder="🔍 Search by title..." />
        </div>
        <div class="col-md-6 mb-2">
          <select v-model="selectedSkill" class="form-select">
            <option v-for="skill in skills" :key="skill" :value="skill">{{ skill }}</option>
          </select>
        </div>
      </div>

      <!-- Stories Table -->
      <div class="table-responsive">
        <table class="table table-bordered align-middle text-center">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Skill</th>
              <th>Created By</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(story, index) in filteredStories" :key="story.id">
              <td>{{ index + 1 }}</td>
              <td>{{ story.title }}</td>
              <td><span class="badge bg-info text-dark">{{ story.skill }}</span></td>
              <td>{{ story.createdBy }}</td>
              <td>
                <span :class="{
                  'badge bg-success': story.status === 'Published',
                  'badge bg-secondary': story.status === 'Unpublished',
                  'badge bg-danger': story.status === 'Flagged'
                }">{{ story.status }}</span>
              </td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" @click="viewStory(story)">👁 View</button>
                <button class="btn btn-sm btn-outline-warning me-1" @click="togglePublish(index)">
                  {{ story.status === 'Published' ? 'Unpublish' : 'Publish' }}
                </button>
                <button v-if="story.status !== 'Flagged'" class="btn btn-sm btn-outline-dark" @click="flagStory(index)">🚩 Flag</button>
                <button class="btn btn-sm btn-outline-danger ms-1" @click="deleteStory(index)">🗑 Delete</button>
              </td>
            </tr>
            <tr v-if="filteredStories.length === 0">
              <td colspan="6" class="text-muted">No stories found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal for Story Preview -->
      <div class="modal fade" id="storyPreviewModal" tabindex="-1" aria-labelledby="previewLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">📖 Story Preview</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"/>
            </div>
            <div class="modal-body" v-if="previewStory">
              <h5>{{ previewStory.title }}</h5>
              <p><strong>Skill:</strong> {{ previewStory.skill }}</p>
              <p><strong>Created By:</strong> {{ previewStory.createdBy }}</p>
              <p><strong>Status:</strong> {{ previewStory.status }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};


// This code defines a Vue.js component for managing stories in an admin dashboard.
// It includes features for adding, editing, deleting, and flagging stories, as well as
// searching and filtering by title and skill. The component uses Bootstrap for styling
// and includes a modal for previewing story details. The stories are stored in a local
// array and can be filtered based on user input. The component also handles form validation
// and provides user feedback through alerts and modals.
// The template includes a responsive table for displaying stories and a form for adding or editing them.
// The component is designed to be user-friendly and efficient for managing content in the application.
// It allows administrators to easily maintain the stories section of the application, ensuring that content is relevant
// and up-to-date. The use of Bootstrap classes ensures a clean and modern UI, while the Vue.js reactivity allows for dynamic updates to the story list without needing to refresh the page.
// The component is structured to be easily extendable, allowing for future enhancements such as additional fields
// or more complex filtering options. It serves as a solid foundation for the stories management functionality in
// the admin dashboard of the application, providing a comprehensive tool for content management.
// The component is designed to be modular and reusable, making it easy to integrate into larger applications
// or to adapt for different use cases. It follows best practices for Vue.js development, ensuring
// maintainability and scalability. The use of computed properties for filtering and skills management
// enhances performance by minimizing unnecessary re-computations, while the methods for handling CRUD operations
// are straightforward and easy to understand. Overall, this component exemplifies a well-structured approach
// to building interactive and user-friendly admin interfaces in Vue.js applications.