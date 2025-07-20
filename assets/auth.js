document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("email-input");
  const passwordInput = document.getElementById("password-input");
  const errorMessage = document.getElementById("error-message");

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (email === "admin" && password === "admin") {
        errorMessage.textContent = "";
        window.location.href = "pages/disputes.html";
      } else {
        errorMessage.textContent = "Неверный email или пароль.";
        passwordInput.value = "";
      }
    });
  }
});
