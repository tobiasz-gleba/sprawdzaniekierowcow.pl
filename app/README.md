# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Database Setup

This project uses Drizzle ORM with MySQL for database management.

### Prerequisites

Make sure you have Docker installed on your system.

### Starting the Database

Start the MySQL database using Docker Compose:

```sh
npm run db:start
```

This will start a MySQL database container on port 3306 with the following credentials:

- Database: `local`
- Root password: `mysecretpassword`
- Port: `3306`

### Environment Variables

Create a `.env` file in the project root with your database connection string:

```env
DATABASE_URL="mysql://root:mysecretpassword@localhost:3306/local"
```

### Database Migrations

The project uses Drizzle Kit for database migrations. The schema is defined in `src/lib/server/db/schema.ts`.

#### Generate Migrations

After modifying the schema, generate migration files:

```sh
npm run db:generate
```

This creates SQL migration files in the `drizzle/` directory.

#### Run Migrations

Apply pending migrations to the database:

```sh
npm run db:migrate
```

This executes the SQL migrations and creates/updates your database tables.

#### Push Schema (Development)

For rapid development, you can push schema changes directly without generating migration files:

```sh
npm run db:push
```

> ⚠️ Note: `db:push` is great for development but should not be used in production. Always use migrations (`db:generate` + `db:migrate`) for production deployments.

#### Database Studio

View and manage your database with Drizzle Studio:

```sh
npm run db:studio
```

This opens a visual database browser in your web browser.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Database Schema

The current schema includes:

- **user** table: Stores user accounts with username, password hash, and age
- **session** table: Manages user sessions with expiration times (for authentication)

The project is set up with Lucia authentication library for secure user authentication.
