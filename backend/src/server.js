import express from "express";
import { config } from "./config.js";
import { createCode, getAllCodes, getCode, removeCode } from "./code-store.js";
import { getHighestRole } from "./role-utils.js";

const app = express();
app.use(express.json());

function requireConfig(values) {
  return values.every(Boolean);
}

function buildDiscordAuthUrl() {
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    redirect_uri: config.redirectUri,
    scope: "identify guilds guilds.members.read"
  });

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

function buildFrontendRedirect(payload) {
  const url = new URL(config.frontendUrl);
  Object.entries(payload).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/auth/discord", (_req, res) => {
  if (!requireConfig([config.clientId, config.clientSecret, config.redirectUri])) {
    res.status(500).json({ error: "OAuth config is incomplete." });
    return;
  }

  res.redirect(buildDiscordAuthUrl());
});

app.get("/auth/discord/callback", async (req, res) => {
  const code = req.query.code;

  if (!code || typeof code !== "string") {
    res.status(400).json({ error: "Missing OAuth code." });
    return;
  }

  if (!requireConfig([config.clientId, config.clientSecret, config.redirectUri, config.guildId])) {
    res.status(500).json({ error: "OAuth or guild config is incomplete." });
    return;
  }

  try {
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: config.redirectUri
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      res.status(401).json({ error: "Discord token exchange failed.", details: tokenData });
      return;
    }

    const accessToken = tokenData.access_token;

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const user = await userResponse.json();

    const memberResponse = await fetch(
      `https://discord.com/api/users/@me/guilds/${config.guildId}/member`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    const member = await memberResponse.json();

    if (!memberResponse.ok || !member.roles) {
      res.status(403).json({
        error: "User is not in the configured guild or membership access is unavailable.",
        details: member
      });
      return;
    }

    const fakeMember = {
      roles: {
        cache: new Map(member.roles.map((roleId) => [roleId, { id: roleId }]))
      }
    };

    const highestRole = getHighestRole(fakeMember);

    res.redirect(
      buildFrontendRedirect({
        auth: "success",
        discord_user: user.username,
        discord_role: highestRole
      })
    );
  } catch (error) {
    res.redirect(
      buildFrontendRedirect({
        auth: "error",
        message: error instanceof Error ? error.message : String(error)
      })
    );
  }
});

app.get("/api/codes", (_req, res) => {
  res.json(getAllCodes());
});

app.post("/api/codes", (req, res) => {
  const { code, role, createdBy = "api" } = req.body;

  if (!code || !role) {
    res.status(400).json({ error: "code and role are required" });
    return;
  }

  const created = createCode(code, role, createdBy);
  res.json({ code: created, role });
});

app.delete("/api/codes/:code", (req, res) => {
  removeCode(req.params.code);
  res.json({ removed: req.params.code.toUpperCase() });
});

app.post("/api/auth/code", (req, res) => {
  const { code } = req.body;
  const match = getCode(code || "");

  if (!match) {
    res.status(403).json({ ok: false, error: "Invalid code." });
    return;
  }

  res.json({ ok: true, role: match.role });
});

app.listen(3001, () => {
  console.log("Backend listening on http://localhost:3001");
  console.log(`Configured guild: ${config.guildId || "missing"}`);
});
