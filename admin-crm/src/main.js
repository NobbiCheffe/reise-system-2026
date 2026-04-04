async function ladeTabelle() {
    const tableBody = document.querySelector('#kunden-daten');
    
    try {
        console.log("Suche API-Brücke...");
        const response = await fetch('/api/getKunden');

        // Check: Haben wir wirklich JSON bekommen oder HTML?
        const contentType = response.headers.get("content-type");
        if (!response.ok || !contentType || !contentType.includes("application/json")) {
            throw new Error("API nicht gefunden oder antwortet mit HTML (Vite-Fallback).");
        }

        const kundenDaten = await response.json();
        renderTable(kundenDaten);

    } catch (error) {
        console.warn("API lokal nicht erreichbar. Nutze Fallback-Daten für die Entwicklung.", error);
        
        // Diese Daten siehst du nur lokal in der Werkstatt
        const fallbackDaten = [
            { id: "26-BW01-01", name: "Max Mustermann (Lokal-Modus)", ort: "Bergisch Gladbach" },
            { id: "26-BW01-02", name: "Erika Schmidt (Lokal-Modus)", ort: "Köln" }
        ];
        renderTable(fallbackDaten);
    }
}

function renderTable(daten) {
    const tableBody = document.querySelector('#kunden-daten');
    if (tableBody) {
        tableBody.innerHTML = daten.map(k => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${k.id}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${k.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${k.ort}</td>
            </tr>
        `).join('');
    }
}

ladeTabelle();