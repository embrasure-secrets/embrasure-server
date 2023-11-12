import { Sequelize } from 'sequelize';

const client = ({ dbName, dbHost, dbPort, dbUsername, dbAuthToken }) => {
    return new Sequelize(dbName, dbUsername, dbAuthToken, {
        host: dbHost,
        dialect: 'postgres',
        port: dbPort,
        logging: false,
        // logging: true,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
            statement_timeout: 10000,
            connectionTimeoutMillis: 10000,
            idle_in_transaction_session_timeout: 10000,
        },
        // pool: {
        //     max: 1,
        //     min: 0,
        //     // acquire: 3000,
        //     acquire: 3000,
        //     // idle: 1,
        //     idle: 1000,
        //     // evict: 6000,
        // },
    });
};

export default client;
