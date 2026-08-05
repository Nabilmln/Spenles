import { config } from "dotenv";

// Load names from local development configuration for equality checks only.
// The integration connection itself always uses TEST_DATABASE_URL.
config({ path: ".env.local", override: false, quiet: true });
