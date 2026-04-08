const loginPage = document.querySelector("#login-page");
const publicSupportPage = document.querySelector("#public-support-page");
const dashboardPage = document.querySelector("#dashboard-page");
const loginForm = document.querySelector("#portal-login-form");
const signoutButton = document.querySelector("#portal-signout");
const rememberCheckbox = document.querySelector("#portal-remember");
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
const manageCodeForm = document.querySelector("#manage-code-form");
const ownerCodeForm = document.querySelector("#owner-code-form");
const deleteCodeForm = document.querySelector("#delete-code-form");
const commandForm = document.querySelector("#command-form");
const supportForm = document.querySelector("#support-form");
const supportAnswerForm = document.querySelector("#support-answer-form");
const publicSupportForm = document.querySelector("#public-support-form");
const publicSupportFormSecondary = document.querySelector("#public-support-form-secondary");
const infractionNote = document.querySelector("#infraction-note");
const promotionNote = document.querySelector("#promotion-note");
const shrCodeTable = document.querySelector("#shr-code-table");
const ownerCodeTable = document.querySelector("#owner-code-table");
const founderCodeTable = document.querySelector("#founder-code-table");
const supportLog = document.querySelector("#support-log");
const publicSupportLog = document.querySelector("#public-support-log");
const publicSupportLogSecondary = document.querySelector("#public-support-log-secondary");
const discordUserOptions = document.querySelector("#discord-user-options");
const tabButtons = document.querySelectorAll("[data-tab-target]");
const codeEditorPanel = document.querySelector("#code-editor-panel");
const codeEditorSummary = document.querySelector("#code-editor-summary");
const codeEditorForm = document.querySelector("#code-editor-form");
const editorCodeDisplay = document.querySelector("#editor-code-display");
const editorCodeLabel = document.querySelector("#editor-code-label");
const editorCodeRole = document.querySelector("#editor-code-role");
const editorCodeInfract = document.querySelector("#editor-code-infract");
const editorCodePromote = document.querySelector("#editor-code-promote");
const editorDeleteButton = document.querySelector("#editor-delete-code");
const editorCloseButton = document.querySelector("#editor-close");

const roleOrder = ["staff", "hr", "shr", "owner", "founder"];
const roleNames = {
  staff: "Staff Panel",
  hr: "HR Panel",
  shr: "SHR Panel",
  owner: "Owner Panel",
  founder: "Founder Panel"
};

let activeEditorCode = null;

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
  support: "staff",
  shr: "shr",
  command: "shr",
  owner: "owner",
  founder: "founder",
  channel: "staff"
};

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

const getRememberedLogin = () => JSON.parse(localStorage.getItem("msrpPortalRememberedLogin") || "null");

const saveRememberedLogin = (login) => {
  localStorage.setItem("msrpPortalRememberedLogin", JSON.stringify(login));
};

const clearRememberedLogin = () => {
  localStorage.removeItem("msrpPortalRememberedLogin");
};

const canAccess = (currentRole, minimumRole) =>
  roleOrder.indexOf(currentRole) >= roleOrder.indexOf(minimumRole);

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[character];
  });

const randomCode = (prefix) =>
  `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

const pushChat = (message) => {
  const chat = JSON.parse(localStorage.getItem("msrpPortalChat") || "[]");
  chat.unshift(message);
  localStorage.setItem("msrpPortalChat", JSON.stringify(chat.slice(0, 80)));
  renderChat();
};

const pushFeed = (title, lines) => {
  const feed = JSON.parse(localStorage.getItem("msrpPortalFeed") || "[]");
  feed.unshift({ title, lines });
  localStorage.setItem("msrpPortalFeed", JSON.stringify(feed.slice(0, 50)));
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
    // Ignore backend errors so the portal still works locally.
  }
};

let userLookupTimer = null;

const fetchDiscordUsers = async (query) => {
  const response = await fetch(`http://localhost:3001/api/discord/members?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.members || [];
};

const renderDiscordUserOptions = (members) => {
  discordUserOptions.innerHTML = members
    .map((member) => {
      const primary = member.globalName
        ? `${member.globalName} (@${member.username})`
        : `@${member.username}`;
      const value = member.globalName ? `${member.globalName} (@${member.username})` : member.username;
      return `<option value="${escapeHtml(value)}" label="${escapeHtml(primary)}"></option>`;
    })
    .join("");
};

