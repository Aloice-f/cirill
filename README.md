# Captain Bot — Personal WhatsApp Connection Portal

A deployable Render website starter with a Captain Bot design, phone-number request form, health endpoint, basic rate limiting, and a private owner-only request metadata endpoint.

## Security and scope
This project intentionally does **not** send WhatsApp login/pairing codes, generate account-linking QR codes, or collect WhatsApp session credentials. It is a frontend and request-flow starter, not a connected WhatsApp bot yet. Use a supported WhatsApp integration and configure credentials privately. Do not ask users to submit their verification codes or session QR codes.

The demo stores only the last four digits of submitted numbers in in-memory memory, which is lost when the service restarts. For production, prefer not collecting phone numbers unless necessary; add consent, retention rules, persistent storage, request-signature checks if connecting external webhooks, and stronger abuse protection.

## Deploy to Render
1. Download and extract the ZIP.
2. Upload the files to a GitHub repository (keep `.env` files with real secrets out of GitHub).
3. Open https://dashboard.render.com/
4. Choose New + → Blueprint and connect the repository, or create a Web Service.
5. Use `npm install` as build command and `npm start` as start command.
6. Deploy. Render will assign a URL such as `https://captain-bot-personal.onrender.com`. The exact name may need to be changed if unavailable.
7. Render generates `ADMIN_TOKEN` from `render.yaml`. Do not share it.

## Test
- Open your deployed URL and submit a test phone number.
- Visit `/health` to confirm the service is running.
- `/api/status` describes the setup status.

## Next step: connect the actual bot
Configure a supported WhatsApp integration privately. For official WhatsApp Business messaging, start at https://developers.facebook.com/docs/whatsapp/cloud-api/get-started. Personal-account automation methods can have platform restrictions and account risk; review the integration's current terms before use. Never deploy personal session files or pairing secrets to a public repository.
