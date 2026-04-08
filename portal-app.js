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
const commandForm = document.querySelector("#command-form");
const infractionNote = document.querySelector("#infraction-note");
const promotionNote = document.querySelector("#promotion-note");
const shrCodeTable = document.querySelector("#shr-code-table");
const ownerCodeTable = document.querySelector("#owner-code-table");
const founderCodeTable = document.querySelector("#founder-code-table");
const tabButtons = document.querySelectorAll("[data-tab-target]");

const roleOrder = ["staff", "hr", "shr", "owner", "founder"];
const roleNames = {
  staff: "Staff Panel",
  hr: "HR Panel",
  shr: "SHR Panel",
  owner: "Owner Panel",
  founder: "Founder Panel"
};

const defaultCodes = [
  { code: "STAFF-ENTRY-7421", role: "staff", label: "Staff Base", canInfract: false, canPromote: false },
  { code: "HR-ALPHA-5512", role: "hr", label: "HR Base", canInfract: false, canPromote: false },
  { code: "SHR-PRIME-9084", role: "shr", label: "SHR Base", canInfract: true, canPromote: true },
  { code: "OWNER-ALPHA-4401", role: "owner", label: "Owner Alpha", canInfract: true, canPromote: true },
  { code: "OWNER-BRAVO-5512", role: "owner", label: "Owner Bravo", canInfract: true, canPromote: true },
  { code: "OWNER-CHARLIE-6623", role: "owner", label: "Owner Charlie", canInfract: true, canPromote: true },
  { code: "FOUNDER-WIST-9001", role: "founder", label: "Founder Wist", canInfract: true, canPromote: true },
  { code: "FOUNDER-MSRP-9222", role: "founder", label: "Founder MSRP", canInfract: true, canPromote: true },
  { code: "FOUNDER-PRIME-7311", role: "founder", label: "Founder Prime", canInfract: true, canPromote: true },
  { code: "FOUNDER-OMEGA-6184", role: "founder", label: "Founder Omega", canInfract: true, canPromote: true }
];

const tabRequirements = {
  staff: "staff",
  hr: "hr",
  shr: "shr",
  command: "shr",
  owner: "owner",
  founder: "founder",
  channel: "staff"
};

const readJson = (key, fallback) => {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
};

const getCodes = () => readJson("msrpPortalCodes", defaultCodes);
const saveCodes = (codes) => localStorage.setItem("msrpPortalCodes", JSON.stringify(codes));
const getSession = () => readJson("msrpPortalSession", null);
const saveSession = (session) => localStorage.setItem("msrpPortalSession", JSON.stringify(session));
const clearSession = () => localStorage.removeItem("msrpPortalSession");

const canAccess = (currentRole, minimumRole) =>
  roleOrder.indexOf(currentRole) >= roleOrder.indexOf(minimumRole);