const attachDiscordAutocomplete = (input) => {
  if (!input) {
    return;
  }

  input.addEventListener("input", () => {
    const query = input.value.trim();
    clearTimeout(userLookupTimer);

    if (query.length < 2) {
      renderDiscordUserOptions([]);
      return;
    }

    userLookupTimer = setTimeout(async () => {
      const members = await fetchDiscordUsers(query);
      renderDiscordUserOptions(members);
    }, 180);
  });
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

const renderSupportLog = () => {
  const entries = JSON.parse(localStorage.getItem("msrpPortalSupport") || "[]");
  supportLog.innerHTML = entries.length
    ? entries
        .map(
          (entry) =>
            `<div class="code-row"><span>${escapeHtml(entry.user)}</span><span>${escapeHtml(entry.kind || "request").toUpperCase()} | ${escapeHtml(entry.details)} | ${escapeHtml(entry.actor)}</span></div>`
        )
        .join("")
    : `<div class="code-row"><span>No support requests yet.</span><span>Staff can create them here and HR / SHR can answer.</span></div>`;
};

const renderPublicSupportLog = () => {
  const entries = JSON.parse(localStorage.getItem("msrpPortalPublicSupport") || "[]");
  const markup = entries.length
    ? entries
        .map(
          (entry) =>
            `<div class="code-row"><span>${escapeHtml(entry.user)}</span><span>${escapeHtml(entry.reason)}</span></div>`
        )
        .join("")
    : `<div class="code-row"><span>No public reports yet.</span><span>Anyone can send one here without logging in.</span></div>`;

  publicSupportLog.innerHTML = markup;
  if (publicSupportLogSecondary) {
    publicSupportLogSecondary.innerHTML = markup;
  }
};

const syncSessionCode = (updatedCode) => {
  const session = getSession();
  if (!session || session.code !== updatedCode.code) {
    return;
  }

  saveSession({
    ...session,
    role: updatedCode.role,
    canInfract: !!updatedCode.canInfract,
    canPromote: !!updatedCode.canPromote
  });
};

const closeCodeEditor = () => {
  activeEditorCode = null;
  codeEditorPanel.hidden = true;
  codeEditorForm.reset();
  codeEditorSummary.textContent = "Enter a code from the SHR or Owner tools to manage it here.";
};

const openCodeEditor = (codeValue) => {
  const session = getSession();
  if (!session || !canAccess(session.role, "owner")) {
    alert("Only Owner or Founder access can manage codes this way.");
    return;
  }

  const found = getCodes().find((entry) => entry.code === codeValue.trim().toUpperCase());
  if (!found) {
    alert("That code was not found.");
    return;
  }

  activeEditorCode = found.code;
  editorCodeDisplay.value = found.code;
  editorCodeLabel.value = found.label;
  editorCodeRole.value = found.role;
  editorCodeInfract.checked = !!found.canInfract;
  editorCodePromote.checked = !!found.canPromote;
  codeEditorSummary.textContent = `${found.code} is open. Choose promo access, infraction access, move it to SHR / Owner / Founder, or delete it.`;
  codeEditorPanel.hidden = false;
  codeEditorPanel.scrollIntoView({ behavior: "smooth", block: "start" });
};

const canDeleteCode = (session, codeEntry) => {
  if (!session || !codeEntry || !canAccess(session.role, "owner")) {
    return false;
  }

  if (session.role === "founder") {
    return true;
  }

  return codeEntry.role !== "founder";
};

const renderCodeTables = () => {
  const codes = getCodes();
  const session = getSession();
  const row = (entry) =>
    `<div class="code-row"><span>${entry.label}</span><span>${entry.code} • ${entry.role.toUpperCase()} • I:${entry.canInfract ? "Y" : "N"} • P:${entry.canPromote ? "Y" : "N"}</span></div>`;

  shrCodeTable.innerHTML = codes.map(row).join("");
  ownerCodeTable.innerHTML = session && canAccess(session.role, "owner")
    ? codes.map(row).join("")
    : `<div class="code-row"><span>Owner-only code list</span><span>Locked</span></div>`;
};

const renderManagedCodeTables = () => {
  const codes = getCodes();
  const session = getSession();
  const row = (entry) => {
    const actions = session && canAccess(session.role, "owner")
      ? `<div class="code-row-actions"><button type="button" class="secondary-button" data-edit-code="${escapeHtml(entry.code)}">Manage</button></div>`
      : "";
    return `<div class="code-row"><span>${escapeHtml(entry.label)}</span><span>${escapeHtml(entry.code)} | ${entry.role.toUpperCase()} | I:${entry.canInfract ? "Y" : "N"} | P:${entry.canPromote ? "Y" : "N"}</span>${actions}</div>`;
  };

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

const renderPortal = () => {
  const session = getSession();

  if (!session) {
    loginPage.hidden = false;
    publicSupportPage.hidden = false;
    dashboardPage.hidden = true;
    closeCodeEditor();
    renderPublicSupportLog();
    return;
  }

  loginPage.hidden = true;
  publicSupportPage.hidden = false;
  dashboardPage.hidden = false;
  roleTitle.textContent = roleNames[session.role] || "Staff Portal";
  userLine.textContent = `${session.username} signed in with ${session.role.toUpperCase()} access.`;
  updatePermissionNotes(session);

  tabButtons.forEach((button) => {
    const tab = button.getAttribute("data-tab-target");
    if (tab) {
      button.hidden = !canAccess(session.role, tabRequirements[tab]);
    }
  });

  if (supportAnswerForm) {
    supportAnswerForm.hidden = !canAccess(session.role, "hr");
  }

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
  renderSupportLog();
  renderManagedCodeTables();
};

const loadRememberedLogin = () => {
  const remembered = getRememberedLogin();
  if (!remembered) {
    return;
  }

  document.querySelector("#portal-username").value = remembered.username || "";
  document.querySelector("#portal-password").value = remembered.password || "";
  document.querySelector("#portal-code").value = remembered.code || "";
  rememberCheckbox.checked = true;
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
    code: found.code,
    role: found.role,
    canInfract: !!found.canInfract,
    canPromote: !!found.canPromote
  });

  if (rememberCheckbox.checked) {
    saveRememberedLogin({ username, password, code });
  } else {
    clearRememberedLogin();
  }
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
    `Issued by ${session.username} on behalf of Michigan State Roleplay`
  ]);

  await postDiscordLog({
    type: "infraction",
    user,
    action: type,
    reason,
    notes,
    actor: session.username,
    actorRole: session.role
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
    `Issued by ${session.username} on behalf of Michigan State Roleplay`
  ]);

  await postDiscordLog({
    type: "promotion",
    user,
    rank,
    notes,
    actor: session.username,
    actorRole: session.role
  });

  promotionForm.reset();
});

createCodeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const session = getSession();
  if (!canAccess(session.role, "shr")) {
    return;
  }

  const label = document.querySelector("#new-code-label").value.trim();
  const role = document.querySelector("#new-code-rank").value;
  const canInfract = document.querySelector("#new-code-infract").checked;
  const canPromote = document.querySelector("#new-code-promote").checked;
  const codes = getCodes();

  codes.push({ code: randomCode("MSRP"), role, label, canInfract, canPromote });
  saveCodes(codes);
  renderManagedCodeTables();
  createCodeForm.reset();
});

promoteCodeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const session = getSession();
  if (!canAccess(session.role, "shr")) {
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
  syncSessionCode(found);
  renderPortal();
  promoteCodeForm.reset();
});

manageCodeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  openCodeEditor(document.querySelector("#manage-code-value").value);
  manageCodeForm.reset();
});

ownerCodeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const session = getSession();
  if (!canAccess(session.role, "owner")) {
    return;
  }

  const label = document.querySelector("#owner-code-label").value.trim();
  const role = document.querySelector("#owner-code-rank").value;
  const canInfract = document.querySelector("#owner-code-infract").checked;
  const canPromote = document.querySelector("#owner-code-promote").checked;
  const codes = getCodes();

  codes.push({ code: randomCode("MSRP"), role, label, canInfract, canPromote });
  saveCodes(codes);
  renderManagedCodeTables();
  ownerCodeForm.reset();
});

deleteCodeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const session = getSession();
  if (!canAccess(session.role, "owner")) {
    return;
  }

  const code = document.querySelector("#delete-code-value").value.trim().toUpperCase();
  const codes = getCodes();
  const found = codes.find((entry) => entry.code === code);
  if (!found) {
    alert("That code was not found.");
    return;
  }

  if (!canDeleteCode(session, found)) {
    alert("Owner cannot delete founder codes.");
    return;
  }

  saveCodes(codes.filter((entry) => entry.code !== code));
  if (session.code === code) {
    clearSession();
  }
  closeCodeEditor();
  renderPortal();
  deleteCodeForm.reset();
});

codeEditorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const session = getSession();
  if (!session || !canAccess(session.role, "owner")) {
    return;
  }

  const codes = getCodes();
  const found = codes.find((entry) => entry.code === activeEditorCode);
  if (!found) {
    alert("That code no longer exists.");
    closeCodeEditor();
    renderPortal();
    return;
  }

  found.label = editorCodeLabel.value.trim() || found.label;
  found.role = editorCodeRole.value;
  found.canInfract = editorCodeInfract.checked;
  found.canPromote = editorCodePromote.checked;
  saveCodes(codes);
  syncSessionCode(found);
  renderPortal();
  openCodeEditor(found.code);
});

editorDeleteButton.addEventListener("click", () => {
  const session = getSession();
  if (!session || !canAccess(session.role, "owner") || !activeEditorCode) {
    return;
  }

  const codes = getCodes();
  const found = codes.find((entry) => entry.code === activeEditorCode);
  if (!found) {
    closeCodeEditor();
    renderPortal();
    return;
  }

  if (!canDeleteCode(session, found)) {
    alert("Owner cannot delete founder codes.");
    return;
  }

  saveCodes(codes.filter((entry) => entry.code !== activeEditorCode));
  if (session.code === activeEditorCode) {
    clearSession();
  }
  closeCodeEditor();
  renderPortal();
});

editorCloseButton.addEventListener("click", () => {
  closeCodeEditor();
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-edit-code]");
  if (!target) {
    return;
  }

  openCodeEditor(target.getAttribute("data-edit-code") || "");
});

supportForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const session = getSession();
  if (!session || !canAccess(session.role, "staff")) {
    return;
  }

  const user = document.querySelector("#support-user").value.trim();
  const details = document.querySelector("#support-details").value.trim();
  const entries = JSON.parse(localStorage.getItem("msrpPortalSupport") || "[]");

  entries.unshift({
    user,
    details,
    actor: session.username,
    kind: "request"
  });

  localStorage.setItem("msrpPortalSupport", JSON.stringify(entries.slice(0, 40)));
  renderSupportLog();
  supportForm.reset();
});

supportAnswerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const session = getSession();
  if (!session || !canAccess(session.role, "hr")) {
    return;
  }

  const user = document.querySelector("#support-answer-user").value.trim();
  const details = document.querySelector("#support-answer-details").value.trim();
  const entries = JSON.parse(localStorage.getItem("msrpPortalSupport") || "[]");

  entries.unshift({
    user,
    details,
    actor: session.username,
    kind: "answer"
  });

  localStorage.setItem("msrpPortalSupport", JSON.stringify(entries.slice(0, 40)));
  renderSupportLog();
  supportAnswerForm.reset();
});

publicSupportForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const user = document.querySelector("#public-support-user").value.trim();
  const reason = document.querySelector("#public-support-reason").value.trim();
  const entries = JSON.parse(localStorage.getItem("msrpPortalPublicSupport") || "[]");

  entries.unshift({ user, reason });
  localStorage.setItem("msrpPortalPublicSupport", JSON.stringify(entries.slice(0, 40)));
  renderPublicSupportLog();

  await postDiscordLog({
    type: "support",
    user,
    reason,
    actor: "Public Support Form",
    actorRole: "public"
  });

  publicSupportForm.reset();
});

publicSupportFormSecondary.addEventListener("submit", async (event) => {
  event.preventDefault();
  const user = document.querySelector("#public-support-user-secondary").value.trim();
  const reason = document.querySelector("#public-support-reason-secondary").value.trim();
  const entries = JSON.parse(localStorage.getItem("msrpPortalPublicSupport") || "[]");

  entries.unshift({ user, reason });
  localStorage.setItem("msrpPortalPublicSupport", JSON.stringify(entries.slice(0, 40)));
  renderPublicSupportLog();

  await postDiscordLog({
    type: "support",
    user,
    reason,
    actor: "Public Support Form",
    actorRole: "public"
  });

  publicSupportFormSecondary.reset();
});

commandForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const session = getSession();
  if (!canAccess(session.role, "shr")) {
    return;
  }

  const action = document.querySelector("#command-type").value;
  const user = document.querySelector("#command-user").value.trim();
  const reason = document.querySelector("#command-reason").value.trim();

  pushFeed("COMMAND PANEL", [
    `${action} prepared for ${user}.`,
    `Reason: ${reason}`,
    `Queued by ${session.username} on behalf of Michigan State Roleplay`
  ]);

  commandForm.reset();
});

loadRememberedLogin();
[
  document.querySelector("#infraction-user"),
  document.querySelector("#promotion-user"),
  document.querySelector("#public-support-user"),
  document.querySelector("#public-support-user-secondary")
].forEach(attachDiscordAutocomplete);
renderPortal();
