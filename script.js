const menuToggle = document.querySelector(".menu-toggle");
const menuPanel = document.querySelector(".menu-panel");
const signinModal = document.querySelector("#signin-modal");
const closeSigninButtons = document.querySelectorAll("[data-close-signin]");
const dashboard = document.querySelector("[data-dashboard]");
const roleOverview = document.querySelector("[data-role-overview]");
const dashboardTitle = document.querySelector("#dashboard-title");
const currentRoleLabel = document.querySelector("#current-role-label");
const signoutButton = document.querySelector("[data-signout]");
const output = document.querySelector("#generated-output");
const signoutButtons = document.querySelectorAll("[data-signout]");
const panelLinks = document.querySelectorAll("[data-panel-link]");
const discordLoginForm = document.querySelector("#discord-login-form");
const codeLoginForm = document.querySelector("#code-login-form");
const discordUsernameInput = document.querySelector("#discord-username");
const accessCodeInput = document.querySelector("#staff-access-code");
const rememberMeInput = document.querySelector("#remember-me");
const signinStepDiscord = document.querySelector("#signin-step-discord");
const signinStepCode = document.querySelector("#signin-step-code");
const signinUserDisplay = document.querySelector("#signin-user-display");
const staffChatBox = document.querySelector("#staff-chat-box");
const ownerCodeList = document.querySelector("#owner-code-list");
const authParams = new URLSearchParams(window.location.search);
const panelSection = document.querySelector("[data-panel-section]");
const roleOrder = ["guest", "member", "staff", "hr", "shr", "owner", "founder"];
const roleNames = {
  guest: "Guest",
  member: "Member",
  staff: "Staff",
  hr: "HR / IA Max",
  shr: "SHR",
  owner: "Owner",
  founder: "Founder"
};
const panelRequirements = {
  staff: "staff",
  hr: "hr",
  shr: "shr",
  owner: "owner",
  founder: "founder"
};
const panelTargets = {
  "#staff-panel": "staff",
  "#staff-chat": "staff",
  "#hr-panel": "hr",
  "#shr-panel": "shr",
  "#owner-panel": "owner",
  "#founder-panel": "founder",
  "#command-panel": "owner"
};
const accessCodes = {
  "STAFF-ENTRY-7421": "staff",
  "HRI-AMAX-5518": "hr",
  "SHR-CTRL-9084": "shr",
  "OWNER-ALPHA-4401": "owner",
  "OWNER-BRAVO-5512": "owner",
  "OWNER-CHARLIE-6623": "owner",
  "OWNER-DELTA-7734": "owner",
  "FOUNDER-WIST-9001": "founder"
};
const ownerCodes = [
  "OWNER-ALPHA-4401",
  "OWNER-BRAVO-5512",
  "OWNER-CHARLIE-6623",
  "OWNER-DELTA-7734",
  "FOUNDER-WIST-9001"
];

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
  if (signinStepDiscord && signinStepCode) {
    signinStepDiscord.hidden = false;
    signinStepCode.hidden = true;
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

  if (roleOverview) {
    roleOverview.hidden = currentRole === "guest" || currentRole === "member";
  }

  document.querySelectorAll("[data-role-min]").forEach((card) => {
    const minimumRole = card.getAttribute("data-role-min");
    card.hidden = !canAccess(currentRole, minimumRole);
  });

  panelLinks.forEach((link) => {
    const requirement = panelRequirements[link.getAttribute("data-panel-link")] || "founder";
    link.hidden = !canAccess(currentRole, requirement);
  });

  signoutButtons.forEach((button) => {
    button.hidden = currentRole === "guest" || currentRole === "member";
  });
};

const updatePanelSectionVisibility = () => {
  if (!panelSection) {
    return;
  }

  const currentRole = localStorage.getItem("msrpRole") || "guest";
  const target = window.location.hash;
  const minimumRole = panelTargets[target];

  if (!minimumRole || !canAccess(currentRole, minimumRole)) {
    panelSection.hidden = true;
    return;
  }

  panelSection.hidden = false;
};

