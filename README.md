# 📘 Backend Application for Online Learning Platform

This is the backend of an **online learning platform** designed to manage users (students, educators, and admins), course enrollments, class scheduling, and tests. Built using **Node.js, Express, TypeScript, Prisma, and PostgreSQL**.

---

## 🚀 Tech Stack

* **Node.js + Express** — Server framework
* **TypeScript** — Type-safe backend
* **Prisma** — ORM for PostgreSQL
* **PostgreSQL** — Relational database
* **JWT + Middleware** — Authentication & Authorization
* **dotenv** — Environment variable support
* **bcrypt** — Password hashing

---

## 📂 Project Structure

```
├── nodemon.json
├── package.json
├── prisma
│   ├── client.ts
│   ├── migrations
│   │   ├── 20250629201739_init
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   ├── schema.prisma
│   └── seed.ts
├── src
│   ├── app.ts
│   ├── controllers
│   │   ├── AdminAPIs
│   │   │   ├── createUser.ts
│   │   │   ├── deleteUser.ts
│   │   │   ├── editUser.ts
│   │   │   ├── getUsers.ts
│   │   │   └── index.ts
│   │   ├── auth
│   │   │   ├── index.ts
│   │   │   ├── login.ts
│   │   │   ├── logout.ts
│   │   │   └── user.ts
│   │   ├── EducatorAPIs
│   │   │   ├── getDetails.ts
│   │   │   └── index.ts
│   │   ├── index.ts
│   │   └── StudentAPIs
│   │       ├── getStudentDetails.ts
│   │       └── index.ts
│   ├── middleware
│   │   ├── authorizeRoles.ts
│   │   └── verifyToken.ts
│   ├── routes
│   │   ├── AdminAPIs.ts
│   │   ├── auth.ts
│   │   ├── EducatorAPIs.ts
│   │   ├── index.ts
│   │   └── StudentAPIs.ts
│   └── types
│       └── authTypes.ts
└── tsconfig.json
```

---

## 🧠 Application Flow

### 👥 Users & Roles

* `User` model includes `role` as ENUM: `student`, `educator`, or `admin`.
* Students and Educators are extensions of User with 1-to-1 relations.

### 📘 Courses & Syllabus

* Courses have metadata and a separate `SyllabusSection` table for structured syllabus.
* Each syllabus section has an `order`, title, and description.

### 📥 Enrollment

* Students enroll in courses.
* Enrollment tracks `syllabus_progress`, `percent_complete`, and `enrolled_on`.

### 📅 Class Scheduling

* Educators can schedule classes with students.
* Each class has a `join_url`, status (`scheduled`, `completed`, etc.), and discussion topics.

### 🧪 Tests

* Educators assign tests to students per course.
* Each test has a `format`, `scheduled_at`, and tracks test results.

### 📝 Test Results

* Student submissions are stored with `marks_scored`, `feedback`, and `submitted_at`.

---

## 📜 Important Scripts

| Command                       | Description                       |
| ----------------------------- | --------------------------------- |
| `npm run dev`                 | Start dev server with hot reload  |
| `npm run build`               | Compile TypeScript code           |
| `npm start`                   | Run the compiled app from `dist/` |
| `npm run prisma:migrate`      | Run migrations in dev             |
| `npm run prisma:migrate:prod` | Deploy production migrations      |
| `npm run prisma:studio`       | Open Prisma Studio GUI            |
| `npm run prisma:reset`        | Drop & reset DB schema            |
| `npm run prisma:generate`     | Generate Prisma client            |
| `npm run prisma:introspect`   | Reverse DB schema into Prisma     |
| `npm run prisma:format`       | Format Prisma schema file         |
| `npm run seed`                | Run database seed file            |

---

## 🛡️ Authentication

* JWT-based with middleware for protected routes.
* Roles are checked using `authorizeRoles.ts`.

---

## 🧪 Seeding & Prisma

To setup and run:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

---

## ✅ Next Steps

* Add Swagger for API docs
* Add Audit Logs table
* Add Google Meet integration for scheduled classes

---

Feel free to contribute or raise issues if needed!

---

© 2025 Online Learning Platform — All rights reserved.
