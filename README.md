# Robin Nasim Hossain — MERN Personal Portfolio

A production-grade, full-stack personal portfolio built with the MERN stack
(MongoDB, Express, React, Node.js). Includes complete JWT authentication,
a role-based admin dashboard, and CRUD for projects, blog posts, and contact
messages.

## Features

- **Authentication**: JWT access + refresh tokens, bcrypt password hashing,
  password change endpoint, rate-limited login, role-based access control
  (`user` / `admin`).
- **Security**: `helmet`, strict CORS, `express-rate-limit`, request body
  size limits, input validation with Zod, fail-fast config loader.
- **Portfolio content**: Hero/About/Skills/Projects/Blog/Contact public site.
- **Admin dashboard**: Manage profile, projects, blog posts, and inbound
  contact messages.
- **Seed script**: Populates the first admin user and an initial set of
  projects/posts for Robin Nasim Hossain.
- **CI**: GitHub Actions runs ESLint and build checks on every push.

## Stack

- **Frontend**: React 18, Vite, React Router, Tailwind CSS, Axios,
  React Hook Form, Zod.
- **Backend**: Node.js (ESM), Express 4, Mongoose 8, JSON Web Tokens,
  bcryptjs, helmet, cors, morgan, express-rate-limit, zod.
- **Database**: MongoDB (Atlas or local).

## Quick start

```bash
# 1. Install deps (both workspaces)
npm install --prefix server
npm install --prefix client

# 2. Configure env
cp server/.env.example server/.env
# edit server/.env with your MongoDB URI and JWT secrets

# 3. Seed an admin user + demo content
npm run seed --prefix server

# 4. Run dev servers
npm run dev --prefix server   # http://localhost:4000
npm run dev --prefix client   # http://localhost:5173
```

Default seeded admin (change immediately after first login):

- email: `admin@robinnasim.dev`
- password: `ChangeMe!2025`

## Project structure

```
mern-portfolio/
├── client/                 # Vite + React SPA
│   ├── src/
│   │   ├── api/            # Axios client + endpoint helpers
│   │   ├── components/     # UI + layout components
│   │   ├── context/        # AuthContext
│   │   ├── pages/          # Route-level pages (public + admin)
│   │   └── routes/         # Protected/admin route guards
└── server/                 # Express API
    └── src/
        ├── config/         # env loader
        ├── middleware/     # auth, error, validation
        ├── models/         # Mongoose schemas
        ├── routes/         # REST endpoints
        ├── utils/          # token helpers, async wrapper
        └── seed.js         # initial admin + portfolio content
```

## License

MIT © Robin Nasim Hossain
