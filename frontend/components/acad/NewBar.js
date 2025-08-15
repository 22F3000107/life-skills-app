// export default {
//   name: "NewBar",
//   data() {
//     return {
//       role: null,
//       isCollapsed: false,
//       isMobileMenuOpen: false,
//     };
//   },
//   methods: {
//     logout() {
//       localStorage.removeItem("auth-token");
//       localStorage.removeItem("role");
//       this.$router.push("/login");
//     },
//     goBack() {
//       this.$router.go(-1);
//     },
//     goForward() {
//       this.$router.go(1);
//     },
//     closeMobileMenu() {
//       this.isMobileMenuOpen = false;
//     },
//   },
//   mounted() {
//     this.role = localStorage.getItem("role");
//   },
//   template: `
  
//     <div>
//       <!-- Mobile Menu Toggle -->
//       <button 
//         class="btn btn-primary d-lg-none position-fixed top-0 start-0 m-3 z-3"
//         @click="isMobileMenuOpen = !isMobileMenuOpen"
//         style="border-radius: 15px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);"
//       >
//         <i class="bi bi-list fs-5"></i>
//       </button>

//       <!-- Sidebar -->
//       <div 
//         class="sidebar d-flex flex-column shadow-lg position-fixed position-lg-sticky"
//         :class="{ 
//           'collapsed': isCollapsed,
//           'mobile-open': isMobileMenuOpen
//         }"
//         style="
//           width: 280px;
//           height: 100vh;
//           background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
//           border-top-right-radius: 25px;
//           border-bottom-right-radius: 25px;
//           z-index: 1000;
//         "
//       >
//         <!-- Logo + App Title -->
//         <div class="p-4 border-bottom border-white border-opacity-20 text-center">
//           <div class="logo-container mb-3">
//             <img 
//               src="./images/lifeskills-logo.png" 
//               alt="Life Skills Logo" 
//               height="60" 
//               class="mb-2 logo-image"
//               style="filter: brightness(0) invert(1);"
//             />
//           </div>
//           <h5 class="fw-bold text-white mb-0" v-if="!isCollapsed">Life Skills</h5>
//           <p class="text-white-50 small mb-0" v-if="!isCollapsed">Academic Portal</p>
//         </div>

//         <!-- Navigation Links -->
//         <nav class="flex-grow-1 nav flex-column p-3">
//           <router-link 
//             to="/acad/home" 
//             exact-active-class="active" 
//             class="nav-link sidebar-link"
//             @click="closeMobileMenu"
//           >
//             <i class="bi bi-house-fill nav-icon"></i>
//             <span class="nav-text" v-if="!isCollapsed">Dashboard</span>
//           </router-link>
          
//           <router-link 
//             to="/acad/modules" 
//             exact-active-class="active" 
//             class="nav-link sidebar-link"
//             @click="closeMobileMenu"
//           >
//             <i class="bi bi-journal-bookmark-fill nav-icon"></i>
//             <span class="nav-text" v-if="!isCollapsed">Modules</span>
//           </router-link>
          
//           <router-link 
//             to="/acad/question-bank" 
//             exact-active-class="active" 
//             class="nav-link sidebar-link"
//             @click="closeMobileMenu"
//           >
//             <i class="bi bi-collection-fill nav-icon"></i>
//             <span class="nav-text" v-if="!isCollapsed">Question Bank</span>
//           </router-link>
          
//           <router-link 
//             to="/acad/concepts" 
//             exact-active-class="active" 
//             class="nav-link sidebar-link"
//             @click="closeMobileMenu"
//           >
//             <i class="bi bi-lightbulb-fill nav-icon"></i>
//             <span class="nav-text" v-if="!isCollapsed">Concepts</span>
//           </router-link>
//           <router-link 
//             to="/acad/archived-questions" 
//             exact-active-class="active" 
//             class="nav-link sidebar-link"
//             @click="closeMobileMenu"
//           >
//             <i class="bi bi-lightbulb-fill nav-icon"></i>
//             <span class="nav-text" v-if="!isCollapsed">Archive</span>
//           </router-link>

//         </nav>

