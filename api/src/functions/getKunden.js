const { app } = require('@azure/functions');
const sql = require('mssql');

app.http('getKunden', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`API 'getKunden' aufgerufen.`);

        try {
            await sql.connect(process.env.SQL_CONNECTION_STRING);
            
            const result = await sql.query`
                SELECT 
                    Kunden_ID, 
                    Anrede, 
                    Vorname, 
                    Nachname, 
                    Email, 
                    Strasse, 
                    PLZ, 
                    Ort, 
                    Access_ID 
                FROM Kunden 
                ORDER BY Nachname ASC`;

            return { 
                jsonBody: result.recordset,
                status: 200 
            };
        } catch (err) {
            context.log('Fehler in getKunden:', err.message);
            return { status: 500, body: err.message };
        }
    }
});