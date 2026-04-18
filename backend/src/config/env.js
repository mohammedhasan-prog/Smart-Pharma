const path = require("path");
const dotenv = require("dotenv");

const envPath = path.resolve(__dirname, "../../.env");
const result = dotenv.config({ path: envPath, override: true });

if (result.error) {
  console.warn(`Could not load .env from ${envPath}: ${result.error.message}`);
}

module.exports = {
  envPath,
};