//         <!-- Collapse Toggle (Desktop Only) -->
//         <div class="p-3 border-top border-white border-opacity-20 d-none d-lg-block">
//           <button 
//             class="btn btn-outline-light btn-sm w-100 mb-3"
//             @click="isCollapsed = !isCollapsed"
//             style="border-radius: 12px; border: 2px solid rgba(255,255,255,0.3);"
//           >
//             <i :class="isCollapsed ? 'bi bi-chevron-right' : 'bi bi-chevron-left'"></i>
//             <span v-if="!isCollapsed" class="ms-2">Collapse</span>
//           </button>
//         </div>

//         <!-- Back / Forward Buttons -->
//         <div class="p-3 border-top border-white border-opacity-20" v-if="!isCollapsed">
//           <div class="d-flex gap-2 mb-3">
//             <button 
//               class="btn btn-outline-light btn-sm flex-fill"
//               @click="goBack"
//               style="border-radius: 12px; border: 2px solid rgba(255,255,255,0.3);"
//             >
//               <i class="bi bi-arrow-left me-1"></i>
//               Back
//             </button>
//             <button 
//               class="btn btn-outline-light btn-sm flex-fill"
//               @click="goForward"
//               style="border-radius: 12px; border: 2px solid rgba(255,255,255,0.3);"
//             >
//               Forward
//               <i class="bi bi-arrow-right ms-1"></i>
//             </button>
//           </div>
//         </div>

//         <!-- User Profile & Logout -->
//         <div class="p-3 border-top border-white border-opacity-20">
//           <!-- User Profile -->
//           <div class="d-flex align-items-center mb-3" v-if="!isCollapsed">
//             <div class="bg-white bg-opacity-20 p-2 rounded-circle me-3">
//               <i class="bi bi-person-fill text-white"></i>
//             </div>
//             <div class="flex-grow-1">
//               <div class="text-white fw-medium small">{{ role || 'Academic' }}</div>
//               <div class="text-white-50 small">Portal User</div>
//             </div>
//           </div>

//           <!-- Logout Button -->
//           <button 
//             class="btn btn-danger btn-sm w-100"
//             @click="logout"
//             style="
//               border-radius: 12px;
//               background: linear-gradient(45deg, #dc3545, #b02a37);
//               border: none;
//               box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
//             "
//           >
//             <i class="bi bi-box-arrow-right me-2"></i>
//             <span v-if="!isCollapsed">Logout</span>
//           </button>
//         </div>
//       </div>

//       <!-- Mobile Overlay -->
//       <div 
//         v-if="isMobileMenuOpen" 
//         class="mobile-overlay d-lg-none"
//         @click="closeMobileMenu"
//         style="
//           position: fixed;
//           top: 0;
//           left: 0;
//           width: 100vw;
//           height: 100vh;
//           background: rgba(0,0,0,0.5);
//           z-index: 999;
//         "
//       ></div>
//     </div>
//   `,
// };

// export default {
//   name: "NewBar",
//   data() {
//     return {
//       role: null,
//       isCollapsed: false,
//       isMobileMenuOpen: false,
//     };
//   },
//   methods: {
//     logout() {
//       localStorage.removeItem("auth-token");
//       localStorage.removeItem("role");
//       this.$router.push("/login");
//     },
//     goBack() {
//       this.$router.go(-1);
//     },
//     goForward() {
//       this.$router.go(1);
//     },
//     closeMobileMenu() {
//       this.isMobileMenuOpen = false;
//     },
//   },
//   mounted() {
//     const storedRole = localStorage.getItem("role");
//     this.role = storedRole ? storedRole.toLowerCase() : null;
//   },
//   template: `
//     <div>
//       <!-- Mobile Menu Toggle -->
//       <button 
//         class="btn btn-primary d-lg-none position-fixed top-0 start-0 m-3 z-3"
//         @click="isMobileMenuOpen = !isMobileMenuOpen"
//         style="border-radius: 15px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);"
//       >
//         <i class="bi bi-list fs-5"></i>
//       </button>

