const { app } = require('@azure/functions');
const { Connection, Request } = require('tedious');

app.http('GetTermine', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Lade aktuelle Termine und Verfügbarkeiten...`);

        const config = {
            authentication: {
                options: { userName: "sqlcheffe", password: "37_4-shILa_3-6" },
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
                    resolve({ status: 500, body: "DB-Verbindungsfehler" });
                } else {
                    // Wir greifen direkt auf den View zu, den wir oben erstellt haben
                    const sqlRequest = new Request(
                        "SELECT * FROM vw_OeffentlicheReisen ORDER BY Startdatum", 
                        (err, rowCount, rows) => {
                            if (err) {
                                resolve({ status: 500, body: "Fehler beim Abruf der Termine" });
                            } else {
                                const data = rows.map(row => {
                                    const item = {};
                                    row.forEach(col => { item[col.metadata.colName] = col.value; });
                                    return item;
                                });
                                resolve({ status: 200, jsonBody: data });
                            }
                            connection.close();
                        }
                    );
                    connection.execSql(sqlRequest);
                }
            });
            connection.connect();
        });
    }
});
