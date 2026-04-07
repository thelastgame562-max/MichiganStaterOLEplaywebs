# Backend Starter

This is a starter backend and bot structure for:

- Discord bot moderation commands
- role-based access checks
- code creation and removal
- infraction logging
- DM notifications for warns/strikes
- staff channel posting

## Important

Do not reuse the old bot token. Regenerate it in the Discord Developer Portal and put the new one in `.env`.

## Setup

1. Copy `.env.example` to `.env`
2. Fill in your bot token, client credentials, guild ID, role IDs, and channel IDs
3. Install dependencies:

```powershell
cd backend
npm install
```

4. Start the API:

```powershell
npm run dev
```

5. Start the bot:

```powershell
npm run bot
```

## Current behavior

- Slash commands are registered in code
- Rank checks are enforced by configured Discord role IDs
- Founder can remove codes
- HR and above can create keys and infractions
- SHR and above can create panel codes
- Owner and Founder can view full logs

This is a secure starter, not a finished production deployment yet.
