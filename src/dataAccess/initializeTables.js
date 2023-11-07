const CREATE_SECRETS_TABLE_COMMAND = `CREATE TABLE IF NOT EXISTS Secrets (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  value VARCHAR(255) NOT NULL
);`;

const CREATE_LOGS_TABLE_COMMAND = `CREATE TABLE IF NOT EXISTS Logs (
  id SERIAL PRIMARY KEY,
  actor VARCHAR(255) NOT NULL,
  ip_address VARCHAR(255) NOT NULL,
  request_type VARCHAR(255) NOT NULL,
  resource_route VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  is_request_authenticated BOOLEAN NOT NULL DEFAULT false,
  is_request_authorized BOOLEAN NOT NULL DEFAULT false,
  http_status_code INTEGER NOT NULL
);`;

async function initializeTables(client) {
    try {
        await client.query(CREATE_SECRETS_TABLE_COMMAND);
        await client.query(CREATE_LOGS_TABLE_COMMAND);
    } catch (error) {
        console.error('Could not create tables:', error.message);
        throw error;
    }
}

export default initializeTables;
