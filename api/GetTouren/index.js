const { Connection, Request } = require('tedious');

module.exports = async function (context, req) {
    // Konfiguration für deine Bergauf-Datenbank
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
            rowCollectionOnRequestCompletion: true // Wichtig für das Sammeln der Zeilen
        }
    };

    return new Promise((resolve) => {
        const connection = new Connection(config);
        
        connection.on('connect', err => {
            if (err) {
                context.log('Verbindungsfehler zur SQL-DB:', err);
                context.res = { status: 500, body: "Datenbank-Verbindung fehlgeschlagen." };
                resolve();
            } else {
                // Hier holen wir deine Touren ab
                const query = "SELECT TourID, TourCode, Titel, Region FROM tbl_Touren";
                const request = new Request(query, (err, rowCount, rows) => {
                    if (err) {
                        context.res = { status: 500, body: "Fehler bei der Abfrage." };
                    } else {
                        // Wir wandeln die SQL-Zeilen in einfaches JSON um
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
