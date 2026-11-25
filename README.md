# GovAI Simple Chat

A minimal Vercel-hosted chat app that calls GovAI from a server-side API route. The API key is never sent to browser JavaScript.

## GovAI endpoint

`POST https://ca.govai.com/api/chat/completions`

Authorization is sent as:

`Authorization: Bearer <GOVAI_API_KEY>`

## Deploy to Vercel

1. Upload this project to a private Git repository.
2. Import the repository into Vercel.
3. In Vercel, open Project Settings > Environment Variables.
4. Add `GOVAI_API_KEY` with your GovAI API key.
5. Add `GOVAI_MODEL` with a model name enabled for your GovAI account.
6. Redeploy the project.
7. Open the deployment URL and send a message.

Do not write the API key into `index.html`, `api/chat.js`, Git, or any variable prefixed with `VITE_`.

## Local development

Use `vercel dev` so the `/api/chat` function runs locally. Copy `.env.example` to `.env.local` and fill in the two values. Never commit `.env.local`.

## Troubleshooting

- 401: API key is missing, invalid, or expired.
- 403: The key lacks permission for the request/model.
- 422: The model name or request data may be invalid.
- 500 from GovAI: GovAI reports the underlying chat completion failed.
- Unexpected response shape: inspect the Vercel function logs; the proxy deliberately returns diagnostic details while testing.
