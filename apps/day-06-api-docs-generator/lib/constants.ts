import type { Format } from './types';

export const FORMAT_OPTIONS: { id: Format; label: string }[] = [
  { id: 'code', label: 'Code' },
  { id: 'openapi', label: 'OpenAPI' },
  { id: 'plaintext', label: 'Plain English' },
];

export const DEMO_INPUT = `// Express routes
app.get('/users', authenticate, async (req, res) => {
  const { page = 1, limit = 20, role } = req.query;
  const users = await User.find({ role }).paginate(page, limit);
  res.json(users);
});

app.post('/users', authenticate, authorize('admin'), async (req, res) => {
  const { name, email, role } = req.body;
  const user = await User.create({ name, email, role });
  res.status(201).json(user);
});

app.delete('/users/:id', authenticate, authorize('admin'), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).send();
});`;

export const MOCK_MARKDOWN = `# Users API

**Base URL:** \`https://api.example.com/v1\`

## Overview

| Property | Value |
|----------|-------|
| Authentication | Bearer token |
| Content-Type | application/json |
| Total endpoints | 3 |

## Authentication

All endpoints require a valid Bearer token in the \`Authorization\` header. Tokens are obtained via your dashboard or OAuth flow. Admin-only endpoints additionally require the requesting user to have the \`admin\` role.

## Endpoints

### GET /users

List all users with optional filtering and pagination.

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| page | integer | No | Page number. Defaults to 1. |
| limit | integer | No | Results per page. Defaults to 20. |
| role | string | No | Filter by role (e.g. \`admin\`, \`user\`). |

**Example request**
\`\`\`http
GET /users?page=1&limit=20&role=admin
Authorization: Bearer <token>
\`\`\`

**Example response** \`200 OK\`
\`\`\`json
{
  "data": [
    { "id": "u_123", "name": "Alice", "email": "alice@example.com", "role": "admin" }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}
\`\`\`

**Error codes**

| Code | Description |
|------|-------------|
| 401 | Unauthorized — missing or invalid token |
| 403 | Insufficient permissions |

---

### POST /users

Create a new user. Requires admin role.

**Body parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| name | string | Yes | Full name of the user. |
| email | string | Yes | Email address. Must be unique. |
| role | string | No | User role. Defaults to \`user\`. |

**Example request**
\`\`\`http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{ "name": "Bob", "email": "bob@example.com", "role": "user" }
\`\`\`

**Example response** \`201 Created\`
\`\`\`json
{ "id": "u_456", "name": "Bob", "email": "bob@example.com", "role": "user" }
\`\`\`

**Error codes**

| Code | Description |
|------|-------------|
| 400 | Bad request — missing required fields |
| 401 | Unauthorized |
| 403 | Insufficient permissions — admin role required |
| 409 | Conflict — email already exists |

---

### DELETE /users/:id

Delete a user by ID. Requires admin role.

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string | Yes | The user ID. |

**Example request**
\`\`\`http
DELETE /users/u_123
Authorization: Bearer <token>
\`\`\`

**Example response** \`204 No Content\`

**Error codes**

| Code | Description |
|------|-------------|
| 401 | Unauthorized |
| 403 | Insufficient permissions — admin role required |
| 404 | User not found |
`;
