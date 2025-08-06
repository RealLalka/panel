document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const themeSwitcher = document.querySelector(".theme-switcher");
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.className = `theme-${savedTheme}`;

  if (themeSwitcher) {
    themeSwitcher.addEventListener("click", () => {
      const isDark = document.documentElement.classList.contains("theme-dark");
      const newTheme = isDark ? "light" : "dark";
      document.documentElement.className = `theme-${newTheme}`;
      localStorage.setItem("theme", newTheme);
    });
  }

  const modals = {
    deposit: document.getElementById("deposit-modal"),
    logout: document.getElementById("logout-modal"),
    addDevice: document.getElementById("add-device-modal"),
    addRequisite: document.getElementById("add-requisite-modal"),
    regulations: document.getElementById("regulations-modal"),
    request: document.getElementById("request-modal"),
    tfa: document.getElementById("tfa-modal"),
  };

  const openButtons = {
    deposit: document.getElementById("open-deposit-modal"),
    logout: document.getElementById("open-logout-modal"),
    addDevice: document.getElementById("add-device-button"),
    addRequisite: document.getElementById("add-requisite-button"),
    regulations: document.getElementById("open-regulations-modal"),
    request: document.getElementById("open-request-modal"),
    tfa: document.getElementById("open-tfa-modal"),
  };

  const closeButtons = {
    deposit: document.getElementById("cancel-deposit"),
    logout: document.getElementById("cancel-logout"),
    addDevice: document.getElementById("cancel-add-device"),
    addRequisite: document.getElementById("cancel-add-requisite"),
    regulations: document.getElementById("close-regulations-modal"),
    regulationsCancel: document.getElementById("cancel-regulations-modal"),
    request: document.getElementById("close-request-modal"),
    tfa: document.getElementById("cancel-tfa-setup"),
  };

  function showModal(modal) {
    if (modal) modal.style.display = "flex";
  }

  function hideModal(modal) {
    if (modal) modal.style.display = "none";
  }

  for (const key in openButtons) {
    if (openButtons[key] && modals[key]) {
      openButtons[key].addEventListener("click", () => showModal(modals[key]));
    }
  }

  for (const key in closeButtons) {
    if (closeButtons[key]) {
      let modalKey = key;
      if (key.includes('Cancel')) modalKey = key.replace('Cancel', '');
      if (key === 'regulationsCancel') modalKey = 'regulations';
      if (key === 'tfa') modalKey = 'tfa';

      if (modals[modalKey]) {
        closeButtons[key].addEventListener("click", () => hideModal(modals[modalKey]));
      }
    }
  }

  const confirmLogoutBtn = document.getElementById("confirm-logout-button");
  if (confirmLogoutBtn) {
    confirmLogoutBtn.addEventListener("click", () => {
      localStorage.removeItem('userData');
      localStorage.removeItem('userToken');
      window.location.href = "../auth.html";
    });
  }

  function generateTfaData() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      alert('Ошибка: не удалось получить данные пользователя.');
      return;
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 16; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const secretKeyInput = document.getElementById('tfa-secret-key');
    const qrCodeImg = document.getElementById('tfa-qr-code');

    if (secretKeyInput) secretKeyInput.value = secret;

    const issuer = 'GateCx';
    const account = userData.email || userData.username;
    const otpauthUrl = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}`;

    if (qrCodeImg) qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;
  }

  if (openButtons.tfa) {
    openButtons.tfa.addEventListener('click', () => {
      generateTfaData();
      showModal(modals.tfa);
    });
  }

  const generateNewTfaKeyBtn = document.getElementById('generate-new-tfa-key');
  if (generateNewTfaKeyBtn) {
    generateNewTfaKeyBtn.addEventListener('click', generateTfaData);
  }

  const confirmTfaSetupBtn = document.getElementById('confirm-tfa-setup');
  if (confirmTfaSetupBtn) {
    confirmTfaSetupBtn.addEventListener('click', () => {
      const code = document.getElementById('tfa-verification-code').value;
      if (code && code.length === 6) {
        alert(`Код для проверки: ${code}. Логика бэкенда еще не реализована.`);
        hideModal(modals.tfa);
      } else {
        alert('Пожалуйста, введите корректный 6-значный код.');
      }
    });
  }

  const copyTfaKeyBtn = document.getElementById('copy-tfa-key');
  if (copyTfaKeyBtn) {
    copyTfaKeyBtn.addEventListener('click', () => {
      const secretKeyInput = document.getElementById('tfa-secret-key');
      secretKeyInput.select();
      secretKeyInput.setSelectionRange(0, 99999);
      try {
        document.execCommand('copy');
        const originalContent = copyTfaKeyBtn.innerHTML;
        copyTfaKeyBtn.textContent = 'Ok!';
        setTimeout(() => {
          copyTfaKeyBtn.innerHTML = originalContent;
        }, 1500);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    });
  }

  window.addEventListener("click", (event) => {
    for (const key in modals) {
      if (event.target === modals[key]) hideModal(modals[key]);
    }
  });

  function addRowClickListener(selector, urlPrefix) {
    const rows = document.querySelectorAll(selector);
    if (rows.length > 0) {
      rows.forEach((row) => {
        row.addEventListener("click", () => {
          const dataId = row.getAttribute(`data-${urlPrefix}-id`);
          if (dataId) {
            window.location.href = `${urlPrefix}.html?id=${dataId}`;
          }
        });
      });
    }
  }

  addRowClickListener(".dispute-row", "dispute");
  addRowClickListener(".deal-row", "deal");
  addRowClickListener(".device-row", "device");
  addRowClickListener(".requisite-row", "requisite");

  function updateBreadcrumb(elementId, prefix = "") {
    const breadcrumbElement = document.getElementById(elementId);
    if (breadcrumbElement) {
      try {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        if (id) {
          breadcrumbElement.textContent = `${prefix} ${id}`.trim();
        }
      } catch (e) {
        console.error("Error parsing URL params:", e);
      }
    }
  }

  updateBreadcrumb("dispute-id-breadcrumb", "Спор");
  updateBreadcrumb("deal-id-breadcrumb", "Сделка");
  updateBreadcrumb("device-name-breadcrumb", "Устройство");
  updateBreadcrumb("requisite-id-breadcrumb");
});
