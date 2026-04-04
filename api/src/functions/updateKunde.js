const { app } = require('@azure/functions');
const sql = require('mssql');

app.http('updateKunde', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const data = await request.json();
            const pool = await sql.connect(process.env.SQL_CONNECTION_STRING);
            
            await pool.request()
                .input('id', sql.Int, data.Kunden_ID)
                .input('vorname', sql.NVarChar, data.Vorname)
                .input('nachname', sql.NVarChar, data.Nachname)
                .input('email', sql.NVarChar, data.Email)
                .input('ort', sql.NVarChar, data.Ort)
                .input('strasse', sql.NVarChar, data.Strasse)
                .input('plz', sql.NVarChar, data.PLZ)
                .query(`
                    UPDATE Kunden 
                    SET Vorname=@vorname, Nachname=@nachname, Email=@email, Ort=@ort, Strasse=@strasse, PLZ=@plz
                    WHERE Kunden_ID=@id
                `);

            return { status: 200, body: "Update erfolgreich" };
        } catch (err) {
            return { status: 500, body: err.message };
        }
    }
});