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
import isUserNonadmin from './utils/isUserNonadmin.js';

const app = express();

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

app.locals.logsWorkerClientCreated = false;
app.locals.logsTable = null;
app.locals.logsWorkerDbClient = null;
app.locals.tablesInit = false;
app.locals.dbHost = null;
app.locals.dbPort = null;
app.locals.dbName = null;

// Use request headers to connect to database
app.use(async (req, res, next) => {
    try {
        const dbUsername = req.header('db-username');
        // const userIsNonadmin = await isUserNonadmin(dbUsername);
        const userIsNonadmin = dbUsername !== 'postgres';
        const dbAuthToken = req.header('db-auth-token');
        const dbName = req.header('db-name');
        const dbHost = req.header('db-host');
        const dbPort = req.header('db-port');
        app.locals.dbName = dbName;
        app.locals.dbHost = dbHost;
        app.locals.dbPort = dbPort;
        const dbClientValues = { dbName, dbHost, dbPort, dbUsername, dbAuthToken };
        const dbClient = client(dbClientValues);
        console.log('dbClientValues are: ', dbClientValues);
        res.locals.dbClient = dbClient;
        if (userIsNonadmin) {
            res.locals.activeUser = 'nonadmin';
        } else if (userIsNonadmin === false) {
            res.locals.activeUser = 'admin';
        }
        next();
    } catch (error) {
        res.status(500).json({ error: 'is user nonadmin error' });
    }
});

// Check if request has proper authentication
app.use(async (req, res, next) => {
    try {
        res.locals.isAuthenticated = await isAuthenticated(res.locals.dbClient);
        next();
    } catch (error) {
        console.log('error in authentication: ', error);
        res.status(500).json({ error: 'error in authentication' });
    }
});

app.use(async (req, res, next) => {
    try {
        console.log('authentication middleware runs');
        if (!res.locals.isAuthenticated) {
            console.log('User is not authenticated!');
            throw new Error('Not Authenticated');
        }
        next();
    } catch (error) {
        next(error);
    }
});

// create logs worker and initialize tables
app.use(async (req, res, next) => {
    try {
        console.log('creating logs worker and initializing tables');
        if (req.app.locals.tablesInit === false && res.locals.activeUser === 'admin') {
            await initializeTables(res.locals.dbClient);
            await addLogsWorker(res.locals.dbClient);
            req.app.locals.tablesInit = true;
        } else if (req.app.locals.tablesInit === false && res.locals.activeUser === 'nonadmin') {
            throw new Error('User Not Permitted to create logs worker and tables ');
        }
        next();
    } catch (error) {
        console.log('error in creating tables/log worker: ', error);
        res.status(500).json({ error: 'Tables and log worker not created yet' });
    }
});

app.locals.dbAuthToken = null;
app.locals.MILLISECONDS_IN_10_MINUTES = 600000;
app.locals.refreshToken = setInterval(async () => {
    app.locals.dbAuthToken = null;
}, app.locals.MILLISECONDS_IN_10_MINUTES);

app.use(async (req, res, next) => {
    try {
        if (req.app.locals.dbAuthToken === null) {
            const { dbHost, dbPort } = app.locals;
            const authToken = await generateDBAuthToken(
                process.env.REGION,
                dbHost,
                dbPort,
                'logsworker'
            );
            req.app.locals.dbAuthToken = authToken;
            req.app.locals.logsWorkerClientCreated = false;
            console.log('168 authtoken is: ', authToken);
        }
        next();
    } catch (error) {
        console.log('error in creating log worker authtoken: ', error);
        res.status(500).json({ error: 'error in creating log worker authtoken' });
    }
});

// create logsworker db client
app.use(async (req, res, next) => {
    try {
        if (req.app.locals.logsWorkerClientCreated === false) {
            const { dbName, dbHost, dbPort } = app.locals;
            const dbClientWorkerValues = {
                dbName,
                dbHost,
                dbPort,
                dbUsername: 'logsworker',
                dbAuthToken: req.app.locals.dbAuthToken,
            };
            const logsWorkerDbClient = client(dbClientWorkerValues);
            req.app.locals.logsWorkerDbClient = logsWorkerDbClient;
            req.app.locals.logsWorkerClientCreated = true;
            req.app.locals.logsTable = await Logs(req.app.locals.logsWorkerDbClient);
        }
        next();
    } catch (error) {
        console.log('error in creating logs worker client is: ', error);
        res.status(500).json({ error: 'error in creating logs worker client' });
    }
});

app.use(async (req, res, next) => {
    try {
        res.locals.secretsTable = await Secrets(res.locals.dbClient);
        next();
    } catch (error) {
        console.log('error in connecting db clients to tables: ', error);
        res.status(500).json({ error: 'error in connecting db clients to tables' });
    }
});

app.use('/secrets', secretsRouter);
app.use('/users', usersRouter);

app.get('/logs', async (req, res) => {
    try {
        if (res.locals.activeUser !== 'admin') {
            throw new Error('Not authorized to get logs');
        }
        console.log('getting all logs runs');
        const logs = await getAllLogs(req.app.locals.logsTable);
        res.json(logs);
    } catch (error) {
        console.log('error in getting all logs is: ', error);
        res.status(500).json({ error: 'Error in getting all logs' });
    }
});

// Middleware to add log for successful request
app.use(async (req, res, next) => {
    try {
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
        console.log('logData good requests is: ', logData);

        const logsTable = req.app.locals.logsTable;

        console.log('261 about to add a new log');
        await logsTable.create(logData);
        console.log('263 just added a new log');
    } catch (error) {
        console.log('Error in adding a good request log:', error);
        next(error);
    }
});

//  Middleware to add log for failed requests
app.use(async (error, req, res, next) => {
    try {
        let statusCode;
        let errorMessage;

        const logData = {
            actor: req.header('db-username'),
            ip_address: req.ip,
            request_type: req.method,
            resource_route: req.path,
            is_request_authenticated: false,
            is_request_authorized: false,
            // http_status_code: 401,
            timestamp: Date.now(),
        };

        if (error.message === 'Not Authenticated') {
            logData.http_status_code = 401;
            statusCode = 401;
            errorMessage = { error: error.message };
        } else if (error.message === 'Not Authorized') {
            logData.http_status_code = 403;
            statusCode = 403;
            logData.is_request_authenticated = true;
            errorMessage = { error: error.message };
        } else {
            next(error);
        }
        const logsTable = req.app.locals.logsTable;
        await addLog(logsTable, logData);
        res.status(statusCode).json(errorMessage);
    } catch (err) {
        console.log('catch: status code before sending response is... ', res.statusCode);
        console.log('error is: ', err);
        res.status(500).json({ error: 'Internal Server Error - penultimate error' });
    }
});

app.use(async (error, req, res, next) => {
    console.log('error is: ', error.message);
    res.status(500).json({ error: 'Internal Server Error - final error' });
});

export const handler = serverless(app);
