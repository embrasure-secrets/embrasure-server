// import { DataTypes } from 'sequelize';

// const Secrets = (dbClient) => {
//     return dbClient.define('Secrets', {
//         key: {
//             type: DataTypes.STRING,
//             allowNull: false,
//             unique: true,
//             validate: {
//                 notNull: { msg: 'secret key is required' },
//             },
//         },
//         value: {
//             type: DataTypes.STRING,
//             allowNull: false,
//             validate: {
//                 notNull: { msg: 'secret value is required' },
//             },
//         },
//     });
// };

// export default Secrets;

import { DataTypes } from 'sequelize';
import client from './dbClient.js';

const headers = {
    dbUsername: process.env.DB_USER,
    dbAuthToken: process.env.DB_USER_PASSWORD,
    dbName: process.env.DATABASE_NAME,
    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT,
};

const dbClient = client(headers);

const Secrets = (dbClient) => {
    return dbClient.define('Secrets', {
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notNull: { msg: 'secret key is required' },
            },
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: 'secret value is required' },
            },
        },
    });
};

export default Secrets;