const randomCode = (prefix) =>
  `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

const pushChat = (message) => {
  const chat = readJson("msrpPortalChat", []);
  chat.unshift(message);
  localStorage.setItem("msrpPortalChat", JSON.stringify(chat.slice(0, 80)));
  renderChat();
};

const pushFeed = (title, lines) => {
  const feed = readJson("msrpPortalFeed", []);
  feed.unshift({ title, lines });
  localStorage.setItem("msrpPortalFeed", JSON.stringify(feed.slice(0, 60)));
  renderFeed();
};

const postDiscordLog = async (payload) => {
  try {
    await fetch("http://localhost:3001/api/discord/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch {
    // Keep the portal usable even when the backend is offline.
  }
};

const renderChat = () => {
  const chat = readJson("msrpPortalChat", []);
  staffChatWindow.innerHTML = chat.length
    ? chat.map((entry) => `<div class="chat-message">${entry}</div>`).join("")
    : `<div class="chat-message">No staff messages yet.</div>`;
};

const renderFeed = () => {
  const feed = readJson("msrpPortalFeed", []);
  channelFeed.innerHTML = feed.length
    ? feed
        .map(
          (entry) =>
            `<article class="feed-card"><strong>${entry.title}</strong>${entry.lines
              .map((line) => `<span>${line}</span>`)
              .join("")}</article>`
        )
        .join("")
    : `<article class="feed-card"><strong>Michigan State Roleplay</strong><span>No infractions, promotions, or command actions logged yet.</span></article>`;
};

const renderCodeTables = () => {
  const codes = getCodes();
  const session = getSession();
  const row = (entry) =>
    `<div class="code-row"><span>${entry.label}</span><span>${entry.code} | ${entry.role.toUpperCase()} | Infract: ${entry.canInfract ? "Yes" : "No"} | Promote: ${entry.canPromote ? "Yes" : "No"}</span></div>`;

  shrCodeTable.innerHTML = codes.map(row).join("");
  ownerCodeTable.innerHTML = session && canAccess(session.role, "owner")
    ? codes.map(row).join("")
    : `<div class="code-row"><span>Owner-only code list</span><span>Locked</span></div>`;
  founderCodeTable.innerHTML = session && canAccess(session.role, "founder")
    ? codes.map(row).join("")
    : `<div class="code-row"><span>Founder-only code list</span><span>Locked</span></div>`;
};

const showTab = (tab) => {
  const session = getSession();
  document.querySelectorAll("[data-tab]").forEach((panel) => {
    const name = panel.getAttribute("data-tab");
    const requirement = tabRequirements[name];
    const allowed = session && canAccess(session.role, requirement);
    panel.hidden = name !== tab || !allowed;
  });
};

const updatePermissionNotes = (session) => {
  infractionNote.textContent = session.canInfract
    ? "This code allows infractions."
    : "This code does not allow infractions.";
  promotionNote.textContent = session.canPromote
    ? "This code allows promotions."
    : "This code does not allow promotions.";
};

const getDefaultTab = (session) => {
  if (canAccess(session.role, "founder")) {
    return "founder";
  }

  if (canAccess(session.role, "owner")) {
    return "owner";
  }

  if (canAccess(session.role, "shr")) {
    return "shr";
  }

  if (canAccess(session.role, "hr")) {
    return "hr";
  }

  return "staff";
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
  roleTitle.textContent = roleNames[session.role] || "Staff Panel";
  userLine.textContent = `${session.username} signed in with ${session.role.toUpperCase()} access.`;
  updatePermissionNotes(session);

  tabButtons.forEach((button) => {
    const tab = button.getAttribute("data-tab-target");
    button.hidden = !canAccess(session.role, tabRequirements[tab]);
  });

  showTab(getDefaultTab(session));
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

  saveSession({
    username,
    role: found.role,
    canInfract: !!found.canInfract,
    canPromote: !!found.canPromote
  });

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
  const message = staffChatInput.value.trim();

  if (!message) {
    return;
  }

  pushChat(`${session.username}: ${message}`);
  staffChatForm.reset();
});

infractionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const session = getSession();

  if (!session?.canInfract) {
    alert("Your code does not allow infractions.");
    return;
  }

  const user = document.querySelector("#infraction-user").value.trim();
  const type = document.querySelector("#infraction-type").value;
  const reason = document.querySelector("#infraction-reason").value.trim();
  const notes = document.querySelector("#infraction-notes").value.trim();

  pushFeed("INFRACTION", [
    `${user} has been ${type.toLowerCase()}ed.`,
    `Reason: ${reason}`,
    `Notes: ${notes}`,
    `Issued by ${session.username} through Michigan State Roleplay`
  ]);

  await postDiscordLog({
    type: "infraction",
    user,
    action: type,
    reason,
    notes,
    actor: session.username
  });

  infractionForm.reset();
});

promotionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const session = getSession();

  if (!session?.canPromote) {
    alert("Your code does not allow promotions.");
    return;
  }

  const user = document.querySelector("#promotion-user").value.trim();
  const rank = document.querySelector("#promotion-rank").value.trim();
  const notes = document.querySelector("#promotion-notes").value.trim();

  pushFeed("PROMOTION", [
    `${user} has been promoted to ${rank}.`,
    `Notes: ${notes}`,
    `Issued by ${session.username} through Michigan State Roleplay`
  ]);

  await postDiscordLog({
    type: "promotion",
    user,
    rank,
    notes,
    actor: session.username
  });

  promotionForm.reset();
});

createCodeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const session = getSession();

  if (!session || !canAccess(session.role, "shr")) {
    return;
  }

  const label = document.querySelector("#new-code-label").value.trim();
  const role = document.querySelector("#new-code-rank").value;
  const canInfract = document.querySelector("#new-code-infract").checked;
  const canPromote = document.querySelector("#new-code-promote").checked;
  const codes = getCodes();

  codes.push({
    code: randomCode("MSRP"),
    role,
    label,
    canInfract: canAccess(role, "shr") ? true : canInfract,
    canPromote: canAccess(role, "shr") ? true : canPromote
  });

  saveCodes(codes);
  renderCodeTables();
  createCodeForm.reset();
});

promoteCodeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const session = getSession();

  if (!session || !canAccess(session.role, "shr")) {
    return;
  }

  const code = document.querySelector("#existing-code").value.trim().toUpperCase();
  const newRole = document.querySelector("#promote-code-rank").value;
  const codes = getCodes();
  const found = codes.find((entry) => entry.code === code);

  if (!found) {
    alert("That code was not found.");
    return;
  }

  found.role = newRole;
  if (["shr", "owner", "founder"].includes(newRole)) {
    found.canInfract = true;
    found.canPromote = true;
  }

  saveCodes(codes);
  renderCodeTables();
  promoteCodeForm.reset();
});

ownerCodeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const session = getSession();

  if (!session || !canAccess(session.role, "owner")) {
    return;
  }

  const label = document.querySelector("#owner-code-label").value.trim();
  const role = document.querySelector("#owner-code-rank").value;
  const canInfract = document.querySelector("#owner-code-infract").checked;
  const canPromote = document.querySelector("#owner-code-promote").checked;
  const codes = getCodes();

  codes.push({
    code: randomCode("MSRP"),
    role,
    label,
    canInfract: canAccess(role, "shr") ? true : canInfract,
    canPromote: canAccess(role, "shr") ? true : canPromote
  });

  saveCodes(codes);
  renderCodeTables();
  ownerCodeForm.reset();
});

deleteCodeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const session = getSession();

  if (!session || !canAccess(session.role, "owner")) {
    return;
  }

  const code = document.querySelector("#delete-code-value").value.trim().toUpperCase();
  saveCodes(getCodes().filter((entry) => entry.code !== code));
  renderCodeTables();
  deleteCodeForm.reset();
});

commandForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const session = getSession();

  if (!session || !canAccess(session.role, "shr")) {
    return;
  }

  const action = document.querySelector("#command-type").value;
  const user = document.querySelector("#command-user").value.trim();
  const reason = document.querySelector("#command-reason").value.trim();

  pushFeed("COMMAND PANEL", [
    `${action} queued for ${user}.`,
    `Reason: ${reason}`,
    `Queued by ${session.username} through Michigan State Roleplay`
  ]);

  await postDiscordLog({
    type: "command",
    action,
    user,
    reason,
    actor: session.username
  });

  commandForm.reset();
});

renderPortal();