//       <!-- Sidebar -->
//       <div 
//         class="sidebar d-flex flex-column shadow-lg position-fixed position-lg-sticky"
//         :class="{ 
//           'collapsed': isCollapsed,
//           'mobile-open': isMobileMenuOpen
//         }"
//         style="
//           width: 280px;
//           height: 100vh;
//           background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
//           border-top-right-radius: 25px;
//           border-bottom-right-radius: 25px;
//           z-index: 1000;
//         "
//       >
//         <!-- Logo + App Title -->
//         <div class="p-4 border-bottom border-white border-opacity-20 text-center">
//           <div class="logo-container mb-3">
//             <img 
//               src="./images/lifeskills-logo.png" 
//               alt="Life Skills Logo" 
//               height="60" 
//               class="mb-2 logo-image"
//               style="filter: brightness(0) invert(1);"
//             />
//           </div>
//           <h5 class="fw-bold text-white mb-0" v-if="!isCollapsed">Life Skills</h5>
//           <p class="text-white-50 small mb-0" v-if="!isCollapsed">Academic Portal</p>
//         </div>

//         <!-- Navigation Links -->
//         <nav class="flex-grow-1 nav flex-column p-3">
//           <router-link 
//             to="/acad/home" 
//             exact-active-class="active" 
//             class="nav-link sidebar-link"
//             @click="closeMobileMenu"
//           >
//             <i class="bi bi-house-fill nav-icon"></i>
//             <span class="nav-text" v-if="!isCollapsed">Dashboard</span>
//           </router-link>
          
//           <router-link 
//             to="/acad/modules" 
//             exact-active-class="active" 
//             class="nav-link sidebar-link"
//             @click="closeMobileMenu"
//           >
//             <i class="bi bi-journal-bookmark-fill nav-icon"></i>
//             <span class="nav-text" v-if="!isCollapsed">Modules</span>
//           </router-link>
          
//           <router-link 
//             to="/acad/question-bank" 
//             exact-active-class="active" 
//             class="nav-link sidebar-link"
//             @click="closeMobileMenu"
//           >
//             <i class="bi bi-collection-fill nav-icon"></i>
//             <span class="nav-text" v-if="!isCollapsed">Question Bank</span>
//           </router-link>
          
//           <router-link 
//             to="/acad/concepts" 
//             exact-active-class="active" 
//             class="nav-link sidebar-link"
//             @click="closeMobileMenu"
//           >
//             <i class="bi bi-lightbulb-fill nav-icon"></i>
//             <span class="nav-text" v-if="!isCollapsed">Concepts</span>
//           </router-link>

//           <router-link 
//             to="/acad/archived-questions" 
//             exact-active-class="active" 
//             class="nav-link sidebar-link"
//             @click="closeMobileMenu"
//           >
//             <i class="bi bi-lightbulb-fill nav-icon"></i>
//             <span class="nav-text" v-if="!isCollapsed">Archive</span>
//           </router-link>

//           <!-- Only show for academic role -->
//           <router-link 
//             v-if="role === 'academic'"
//             to="/acad/AcademicCreateStory" 
//             exact-active-class="active" 
//             class="nav-link sidebar-link"
//             @click="closeMobileMenu"
//           >
//             <i class="bi bi-book-fill nav-icon"></i>
//             <span class="nav-text" v-if="!isCollapsed">Manage Stories</span>
//           </router-link>
//         </nav>

//         <!-- Collapse Toggle (Desktop Only) -->
//         <div class="p-3 border-top border-white border-opacity-20 d-none d-lg-block">
//           <button 
//             class="btn btn-outline-light btn-sm w-100 mb-3"
//             @click="isCollapsed = !isCollapsed"
//             style="border-radius: 12px; border: 2px solid rgba(255,255,255,0.3);"
//           >
//             <i :class="isCollapsed ? 'bi bi-chevron-right' : 'bi bi-chevron-left'"></i>
//             <span v-if="!isCollapsed" class="ms-2">Collapse</span>
//           </button>
//         </div>

//         <!-- Back / Forward Buttons -->
//         <div class="p-3 border-top border-white border-opacity-20" v-if="!isCollapsed">
//           <div class="d-flex gap-2 mb-3">
//             <button 
//               class="btn btn-outline-light btn-sm flex-fill"
//               @click="goBack"
//               style="border-radius: 12px; border: 2px solid rgba(255,255,255,0.3);"
//             >
//               <i class="bi bi-arrow-left me-1"></i>
//               Back
//             </button>
//             <button 
//               class="btn btn-outline-light btn-sm flex-fill"
//               @click="goForward"
//               style="border-radius: 12px; border: 2px solid rgba(255,255,255,0.3);"
//             >
//               Forward
//               <i class="bi bi-arrow-right ms-1"></i>
//             </button>
//           </div>
//         </div>

