import { Sequelize } from 'sequelize';
// import './loadEnv.js';

const client = ({ dbName, dbHost, dbPort, dbUsername, dbAuthToken }) => {
    return new Sequelize(
        // process.env.DATABASE_NAME,
        dbName,
        // process.env.DB_USER,
        dbUsername,
        // process.env.DB_USER_PASSWORD,
        dbAuthToken,
        {
            // host: process.env.DB_HOST,
            host: dbHost,
            dialect: 'postgres',
            // port: process.env.DB_PORT,
            port: dbPort,
            // turn off Sequelize's log statements
            logging: false,
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false,
                },
            },
            pool: {
                // Maximum time ms to secure connection
                acquire: 3000,
                // Maximum time ms a connection can be idle before exiting
                // 1 is lowest truthy value
                idle: 1,
            },
        }
    );
};

// const testDbConnection = async () => {
//     try {
//         await client.authenticate();
//         // console.log('Connection to the database is successful!');
//     } catch (error) {
//         console.error('Unable to connect to the database:', error);
//     }
// };

// testDbConnection();

export default client;
