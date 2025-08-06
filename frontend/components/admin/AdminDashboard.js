// export default {
//   name: "AdminDashboard",
//   data() {
//     return {
//       adminName: "Admin",
//       stats: {
//         totalUsers: 120,
//         totalQuizzes: 45,
//         flaggedItems: 6,
//         storiesAdded: 12,
//         academicMembers: 8,
//         activeToday: 23
//       },
//       reminders: [
//         { title: "Reminder to complete quiz", date: "2025-06-18" },
//         { title: "New weekly habit starts", date: "2025-06-20" }
//       ],
//       logs: [
//         "User A completed a quiz",
//         "New story added by Academic Member",
//         "User B flagged a question",
//         "Reminder sent to 5 inactive users"
//       ],
//       showAcademicForm: false,
//       newAcademic: {
//         name: "",
//         email: "",
//         qualification: "",
//         department: "",
//         institute: "",
//         reason: ""
//       },
//       users: []
//     };
//   },
//   methods: {
//     registerAcademic() {
//       const a = this.newAcademic;
//       if (!a.name || !a.email || !a.qualification || !a.department || !a.institute || !a.reason) {
//         alert("Please fill all fields.");
//         return;
//       }

//       this.users.push({
//         id: Date.now(),
//         name: a.name,
//         email: a.email,
//         qualification: a.qualification,
//         department: a.department,
//         institute: a.institute,
//         reason: a.reason,
//         role: "academic",
//         approved: true,
//         blocked: false,
//         registered: new Date().toISOString().split("T")[0],
//         coins: 0,
//         tests: 0
//       });

//       this.logs.unshift(`Academic ${a.name} registered by Admin`);
//       alert("Academic user registered and approved.");
//       this.newAcademic = { name: "", email: "", qualification: "", department: "", institute: "", reason: "" };
//       this.showAcademicForm = false;
//     }
//   },
//   template: `
//     <div class="container mt-4 mb-5">
//       <div class="text-center mb-4">
//         <h2 class="fw-bold">Welcome, {{ adminName }}</h2>
//         <p class="text-muted">This is your control panel for managing the Life Skills App.</p>
//       </div>

//       <!-- Cards -->
//       <div class="row text-center g-4 mb-4">
//         <div class="col-md-4" v-for="(item, key) in [
//           { label: 'Total Users', value: stats.totalUsers, img: 'images/user.png' },
//           { label: 'Quizzes Created', value: stats.totalQuizzes, img: 'images/quiz.png' },
//           { label: 'Flagged Content', value: stats.flaggedItems, img: 'images/flag.png' }
//         ]" :key="key">
//           <div class="card shadow-sm p-3 bg-light h-100">
//             <img :src="item.img" alt="card-icon" class="mx-auto mb-2" style="height: 100px;" />
//             <h6 class="fw-semibold">{{ item.label }}</h6>
//             <p class="fw-bold fs-4 text-primary">{{ item.value }}</p>
//           </div>
//         </div>
//       </div>

//       <div class="row text-center g-4 mb-4">
//         <div class="col-md-4" v-for="(item, key) in [
//           { label: 'Stories Added', value: stats.storiesAdded, img: 'images/story.png' },
//           { label: 'Academic Members', value: stats.academicMembers, img: 'images/teacher.png' },
//           { label: 'Active Today', value: stats.activeToday, img: 'images/active.png' }
//         ]" :key="'second-' + key">
//           <div class="card shadow-sm p-3 bg-light h-100">
//             <img :src="item.img" alt="card-icon" class="mx-auto mb-2" style="height: 100px;" />
//             <h6 class="fw-semibold">{{ item.label }}</h6>
//             <p class="fw-bold fs-4 text-success">{{ item.value }}</p>
//           </div>
//         </div>
//       </div>

//       <!-- Logs and Reminders -->
//       <div class="row g-4">
//         <div class="col-md-6">
//           <div class="card shadow-sm h-100">
//             <div class="card-header bg-warning text-white fw-bold">
//               <i class="bi bi-alarm-fill me-1"></i> Scheduled Reminders
//             </div>
//             <div class="card-body">
//               <ul class="list-group">
//                 <li v-for="(rem, i) in reminders" :key="i" class="list-group-item d-flex justify-content-between">
//                   <span>{{ rem.title }}</span>
//                   <small class="text-muted">{{ rem.date }}</small>
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </div>

//         <div class="col-md-6">
//           <div class="card shadow-sm h-100">
//             <div class="card-header bg-secondary text-white fw-bold">
//               <i class="bi bi-clipboard-data-fill me-1"></i> Recent Activity Logs
//             </div>
//             <div class="card-body">
//               <ul class="list-group">
//                 <li v-for="(log, i) in logs" :key="i" class="list-group-item">
//                   <i class="bi bi-dot text-secondary me-1"></i> {{ log }}
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>

