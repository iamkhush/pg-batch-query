# Release Notes v1.2.1

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
