module.exports.localConfig = {
    "host": "localhost",
    "user": "root",
    "password": "Emilence@123",
    "database": "DB_deliveryApp",
    "connectionLimit": 100,
    dialect: 'sqlite' || 'mysql' || 'postgres',
}

module.exports.appConstants = {
    "bodyLimit": "50 mb",
    "port": 3010   //
}
module.exports.secretKeys = {
    "secret": process.env.SECRET_KEY
}