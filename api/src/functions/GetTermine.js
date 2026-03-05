const { app } = require('@azure/functions');
const { Connection, Request } = require('tedious');

app.http('GetTermine', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Lade Termine im 2D-Array Format für TablePress Max (inkl. Datums-Fix).`);

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
                    context.error('Verbindungsfehler zur SQL-DB:', err);
                    resolve({ status: 500, body: "DB-Verbindungsfehler" });
                } else {
                    const sqlRequest = new Request(
                        "SELECT Reise_ID, Titel, Startdatum, Enddatum, Preis_DZ, Status, Restplaetze FROM vw_OeffentlicheReisen ORDER BY Startdatum", 
                        (err, rowCount, rows) => {
                            if (err) {
                                context.error('Query-Fehler:', err);
                                resolve({ status: 500, body: "Abfragefehler" });
                            } else {
                                // 1. Spaltenköpfe für TablePress definieren
                                const headers = ["Reise_ID", "Titel", "Startdatum", "Enddatum", "Preis", "Status", "Plätze"];
                                
                                // 2. Daten in Zeilen umwandeln und DATUM FORMATIEREN
                                const dataRows = rows.map(row => {
                                    return row.map(col => {
                                        let val = col.value;

                                        // Prüfen, ob der Wert ein Datum ist
                                        if (val instanceof Date) {
                                            const d = val;
                                            const day = String(d.getDate()).padStart(2, '0');
                                            const month = String(d.getMonth() + 1).padStart(2, '0');
                                            const year = d.getFullYear();
                                            return `${day}.${month}.${year}`; // Ergebnis: DD.MM.YYYY
                                        }

                                        // Falls es ein Preis ist (Zahl), können wir ihn hier auch runden
                                        if (typeof val === 'number' && col.metadata.colName === 'Preis_DZ') {
                                            return val.toFixed(2).replace('.', ','); // Ergebnis: 1050,00
                                        }

                                        return val;
                                    });
                                });

                                // 3. Köpfe und Daten zum 2D-Array zusammenfügen
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
