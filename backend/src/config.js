import dotenv from "dotenv";

dotenv.config();

export const config = {
  botToken: process.env.DISCORD_BOT_TOKEN || "",
  clientId: process.env.DISCORD_CLIENT_ID || "",
  clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
  guildId: process.env.DISCORD_GUILD_ID || "",
  redirectUri: process.env.DISCORD_REDIRECT_URI || "",
  frontendUrl:
    process.env.FRONTEND_URL || "https://thelastgame562-max.github.io/MichiganStaterOLEplaywebs/",
  sessionSecret: process.env.SESSION_SECRET || "",
  roles: {
    staff: process.env.ROLE_STAFF || "",
    hr: process.env.ROLE_HR || "",
    shr: process.env.ROLE_SHR || "",
    owner: process.env.ROLE_OWNER || "",
    founder: process.env.ROLE_FOUNDER || ""
  },
  channels: {
    infractions: process.env.CHANNEL_INFRACTIONS || "",
    staff: process.env.CHANNEL_STAFF || "",
    discordLogs: process.env.CHANNEL_DISCORD_LOGS || ""
  }
};
