const { app } = require('@azure/functions');
const sql = require('mssql');

app.http('getReisen', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`API 'getReisen' aufgerufen.`);

        try {
            await sql.connect(process.env.SQL_CONNECTION_STRING);
            
            // Wir nutzen FORMAT direkt in SQL für TT.MM.JJJJ
            const result = await sql.query`
                SELECT 
                    Reise_ID, 
                    Titel, 
                    Zielort, 
                    FORMAT(Startdatum, 'dd.MM.yyyy') AS Start, 
                    FORMAT(Enddatum, 'dd.MM.yyyy') AS Ende, 
                    Verkaufspreis,
                    Teilnehmer_Max,
                    Teilnehmer_Aktuell,
                    Status
                FROM Reisen 
                ORDER BY Startdatum ASC`;

            return { jsonBody: result.recordset, status: 200 };
        } catch (err) {
            context.log('SQL Fehler Reisen:', err);
            return { status: 500, body: 'Fehler beim Laden der Reisen.' };
        }
    }
});