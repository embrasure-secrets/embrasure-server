async function addLog(table, logData) {
    try {
        console.log('Creating log record');
        await table.create(logData);
    } catch (error) {
        console.error('Error in creating a new log: ', error);
        throw error;
    }
}

export default addLog;
