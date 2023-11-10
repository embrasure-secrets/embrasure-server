import { Sequelize } from 'sequelize';

const client = ({ dbName, dbHost, dbPort, dbUsername, dbAuthToken }) => {
    return new Sequelize(dbName, dbUsername, dbAuthToken, {
        host: dbHost,
        dialect: 'postgres',
        port: dbPort,
        // logging: false,
        logging: true,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        pool: {
            max: 2,
            min: 0,
            // acquire: 3000,
            acquire: 3000,
            // idle: 1,
            idle: 0,
            evict: 6000,
        },
    });
};

export default client;
