const { Connection, Request } = require('tedious');

module.exports = async function (context, req) {
    // Wir holen uns den Connection String direkt aus deiner Azure-Konfiguration
    const connectionString = process.env.AZURE_STATIC_WEB_APPS_DATABASE_CONNECTION_STRING;

    // Einfache Logik, um den String in Einzelteile zu zerlegen
    const config = {
        authentication: {
            options: {
                userName: "sqlcheffe",
                password: "37_4-shILa_3-6" 
            },
            type: "default"
        },
        server: "bergauf.database.windows.net",
        options: {
            database: "Bergauf-Datenbank",
            encrypt: true,
            trustServerCertificate: false,
            rowCollectionOnRequestCompletion: true
        }
    };

    return new Promise((resolve) => {
        const connection = new Connection(config);
        
        connection.on('connect', err => {
            if (err) {
                context.log('Verbindungsfehler:', err);
                context.res = { status: 500, body: "Fehler: " + err.message };
                resolve();
            } else {
                const request = new Request("SELECT TourID, Titel, Region FROM tbl_Touren", (err, rowCount, rows) => {
                    if (err) {
                        context.res = { status: 500, body: "Abfragefehler" };
                    } else {
                        // Daten schön formatieren
                        const data = rows.map(row => {
                            const item = {};
                            row.forEach(col => { item[col.metadata.colName] = col.value; });
                            return item;
                        });
                        context.res = { 
                            status: 200, 
                            body: data,
                            headers: { 'Content-Type': 'application/json' }
                        };
                    }
                    connection.close();
                    resolve();
                });
                connection.execSql(request);
            }
        });

        connection.connect();
    });
};
