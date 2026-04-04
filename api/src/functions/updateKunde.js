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
                .input('access_id', sql.Int, data.Access_ID || null)
                .input('anrede', sql.NVarChar, data.Anrede || null)
                .input('vorname', sql.NVarChar, data.Vorname || null)
                .input('nachname', sql.NVarChar, data.Nachname)
                .input('zusatz', sql.NVarChar, data.Name_Zusatz || null)
                .input('geschlecht', sql.NChar, data.Geschlecht || null)
                .input('strasse', sql.NVarChar, data.Strasse || null)
                .input('plz', sql.NVarChar, data.PLZ || null)
                .input('ort', sql.NVarChar, data.Ort || null)
                .input('land', sql.NVarChar, data.Land || null)
                .input('nationalitaet', sql.NVarChar, data.Nationalitaet || null)
                .input('geburtsdatum', sql.Date, data.Geburtsdatum || null)
                .input('email', sql.NVarChar, data.Email || null)
                .input('tel_tag', sql.NVarChar, data.Telefon_Tag || null)
                .input('tel_abend', sql.NVarChar, data.Telefon_Abend || null)
                .input('mobil', sql.NVarChar, data.Mobil || null)
                .input('pass_nr', sql.NVarChar, data.Pass_Nummer || null)
                .input('pass_bis', sql.Date, data.Pass_Gueltig_Bis || null)
                .input('pass_ort', sql.NVarChar, data.Pass_Ausstellungsort || null)
                .input('pass_von', sql.Date, data.Pass_Ausstellungsdatum || null)
                .input('b_inhaber', sql.NVarChar, data.Bank_Kontoinhaber || null)
                .input('b_name', sql.NVarChar, data.Bank_Name || null)
                .input('b_iban', sql.NVarChar, data.Bank_IBAN || null)
                .input('b_bic', sql.NVarChar, data.Bank_BIC || null)
                .input('kk_typ', sql.NVarChar, data.KK_Typ || null)
                .input('kk_inhaber', sql.NVarChar, data.KK_Inhaber || null)
                .input('kk_nr', sql.NVarChar, data.KK_Nummer_Maskiert || null)
                .input('kk_bis', sql.NVarChar, data.KK_Gueltig_Bis || null)
                .input('bemerkungen', sql.NVarChar, data.Bemerkungen || null)
                .input('mailing', sql.Bit, data.Mailing_erlaubt ? 1 : 0)
                .input('freigabe', sql.Bit, data.Kontaktdaten_freigegeben ? 1 : 0)
                .input('alte_buchungen', sql.NVarChar, data.Alte_Buchungen || null)
                .input('zugehoerige', sql.NVarChar, data.Zugehoerige_Personen || null)
                .query(`
                    UPDATE Kunden SET 
                        Access_ID=@access_id, Anrede=@anrede, Vorname=@vorname, Nachname=@nachname, Name_Zusatz=@zusatz, Geschlecht=@geschlecht,
                        Strasse=@strasse, PLZ=@plz, Ort=@ort, Land=@land, Nationalitaet=@nationalitaet, Geburtsdatum=@geburtsdatum,
                        Email=@email, Telefon_Tag=@tel_tag, Telefon_Abend=@tel_abend, Mobil=@mobil,
                        Pass_Nummer=@pass_nr, Pass_Gueltig_Bis=@pass_bis, Pass_Ausstellungsort=@pass_ort, Pass_Ausstellungsdatum=@pass_von,
                        Bank_Kontoinhaber=@b_inhaber, Bank_Name=@b_name, Bank_IBAN=@b_iban, Bank_BIC=@b_bic,
                        KK_Typ=@kk_typ, KK_Inhaber=@kk_inhaber, KK_Nummer_Maskiert=@kk_nr, KK_Gueltig_Bis=@kk_bis,
                        Bemerkungen=@bemerkungen, Mailing_erlaubt=@mailing, Kontaktdaten_freigegeben=@freigabe, Alte_Buchungen=@alte_buchungen,Zugehoerige_Personen=@zugehoerige,
                        Letztes_Update=GETDATE()
                    WHERE Kunden_ID=@id
                `);

            return { status: 200, body: "Update erfolgreich" };
        } catch (err) {
            return { status: 500, body: err.message };
        }
    }
});