const randomCode = (prefix) =>
  `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

const currentDiscordUser = () =>
  localStorage.getItem("msrpDiscordUser") ||
  sessionStorage.getItem("msrpDiscordUserSession") ||
  "Unknown user";
const shouldRemember = () => localStorage.getItem("msrpRememberMe") === "true";

const pushOutput = (message) => {
  if (output) {
    output.insertAdjacentHTML("afterbegin", `<div class="output-item">${message}</div>`);
  }
};

const pushChat = (message) => {
  if (staffChatBox) {
    staffChatBox.insertAdjacentHTML("afterbegin", `<div class="chat-message">${message}</div>`);
  }
};

const renderOwnerCodes = () => {
  if (!ownerCodeList) {
    return;
  }

  ownerCodeList.innerHTML = ownerCodes
    .map((code) => `<div class="code-item">${code}</div>`)
    .join("");
};

const routeToRolePanel = (role) => {
  const targetByRole = {
    staff: "#staff-chat",
    hr: "#hr-panel",
    shr: "#shr-panel",
    owner: "#owner-panel",
    founder: "#founder-panel"
  };

  const target = targetByRole[role];
  if (target) {
    window.location.hash = target;
    updatePanelSectionVisibility();
  }
};

const syncRoleFromDiscordAuth = () => {
  if (authParams.get("auth") !== "success") {
    return;
  }

  const username = authParams.get("discord_user");
  const role = authParams.get("discord_role");

  if (!username || !role) {
    return;
  }

  sessionStorage.setItem("msrpDiscordUserSession", username);

    if (role === "staff" || role === "hr" || role === "shr") {
      localStorage.setItem("msrpRole", role);
    } else {
      localStorage.removeItem("msrpRole");
    }

    pushOutput(`${username} signed in with Discord and was tracked as ${roleNames[role] || role}.`);
    routeToRolePanel(role);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

const hydrateRememberedUser = () => {
  if (discordUsernameInput && shouldRemember()) {
    discordUsernameInput.value = currentDiscordUser();
  }

  if (rememberMeInput) {
    rememberMeInput.checked = shouldRemember();
  }
};

closeSigninButtons.forEach((button) => {
  button.addEventListener("click", closeSignin);
});

if (discordLoginForm) {
  discordLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = discordUsernameInput?.value.trim() || "";

    if (!username) {
      return;
    }

    if (rememberMeInput?.checked) {
      localStorage.setItem("msrpDiscordUser", username);
      localStorage.setItem("msrpRememberMe", "true");
    } else {
      sessionStorage.setItem("msrpDiscordUserSession", username);
      localStorage.removeItem("msrpDiscordUser");
      localStorage.removeItem("msrpRememberMe");
    }

    if (signinUserDisplay) {
      signinUserDisplay.textContent = `Signed in with Discord as ${username}. Now enter your access code.`;
    }

    if (signinStepDiscord && signinStepCode) {
      signinStepDiscord.hidden = true;
      signinStepCode.hidden = false;
    }
  });
}

if (codeLoginForm) {
  codeLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const accessCode = accessCodeInput?.value.trim().toUpperCase() || "";
    const role = accessCodes[accessCode];

    if (!role) {
      pushOutput(`Access denied for ${currentDiscordUser()} - invalid code entered.`);
      return;
    }

      localStorage.setItem("msrpRole", role);
      renderDashboard();
      pushOutput(`${currentDiscordUser()} signed in successfully with ${roleNames[role]} access.`);
      routeToRolePanel(role);
      closeSignin();
      codeLoginForm.reset();
      discordLoginForm.reset();
  });
}

const handleSignout = () => {
    localStorage.removeItem("msrpRole");
    localStorage.removeItem("msrpDiscordUser");
    localStorage.removeItem("msrpRememberMe");
    sessionStorage.removeItem("msrpDiscordUserSession");
    if (window.location.hash in panelTargets) {
      window.location.hash = "#home";
    }
    renderDashboard();
    updatePanelSectionVisibility();
};

if (signoutButton) {
  signoutButton.addEventListener("click", handleSignout);
}

signoutButtons.forEach((button) => {
  button.addEventListener("click", handleSignout);
});

document.querySelectorAll("[data-tool-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const type = form.getAttribute("data-tool-form");
    let message = "";

    if (type === "infraction") {
      message = `${formData.get("action")} saved for ${formData.get("member")} - ${formData.get("reason")}`;
    }

    if (type === "promo") {
      message = `Promotion logged for ${formData.get("member")} to ${formData.get("rank")}`;
    }

    if (type === "key") {
      message = `Key created for ${formData.get("label")}: ${randomCode("MSRPKEY")}`;
    }

    if (type === "code") {
      message = `Join code created for ${formData.get("label")}: ${randomCode("MSRPCODE")}`;
    }

    if (type === "command-code") {
      message = `Command panel code created for ${formData.get("label")}: ${randomCode("ERLCCMD")}`;
    }

    if (type === "erlc-command") {
      message = `ER:LC ${formData.get("command")} queued for ${formData.get("player")} - ${formData.get("reason")} (API key required for live send)`;
    }

    if (type === "chat") {
      message = `${currentDiscordUser()}: ${formData.get("message")}`;
      pushChat(message);
    }

    pushOutput(message);

    form.reset();
  });
});

window.addEventListener("hashchange", updatePanelSectionVisibility);
renderOwnerCodes();
hydrateRememberedUser();
syncRoleFromDiscordAuth();
renderDashboard();
updatePanelSectionVisibility();
