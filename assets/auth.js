document.addEventListener("DOMContentLoaded", () => {
  const authApp = {
    elements: {
      form: document.getElementById("auth-form"),
      emailInput: document.getElementById("email-input"),
      passwordInput: document.getElementById("password-input"),
      clidGroup: document.getElementById("clid-group"),
      clidInput: document.getElementById("clid-input"),
      errorMessage: document.getElementById("error-message"),
      title: document.getElementById("auth-title"),
      submitButton: document.getElementById("submit-button"),
      toggleButton: document.getElementById("toggle-form-button"),
    },
    isLoginView: true,

    toggleView() {
      this.isLoginView = !this.isLoginView;
      this.clearForm();
      this.updateUI();
    },

    updateUI() {
      if (this.isLoginView) {
        this.elements.title.textContent = "Вход";
        this.elements.submitButton.textContent = "Войти";
        this.elements.toggleButton.textContent = "Нет аккаута? Зарегистрироваться";
        this.elements.clidGroup.style.display = "none";
        this.elements.clidInput.required = false;
      } else {
        this.elements.title.textContent = "Регистрация";
        this.elements.submitButton.textContent = "Зарегистрироваться";
        this.elements.toggleButton.textContent = "Уже есть аккаунт? Войти";
        this.elements.clidGroup.style.display = "block";
        this.elements.clidInput.required = true;
      }
    },

    clearForm() {
      this.elements.form.reset();
      this.elements.errorMessage.textContent = "";
    },

    handleLogin() {
      const email = this.elements.emailInput.value.trim();
      const password = this.elements.passwordInput.value.trim();

      if (email && password) {
        console.log(`Login attempt for email: ${email}`);
        window.location.href = "pages/hello.html";
      } else {
        this.elements.errorMessage.textContent = "Пожалуйста, введите email и пароль.";
      }
    },

    handleRegistration() {
      const email = this.elements.emailInput.value.trim();
      const password = this.elements.passwordInput.value.trim();
      const clid = this.elements.clidInput.value.trim();

      if (email && password && clid) {
        console.log(`Registration attempt for email: ${email} with clid: ${clid}`);
        window.location.href = "pages/hello.html";
      } else {
        this.elements.errorMessage.textContent = "Пожалуйста, заполните все поля.";
      }
    },

    handleSubmit(event) {
      event.preventDefault();
      this.elements.errorMessage.textContent = "";
      this.isLoginView ? this.handleLogin() : this.handleRegistration();
    },

    init() {
      if (!this.elements.form) return;
      this.elements.form.addEventListener("submit", (e) => this.handleSubmit(e));
      this.elements.toggleButton.addEventListener("click", () => this.toggleView());
      this.updateUI();
    },
  };

  authApp.init();
});
