import serverless from 'serverless-http';
import express from 'express';
import helmet from 'helmet';
// loadEnv should be probably moved to root directory
import cors from 'cors';
import './dataAccess/loadEnv.js';

import secretsRouter from './routes/secrets.js';
import usersRouter from './routes/users.js';
import addLog from './dataAccess/addLog.js';
import getAllLogs from './dataAccess/getAllLogs.js';
import client from './dataAccess/dbClient.js';
import { Secrets, Logs } from './dataAccess/model.js';
import initializeTables from './dataAccess/initializeTables.js';
import syncTable from './dataAccess/syncTable.js';

const app = express();
let initializedTables = false;

// Instantiate helmet
app.use(helmet());

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
    res.locals.dbClient = dbClient;

    next();
});

app.use(async (req, res, next) => {
    if (!initializedTables) {
        await initializeTables(res.locals.dbClient);
        initializedTables = true;
    }

    syncTable(res.locals.dbClient);
    res.locals.secretsTable = Secrets(res.locals.dbClient);
    res.locals.logsTable = Logs(res.locals.dbClient);

    next();
});

app.use(async (req, res, next) => {
    const logData = {
        actor: req.header('db-username'),
        ip_address: req.ip, //
        request_type: req.method,
        resource_route: req.path,
        is_request_authenticated: false, //
        is_request_authorized: false, //
        http_status_code: res.statusCode,
        timestamp: Date.now(),
    };
    console.log('logData is: ', logData);
    await addLog(res.locals.logsTable, logData); // <-- THIS BITCH IS THE PROBLEM
    next();
});

app.use('/secrets', secretsRouter);
app.use('/users', usersRouter);

// app.get('/logs', async (req, res) => {
//     try {
//         const logs = await getAllLogs(res.locals.logsTable);
//         res.json(logs);
//     } catch (error) {
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

export const handler = serverless(app);
