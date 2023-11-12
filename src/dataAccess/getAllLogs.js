async function getAllLogs(table) {
    try {
        const allLogs = await table.findAll({ order: [['id', 'ASC']] });
        const logsFormatted = allLogs.map(({ dataValues }) => dataValues);
        return logsFormatted;
    } catch (error) {
        console.error('Error in getting all logs: ', error);
        throw error;
    }
}

export default getAllLogs;
