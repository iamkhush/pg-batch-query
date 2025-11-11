# Release Notes

## v1.3.1

This release brings major improvements to the type system, bug fixes, and enhanced documentation.

### 🎯 Type System Improvements

- **Flexible Value Types**: `BatchQuery` now accepts any JavaScript types that PostgreSQL supports, not just strings
  - Pass `Date` objects, numbers, booleans, `Buffer` objects, arrays, and more
  - Values are automatically converted using pg's `prepareValue` function
  - Fully compatible with all PostgreSQL data types
  - Example:
    ```typescript
    new BatchQuery({
      text: 'INSERT INTO events (id, name, count, timestamp) VALUES ($1, $2, $3, $4)',
      values: [
        [1, 'login', 100, new Date()],
        [2, 'logout', 50, new Date()]
      ]
    })
    ```

- **Enhanced Generics**: New generic signature `BatchQuery<T, V>` provides better type inference
  - `T`: The row type returned from queries (e.g., `User`)
  - `V`: The tuple type of values in each batch (automatically inferred)
  - Example: `new BatchQuery<User>({ ... })` gives you fully typed results
  - Before: `BatchQuery<T>`
  - After: `BatchQuery<T, V>`

- **Correct Submittable Protocol Implementation**:
  - `client.query(batchQuery)` now correctly returns the `BatchQuery` instance (not a Promise)
  - Call `.execute()` to get the Promise: `await client.query(batch).execute()`
  - Matches pg's Submittable protocol used by pg-query-stream and pg-cursor
  - Properly implements the callback pattern internally for pg compatibility

- **Fixed Module Augmentation Distribution**:
  - Changed from `src/global.d.ts` (ambient) to `src/global.ts` (module)
  - Module augmentation now properly included in `dist/global.d.ts`
  - Ensures types work correctly when package is installed via npm

### 🐛 Bug Fixes

- **Fixed Validation Bug**: Constructor now properly validates that each value set is an array
  - Before: `if (!Array.isArray(values))` (checked parent array)
  - After: `if (!Array.isArray(valueSet))` (checks each element)
  - Now correctly catches malformed input

### 📚 Documentation

- **Added TypeScript Examples**: Comprehensive examples showing:
  - Generic type usage with custom interfaces
  - Mixed type values (strings, dates, numbers, booleans)
  - Proper type annotations for better IDE support

- **Added "Supported Value Types" Section**: Documents all supported types and conversion behavior

- **Improved Code Examples**: Fixed SQL typo and added real-world usage patterns

### 🔄 Breaking Changes

None! All changes are backward compatible. Existing code using string-only values will continue to work.

### 📦 Migration Guide

If you're upgrading from v1.2.x:

**Before (still works):**
```typescript
const batch = new BatchQuery({
  text: 'INSERT INTO users (name) VALUES ($1)',
  values: [['Alice'], ['Bob']]  // strings only
})
```

**After (now also supported):**
```typescript
interface User {
  id: number
  name: string
  created_at: Date
}

const batch = new BatchQuery<User>({
  text: 'INSERT INTO users (id, name, created_at) VALUES ($1, $2, $3)',
  values: [
    [1, 'Alice', new Date()],  // mixed types!
    [2, 'Bob', new Date()]
  ]
})
```

---

## v1.2.1

This release includes several improvements and bug fixes:

## Features

-   **Improved CI/CD Workflows:**
    -   Separated test commands for local development (`yarn test:local`) and CI/CD (`yarn test`) environments.
    -   Ensured CI workflow uses `yarn install --frozen-lockfile` for consistent dependency management.
    -   Configured publish workflow to build and test before publishing, and to include PostgreSQL services and environment variables for its test step.
-   **Enhanced Type Definitions:**
    -   Correctly implemented `pg` module augmentation to provide proper TypeScript type definitions for `BatchQuery` when used with `pg.Client` and `pg.PoolClient`. This ensures better type checking and IDE support.
-   **`pg-batch-query` and `pg-query-stream` Integration Test:**
    -   Added a new test scenario demonstrating how `pg-batch-query` can be effectively used in conjunction with `pg-query-stream` to process data in batches from a stream.

## Bug Fixes

-   Resolved type definition issues that prevented correct type inference for `BatchQuery` usage.
-   Corrected `BatchQuery` export from `export = BatchQuery` to `export default BatchQuery` for better ES module compatibility.

## Other Improvements

-   Updated `README.md` with:
    -   Correct `yarn` installation instructions.
    -   An improved usage example.
    -   Corrected license information (MIT).
-   Cleaned up temporary test files and unnecessary `dotenv` dependency.