import '../loadEnv.js';
import serverless from 'serverless-http';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import secretsRouter from './routes/secrets.js';
import usersRouter from './routes/users.js';
import addLog from './dataAccess/addLog.js';
import getAllLogs from './dataAccess/getAllLogs.js';
import client from './dataAccess/dbClient.js';
import { Secrets, Logs } from './dataAccess/model.js';
import initializeTables from './dataAccess/initializeTables.js';
import isAuthenticated from './dataAccess/isAuthenticated.js';
import addLogsWorker from './dataAccess/addLogsWorker.js';
import generateDBAuthToken from './utils/generateDBAuthToken.js';

const app = express();
app.locals.initializedTables = false;
console.log('app.locals.initializedTables is: ', app.locals.initializedTables);
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
    res.locals.dbName = dbName;
    res.locals.dbHost = dbHost;
    res.locals.dbPort = dbPort;
    console.log('dbClientValues are: ', dbClientValues);
    next();
});

app.use(async (req, res, next) => {
    if (!req.app.locals.initializedTables) {
        try {
            await initializeTables(res.locals.dbClient);
            await addLogsWorker(res.locals.dbClient);
            req.app.locals.initializedTables = true;

            next();
        } catch (error) {
            error.message = 'Not Authenticated';
            next(error);
        }
    } else {
        next();
    }
});

app.use(async (req, res, next) => {
    const authenticated = await isAuthenticated(res.locals.dbClient);
    try {
        if (!authenticated) {
            throw new Error('Not Authenticated');
        }
        next();
    } catch (error) {
        next(error);
    }
});

app.use(async (req, res, next) => {
    res.locals.secretsTable = await Secrets(res.locals.dbClient);
    // may not work if authentication is wrong
    // res.locals.logsTable = await Logs(res.locals.dbClient);
    next();
});

app.use('/secrets', secretsRouter);
app.use('/users', usersRouter);

app.get('/logs', async (req, res) => {
    try {
        const logs = await getAllLogs(res.locals.logsTable);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.use(async (req, res, next) => {
    const logData = {
        actor: req.header('db-username'),
        ip_address: req.ip, //
        request_type: req.method,
        resource_route: req.path,
        is_request_authenticated: true, //
        is_request_authorized: true, //
        http_status_code: res.statusCode,
        timestamp: Date.now(),
    };

    try {
        const { dbName, dbHost, dbPort } = res.locals;

        // remove hard-coded region
        const authToken = await generateDBAuthToken('us-east-1', dbHost, dbPort, 'logsworker');
        const dbClientWorkerValues = {
            dbName,
            dbHost,
            dbPort,
            dbUsername: 'logsworker',
            dbAuthToken: authToken,
        };
        //
        const dbClient = client(dbClientWorkerValues);
        const logsTable = await Logs(dbClient);
        console.log('logData good requests is: ', logData);
        await addLog(logsTable, logData, dbClient);
        // await addLog(res.locals.logsTable, logData);
        // next();
    } catch (error) {
        console.log('log adding middleware:', error);
        next(error);
    }
});

app.use(async (error, req, res, next) => {
    // try {
    //     if (error.message === 'Not Authenticated') {
    //         const logData = {
    //             actor: req.header('db-username'),
    //             ip_address: req.ip,
    //             request_type: req.method,
    //             resource_route: req.path,
    //             is_request_authenticated: false, //
    //             is_request_authorized: false, //
    //             http_status_code: 401,
    //             timestamp: Date.now(),
    //         };

    //         const { dbName, dbHost, dbPort } = res.locals;

    //         // remove hard-coded region
    //         const authToken = await generateDBAuthToken('us-east-1', dbHost, dbPort, 'logsworker');
    //         const dbClientWorkerValues = {
    //             dbName,
    //             dbHost,
    //             dbPort,
    //             dbUsername: 'logsworker',
    //             dbAuthToken: authToken,
    //         };

    //         const dbClient = client(dbClientWorkerValues);
    //         const logsTable = await Logs(dbClient);
    //         console.log('logData bad requests is: ', logData);
    //         await addLog(logsTable, logData);
    //         console.log(
    //             'not authenticated: status code before sending response is...',
    //             res.statusCode
    //         );
    //         res.status(401).json({ error: error.message });
    //     } else {
    //         console.log(
    //             'else statement: status code before sending response is...',
    //             res.statusCode
    //         );
    //         res.status(500).json({ error: 'Internal Server Error' });
    //     }
    // } catch (err) {
    //     console.log('catch: status code before sending response is... ', res.statusCode);
    //     console.log('error is: ', err);
    //     res.status(500).json({ error: 'Internal Server Error - final error' });
    // }
    res.status(500).json({ error: 'Internal Server Error - final error' });
});

export const handler = serverless(app);
