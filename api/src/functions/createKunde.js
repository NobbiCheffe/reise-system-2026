const { app } = require('@azure/functions');
const sql = require('mssql');

app.http('createKunde', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`API 'createKunde' aufgerufen.`);

        try {
            // 1. Daten aus dem Request-Body lesen
            const data = await request.json();

            // Validierung: Nachname ist ein Pflichtfeld in deiner DB
            if (!data.Nachname) {
                return { status: 400, body: "Fehler: Nachname ist ein Pflichtfeld." };
            }

            // 2. Verbindung zur Azure SQL Datenbank herstellen
            const pool = await sql.connect(process.env.SQL_CONNECTION_STRING);
            
            // 3. Den SQL-Befehl vorbereiten und ausführen
            const result = await pool.request()
                .input('anrede', sql.NVarChar, data.Anrede || null)
                .input('vorname', sql.NVarChar, data.Vorname || null)
                .input('nachname', sql.NVarChar, data.Nachname)
                .input('email', sql.NVarChar, data.Email || null)
                .input('strasse', sql.NVarChar, data.Strasse || null)
                .input('plz', sql.NVarChar, data.PLZ || null)
                .input('ort', sql.NVarChar, data.Ort || null)
                .input('accessid', sql.Int, data.Access_ID || null)
                .query(`
                    INSERT INTO Kunden (Anrede, Vorname, Nachname, Email, Strasse, PLZ, Ort, Access_ID)
                    VALUES (@anrede, @vorname, @nachname, @email, @strasse, @plz, @ort, @accessid)
                `);

            context.log('Kunde erfolgreich in SQL gespeichert.');

            // 4. Erfolgsantwort zurückgeben
            return { 
                status: 201, 
                body: "Kunde erfolgreich angelegt." 
            };

        } catch (err) {
            context.log('Schwerwiegender Fehler bei createKunde:', err.message);
            
            return { 
                status: 500, 
                body: `Datenbankfehler: ${err.message}` 
            };
        }
    }
});