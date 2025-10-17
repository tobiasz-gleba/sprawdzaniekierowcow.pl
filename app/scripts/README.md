# CLI Scripts

This directory contains CLI scripts for managing and maintaining the driver license verification system.

## Available Scripts

### 1. Validate All Drivers

**Script:** `validate-all-drivers.ts`

Validates all or selected drivers in the database by checking their license status with the external API.

**Usage:**
```bash
# Validate all drivers
bun run scripts/validate-all-drivers.ts
# or
npm run validate:all

# Validate only pending drivers
npm run validate:pending

# Validate specific user's drivers
bun run scripts/validate-all-drivers.ts --user-id <user-id>

# Validate drivers with specific status (0=invalid, 1=valid, 2=pending)
bun run scripts/validate-all-drivers.ts --status 2

# Dry run (see what would be validated without actually validating)
bun run scripts/validate-all-drivers.ts --dry-run

# Custom delay between validations (default: 2000ms)
bun run scripts/validate-all-drivers.ts --delay 3000
```

**Options:**
- `--user-id <id>` - Only validate drivers for a specific user
- `--status <status>` - Only validate drivers with specific status (0=invalid, 1=valid, 2=pending)
- `--delay <ms>` - Delay between validations in milliseconds (default: 2000)
- `--dry-run` - Show what would be validated without actually validating

---

### 2. Notify Invalid Drivers

**Script:** `notify-invalid-drivers.ts`

Sends email notifications to users who have drivers with invalid status. This script excludes drivers with pending status and only notifies about confirmed invalid licenses.

**Usage:**
```bash
# Send notifications to all users with invalid drivers
bun run scripts/notify-invalid-drivers.ts
# or
npm run notify:invalid

# Send notification to specific user only
bun run scripts/notify-invalid-drivers.ts --user-id <user-id>

# Dry run (see what emails would be sent without actually sending them)
bun run scripts/notify-invalid-drivers.ts --dry-run
```

**Options:**
- `--user-id <id>` - Only send notification to a specific user
- `--dry-run` - Show what emails would be sent without actually sending them

**Email Content:**
The notification email includes:
- A warning about invalid driver licenses
- A list of all invalid drivers (name, surname, document number)
- Information about what "invalid" status means
- A link to the dashboard where users can review their drivers

---

## Environment Variables

All scripts require the following environment variables:

### Database Configuration
- `DB_HOST` - MySQL database host (default: localhost)
- `DB_NAME` - Database name (default: sprawdzaniekierowcow)
- `DB_USERNAME` - Database username (default: root)
- `DB_PASSWORD` - Database password (default: password)

### Email Configuration (for notify-invalid-drivers.ts)
- `EMAIL_USER` - SMTP username/email address
- `EMAIL_PASS` - SMTP password
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port (default: 587)
- `PUBLIC_BASE_URL` - Base URL for the application (default: https://sprawdzaniekierowcow.pl)

---

## Automation with Cron

These scripts can be automated using cron jobs or Kubernetes CronJobs:

### Example: Daily validation and notification flow

1. Validate all pending drivers (every 6 hours):
```bash
0 */6 * * * cd /path/to/app && bun run scripts/validate-all-drivers.ts --status 2
```

2. Send notifications to users with invalid drivers (once daily at 9 AM):
```bash
0 9 * * * cd /path/to/app && bun run scripts/notify-invalid-drivers.ts
```

### Kubernetes CronJob Example

See `kubernetes/cron.yaml` for Kubernetes CronJob configuration examples.

---

## Notes

- The `validate-all-drivers.ts` script includes a delay between validations to avoid overwhelming the external API (default: 2000ms)
- The `notify-invalid-drivers.ts` script groups drivers by user and sends one email per user (not one per driver)
- Both scripts support `--dry-run` mode for testing without making actual changes
- All scripts output detailed logs for monitoring and debugging
- Scripts use standalone database connections and can be run independently of the web application

