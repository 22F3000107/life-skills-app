import {
  storyService,
  quizService,
  conceptContentService,
  contentUtils,
} from "../../services/storyQuizService.js";

export default {
  name: "ContentManagement",
  data() {
    return {
      activeTab: "stories", // 'stories' or 'quizzes'
      stories: [],
      quizzes: [],
      selectedContent: null,
      showContentModal: false,
      showEditModal: false,
      isLoading: false,

      // Filters
      statusFilter: "",
      moduleFilter: "",

      // Edit form data
      editForm: {
        title: "",
        skill: "",
        content: "", // for stories
        status: "draft",
        flag: false,
        flag_reason: "",
      },

      // Status options
      statusOptions: [
        { value: "", label: "All Statuses" },
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
        { value: "flagged", label: "Flagged" },
      ],
    };
  },

  computed: {
    filteredStories() {
      return this.stories.filter((story) => {
        return (
          (!this.statusFilter || story.status === this.statusFilter) &&
          (!this.moduleFilter || story.concept?.module_id == this.moduleFilter)
        );
      });
    },

    filteredQuizzes() {
      return this.quizzes.filter((quiz) => {
        return (
          (!this.statusFilter || quiz.status === this.statusFilter) &&
          (!this.moduleFilter || quiz.concept?.module_id == this.moduleFilter)
        );
      });
    },

    currentContent() {
      return this.activeTab === "stories"
        ? this.filteredStories
        : this.filteredQuizzes;
    },
  },

  methods: {
    // Load content based on active tab
    async loadContent() {
      this.isLoading = true;
      try {
        if (this.activeTab === "stories") {
          await this.loadStories();
        } else {
          await this.loadQuizzes();
        }
      } catch (error) {
        console.error("Error loading content:", error);
        this.$toast.error("Failed to load content");
      } finally {
        this.isLoading = false;
      }
    },

    // Load all stories
    async loadStories() {
      try {
        const filters = {};
        if (this.statusFilter) filters.status = this.statusFilter;
        if (this.moduleFilter) filters.module_id = this.moduleFilter;

        this.stories = await storyService.fetchStories(filters);
      } catch (error) {
        console.error("Error loading stories:", error);
        throw error;
      }
    },

    // Load all quizzes
    async loadQuizzes() {
      try {
        const filters = {};
        if (this.statusFilter) filters.status = this.statusFilter;
        if (this.moduleFilter) filters.module_id = this.moduleFilter;

        let response = await quizService.fetchQuizzes(filters);
        this.quizzes = response;
      } catch (error) {
        console.error("Error loading quizzes:", error);
        throw error;
      }
    },

    // View specific content details
    async viewContent(content) {
      this.isLoading = true;
      try {
        if (this.activeTab === "stories") {
          this.selectedContent = await storyService.fetchStoryById(content.id);
        } else {
          this.selectedContent = await quizService.fetchQuizById(content.id);
        }
        this.showContentModal = true;
      } catch (error) {
        console.error("Error fetching content details:", error);
        this.$toast.error("Failed to load content details");
      } finally {
        this.isLoading = false;
      }
    },

    // Open edit modal
    openEditModal(content) {
      this.selectedContent = content;
      this.editForm = {
        title: content.title || "",
        skill: content.skill || "",
        content: content.content || "",
        status: content.status || "draft",
        flag: content.flag || false,
        flag_reason: content.flag_reason || "",
      };
      this.showEditModal = true;
    },

    // Update content
    async updateContent() {
      if (!this.selectedContent) return;

      this.isLoading = true;
      try {
        if (this.activeTab === "stories") {
          await storyService.updateStory(
            this.selectedContent.id,
            this.editForm
          );
          this.$toast.success("Story updated successfully");
        } else {
          await quizService.updateQuiz(this.selectedContent.id, this.editForm);
          this.$toast.success("Quiz updated successfully");
        }

        this.showEditModal = false;
        await this.loadContent();
      } catch (error) {
        console.error("Error updating content:", error);
        this.$toast.error("Failed to update content");
      } finally {
        this.isLoading = false;
      }
    },

    // Delete content
    async deleteContent(content) {
      if (
        !confirm(
          `Are you sure you want to delete this ${this.activeTab.slice(0, -1)}?`
        )
      ) {
        return;
      }

      this.isLoading = true;
      try {
        if (this.activeTab === "stories") {
          await storyService.deleteStory(content.id);
          this.$toast.success("Story deleted successfully");
        } else {
          await quizService.deleteQuiz(content.id);
          this.$toast.success("Quiz deleted successfully");
        }

        await this.loadContent();
      } catch (error) {
        console.error("Error deleting content:", error);
        this.$toast.error("Failed to delete content");
      } finally {
        this.isLoading = false;
      }
    },

    // Toggle content status
    async toggleStatus(content) {
      const newStatus = content.status === "published" ? "draft" : "published";

      this.isLoading = true;
      try {
        if (this.activeTab === "stories") {
          await storyService.updateStoryStatus(content.id, newStatus);
        } else {
          await quizService.updateQuizStatus(content.id, newStatus);
        }

        content.status = newStatus;
        this.$toast.success(`${this.activeTab.slice(0, -1)} status updated`);
      } catch (error) {
        console.error("Error updating status:", error);
        this.$toast.error("Failed to update status");
      } finally {
        this.isLoading = false;
      }
    },

    // Flag/unflag content
    async toggleFlag(content) {
      const flagReason = content.flag ? null : prompt("Enter flag reason:");
      if (content.flag === false && !flagReason) return;

      this.isLoading = true;
      try {
        if (this.activeTab === "stories") {
          await storyService.flagStory(content.id, !content.flag, flagReason);
        } else {
          await quizService.flagQuiz(content.id, !content.flag, flagReason);
        }

        content.flag = !content.flag;
        if (flagReason) content.flag_reason = flagReason;
        this.$toast.success(
          `${this.activeTab.slice(0, -1)} ${
            content.flag ? "flagged" : "unflagged"
          }`
        );
      } catch (error) {
        console.error("Error toggling flag:", error);
        this.$toast.error("Failed to update flag status");
      } finally {
        this.isLoading = false;
      }
    },

    // Get content by concept
    async getContentByConcept(conceptId, type) {
      try {
        return await conceptContentService.fetchConceptContent(conceptId, type);
      } catch (error) {
        console.error("Error fetching content by concept:", error);
        throw error;
      }
    },

    // Switch tabs
    switchTab(tab) {
      this.activeTab = tab;
      this.loadContent();
    },

    // Clear filters
    clearFilters() {
      this.statusFilter = "";
      this.moduleFilter = "";
      this.loadContent();
    },

    // Utility methods
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },

    getStatusBadgeClass(status) {
      const classes = {
        draft: "text-secondary",
        published: "text-success",
        flagged: "text-danger",
      };
      return classes[status] || "text-secondary";
    },
  },

  async mounted() {
    await this.loadContent();
  },

  template: `
    <div class="content-management">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Content Management</h2>
        <div class="d-flex gap-2">
          <button 
            class="btn"
            :class="activeTab === 'stories' ? 'btn-primary' : 'btn-outline-primary'"
            @click="switchTab('stories')"
          >
            <i class="bi bi-book-fill me-2"></i>Stories
          </button>
          <button 
            class="btn"
            :class="activeTab === 'quizzes' ? 'btn-primary' : 'btn-outline-primary'"
            @click="switchTab('quizzes')"
          >
            <i class="bi bi-question-circle-fill me-2"></i>Quizzes
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Status Filter</label>
              <select v-model="statusFilter" class="form-select" @change="loadContent">
                <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
            
            <div class="col-md-4 d-flex align-items-end">
              <button class="btn btn-outline-secondary" @click="clearFilters">
                <i class="bi bi-x-circle me-2"></i>Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Content List -->
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">
            <i :class="activeTab === 'stories' ? 'bi bi-book-fill' : 'bi bi-question-circle-fill'" class="me-2"></i>
            {{ activeTab === 'stories' ? 'Stories' : 'Quizzes' }} ({{ currentContent.length }})
          </h5>
        </div>
        <div class="card-body">
          <div v-if="isLoading" class="text-center py-4">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <div v-else-if="currentContent.length === 0" class="text-center py-4 text-muted">
            <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
            <h6>No {{ activeTab }} found</h6>
            <p>No content matches your current filters.</p>
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Concept</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="content in currentContent" :key="content.id">
                  <td>
                    <div class="d-flex align-items-center">
                      <i 
                        :class="activeTab === 'stories' ? 'bi bi-book-fill text-info' : 'bi bi-question-circle-fill text-primary'" 
                        class="me-2"
                      ></i>
                      <div>
                        <div class="fw-bold">{{ content.title }}</div>
                        <small class="text-muted">{{ content.skill }}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div v-if="content.concept">
                      <div class="fw-medium">{{ content.concept.name }}</div>
                      <small class="text-muted">Module {{ content.concept.module_id }}</small>
                    </div>
                    <span v-else class="text-muted">No concept</span>
                  </td>
                  <td>
                    <span class="badge" :class="getStatusBadgeClass(content.status)">
                      {{ content.status.charAt(0).toUpperCase() + content.status.slice(1) }}
                    </span>
                    <div v-if="content.flag" class="mt-1">
                      <span class="badge badge-warning">
                        <i class="bi bi-flag-fill me-1"></i>Flagged
                      </span>
                    </div>
                  </td>
                  
                  <td>
                    <div class="btn-group" role="group">
                      <button 
                        class="btn btn-sm btn-outline-primary" 
                        @click="viewContent(content)"
                        title="View Details"
                      >
                        <i class="bi bi-eye"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-secondary" 
                        @click="openEditModal(content)"
                        title="Edit"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button 
                        class="btn btn-sm" 
                        :class="content.status === 'published' ? 'btn-outline-warning' : 'btn-outline-success'"
                        @click="toggleStatus(content)"
                        :title="content.status === 'published' ? 'Make Draft' : 'Publish'"
                      >
                        <i :class="content.status === 'published' ? 'bi bi-pause' : 'bi bi-play'"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-warning" 
                        @click="toggleFlag(content)"
                        :title="content.flag ? 'Unflag' : 'Flag'"
                      >
                        <i class="bi bi-flag"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-danger" 
                        @click="deleteContent(content)"
                        title="Delete"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- View Content Modal -->
      <div v-if="showContentModal" class="modal d-block" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i :class="activeTab === 'stories' ? 'bi bi-book-fill' : 'bi bi-question-circle-fill'" class="me-2"></i>
                {{ selectedContent?.title }}
              </h5>
              <button type="button" class="btn-close" @click="showContentModal = false"></button>
            </div>
            <div class="modal-body">
              <div v-if="selectedContent">
                <div class="row mb-3">
                  <div class="col-md-6">
                    <strong>Status:</strong>
                    <span class="badge ms-2" :class="getStatusBadgeClass(selectedContent.status)">
                      {{ selectedContent.status }}
                    </span>
                  </div>
                  <div class="col-md-6">
                    <strong>Skill:</strong> {{ selectedContent.skill }}
                  </div>
                </div>
                
                <div v-if="selectedContent.concept" class="mb-3">
                  <strong>Concept:</strong> {{ selectedContent.concept.name }}
                  <br>
                  <small class="text-muted">Module {{ selectedContent.concept.module_id }} • {{ selectedContent.concept.question_count }} questions</small>
                </div>

                <div v-if="activeTab === 'stories' && selectedContent.content" class="mb-3">
                  <strong>Content:</strong>
                  <div class="border p-3 rounded bg-light mt-2">
                    {{ selectedContent.content }}
                  </div>
                </div>

                <div v-if="activeTab === 'quizzes' && selectedContent.questions" class="mb-3">
                  <strong>Questions ({{ selectedContent.questions.length }}):</strong>
                  <div class="mt-2">
                    <div v-for="(question, index) in selectedContent.questions" :key="question.id" class="border p-2 rounded mb-2">
                      <small class="text-muted">Q{{ index + 1 }}:</small>
                      {{ question.question_statement }}
                      <div class="mt-1">
                        <span class="badge badge-info me-2">{{ question.type }}</span>
                        <span class="badge badge-secondary">{{ question.age_group?.join(', ') }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showContentModal = false">Close</button>
              <button class="btn btn-primary" @click="openEditModal(selectedContent); showContentModal = false">
                <i class="bi bi-pencil me-2"></i>Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Content Modal -->
      <div v-if="showEditModal" class="modal d-block" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-pencil me-2"></i>
                Edit {{ activeTab === 'stories' ? 'Story' : 'Quiz' }}
              </h5>
              <button type="button" class="btn-close" @click="showEditModal = false"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="updateContent">
                <div class="mb-3">
                  <label class="form-label">Title</label>
                  <input v-model="editForm.title" type="text" class="form-control" required>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Skill</label>
                  <input v-model="editForm.skill" type="text" class="form-control" required>
                </div>

                <div v-if="activeTab === 'stories'" class="mb-3">
                  <label class="form-label">Content</label>
                  <textarea v-model="editForm.content" class="form-control" rows="6"></textarea>
                </div>

                <div class="mb-3">
                  <label class="form-label">Status</label>
                  <select v-model="editForm.status" class="form-select">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="flagged">Flagged</option>
                  </select>
                </div>

                <div class="form-check mb-3">
                  <input v-model="editForm.flag" class="form-check-input" type="checkbox" id="flagCheck">
                  <label class="form-check-label" for="flagCheck">Flag this content</label>
                </div>

                <div v-if="editForm.flag" class="mb-3">
                  <label class="form-label">Flag Reason</label>
                  <textarea v-model="editForm.flag_reason" class="form-control" rows="3"></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showEditModal = false">Cancel</button>
              <button class="btn btn-primary" @click="updateContent" :disabled="isLoading">
                <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-check me-2"></i>
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};
