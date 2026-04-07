export function queueErlcCommand({ command, player, reason, actor }) {
  return {
    ok: true,
    status: "queued",
    message: `ER:LC ${command} queued for ${player} by ${actor}. API key required for live execution.`,
    payload: {
      command,
      player,
      reason,
      actor
    }
  };
}
