export default {
  name: "RegistrationPage",
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      parentEmail: '',
      phone: '',
      password: '',
      agreeTerms: false,
      agreePromos: false,
      error: '',
      success: ''
    };
  },
  template: `
    <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div class="card shadow p-4" style="width: 100%; max-width: 550px;">
        <h3 class="text-center mb-4">📝 Sign Up</h3>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">First Name*</label>
            <input v-model="firstName" class="form-control" required placeholder="First name"/>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Last Name*</label>
            <input v-model="lastName" class="form-control" required placeholder="Last name"/>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Email Address*</label>
          <input v-model="email" type="email" class="form-control" required placeholder="Enter your email"/>
        </div>

        <div class="mb-3">
         <label class="form-label">Parent's Email Address*</label>
         <input v-model="parentEmail" type="email" class="form-control" required placeholder="Enter parent's email"/>
         <small class="form-text text-muted">
          We’ll use this to share important updates with your parent or guardian.
         </small>
        </div>


        <div class="mb-3">
          <label class="form-label">Phone Number*</label>
          <div class="input-group">
            <span class="input-group-text">+91</span>
            <input v-model="phone" type="tel" class="form-control" required placeholder="10-digit number"/>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Password*</label>
          <input v-model="password" type="password" class="form-control" required placeholder="Create a password"/>
          <small class="form-text text-muted">
            Use 8 or more characters with a mix of letters, numbers & symbols.
          </small>
        </div>

        <div class="form-check mb-2">
          <input class="form-check-input" type="checkbox" v-model="agreeTerms" />
          <label class="form-check-label">
            I agree to the <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>
          </label>
        </div>

        <div class="form-check mb-3">
          <input class="form-check-input" type="checkbox" v-model="agreePromos" />
          <label class="form-check-label">
            I agree to receive SMS and emails including product updates, events, and promotions.
          </label>
        </div>

        <div class="d-grid">
          <button class="btn btn-success" @click="register">Sign Up</button>
        </div>

        <p class="mt-3 text-center">
          Already have an account?
          <router-link to="/login">Log in</router-link>
        </p>

        <p v-if="error" class="text-danger mt-3 text-center">{{ error }}</p>
        <p v-if="success" class="text-success mt-3 text-center">{{ success }}</p>
      </div>
    </div>
  `,
  methods: {
    register() {
      if (!this.firstName || !this.lastName || !this.email || !this.phone || !this.password || !this.parentEmail || !this.agreeTerms) {
        this.error = "Please fill all required fields including your parent's email, and agree to the terms.";
        this.success = '';
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        this.error = "Please enter a valid email address.";
        this.success = '';
        return;
      }

      if (!emailRegex.test(this.parentEmail)) {
        this.error = "Please enter a valid parent's email address.";
        this.success = '';
        return;
      }

      this.error = '';
      this.success = "Registered successfully! Redirecting to login...";
      setTimeout(() => this.$router.push('/login'), 1500);
    }
  }
};

// This code defines a Vue.js component for a registration page.
// It includes fields for first name, last name, email, phone number, password, and checkboxes for agreeing to terms and receiving promotional messages.
// The component validates the input and displays success or error messages accordingly.
// Upon successful registration, it redirects the user to the login page after a brief delay