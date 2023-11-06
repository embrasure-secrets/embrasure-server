import { DataTypes } from 'sequelize';

export const Secrets = (dbClient) => {
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

export const Logs = (dbClient) => {
    return dbClient.define('Logs', {
        actor: {
            type: DataTypes.STRING,
            allowNull: false,
            required: true,
        },
        ip_address: {
            type: DataTypes.STRING,
            allowNull: false,
            required: true,
        },
        request_type: {
            type: DataTypes.STRING,
            allowNull: false,
            required: true,
        },
        resource_route: {
            type: DataTypes.STRING,
            allowNull: false,
            required: true,
        },
        timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        is_request_authenticated: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        is_request_authorized: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        http_status_code: {
            type: DataTypes.INTEGER,
            allowNull: false,
            required: true,
        },
    });
};
