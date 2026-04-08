import {
  ChannelType,
  Client,
  GatewayIntentBits,
  Partials,
  PermissionFlagsBits
} from "discord.js";
import { config } from "./config.js";
import { createCode, removeCode } from "./code-store.js";
import { getHighestRole, hasMinimumRole } from "./role-utils.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

async function sendToChannel(channelId, content) {
  if (!channelId) {
    return;
  }

  const channel = await client.channels.fetch(channelId);
  if (channel && channel.type === ChannelType.GuildText) {
    await channel.send(content);
  }
}

async function dmUser(user, content) {
  try {
    await user.send(content);
  } catch {
    // Ignore DM failures.
  }
}

client.once("ready", async () => {
  console.log(`Bot ready as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand() || !interaction.inGuild()) {
    return;
  }

  const member = interaction.member;
  const actorRole = getHighestRole(member);

  if (interaction.commandName === "staffsay") {
    if (!hasMinimumRole(actorRole, "staff")) {
      await interaction.reply({ content: "You need Staff access.", ephemeral: true });
      return;
    }

    const message = interaction.options.getString("message", true);
    await sendToChannel(config.channels.staff, `**Staff Channel**\n${interaction.user.tag}: ${message}`);
    await interaction.reply({ content: "Posted to staff channel.", ephemeral: true });
    return;
  }

  if (interaction.commandName === "infractions") {
    if (!hasMinimumRole(actorRole, "hr")) {
      await interaction.reply({ content: "You need HR / IA Max access.", ephemeral: true });
      return;
    }

    const user = interaction.options.getUser("user", true);
    const action = interaction.options.getString("action", true);
    const reason = interaction.options.getString("reason", true);
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    const targetRole = member ? getHighestRole(member) : "member";
    const log =
      `**${action.toUpperCase()}** for ${user.tag}\n` +
      `Reason: ${reason}\n` +
      `Target Role: ${targetRole}\n` +
      `By: ${interaction.user.tag}\n` +
      `Actor Role: ${actorRole}`;

    await sendToChannel(config.channels.infractions, log);
    await sendToChannel(config.channels.discordLogs, log);
    await dmUser(user, `You received a ${action} in Michigan State Roleplay.\nReason: ${reason}`);
    await interaction.reply({ content: `Logged ${action} for ${user.tag}.`, ephemeral: true });
    return;
  }

  if (interaction.commandName === "promo") {
    if (!hasMinimumRole(actorRole, "hr")) {
      await interaction.reply({ content: "You need HR / IA Max access.", ephemeral: true });
      return;
    }

    const user = interaction.options.getUser("user", true);
    const rank = interaction.options.getString("rank", true);
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    const targetRole = member ? getHighestRole(member) : "member";
    const message =
      `**PROMOTION** ${user.tag} -> ${rank}\n` +
      `Current Role: ${targetRole}\n` +
      `By: ${interaction.user.tag}\n` +
      `Actor Role: ${actorRole}`;
    await sendToChannel(config.channels.discordLogs, message);
    await dmUser(user, `You were promoted to ${rank} in Michigan State Roleplay.`);
    await interaction.reply({ content: `Promotion logged for ${user.tag}.`, ephemeral: true });
    return;
  }

  if (interaction.commandName === "createcode") {
    if (!hasMinimumRole(actorRole, "shr")) {
      await interaction.reply({ content: "You need SHR access.", ephemeral: true });
      return;
    }

    const code = interaction.options.getString("code", true);
    const role = interaction.options.getString("role", true);
    createCode(code, role, interaction.user.tag);
    await interaction.reply({ content: `Code ${code.toUpperCase()} created for ${role}.`, ephemeral: true });
    return;
  }

  if (interaction.commandName === "removecode") {
    if (!hasMinimumRole(actorRole, "founder")) {
      await interaction.reply({ content: "Only Founder can remove codes.", ephemeral: true });
      return;
    }

    const code = interaction.options.getString("code", true);
    removeCode(code);
    await interaction.reply({ content: `Code ${code.toUpperCase()} removed.`, ephemeral: true });
  }
});

client.login(config.botToken);
