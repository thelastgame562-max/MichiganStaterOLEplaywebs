const menuToggle = document.querySelector(".menu-toggle");
const menuPanel = document.querySelector(".menu-panel");
const signinModal = document.querySelector("#signin-modal");
const openSigninButtons = document.querySelectorAll("[data-open-signin]");
const closeSigninButtons = document.querySelectorAll("[data-close-signin]");
const roleChoices = document.querySelectorAll("[data-role]");
const dashboard = document.querySelector("[data-dashboard]");
const dashboardTitle = document.querySelector("#dashboard-title");
const currentRoleLabel = document.querySelector("#current-role-label");
const signoutButton = document.querySelector("[data-signout]");
const output = document.querySelector("#generated-output");
const roleOrder = ["guest", "member", "staff", "hr", "shr"];
const roleNames = {
  guest: "Guest",
  member: "Member",
  staff: "Staff",
  hr: "HR / IA Max",
  shr: "SHR"
};

if (menuToggle && menuPanel) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuPanel.hidden = true;
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuPanel.hidden = isOpen;
  });

  menuPanel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!menuPanel.hidden && !event.target.closest(".menu-wrap")) {
      closeMenu();
    }
  });
}

const openSignin = () => {
  if (signinModal) {
    signinModal.hidden = false;
  }
};

const closeSignin = () => {
  if (signinModal) {
    signinModal.hidden = true;
  }
};

const canAccess = (currentRole, minimumRole) =>
  roleOrder.indexOf(currentRole) >= roleOrder.indexOf(minimumRole);

const renderDashboard = () => {
  const currentRole = localStorage.getItem("msrpRole") || "guest";

  if (currentRoleLabel) {
    currentRoleLabel.textContent = `Current access: ${roleNames[currentRole] || "Guest"}`;
  }

  if (dashboardTitle) {
    dashboardTitle.textContent = `${roleNames[currentRole] || "Guest"} Dashboard`;
  }

  if (dashboard) {
    dashboard.hidden = currentRole === "guest" || currentRole === "member";
  }

  document.querySelectorAll("[data-role-min]").forEach((card) => {
    const minimumRole = card.getAttribute("data-role-min");
    card.hidden = !canAccess(currentRole, minimumRole);
  });
};

const randomCode = (prefix) =>
  `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

openSigninButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openSignin();
    if (menuPanel) {
      menuPanel.hidden = true;
      menuToggle?.setAttribute("aria-expanded", "false");
    }
  });
});

closeSigninButtons.forEach((button) => {
  button.addEventListener("click", closeSignin);
});

roleChoices.forEach((button) => {
  button.addEventListener("click", () => {
    const role = button.getAttribute("data-role") || "member";
    localStorage.setItem("msrpRole", role);
    renderDashboard();
    closeSignin();
  });
});

if (signoutButton) {
  signoutButton.addEventListener("click", () => {
    localStorage.removeItem("msrpRole");
    renderDashboard();
  });
}

document.querySelectorAll("[data-tool-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const type = form.getAttribute("data-tool-form");
    let message = "";

    if (type === "infraction") {
      message = `${formData.get("action")} saved for ${formData.get("member")} - ${formData.get("reason")}`;
    }

    if (type === "key") {
      message = `Key created for ${formData.get("label")}: ${randomCode("MSRPKEY")}`;
    }

    if (type === "code") {
      message = `Join code created for ${formData.get("label")}: ${randomCode("MSRPCODE")}`;
    }

    if (output) {
      output.insertAdjacentHTML("afterbegin", `<div class="output-item">${message}</div>`);
    }

    form.reset();
  });
});

renderDashboard();
