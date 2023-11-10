async function addLog(table, logData, client) {
    const transaction = await client.transaction();

    try {
        console.log('in addLog - about to add log');
        await table.create(logData, { transaction });
        await transaction.commit();
        console.log('in addLog - finished adding log');
    } catch (error) {
        console.error('Error in creating a new log: ', error);
        await transaction.rollback();
        throw error;
    }
}

export default addLog;
