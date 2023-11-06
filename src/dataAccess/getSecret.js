/*
Given a secretKey of type string, 
the getSecret function will return an object from the secrets 
database that has the value in the key column that
matches the value of the secretKey
*/

async function getSecret(table, secretKey) {
    try {
        // object with raw data for secret including metadata
        //   and unneeded fields
        const rawSecretData = await table.findOne({
            where: {
                key: secretKey,
            },
        });

        const secretFormatted = {
            key: rawSecretData.dataValues.key,
            value: rawSecretData.dataValues.value,
        };
        return secretFormatted;
    } catch (error) {
        console.error('Error in getting all secrets: ', error);
    }
}

export default getSecret;
