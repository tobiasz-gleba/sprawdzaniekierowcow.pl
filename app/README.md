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

Create a `.env` file in the project root with your database connection details:

```env
DB_HOST=localhost
DB_NAME=local
DB_USERNAME=root
DB_PASSWORD=mysecretpassword
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

## Docker Deployment

This project includes Docker support for production deployments. The application uses `@sveltejs/adapter-node` for Node.js runtime in Docker containers.

### Quick Start with Docker

1. **Install the Node.js adapter** (if not already installed):

   ```sh
   npm install
   ```

2. **Build and run with Docker Compose:**

   ```sh
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Access the application:**

   Open your browser at `http://localhost:3000`

### Files Included

- `Dockerfile` - Multi-stage production build
- `docker-compose.prod.yml` - Complete production setup with MySQL
- `.dockerignore` - Optimizes Docker build context
- `.env.example` - Template for environment variables
- `DEPLOYMENT.md` - Comprehensive deployment guide

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Database Schema

The current schema includes:

- **user** table: Stores user accounts with username, password hash, and age
- **session** table: Manages user sessions with expiration times (for authentication)

The project is set up with Lucia authentication library for secure user authentication.
