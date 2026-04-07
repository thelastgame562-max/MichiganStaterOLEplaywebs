import { config } from "./config.js";

export const roleOrder = ["member", "staff", "hr", "shr", "owner", "founder"];

export function getHighestRole(member) {
  const roleEntries = [
    ["founder", config.roles.founder],
    ["owner", config.roles.owner],
    ["shr", config.roles.shr],
    ["hr", config.roles.hr],
    ["staff", config.roles.staff]
  ];

  for (const [name, roleId] of roleEntries) {
    if (roleId && member.roles.cache.has(roleId)) {
      return name;
    }
  }

  return "member";
}

export function hasMinimumRole(roleName, minimumRole) {
  return roleOrder.indexOf(roleName) >= roleOrder.indexOf(minimumRole);
}
