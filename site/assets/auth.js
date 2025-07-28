document.addEventListener("DOMContentLoaded", () => {
  const authApp = {
    elements: {
      form: document.getElementById("auth-form"),
      loginGroup: document.getElementById("login-group"),
      loginInput: document.getElementById("login-input"),
      usernameGroup: document.getElementById("username-group"),
      usernameInput: document.getElementById("username-input"),
      passwordInput: document.getElementById("password-input"),
      clidGroup: document.getElementById("clid-group"),
      clidInput: document.getElementById("clid-input"),
      emailGroup: document.getElementById("email-group"),
      emailInput: document.getElementById("email-input"),
      errorMessage: document.getElementById("error-message"),
      title: document.getElementById("auth-title"),
      submitButton: document.getElementById("submit-button"),
      toggleButton: document.getElementById("toggle-form-button"),
    },
    isLoginView: true,
    API_BASE_URL: 'http://localhost:4444/api/auth',

    toggleView() {
      this.isLoginView = !this.isLoginView;
      this.clearForm();
      this.updateUI();
    },

    updateUI() {
      if (this.isLoginView) {
        this.elements.title.textContent = "Вход";
        this.elements.submitButton.textContent = "Войти";
        this.elements.toggleButton.textContent = "Нет аккаунта? Зарегистрироваться";

        this.elements.loginGroup.style.display = "block";
        this.elements.usernameGroup.style.display = "none";
        this.elements.emailGroup.style.display = "none";
        this.elements.clidGroup.style.display = "none";

        this.elements.loginInput.required = true;
        this.elements.usernameInput.required = false;
        this.elements.emailInput.required = false;
        this.elements.clidInput.required = false;

      } else {
        this.elements.title.textContent = "Регистрация";
        this.elements.submitButton.textContent = "Зарегистрироваться";
        this.elements.toggleButton.textContent = "Уже есть аккаунт? Войти";

        this.elements.loginGroup.style.display = "none";
        this.elements.usernameGroup.style.display = "block";
        this.elements.emailGroup.style.display = "block";
        this.elements.clidGroup.style.display = "block";

        this.elements.loginInput.required = false;
        this.elements.usernameInput.required = true;
        this.elements.emailInput.required = true;
        this.elements.clidInput.required = true;
      }
    },

    clearForm() {
      this.elements.form.reset();
      this.elements.errorMessage.textContent = "";
    },

    async handleLogin() {
      const login = this.elements.loginInput.value.trim();
      const password = this.elements.passwordInput.value.trim();

      if (!login || !password) {
        this.elements.errorMessage.textContent = "Пожалуйста, введите логин и пароль.";
        return;
      }

      try {
        const response = await fetch(`${this.API_BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login, password })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Ошибка входа');
        }

        localStorage.setItem('userToken', data.accessToken);
        localStorage.setItem('userData', JSON.stringify(data));

        window.location.href = "/pages/hello.html";

      } catch (error) {
        this.elements.errorMessage.textContent = error.message;
      }
    },

    async handleRegistration() {
      const username = this.elements.usernameInput.value.trim();
      const email = this.elements.emailInput.value.trim();
      const password = this.elements.passwordInput.value.trim();
      const clid = this.elements.clidInput.value.trim();

      if (!username || !email || !password || !clid) {
        this.elements.errorMessage.textContent = "Пожалуйста, заполните все поля.";
        return;
      }

      try {
        const response = await fetch(`${this.API_BASE_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password, clid })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Ошибка регистрации');
        }

        alert('Регистрация прошла успешно! Теперь вы можете войти.');
        this.toggleView();

      } catch (error) {
        this.elements.errorMessage.textContent = error.message;
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