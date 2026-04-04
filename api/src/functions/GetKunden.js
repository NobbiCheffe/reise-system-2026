const { app } = require('@azure/functions');
const sql = require('mssql');

app.http('getKunden', {
    methods: ['GET'],
    authLevel: 'anonymous', // Wir stellen das später auf 'function' oder 'admin' um
    handler: async (request, context) => {
        context.log(`API 'getKunden' aufgerufen.`);

        try {
            // Verbindung herstellen
            await sql.connect(process.env.SQL_CONNECTION_STRING);
            
            // Abfrage mit den neuen Feldnamen
            const result = await sql.query`
                SELECT TOP 100 
                    Kunden_ID, 
                    Nachname, 
                    Vorname, 
                    Ort, 
                    Email 
                FROM Kunden 
                ORDER BY Nachname ASC`;

            return { 
                jsonBody: result.recordset,
                status: 200 
            };
        } catch (err) {
            context.log('SQL Fehler:', err);
            return { 
                status: 500, 
                body: 'Datenbankfehler beim Laden der Kunden.' 
            };
        }
    }
});