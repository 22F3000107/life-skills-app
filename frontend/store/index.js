// store/index.js
import {
  UserService,
  AcademicService,
  AdminService,
} from "../services/ApiServices.js";

const store = {
  state: {
    user: null,
    role: localStorage.getItem("role"),
    loading: false,
    error: null,
  },

  getters: {
    isAuthenticated: () => !!localStorage.getItem("auth-token"),
    userRole: (state) => state.role,
    isAdmin: (state) => state.role === "admin",
    isAcademic: (state) => state.role === "acad",
    isUser: (state) => state.role === "user",
  },

  mutations: {
    SET_USER(user) {
      this.state.user = user;
    },
    SET_ROLE(role) {
      this.state.role = role;
    },
    SET_LOADING(loading) {
      this.state.loading = loading;
    },
    SET_ERROR(error) {
      this.state.error = error;
    },
  },

  actions: {
    async login(credentials) {
      this.mutations.SET_LOADING(true);
      try {
        // API call logic
        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });
        const data = await response.json();

        localStorage.setItem("auth-token", data.token);
        localStorage.setItem("role", data.role);
        this.mutations.SET_ROLE(data.role);
        this.mutations.SET_USER(data.user);

        return data;
      } catch (error) {
        this.mutations.SET_ERROR(error.message);
        throw error;
      } finally {
        this.mutations.SET_LOADING(false);
      }
    },

    logout() {
      localStorage.removeItem("auth-token");
      localStorage.removeItem("role");
      this.mutations.SET_USER(null);
      this.mutations.SET_ROLE(null);
    },
  },
};

export default store;
