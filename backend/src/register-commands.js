import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { config } from "./config.js";

const commands = [
  new SlashCommandBuilder()
    .setName("staffsay")
    .setDescription("Post a message into the private staff channel.")
    .addStringOption((option) =>
      option.setName("message").setDescription("Message to send").setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("infractions")
    .setDescription("Log a warning, strike, kick, or ban.")
    .addUserOption((option) =>
      option.setName("user").setDescription("Target user").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("Infraction type")
        .setRequired(true)
        .addChoices(
          { name: "warn", value: "warn" },
          { name: "strike", value: "strike" },
          { name: "kick", value: "kick" },
          { name: "ban", value: "ban" }
        )
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason").setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("promo")
    .setDescription("Log a promotion.")
    .addUserOption((option) =>
      option.setName("user").setDescription("Target user").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("rank").setDescription("New rank").setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("createcode")
    .setDescription("Create a staff panel code.")
    .addStringOption((option) =>
      option.setName("code").setDescription("New code value").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("role")
        .setDescription("Role unlocked by this code")
        .setRequired(true)
        .addChoices(
          { name: "staff", value: "staff" },
          { name: "hr", value: "hr" },
          { name: "shr", value: "shr" },
          { name: "owner", value: "owner" },
          { name: "founder", value: "founder" }
        )
    ),
  new SlashCommandBuilder()
    .setName("removecode")
    .setDescription("Founder-only code removal.")
    .addStringOption((option) =>
      option.setName("code").setDescription("Code to remove").setRequired(true)
    )
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(config.botToken);

await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
  body: commands
});

console.log("Registered slash commands.");
