const loginPage = document.querySelector("#login-page");
const dashboardPage = document.querySelector("#dashboard-page");
const loginForm = document.querySelector("#portal-login-form");
const signoutButton = document.querySelector("#portal-signout");
const roleTitle = document.querySelector("#portal-role-title");
const userLine = document.querySelector("#portal-user-line");
const staffChatWindow = document.querySelector("#staff-chat-window");
const staffChatForm = document.querySelector("#staff-chat-form");
const staffChatInput = document.querySelector("#staff-chat-input");
const channelFeed = document.querySelector("#channel-feed");
const infractionForm = document.querySelector("#infraction-form");
const promotionForm = document.querySelector("#promotion-form");
const createCodeForm = document.querySelector("#create-code-form");
const promoteCodeForm = document.querySelector("#promote-code-form");
const ownerCodeForm = document.querySelector("#owner-code-form");
const deleteCodeForm = document.querySelector("#delete-code-form");
const shrCodeTable = document.querySelector("#shr-code-table");
const ownerCodeTable = document.querySelector("#owner-code-table");
const tabButtons = document.querySelectorAll("[data-tab-target]");

const roleOrder = ["staff", "hr", "shr", "owner"];
const roleNames = {
  staff: "Staff Panel",
  hr: "HR Panel",
  shr: "SHR Panel",
  owner: "Owner Panel"
};

const defaultCodes = [
  { code: "STAFF-ENTRY-7421", role: "staff", label: "Staff Base" },
  { code: "HR-ALPHA-5512", role: "hr", label: "HR Base" },
  { code: "SHR-PRIME-9084", role: "shr", label: "SHR Base" },
  { code: "OWNER-ALPHA-4401", role: "owner", label: "Owner Alpha" },
  { code: "OWNER-BRAVO-5512", role: "owner", label: "Owner Bravo" },
  { code: "OWNER-CHARLIE-6623", role: "owner", label: "Owner Charlie" },
  { code: "OWNER-DELTA-7734", role: "owner", label: "Owner Delta" },
  { code: "OWNER-ECHO-8845", role: "owner", label: "Owner Echo" }
];

const getCodes = () =>
  JSON.parse(localStorage.getItem("msrpPortalCodes") || JSON.stringify(defaultCodes));

const saveCodes = (codes) => {
  localStorage.setItem("msrpPortalCodes", JSON.stringify(codes));
};

const getSession = () => JSON.parse(localStorage.getItem("msrpPortalSession") || "null");

const saveSession = (session) => {
  localStorage.setItem("msrpPortalSession", JSON.stringify(session));
};

const clearSession = () => {
  localStorage.removeItem("msrpPortalSession");
};

const canAccess = (currentRole, minimumRole) =>
  roleOrder.indexOf(currentRole) >= roleOrder.indexOf(minimumRole);

