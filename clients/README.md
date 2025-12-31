# Client Configuration Directory

This directory holds **only sanitized templates** for client scopes.

- Real client configuration must **never** be committed.
- Copy an example file, rename it to your client, and keep it local.
- Follow the repository .gitignore rules that block non-example client files.

## Setup Instructions
1) Copy `example.toml` to `<client>.toml` (or the YAML equivalent).
2) Fill in real values locally; do not commit them.
3) Keep secrets in your local `.env` files, not here.

## Template Fields
- `name`: Client identifier.
- `environment`: e.g., `staging`, `production`.
- `api_base_url`: Base URL for API calls.
- `contact`: Primary contact for coordination.
- `notes`: Non-sensitive notes; avoid secrets here too.
