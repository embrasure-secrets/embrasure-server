import { DataTypes } from 'sequelize';

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
