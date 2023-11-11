async function addLog(table, logData) {
    try {
        console.log('in addLog - about to add log');
        await table.create(logData);
        console.log('in addLog - finished adding log');
    } catch (error) {
        console.error('Error in creating a new log: ', error);
        throw error;
    }
}

export default addLog;
