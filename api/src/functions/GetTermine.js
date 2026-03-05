const { app } = require('@azure/functions');
const { Connection, Request } = require('tedious');

app.http('GetTermine', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Lade Termine im 2D-Array Format für TablePress Max.`);

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
                    const sqlRequest = new Request(
                        "SELECT Reise_ID, Titel, Startdatum, Enddatum, Preis_DZ, Status, Restplaetze FROM vw_OeffentlicheReisen ORDER BY Startdatum", 
                        (err, rowCount, rows) => {
                            if (err) {
                                resolve({ status: 500, body: "Abfragefehler" });
                            } else {
                                // 1. Spaltenköpfe definieren
                                const headers = ["Reise_ID", "Titel", "Startdatum", "Enddatum", "Preis", "Status", "Plätze"];
                                
                                // 2. Daten in Zeilen umwandeln
                                const dataRows = rows.map(row => {
                                    return row.map(col => col.value);
                                });

                                // 3. Köpfe und Daten zusammenfügen (Das 2D-Array)
                                const tableData = [headers, ...dataRows];

                                resolve({ 
                                    status: 200, 
                                    jsonBody: tableData,
                                    headers: { 'Content-Type': 'application/json' } 
                                });
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
