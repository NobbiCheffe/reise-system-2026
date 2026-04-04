const { app } = require('@azure/functions');

app.http('getKunden', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http-Funktion 'getKunden' wurde aufgerufen.`);

        const kunden = [
            { id: "26-BW01-01", name: "Max Mustermann (API)", ort: "Bergisch Gladbach" },
            { id: "26-BW01-02", name: "Erika Schmidt (API)", ort: "Köln" }
        ];

        return { 
            jsonBody: kunden,
            status: 200 
        };
    }
});