//       <!-- Register Academic Member -->
//       <div class="mt-5">
//         <h5 class="fw-semibold mb-3">
//           <i class="bi bi-person-plus-fill text-info me-1"></i> Register Academic Team Member
//         </h5>
//         <button class="btn btn-outline-info mb-3" @click="showAcademicForm = !showAcademicForm">
//           <i class="bi bi-person-plus me-1"></i>{{ showAcademicForm ? 'Cancel' : 'Add Academic Member' }}
//         </button>

//         <div v-if="showAcademicForm" class="card p-4 shadow-sm">
//           <div class="mb-3">
//             <label class="form-label">Full Name</label>
//             <input v-model="newAcademic.name" class="form-control" placeholder="Enter full name" />
//           </div>
//           <div class="mb-3">
//             <label class="form-label">Email</label>
//             <input v-model="newAcademic.email" class="form-control" placeholder="Enter email" type="email" />
//           </div>
//           <div class="mb-3">
//             <label class="form-label">Qualification</label>
//             <input v-model="newAcademic.qualification" class="form-control" placeholder="Enter qualification" />
//           </div>
//           <div class="mb-3">
//             <label class="form-label">Department</label>
//             <input v-model="newAcademic.department" class="form-control" placeholder="Enter department" />
//           </div>
//           <div class="mb-3">
//             <label class="form-label">Institute</label>
//             <input v-model="newAcademic.institute" class="form-control" placeholder="Enter institute name" />
//           </div>
//           <div class="mb-3">
//             <label class="form-label">Reason for Joining</label>
//             <textarea v-model="newAcademic.reason" class="form-control" placeholder="Explain why they are joining..." rows="3"></textarea>
//           </div>
//           <div class="text-end">
//             <button class="btn btn-success" @click="registerAcademic">
//               <i class="bi bi-check-circle me-1"></i>Submit Academic Registration
//             </button>
//           </div>
//         </div>
//       </div>

//       <!-- Quick Actions -->
//       <div class="mt-5">
//         <h5 class="fw-semibold mb-3">
//           <i class="bi bi-lightning-fill text-primary me-1"></i> Quick Actions
//         </h5>
//         <div class="d-flex flex-wrap gap-3">
//           <router-link to="/admin/stories" class="btn btn-outline-primary">
//             <i class="bi bi-journal-plus me-1"></i> Add New Story
//           </router-link>
//           <router-link to="/admin/quizzes" class="btn btn-outline-success">
//             <i class="bi bi-patch-plus-fill me-1"></i> Create Quiz
//           </router-link>
//           <router-link to="/admin/users" class="btn btn-outline-dark">
//             <i class="bi bi-search me-1"></i> Manage Users
//           </router-link>
//         </div>
//       </div>
//     </div>
//   `
// };


import { fetchAdminStats, registerAcademicUser } from "/utils/api.js";

