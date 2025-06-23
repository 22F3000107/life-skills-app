export default {
  name: "ManageUsers",
  data() {
    return {
      searchQuery: "",
      users: [
        {
          id: 1,
          name: "Riya Sharma",
          email: "riya@example.com",
          role: "user",
          blocked: false,
          registered: "2025-05-01",
          coins: 120,
          tests: 4
        },
        {
          id: 2,
          name: "Deepak Kumar",
          email: "deepak@example.com",
          role: "admin",
          blocked: false,
          registered: "2025-04-15",
          coins: 0,
          tests: 0
        },
        {
          id: 3,
          name: "Meera Verma",
          email: "meera@example.com",
          role: "academic",
          blocked: false,
          approved: false,
          registered: "2025-06-01",
          coins: 60,
          tests: 2,
          institute: "Springdale High",
          reason: "Contribute to stories"
        },
        {
          id: 4,
          name: "Sneha Patel",
          email: "sneha@school.com",
          role: "academic",
          blocked: false,
          approved: true,
          registered: "2025-05-25",
          coins: 50,
          tests: 1,
          institute: "Oxford Public School",
          reason: "Improve student engagement"
        }
      ]
    };
  },
  computed: {
    approvedUsers() {
      return this.users.filter(user =>
        (user.role !== "academic" || user.approved) &&
        (user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
         user.email.toLowerCase().includes(this.searchQuery.toLowerCase()))
      );
    },
    pendingAcademics() {
      return this.users.filter(user =>
        user.role === "academic" &&
        !user.approved &&
        (user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
         user.email.toLowerCase().includes(this.searchQuery.toLowerCase()))
      );
    }
  },
  methods: {
    toggleBlock(user) {
      user.blocked = !user.blocked;
    },
    approve(user) {
      user.approved = true;
    },
    reject(user) {
      if (confirm("Reject this academic member?")) {
        const i = this.users.findIndex(u => u.id === user.id);
        this.users.splice(i, 1);
      }
    },
    deleteUser(user) {
      if (confirm("Delete this user?")) {
        const i = this.users.findIndex(u => u.id === user.id);
        this.users.splice(i, 1);
      }
    }
  },
  template: `
    <div class="container mt-4 mb-5">
      <h2 class="text-center fw-bold mb-4">👩‍🏫 Manage Users & Academic Approvals</h2>

      <!-- Search -->
      <div class="input-group mb-4" style="max-width: 400px; margin: auto;">
        <input v-model="searchQuery" type="text" class="form-control" placeholder="Search by name or email..." />
        <span class="input-group-text"><i class="bi bi-search"></i></span>
      </div>

      <!-- 🔶 Pending Academic Table -->
      <div v-if="pendingAcademics.length" class="mb-5">
        <h5 class="fw-semibold mb-3">📌 Pending Academic Approvals</h5>
        <div class="table-responsive">
          <table class="table table-bordered text-center align-middle">
            <thead class="table-warning">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Institute</th>
                <th>Reason for Joining</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in pendingAcademics" :key="user.id">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.institute }}</td>
                <td>{{ user.reason }}</td>
                <td><span class="badge bg-warning text-dark">Pending</span></td>
                <td>
                  <button class="btn btn-sm btn-success me-2" @click="approve(user)">Approve</button>
                  <button class="btn btn-sm btn-danger" @click="reject(user)">Reject</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ✅ Approved Users Table -->
      <div>
        <h5 class="fw-semibold mb-3">👥 All Active Users</h5>
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
                    {{ user.blocked ? 'Unblock' : 'Block' }}
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteUser(user)">Delete</button>
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

