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
                Kunden_ID, Access_ID, Anrede, Vorname, Nachname, Name_Zusatz, Geschlecht,
                Strasse, PLZ, Ort, Land, Nationalitaet, Geburtsdatum,
                Email, Telefon_Tag, Telefon_Abend, Mobil,
                Pass_Nummer, Pass_Gueltig_Bis, Pass_Ausstellungsort, Pass_Ausstellungsdatum,
                Bank_Kontoinhaber, Bank_Name, Bank_IBAN, Bank_BIC,
                KK_Typ, KK_Inhaber, KK_Nummer_Maskiert, KK_Gueltig_Bis,
                Bemerkungen, Erstellt_Am, Letztes_Update,
                Mailing_erlaubt, Kontaktdaten_freigegeben, Alte_Buchungen
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