//         <!-- User Profile & Logout -->
//         <div class="p-3 border-top border-white border-opacity-20">
//           <!-- User Profile -->
//           <div class="d-flex align-items-center mb-3" v-if="!isCollapsed">
//             <div class="bg-white bg-opacity-20 p-2 rounded-circle me-3">
//               <i class="bi bi-person-fill text-white"></i>
//             </div>
//             <div class="flex-grow-1">
//               <div class="text-white fw-medium small">{{ role || 'Academic' }}</div>
//               <div class="text-white-50 small">Portal User</div>
//             </div>
//           </div>

//           <!-- Logout Button -->
//           <button 
//             class="btn btn-danger btn-sm w-100"
//             @click="logout"
//             style="
//               border-radius: 12px;
//               background: linear-gradient(45deg, #dc3545, #b02a37);
//               border: none;
//               box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
//             "
//           >
//             <i class="bi bi-box-arrow-right me-2"></i>
//             <span v-if="!isCollapsed">Logout</span>
//           </button>
//         </div>
//       </div>

//       <!-- Mobile Overlay -->
//       <div 
//         v-if="isMobileMenuOpen" 
//         class="mobile-overlay d-lg-none"
//         @click="closeMobileMenu"
//         style="
//           position: fixed;
//           top: 0;
//           left: 0;
//           width: 100vw;
//           height: 100vh;
//           background: rgba(0,0,0,0.5);
//           z-index: 999;
//         "
//       ></div>
//     </div>
//   `,
// };

