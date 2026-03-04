const { Connection, Request } = require('tedious');

module.exports = async function (context, req) {
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
            trustServerCertificate: false
        }
    };

    return new Promise((resolve, reject) => {
        const connection = new Connection(config);
        connection.on('connect', err => {
            if (err) {
                context.log('Fehler beim Verbinden:', err);
                context.res = { status: 500, body: "DB Connect Error" };
                resolve();
            } else {
                const results = [];
                const request = new Request("SELECT TourID, Titel, Region FROM tbl_Touren", (err) => {
                    if (err) {
                        context.res = { status: 500, body: "Query Error" };
                    } else {
                        context.res = { body: results };
                    }
                    connection.close();
                    resolve();
                });

                request.on('row', columns => {
                    const row = {};
                    columns.forEach(col => { row[col.metadata.colName] = col.value; });
                    results.push(row);
                });

                connection.execSql(request);
            }
        });
        connection.connect();
    });
};