const randomCode = (prefix) =>
  `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

const pushChat = (message) => {
  const chat = JSON.parse(localStorage.getItem("msrpPortalChat") || "[]");
  chat.unshift(message);
  localStorage.setItem("msrpPortalChat", JSON.stringify(chat.slice(0, 60)));
  renderChat();
};

const pushFeed = (title, lines) => {
  const feed = JSON.parse(localStorage.getItem("msrpPortalFeed") || "[]");
  feed.unshift({ title, lines });
  localStorage.setItem("msrpPortalFeed", JSON.stringify(feed.slice(0, 30)));
  renderFeed();
};

const renderChat = () => {
  const chat = JSON.parse(localStorage.getItem("msrpPortalChat") || "[]");
  staffChatWindow.innerHTML = chat.length
    ? chat.map((entry) => `<div class="chat-message">${entry}</div>`).join("")
    : `<div class="chat-message">No staff messages yet.</div>`;
};

const renderFeed = () => {
  const feed = JSON.parse(localStorage.getItem("msrpPortalFeed") || "[]");
  channelFeed.innerHTML = feed.length
    ? feed
        .map(
          (entry) =>
            `<article class="feed-card"><strong>${entry.title}</strong>${entry.lines
              .map((line) => `<span>${line}</span>`)
              .join("")}</article>`
        )
        .join("")
    : `<article class="feed-card"><strong>Michigan State Roleplay</strong><span>No infractions or promotions logged yet.</span></article>`;
};

const renderCodeTables = () => {
  const codes = getCodes();
  const session = getSession();

  shrCodeTable.innerHTML = codes
    .filter((entry) => ["staff", "hr", "shr"].includes(entry.role))
    .map((entry) => `<div class="code-row"><span>${entry.label}</span><span>${entry.code} • ${entry.role.toUpperCase()}</span></div>`)
    .join("");

  ownerCodeTable.innerHTML = session && session.role === "owner"
    ? codes
        .map((entry) => `<div class="code-row"><span>${entry.label}</span><span>${entry.code} • ${entry.role.toUpperCase()}</span></div>`)
        .join("")
    : `<div class="code-row"><span>Owner-only code list</span><span>Locked</span></div>`;
};

const showTab = (tab) => {
  const session = getSession();
  document.querySelectorAll("[data-tab]").forEach((panel) => {
    const name = panel.getAttribute("data-tab");
    const requirements = {
      staff: "staff",
      hr: "hr",
      shr: "shr",
      owner: "owner",
      channel: "staff"
    };
    const allowed = session && canAccess(session.role, requirements[name]);
    panel.hidden = name !== tab || !allowed;
  });
};

const renderPortal = () => {
  const session = getSession();

  if (!session) {
    loginPage.hidden = false;
    dashboardPage.hidden = true;
    return;
  }

  loginPage.hidden = true;
  dashboardPage.hidden = false;
  roleTitle.textContent = roleNames[session.role] || "Staff Portal";
  userLine.textContent = `${session.username} signed in with ${session.role.toUpperCase()} access.`;

  tabButtons.forEach((button) => {
    const tab = button.getAttribute("data-tab-target");
    if (!tab) {
      return;
    }

    const requirements = {
      staff: "staff",
      hr: "hr",
      shr: "shr",
      owner: "owner",
      channel: "staff"
    };

    button.hidden = !canAccess(session.role, requirements[tab]);
  });

  const defaultTab = canAccess(session.role, "owner")
    ? "owner"
    : canAccess(session.role, "shr")
      ? "shr"
      : canAccess(session.role, "hr")
        ? "hr"
        : "staff";

  showTab(defaultTab);
  renderChat();
  renderFeed();
  renderCodeTables();
};

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = document.querySelector("#portal-username").value.trim();
  const password = document.querySelector("#portal-password").value.trim();
  const code = document.querySelector("#portal-code").value.trim().toUpperCase();
  const found = getCodes().find((entry) => entry.code === code);

  if (!username || !password || !found) {
    alert("Invalid username, password, or code.");
    return;
  }

  saveSession({ username, role: found.role });
  renderPortal();
});

signoutButton.addEventListener("click", () => {
  clearSession();
  renderPortal();
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.getAttribute("data-tab-target");
    if (target) {
      showTab(target);
    }
  });
});

staffChatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const session = getSession();
  pushChat(`${session.username}: ${staffChatInput.value.trim()}`);
  staffChatForm.reset();
});

infractionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const session = getSession();
  const user = document.querySelector("#infraction-user").value.trim();
  const type = document.querySelector("#infraction-type").value;
  const reason = document.querySelector("#infraction-reason").value.trim();
  const notes = document.querySelector("#infraction-notes").value.trim();

  pushFeed("INFRACTION", [
    `Reason for ${type.toLowerCase()}: ${reason}`,
    `Notes: ${notes}`,
    `Issued by ${session.username} on behalf of Michigan State Roleplay`
  ]);

  infractionForm.reset();
});

promotionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const session = getSession();
  const user = document.querySelector("#promotion-user").value.trim();
  const rank = document.querySelector("#promotion-rank").value.trim();
  const notes = document.querySelector("#promotion-notes").value.trim();

  pushFeed("PROMOTION", [
    `${user} has been promoted to ${rank}.`,
    `Notes: ${notes}`,
    `Issued by ${session.username} on behalf of Michigan State Roleplay`
  ]);

  promotionForm.reset();
});

createCodeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const session = getSession();
  const label = document.querySelector("#new-code-label").value.trim();
  const role = document.querySelector("#new-code-rank").value;
  const codes = getCodes();

  if (!canAccess(session.role, "shr")) {
    return;
  }

  codes.push({ code: randomCode("MSRP"), role, label });
  saveCodes(codes);
  renderCodeTables();
  createCodeForm.reset();
});

promoteCodeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const session = getSession();
  const code = document.querySelector("#existing-code").value.trim().toUpperCase();
  const newRole = document.querySelector("#promote-code-rank").value;
  const codes = getCodes();
  const found = codes.find((entry) => entry.code === code);

  if (!found || !canAccess(session.role, "shr")) {
    return;
  }

  found.role = newRole;
  saveCodes(codes);
  renderCodeTables();
  promoteCodeForm.reset();
});

ownerCodeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const session = getSession();
  const label = document.querySelector("#owner-code-label").value.trim();
  const role = document.querySelector("#owner-code-rank").value;
  const codes = getCodes();

  if (!canAccess(session.role, "owner")) {
    return;
  }

  codes.push({ code: randomCode("MSRP"), role, label });
  saveCodes(codes);
  renderCodeTables();
  ownerCodeForm.reset();
});

deleteCodeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const session = getSession();
  const code = document.querySelector("#delete-code-value").value.trim().toUpperCase();

  if (!canAccess(session.role, "owner")) {
    return;
  }

  saveCodes(getCodes().filter((entry) => entry.code !== code));
  renderCodeTables();
  deleteCodeForm.reset();
});

renderPortal();
