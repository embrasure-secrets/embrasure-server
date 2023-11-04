/*
getAllSecrets function will display
all secrets in the Secrets table
*/

async function getAllSecrets(table) {
    try {
        // array with raw secret data for each secret
        // includes metadata and unneeded columns
        const allSecrets = await table.findAll();
        const secretsFormatted = allSecrets.map((rawSecretData) => {
            const secretObj = rawSecretData.dataValues;
            return { key: secretObj.key, value: secretObj.value };
        });
        return secretsFormatted;
    } catch (error) {
        console.error('Error getting all secrets: ', error);
    }
}

export default getAllSecrets;
