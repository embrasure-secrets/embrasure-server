import { Sequelize } from 'sequelize';

const client = ({ dbName, dbHost, dbPort, dbUsername, dbAuthToken }) => {
    return new Sequelize(dbName, dbUsername, dbAuthToken, {
        host: dbHost,
        dialect: 'postgres',
        port: dbPort,
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        pool: {
            acquire: 3000,
            idle: 1,
        },
    });
};

export default client;
