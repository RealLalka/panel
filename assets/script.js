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
  };

  const openButtons = {
    deposit: document.getElementById("open-deposit-modal"),
    logout: document.getElementById("open-logout-modal"),
    addDevice: document.getElementById("add-device-button"),
    addRequisite: document.getElementById("add-requisite-button"),
    regulations: document.getElementById("open-regulations-modal"),
    request: document.getElementById("open-request-modal"),
  };

  const closeButtons = {
    deposit: document.getElementById("cancel-deposit"),
    logout: document.getElementById("cancel-logout"),
    addDevice: document.getElementById("cancel-add-device"),
    addRequisite: document.getElementById("cancel-add-requisite"),
    regulations: document.getElementById("close-regulations-modal"),
    regulationsCancel: document.getElementById("cancel-regulations-modal"),
    request: document.getElementById("close-request-modal"),
  };

  const confirmLogoutBtn = document.getElementById("confirm-logout-button");

  function showModal(modal) {
    if (modal) modal.style.display = "flex";
  }

  function hideModal(modal) {
    if (modal) modal.style.display = "none";
  }

  for (const key in openButtons) {
    if (openButtons[key]) {
      openButtons[key].addEventListener("click", () => showModal(modals[key]));
    }
  }

  for (const key in closeButtons) {
    if (closeButtons[key]) {
      const modalKey = key.replace('Cancel', '').replace('regulations', 'regulations');
      closeButtons[key].addEventListener("click", () => hideModal(modals[modalKey]));
    }
  }

  if (confirmLogoutBtn) {
    confirmLogoutBtn.addEventListener("click", () => {
      window.location.href = "../auth.html";
    });
  }

  window.addEventListener("click", (event) => {
    for (const key in modals) {
      if (event.target === modals[key]) hideModal(modals[key]);
    }
  });

  const disputeRows = document.querySelectorAll(".dispute-row");
  if (disputeRows.length > 0) {
    disputeRows.forEach((row) => {
      row.addEventListener("click", () => {
        const disputeId = row.getAttribute("data-dispute-id");
        if (disputeId) {
          window.location.href = `dispute.html?id=${disputeId}`;
        }
      });
    });
  }

  const dealRows = document.querySelectorAll(".deal-row");
  if (dealRows.length > 0) {
    dealRows.forEach((row) => {
      row.addEventListener("click", () => {
        const dealId = row.getAttribute("data-deal-id");
        if (dealId) {
          window.location.href = `deal.html?id=${dealId}`;
        }
      });
    });
  }

  const deviceRows = document.querySelectorAll(".device-row");
  if (deviceRows.length > 0) {
    deviceRows.forEach((row) => {
      row.addEventListener("click", () => {
        const deviceId = row.getAttribute("data-device-id");
        if (deviceId) {
          window.location.href = `device.html?id=${deviceId}`;
        }
      });
    });
  }

  const requisiteRows = document.querySelectorAll(".requisite-row");
  if (requisiteRows.length > 0) {
    requisiteRows.forEach((row) => {
      row.addEventListener("click", () => {
        const requisiteId = row.getAttribute("data-requisite-id");
        if (requisiteId) {
          window.location.href = `requisite.html?id=${requisiteId}`;
        }
      });
    });
  }

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
