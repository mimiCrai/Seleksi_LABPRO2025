# 🛠️ Utility Scripts

This directory contains various utility scripts for database management and testing.

## Database Scripts

### `setup-database.js`
Sets up the initial database structure.
```bash
node scripts/setup-database.js
```

### `reset-modules.ts`
Resets all course modules and re-seeds them with proper relationships.
```bash
npx ts-node scripts/reset-modules.ts
```

## Debug Scripts

### `debug-data.ts`
Displays current database state for debugging.
```bash
npx ts-node scripts/debug-data.ts
```

### `debug-courses.ts`
Shows detailed course information.
```bash
npx ts-node scripts/debug-courses.ts
```

## Test Data Scripts

### `create-test-user.ts`
Creates test users for development.
```bash
npx ts-node scripts/create-test-user.ts
```

### `create-test-modules.ts`
Creates test modules for courses.
```bash
npx ts-node scripts/create-test-modules.ts
```

### `create-test-progress.ts`
Creates test progress data for users.
```bash
npx ts-node scripts/create-test-progress.ts
```

### `add-missing-courses.ts`
Adds missing courses to the database.
```bash
npx ts-node scripts/add-missing-courses.ts
```

## Usage

All TypeScript scripts should be run from the project root:

```bash
# From project root
cd /home/crai/LABPRO/Seleksi_LABPRO2025
npx ts-node scripts/<script-name>.ts
```
