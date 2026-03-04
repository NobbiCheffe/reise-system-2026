const { app } = require('@azure/functions');
const { Connection, Request } = require('tedious');

// Registrierung der Funktion (V4 Modell)
app.http('GetTouren', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`API-Aufruf für GetTouren gestartet.`);

        // Deine SQL-Konfiguration
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
                rowCollectionOnRequestCompletion: true // Wichtig für V4
            }
        };

        return new Promise((resolve) => {
            const connection = new Connection(config);
            
            connection.on('connect', err => {
                if (err) {
                    context.error('Datenbank-Verbindungsfehler:', err);
                    resolve({ 
                        status: 500, 
                        body: `Fehler: Verbindung zur SQL-DB fehlgeschlagen (${err.message})` 
                    });
                } else {
                    const sqlRequest = new Request(
                        "SELECT TourID, TourCode, Titel, Region FROM tbl_Touren", 
                        (err, rowCount, rows) => {
                            if (err) {
                                context.error('Abfragefehler:', err);
                                resolve({ status: 500, body: "Fehler bei der SQL-Abfrage." });
                            } else {
                                // Daten von SQL-Format in JSON umwandeln
                                const data = rows.map(row => {
                                    const item = {};
                                    row.forEach(col => { item[col.metadata.colName] = col.value; });
                                    return item;
                                });

                                context.log(`${rowCount} Touren erfolgreich geladen.`);
                                resolve({ 
                                    status: 200, 
                                    jsonBody: data 
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
