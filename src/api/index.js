import serverless from 'serverless-http';
import express from 'express';
import helmet from 'helmet';
// loadEnv should be probably moved to root directory
import cors from 'cors';
import '../utils/rds/loadEnv.js';

import getAllSecrets from '../utils/rds/getAllSecrets.js';
import getSecret from '../utils/rds/getSecret.js';
import deleteSecret from '../utils/rds/deleteSecret.js';
import updateSecret from '../utils/rds/updateSecret.js';
import addSecret from '../utils/rds/addSecret.js';
import getAllUsers from '../utils/rds/getAllUsers.js';
import addUser from '../utils/rds/addUser.js';
import client from '../utils/rds/dbClient.js';
import Secrets from '../utils/rds/model.js';
import syncTable from '../utils/rds/syncTable.js';

const app = express();

// Instantiate helmet
app.use(helmet());

// Content Security Policy (CSP) configuration
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", 'trusted-domain.com'],
            styleSrc: ["'self'", 'cdn.example.com'],
            // Add other directives as needed
        },
    })
);

// HTTP Strict Transport Security (HSTS) configuration
app.use(
    helmet.hsts({
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
    })
);

// X-Content-Type-Options configuration
app.use(helmet.noSniff());

// X-Frame-Options configuration
app.use(helmet.frameguard({ action: 'deny' }));

// X-XSS-Protection configuration
app.use(helmet.xssFilter());

// Referrer Policy configuration
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));

// Feature Policy configuration
app.use((req, res, next) => {
    res.setHeader('Feature-Policy', "geolocation 'none'; microphone 'none'");
    next();
});

// Optionally, hide the "X-Powered-By" header
app.disable('x-powered-by');

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Use request headers to connect to database
app.use((req, res, next) => {
    const dbUsername = req.header('db-username');
    const dbAuthToken = req.header('db-auth-token');
    const dbName = req.header('db-name');
    const dbHost = req.header('db-host');
    const dbPort = req.header('db-port');
    const dbClientValues = { dbName, dbHost, dbPort, dbUsername, dbAuthToken };
    const dbClient = client(dbClientValues);
    syncTable(dbClient);
    res.locals.dbClient = dbClient;
    res.locals.secretsTable = Secrets(dbClient);
    next();
});

// Get a single secret by key
app.get('/secrets/:key', async (req, res) => {
    try {
        const secretKey = req.params.key;
        const secret = await getSecret(res.locals.secretsTable, secretKey);
        if (secret === undefined) {
            res.status(404).json({ message: 'Secret not found' });
        } else {
            res.json(secret);
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get all secrets
app.get('/secrets', async (req, res) => {
    const secrets = await getAllSecrets(res.locals.secretsTable);
    res.json(secrets);
});

// Get all users
app.get('/users', async (req, res) => {
    const users = await getAllUsers(res.locals.dbClient);
    res.json(users);
});

// Delete a secret by  key
app.delete('/secret', async (req, res) => {
    try {
        const secretKey = req.body.key;
        /* 
        deleteSecret returns 1 if a secret was found and deleted, 0 otherwise
        */
        const secretDeleted = !!(await deleteSecret(res.locals.secretsTable, secretKey));
        if (!secretDeleted) {
            throw new Error('Secret could not be deleted or was not found.');
        }
        res.status(204).json({});
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Specify a secret by key and update its value
app.patch('/secret', async (req, res) => {
    try {
        const secretKey = req.body.key;
        const secretValue = req.body.value;
        const secretUpdated = !!(await updateSecret(
            res.locals.secretsTable,
            secretKey,
            secretValue
        ));

        if (!secretUpdated) {
            throw new Error('Secret could not be updated or was not found.');
        }
        // returns no content
        res.status(204).json({});
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Create a secret
app.post('/secrets', async (req, res) => {
    try {
        const secretKey = req.body.key;
        const secretValue = req.body.value;

        const createdSecret = await addSecret(res.locals.secretsTable, secretKey, secretValue);
        if (!createdSecret) throw new Error("Couldn't create secret.");

        res.status(201).json({ key: createdSecret.key });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Create a user
app.post('/users', async (req, res) => {
    try {
        const usersCreated = await addUser(
            res.locals.dbClient,
            req.body.username,
            req.body.hasWritePermissions
        );
        res.status(201).json({ usersCreated });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// app.listen(process.env.API_PORT, () => {
//     console.log(`Embrasure server running on port ${process.env.API_PORT}`);
// });

export const handler = serverless(app);