export default {
  name: "AdminDashboard",
  data() {
    return {
      adminName: "Admin",
      stats: {
        totalUsers: 0,
        totalQuizzes: 0,
        flaggedItems: 0,
        storiesAdded: 0,
        academicMembers: 0,
        activeToday: 0 // Placeholder if backend supports it later
      },
      reminders: [
        { title: "Reminder to complete quiz", date: "2025-06-18" },
        { title: "New weekly habit starts", date: "2025-06-20" }
      ],
      logs: [],
      showAcademicForm: false,
      newAcademic: {
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        age: "",
        password: "",
        qualification: "",
        discipline: "",
        institution: ""
      }
    };
  },
  methods: {
    async registerAcademic() {
      const a = this.newAcademic;
      const required = [
        "first_name", "last_name", "email", "phone_number", "age",
        "password", "qualification", "discipline", "institution"
      ];

      for (const field of required) {
        if (!a[field]) {
          alert("Please fill all fields.");
          return;
        }
      }

      try {
        const response = await registerAcademicUser(a);
        this.logs.unshift(`Academic ${a.first_name} ${a.last_name} registered by Admin`);
        alert("✅ Academic user registered and approved.");
        this.newAcademic = {
          first_name: "", last_name: "", email: "", phone_number: "", age: "", password: "",
          qualification: "", discipline: "", institution: ""
        };
        this.showAcademicForm = false;
      } catch (err) {
        alert("❌ Registration failed: " + err.message);
      }
    },
    async loadStats() {
      try {
        const response = await fetchAdminStats();
        this.stats.totalUsers = response.total_users;
        this.stats.totalQuizzes = response.total_quizzes;
        this.stats.flaggedItems = response.flagged_items;
        this.stats.storiesAdded = response.stories_added;
        this.stats.academicMembers = response.academic_members;
      } catch (err) {
        console.error("Failed to load admin stats:", err.message);
      }
    }
  },
  mounted() {
    this.loadStats();
  },
  template: `
    <div class="container mt-4 mb-5">
      <div class="text-center mb-4">
        <h2 class="fw-bold">Welcome, {{ adminName }}</h2>
        <p class="text-muted">This is your control panel for managing the Life Skills App.</p>
      </div>

      <!-- Cards -->
      <div class="row text-center g-4 mb-4">
        <div class="col-md-4" v-for="(item, key) in [
          { label: 'Total Users', value: stats.totalUsers, img: 'images/user.png' },
          { label: 'Quizzes Created', value: stats.totalQuizzes, img: 'images/quiz.png' },
          { label: 'Flagged Content', value: stats.flaggedItems, img: 'images/flag.png' }
        ]" :key="key">
          <div class="card shadow-sm p-3 bg-light h-100">
            <img :src="item.img" alt="card-icon" class="mx-auto mb-2" style="height: 100px;" />
            <h6 class="fw-semibold">{{ item.label }}</h6>
            <p class="fw-bold fs-4 text-primary">{{ item.value }}</p>
          </div>
        </div>
      </div>

      <div class="row text-center g-4 mb-4">
        <div class="col-md-4" v-for="(item, key) in [
          { label: 'Stories Added', value: stats.storiesAdded, img: 'images/story.png' },
          { label: 'Academic Members', value: stats.academicMembers, img: 'images/teacher.png' },
          { label: 'Active Today', value: stats.activeToday, img: 'images/active.png' }
        ]" :key="'second-' + key">
          <div class="card shadow-sm p-3 bg-light h-100">
            <img :src="item.img" alt="card-icon" class="mx-auto mb-2" style="height: 100px;" />
            <h6 class="fw-semibold">{{ item.label }}</h6>
            <p class="fw-bold fs-4 text-success">{{ item.value }}</p>
          </div>
        </div>
      </div>

      <!-- Logs and Reminders -->
      <div class="row g-4">
        <div class="col-md-6">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-warning text-white fw-bold">
              <i class="bi bi-alarm-fill me-1"></i> Scheduled Reminders
            </div>
            <div class="card-body">
              <ul class="list-group">
                <li v-for="(rem, i) in reminders" :key="i" class="list-group-item d-flex justify-content-between">
                  <span>{{ rem.title }}</span>
                  <small class="text-muted">{{ rem.date }}</small>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-secondary text-white fw-bold">
              <i class="bi bi-clipboard-data-fill me-1"></i> Recent Activity Logs
            </div>
            <div class="card-body">
              <ul class="list-group">
                <li v-for="(log, i) in logs" :key="i" class="list-group-item">
                  <i class="bi bi-dot text-secondary me-1"></i> {{ log }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Register Academic Member -->
      <div class="mt-5">
        <h5 class="fw-semibold mb-3">
          <i class="bi bi-person-plus-fill text-info me-1"></i> Register Academic Team Member
        </h5>
        <button class="btn btn-outline-info mb-3" @click="showAcademicForm = !showAcademicForm">
          <i class="bi bi-person-plus me-1"></i>{{ showAcademicForm ? 'Cancel' : 'Add Academic Member' }}
        </button>

        <div v-if="showAcademicForm" class="card p-4 shadow-sm">
          <div class="mb-3">
            <label class="form-label">First Name</label>
            <input v-model="newAcademic.first_name" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label">Last Name</label>
            <input v-model="newAcademic.last_name" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input v-model="newAcademic.email" type="email" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label">Phone Number</label>
            <input v-model="newAcademic.phone_number" type="text" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label">Age</label>
            <input v-model="newAcademic.age" type="number" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input v-model="newAcademic.password" type="password" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label">Qualification</label>
            <input v-model="newAcademic.qualification" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label">Discipline</label>
            <input v-model="newAcademic.discipline" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label">Institution</label>
            <input v-model="newAcademic.institution" class="form-control" />
          </div>
          <div class="text-end">
            <button class="btn btn-success" @click="registerAcademic">
              <i class="bi bi-check-circle me-1"></i>Submit Academic Registration
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-5">
        <h5 class="fw-semibold mb-3">
          <i class="bi bi-lightning-fill text-primary me-1"></i> Quick Actions
        </h5>
        <div class="d-flex flex-wrap gap-3">
          <router-link to="/admin/stories" class="btn btn-outline-primary">
            <i class="bi bi-journal-plus me-1"></i> Add New Story
          </router-link>
          <router-link to="/admin/quizzes" class="btn btn-outline-success">
            <i class="bi bi-patch-plus-fill me-1"></i> Create Quiz
          </router-link>
          <router-link to="/admin/users" class="btn btn-outline-dark">
            <i class="bi bi-search me-1"></i> Manage Users
          </router-link>
        </div>
      </div>
    </div>
  `
};



// This code defines an Admin Dashboard component for a Vue.js application.
// It provides a summary of platform activity with statistics on total users, quizzes, and flagged content.
// The dashboard includes quick access links to manage users, stories, quizzes, flagged content, reports,
// and reminder settings.
// The component uses Bootstrap classes for styling and Vue Router for navigation.
// The admin's name is displayed at the top, and the statistics are dynamically populated from the `data` object.
// The layout is responsive, adapting to different screen sizes using Bootstrap's grid system.
// This component serves as a central hub for administrators to monitor and manage the platform effectively.