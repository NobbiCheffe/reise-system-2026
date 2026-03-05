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
                    context.error('DB-Verbindungsfehler:', err);
                    resolve({ status: 500, body: "DB-Verbindungsfehler" });
                } else {
                    const sqlRequest = new Request(
                        "SELECT * FROM vw_OeffentlicheReisen ORDER BY Startdatum", 
                        (err, rowCount, rows) => {
                            if (err) {
                                context.error('Query-Fehler:', err);
                                resolve({ status: 500, body: "Fehler beim Abruf der Termine" });
                            } else {
                                const list = rows.map(row => {
                                    const item = {};
                                    row.forEach(col => { item[col.metadata.colName] = col.value; });
                                    return item;
                                });

                                // HIER IST DIE ÄNDERUNG: 
                                // Die Liste wird in das Objekt { data: ... } gepackt
                                resolve({ 
                                    status: 200, 
                                    jsonBody: { data: list } 
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
