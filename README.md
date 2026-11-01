**English** | [Français](README.fr.md)

# Grocery List

[![CI](https://github.com/FelixPepin/grocery-list/actions/workflows/ci.yml/badge.svg)](https://github.com/FelixPepin/grocery-list/actions/workflows/ci.yml)

A full-stack web app to manage a grocery list: add, edit and remove items, see the total, and keep the list after a restart.

Built for the OVA full-stack internship technical test.

**Stack:** Vue 3 + Vite · Node.js + Express 5 · MySQL 8.4 (Docker) · Vitest

---

## Features

**Required**
- Add, edit and remove an item (name, quantity, unit price), and see the whole list
- Validation on both sides, with visual feedback: each error is shown under its field
- Data saved in MySQL: the list is still there after a restart

**Extra**
- Total of the list, updated after every change
- Clear the whole list
- Confirmation dialog before any delete
- English / French switch (texts, error messages and price format)
- Automated tests (backend and frontend) and a CI pipeline on GitHub Actions
- A **Development log** page with the time spent on each step (see [Time spent](#time-spent))
- A Postman collection with automated tests on every request (valid cases, errors and edge cases)

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| [Node.js](https://nodejs.org) | 22.18 or newer | Tested with 26.13 (and 24 in the CI) |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Any recent version | **Must be running** before starting the database |
| Git | Any | |
| [Postman](https://www.postman.com/downloads/) | Optional | To try the API with the provided collection |

The ports **3000** (API), **3307** (MySQL) and **5173** (frontend) must be free.

---

## Getting started

The commands below are for PowerShell (Windows). On macOS or Linux, replace `Copy-Item` with `cp`.

### 1. Clone the repository

```powershell
git clone https://github.com/FelixPepin/grocery-list.git
cd grocery-list
```

### 2. Start the database

```powershell
docker compose up -d
```

This starts MySQL in a container, creates the `grocery_items` table and adds 4 sample items. Wait about 20 seconds, until the status is `healthy`:

```powershell
docker compose ps
```

No configuration is needed: `docker-compose.yml` has default values that match `backend/.env.example`.

### 3. Start the backend (API)

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run dev
```

You should see `MySQL connected` and `Server running on http://localhost:3000`.

### 4. Start the frontend

In a **second terminal**, from the root of the project:

```powershell
cd FrontEnd
Copy-Item .env.example .env
npm install
npm run dev
```

Open **http://localhost:5173**.

### Stopping everything

`Ctrl + C` in both terminals, then `docker compose down`. The data is kept in a Docker volume and will still be there next time.

---

## Tests

| Part | Command | What it covers |
|---|---|---|
| Backend | `cd backend` then `npm test` | Validation middlewares (unit tests) and every route with Supertest. The model is mocked: **no database needed** |
| Frontend | `cd FrontEnd` then `npm test` | Validation, composable, components, navigation and translations. `fetch` is mocked: **no backend needed** |
| API (manual) | Postman | Import `postman/grocery-list.postman_collection.json` |

**Postman:** with the backend running, right-click the **grocery_list** folder, then **Run folder**: every request has its own tests. The **Destructive** folder deletes every item and is meant to be run separately. To get the sample data back: `docker compose down -v` then `docker compose up -d`.

The **CI** (GitHub Actions) runs the backend tests, the frontend lint, the frontend tests and the build on every push to `main` and every pull request. `main` is protected: a pull request can only be merged if the CI passes.

---

## API

Base URL: `http://localhost:3000`. Request bodies are JSON.

| Method | Route | Success | Errors |
|---|---|---|---|
| `GET` | `/grocery_list` | **200** with every item (newest first) | |
| `POST` | `/grocery_list` | **201** with the created item and a `Location` header | 400, 422 |
| `PUT` | `/grocery_list/:id` | **200** with the item as saved | 400, 404, 422 |
| `DELETE` | `/grocery_list/:id` | **204** (no body) | 400, 404 |
| `DELETE` | `/grocery_list` | **204**, deletes every item | |

**Item:** `{ "name": "Apple", "quantity": 3, "unit_price": 1.5 }`

| Field | Rules |
|---|---|
| `name` | Required, text, not empty, 50 characters max (spaces around it are removed) |
| `quantity` | Required, whole number, from 1 to 10,000 |
| `unit_price` | Required, number, greater than 0 and up to 100,000 (stored with 2 decimals) |

**Response format**

```jsonc
// Success
{ "status": 201, "message": "Item created successfully", "data": { ... }, "path": "/grocery_list", "timestamp": "..." }

// Error
{ "status": 422, "error": "Unprocessable Entity", "message": "Quantity must be at least 1", "code": "QUANTITY_TOO_LOW", "path": "/grocery_list", "timestamp": "..." }
```

- **400**: a field is missing, the JSON is malformed or the `id` in the URL is not a positive integer
- **422**: a field is present but invalid
- **404**: the item or the route doesn't exist
- **500**: unexpected error. The details are logged on the server, never sent to the client

The frontend uses the `code` field as a key to look up the matching message in `messages.js`, in the selected language (for example, `QUANTITY_TOO_LOW` → "Quantity must be at least 1.").

---

## Project structure

```
grocery-list/
├── .github/workflows/ci.yml     CI: tests, lint and build
├── docker-compose.yml           MySQL 8.4 with a persistent volume
├── database/init/               Table creation and sample data
├── postman/                     Postman collection with tests
├── backend/
│   ├── app.mjs                  Express app (CORS, routes, error handler)
│   ├── db.mjs                   MySQL connection pool
│   ├── routes/                  URL → validation → controller
│   ├── middlewares/             Request validation
│   ├── controllers/             Request handling and responses
│   ├── models/                  SQL queries
│   ├── utils/                   Shared HTTP error helper
│   └── tests/
└── FrontEnd/
    ├── src/
    │   ├── views/               The two pages (list and development log)
    │   ├── components/          Form, list, item, dialog, language switch...
    │   ├── composables/         useGroceryList: API calls and shared state
    │   ├── i18n/                English and French texts
    │   ├── utils/               Item validation (same rules as the API)
    │   ├── router/              Vue Router
    │   └── data/                Development log data
    └── tests/
```

---

## Technical choices

**Stack.** I used the same stack as my school integration project, a loyalty app built for a real client (Vue 3, Express, MySQL, Vitest), and reused its conventions: routes → validation middleware → controller → model, and the same JSON response format.

**Validation on 3 levels.**
1. **Frontend**, for the user: instant feedback under each field.
2. **API**, for security: the API can be called without the frontend (Postman, curl...). It returns **400** when a field is missing and **422** when it's invalid, with a `code` the frontend translates.
3. **Database**, as a last safeguard: `CHECK` constraints on the table.

The frontend and the API use the same rules and the same error codes, so the messages are identical on both sides.

**Express 5.** It forwards errors thrown in `async` handlers to the error middleware automatically, so the controllers have no `try/catch` blocks that would only call `next(err)`. All errors go through one handler that builds the same JSON format and hides internal details on a 500.

**Prices.** `DECIMAL(10,2)` instead of `FLOAT`, to avoid rounding errors with money. The `mysql2` pool returns them as numbers (`decimalNumbers: true`) so the total can be computed directly.

**Database connection.** The pool is in its own file (`db.mjs`) instead of `app.mjs`, to avoid a circular import (app → routes → controllers → models → app).

**CORS.** Only the frontend URL is allowed (`FRONTEND_URL`), not `*`.

**State management.** A composable (`useGroceryList`) holds the list and the API calls, shared by every component. I usually use Pinia, but it would bring little for a single resource.

**Translations.** A small home-made i18n (no library): every text goes through `t()`, error messages are translated from the API `code`, and prices are formatted with `Intl.NumberFormat` (`$1.50` / `1,50 $`). The chosen language is remembered.

**Confirmation dialog.** Native `<dialog>` element: dark backdrop, focus kept inside, `Esc` to cancel, and **No** is focused by default so pressing Enter never deletes by accident.

**Accessibility.** Labels linked to their field, errors announced to screen readers (`aria-invalid`, `aria-describedby`, `role="alert"`), focus moved to the first invalid field, and buttons named after their item (`Delete Apple`).

**Docker.** Only MySQL runs in Docker. The port is bound to `127.0.0.1:3307`, so it doesn't clash with a local MySQL and isn't reachable from the network. The values in `.env.example` are **local development values only**, the same as the defaults in `docker-compose.yml`, so the project runs without any setup. Real secrets never go in these files.

**Tests.** The backend tests mock the model and the frontend tests mock `fetch`, so neither needs a database or a running server. That's what lets them run in the CI.

**Small decisions**
- The quantity field starts at **1**: it's the most common value and the minimum. The price starts empty, since any default would be made up.
- **Max values** (quantity 10,000, price 100,000): found while testing the form. A huge number like `1.23e21` passed the validation and MySQL returned a 500. The limit is now checked on both sides.
- The frontend tests disable Node's built-in `localStorage` (`--no-experimental-webstorage`): since Node 25, it hides jsdom's in tests.

---

## Time spent

About **X hours** in total, detailed below.

The same breakdown is also available **directly in the app**, on the **Development log** page (link in the header). This page isn't part of the grocery list itself, and that's intentional: I really enjoy working with **Vue Router**, and since the app only needed one page, I didn't want to leave routing out of the project. Adding a second page was a simple way to show it, with a lazy-loaded route, an active link style and tests, while keeping the grocery list itself untouched.

| Step | Details | Time |
|---|---|---|
| Project setup | Git repository, monorepo structure, `.gitignore` | 12 min |
| Database | MySQL 8.4 in Docker, persistent volume, `CHECK` constraints, sample data | 32 min |
| Backend setup | Express 5 server, MySQL pool, CORS, global error handler | 54 min |
| List and add items (API) | `GET` and `POST` routes, validation middleware, Postman collection | 1 h 59 |
| Edit and delete items (API) | `PUT` and `DELETE` routes, delete the whole list, id validation | 1 h 24 |
| Backend tests | Vitest + Supertest, mocked model | 1 h 07 |
| Display the list | Vue 3 + Vite, composable, FR/EN translations, loading, error and empty states | 1 h 52 |
| Add form | Validation and messages under each field, max values on both sides | 2 h 09 |
| Edit, delete, total and language | Edit in the card, confirmation dialog, total, clear the list, FR/EN switch | 1 h 57 |
| Continuous integration | GitHub Actions (tests, lint, build), protected `main` branch | 18 min |
| Cleanup | Unused code removed, shared button styles, missing translations | 1 h 00 |
| Development log page | Vue Router, lazy-loaded route, this table | 1 h 22 |
| Documentation | README in English and French | 29 min |
| Final check | Fresh clone, following this README step by step | X |
| **Total** | | **X** |

---

## If I had more time

A few things I would have liked to add with more time, or if this were a personal project:

- **User accounts**, so each person has their own list.
- **Deploy the app** with continuous delivery, like I did for my school integration project on Render.
- **Filters and sorting**, to sort the list by name, price or quantity, or quickly find an item in a long list.