const { app } = require('@azure/functions');
const { Connection, Request } = require('tedious');

app.http('GetTouren', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`API-Aufruf: Lade Touren aus dem neuen Bergauf-Schema.`);

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
                    context.error('Verbindungsfehler:', err);
                    resolve({ status: 500, body: "DB-Verbindungsfehler" });
                } else {
                    // WICHTIG: Hier nutzen wir jetzt 'Kategorie' statt 'Region'
                    const sqlRequest = new Request(
                        "SELECT TourID, TourCode, Titel, Kategorie FROM tbl_Touren", 
                        (err, rowCount, rows) => {
                            if (err) {
                                context.error('Query-Fehler:', err);
                                resolve({ status: 500, body: "Fehler bei der Abfrage" });
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
