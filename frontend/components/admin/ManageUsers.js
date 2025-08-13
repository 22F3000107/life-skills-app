import {
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUser,
} from "../../utils/api.js";

export default {
  name: "ManageUsers",
  data() {
    return {
      searchQuery: "",
      users: []
    };
  },
  computed: {
    approvedUsers() {
      return this.users.filter(user =>
        user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  },
  methods: {
    async fetchUsers() {
      try {
        const res = await getAllUsers();
        this.users = res.users.map(user => {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.roles && user.roles.length > 0 ? user.roles[0].toLowerCase() : "user",
            blocked: !user.active,
            registered: user.registered || "2025-01-01",
            coins: user.coins || 0,
            tests: user.tests || 0
          };
        });
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    },

    async toggleBlock(user) {
      try {
        if (user.blocked) {
          await unblockUser(user.id);
        } else {
          await blockUser(user.id);
        }
        user.blocked = !user.blocked;
      } catch (err) {
        console.error("Error toggling block status:", err);
        alert("Failed to change user status. Please check backend logs or endpoint.");
      }
    },

    async deleteUser(user) {
      try {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
          await deleteUser(user.id);
          this.users = this.users.filter(u => u.id !== user.id);
        }
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Failed to delete user. Check backend logs.");
      }
    }
  },
  mounted() {
    this.fetchUsers();
  },
  template: `
    <div class="container mt-4 mb-5">
      <h2 class="text-center fw-bold mb-4">
        <i class="bi bi-people-fill me-2 text-primary"></i>Manage Users
      </h2>

      <!-- Search -->
      <div class="input-group mb-4" style="max-width: 450px; margin: auto;">
        <input v-model="searchQuery" type="text" class="form-control" placeholder="Search by name or email..." />
        <span class="input-group-text"><i class="bi bi-search"></i></span>
      </div>

      <!-- Users Table -->
      <div>
        <h5 class="fw-semibold mb-3"><i class="bi bi-person-check me-2 text-success"></i>All Users</h5>
        <div class="table-responsive">
          <table class="table table-bordered text-center align-middle">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Coins</th>
                <th>Tests</th>
                <th>Registered</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, index) in approvedUsers" :key="user.id">
                <td>{{ index + 1 }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="badge"
                    :class="{
                      'bg-primary': user.role === 'user',
                      'bg-success': user.role === 'academic',
                      'bg-dark': user.role === 'admin'
                    }">
                    {{ user.role }}
                  </span>
                </td>
                <td>{{ user.coins }}</td>
                <td>{{ user.tests }}</td>
                <td>{{ user.registered }}</td>
                <td>
                  <span :class="user.blocked ? 'text-danger fw-bold' : 'text-success fw-semibold'">
                    {{ user.blocked ? 'Blocked' : 'Active' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-warning me-2" @click="toggleBlock(user)">
                    <i class="bi bi-shield-exclamation me-1"></i>{{ user.blocked ? 'Unblock' : 'Block' }}
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteUser(user)">
                    <i class="bi bi-trash me-1"></i>Delete
                  </button>
                </td>
              </tr>
              <tr v-if="approvedUsers.length === 0">
                <td colspan="9" class="text-muted">No users to display.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
};



// This code defines a Vue.js component for managing users and academics in an admin dashboard.
// It includes features like searching, filtering by role, blocking/unblocking users, approving/reject// rejecting academic users, and deleting users.
// The component uses a table to display user information and provides buttons for actions like blocking, approving, and deleting users.
// The user data is hardcoded for demonstration purposes, but in a real application, this would typically be fetched from an API.
// The template is structured with Bootstrap classes for styling, ensuring a responsive and user-friendly interface.
// The component allows admins to efficiently manage users and academics, providing a clear overview of their status and roles within the application.
// The component is designed to be easily extendable, allowing for future enhancements such as pagination, sorting, or more complex user management features.
// It serves as a foundational piece for the admin dashboard, enabling effective user management and oversight within the application.
// The use of computed properties for filtering users based on search queries and role selection enhances performance and user experience, ensuring that the displayed data is always relevant to the admin's current context.
// The component is ready to be integrated into a larger Vue.js application, providing essential user management functionalities that are crucial for maintaining the integrity and organization of the platform's user base.
// The design is clean and intuitive, making it easy for administrators to navigate and perform necessary actions without confusion or clutter.
// Overall, this component is a robust solution for managing users and academics in a Vue.js application, providing essential functionalities that enhance the administrative capabilities of the platform while maintaining a user-friendly interface.

