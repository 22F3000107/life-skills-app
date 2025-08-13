// AcademicCreateStory.js
import { createAcademicStory } from "../../utils/api.js";

export default {
  name: "AcademicCreateStory",
  data() {
    return {
      title: "",
      skill: "",
      content: "",
      loading: false,
      message: null,
      error: null
    };
  },
  methods: {
    async submitStory() {
      this.message = null;
      this.error = null;

      if (!this.title || !this.skill || !this.content) {
        this.error = "Please fill in all required fields.";
        return;
      }

      this.loading = true;
      try {
        const token = localStorage.getItem("auth-token");
        const payload = {
          title: this.title,
          skill: this.skill,
          content: this.content,
          createdBy: localStorage.getItem("user_id") // Store after login
        };
        const res = await createAcademicStory(payload, token);
        this.message = res.message || "Story created successfully!";
        this.title = "";
        this.skill = "";
        this.content = "";
      } catch (err) {
        console.error("Error creating story:", err);
        this.error = "Failed to create story.";
      } finally {
        this.loading = false;
      }
    }
  },
  template: `
    <div class="container mt-4">
      <h2 class="fw-bold mb-3">Create Academic Story</h2>
      <p>Fill in the details below to create a new learning story.</p>

      <div v-if="message" class="alert alert-success">{{ message }}</div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <form @submit.prevent="submitStory">
        <div class="mb-3">
          <label class="form-label">Title</label>
          <input v-model="title" type="text" class="form-control" placeholder="Story title" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Skill</label>
          <input v-model="skill" type="text" class="form-control" placeholder="Skill name" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Content</label>
          <textarea v-model="content" class="form-control" rows="5" placeholder="Story content..." required></textarea>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? "Creating..." : "Create Story" }}
        </button>
      </form>
    </div>
  `
};