export default {
  name: "NewBar",
  data() {
    return {
      role: null,
      isCollapsed: false,
      isMobileMenuOpen: false,
    };
  },
  methods: {
    logout() {
      localStorage.removeItem("auth-token");
      localStorage.removeItem("role");
      this.$router.push("/login");
    },
    goBack() {
      this.$router.go(-1);
    },
    goForward() {
      this.$router.go(1);
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false;
    },
  },
  mounted() {
    const storedRole = localStorage.getItem("role");
    this.role = storedRole ? storedRole.toLowerCase() : null;
  },
  template: `
    <div>
      <!-- Mobile Menu Toggle -->
      <button 
        class="btn btn-primary d-lg-none position-fixed top-0 start-0 m-3 z-3"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
        style="border-radius: 15px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);"
      >
        <i class="bi bi-list fs-5"></i>
      </button>

      <!-- Sidebar -->
      <div 
        class="sidebar d-flex flex-column shadow-lg position-fixed position-lg-sticky"
        :class="{ 
          'collapsed': isCollapsed,
          'mobile-open': isMobileMenuOpen
        }"
        style="
          width: 280px;
          height: 100vh;
          background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
          border-top-right-radius: 25px;
          border-bottom-right-radius: 25px;
          z-index: 1000;
        "
      >
        <!-- Logo + App Title -->
        <div class="p-4 border-bottom border-white border-opacity-20 text-center">
          <div class="logo-container mb-3">
            <img 
              src="./images/lifeskills-logo.png" 
              alt="Life Skills Logo" 
              height="60" 
              class="mb-2 logo-image"
              style="filter: brightness(0) invert(1);"
            />
          </div>
          <h5 class="fw-bold text-white mb-0" v-if="!isCollapsed">Life Skills</h5>
          <p class="text-white-50 small mb-0" v-if="!isCollapsed">Academic Portal</p>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-grow-1 nav flex-column p-3">
          <router-link 
            to="/acad/home" 
            exact-active-class="active" 
            class="nav-link sidebar-link"
            @click="closeMobileMenu"
          >
            <i class="bi bi-house-fill nav-icon"></i>
            <span class="nav-text" v-if="!isCollapsed">Dashboard</span>
          </router-link>
          
          <router-link 
            to="/acad/modules" 
            exact-active-class="active" 
            class="nav-link sidebar-link"
            @click="closeMobileMenu"
          >
            <i class="bi bi-journal-bookmark-fill nav-icon"></i>
            <span class="nav-text" v-if="!isCollapsed">Modules</span>
          </router-link>
          
          <router-link 
            to="/acad/question-bank" 
            exact-active-class="active" 
            class="nav-link sidebar-link"
            @click="closeMobileMenu"
          >
            <i class="bi bi-collection-fill nav-icon"></i>
            <span class="nav-text" v-if="!isCollapsed">Question Bank</span>
          </router-link>
          
          <router-link 
            to="/acad/concepts" 
            exact-active-class="active" 
            class="nav-link sidebar-link"
            @click="closeMobileMenu"
          >
            <i class="bi bi-lightbulb-fill nav-icon"></i>
            <span class="nav-text" v-if="!isCollapsed">Concepts</span>
          </router-link>

          <router-link 
            to="/acad/contents" 
            exact-active-class="active" 
            class="nav-link sidebar-link"
            @click="closeMobileMenu"
          >
            <i class="bi bi-archive-fill nav-icon"></i>
            <span class="nav-text" v-if="!isCollapsed">Contents</span>
          </router-link>
          <router-link 
            to="/acad/archived-questions" 
            exact-active-class="active" 
            class="nav-link sidebar-link"
            @click="closeMobileMenu"
          >
            <i class="bi bi-archive-fill nav-icon"></i>
            <span class="nav-text" v-if="!isCollapsed">Archive</span>
          </router-link>
        </nav>

        <!-- Collapse Toggle (Desktop Only) -->
        <div class="p-3 border-top border-white border-opacity-20 d-none d-lg-block">
          <button 
            class="btn btn-outline-light btn-sm w-100 mb-3"
            @click="isCollapsed = !isCollapsed"
            style="border-radius: 12px; border: 2px solid rgba(255,255,255,0.3);"
          >
            <i :class="isCollapsed ? 'bi bi-chevron-right' : 'bi bi-chevron-left'"></i>
            <span v-if="!isCollapsed" class="ms-2">Collapse</span>
          </button>
        </div>

        <!-- Back / Forward Buttons -->
        <div class="p-3 border-top border-white border-opacity-20" v-if="!isCollapsed">
          <div class="d-flex gap-2 mb-3">
            <button 
              class="btn btn-outline-light btn-sm flex-fill"
              @click="goBack"
              style="border-radius: 12px; border: 2px solid rgba(255,255,255,0.3);"
            >
              <i class="bi bi-arrow-left me-1"></i>
              Back
            </button>
            <button 
              class="btn btn-outline-light btn-sm flex-fill"
              @click="goForward"
              style="border-radius: 12px; border: 2px solid rgba(255,255,255,0.3);"
            >
              Forward
              <i class="bi bi-arrow-right ms-1"></i>
            </button>
          </div>
        </div>

        <!-- User Profile & Logout -->
        <div class="p-3 border-top border-white border-opacity-20">
          <!-- User Profile -->
          <div class="d-flex align-items-center mb-3" v-if="!isCollapsed">
            <div class="bg-white bg-opacity-20 p-2 rounded-circle me-3">
              <i class="bi bi-person-fill text-white"></i>
            </div>
            <div class="flex-grow-1">
              <div class="text-white fw-medium small">{{ role || 'Academic' }}</div>
              <div class="text-white-50 small">Portal User</div>
            </div>
          </div>

          <!-- Logout Button -->
          <button 
            class="btn btn-danger w-100 py-2"
            @click="logout"
            style="
              border-radius: 12px;
              background: linear-gradient(45deg, #dc3545, #b02a37);
              border: none;
              box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
              font-size: 1.1rem;
            "
          >
            <i class="bi bi-box-arrow-right me-2" style="font-size: 1.2rem;"></i>
            <span v-if="!isCollapsed">Logout</span>
          </button>
        </div>
      </div>

      <!-- Mobile Overlay -->
      <div 
        v-if="isMobileMenuOpen" 
        class="mobile-overlay d-lg-none"
        @click="closeMobileMenu"
        style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.5);
          z-index: 999;
        "
      ></div>
    </div>
  `,
};
