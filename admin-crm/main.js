// Test-Log im Browser-Fenster (F12)
console.log("--- Bergauf CRM: main.js wurde gestartet ---");

// Wir warten, bis das HTML komplett geladen ist
window.addEventListener('DOMContentLoaded', () => {
    console.log("DOM ist bereit, suche Tabelle...");
    
    const tableBody = document.querySelector('#kunden-daten');

    if (!tableBody) {
        console.error("FEHLER: Das Element #kunden-daten wurde nicht gefunden!");
        return;
    }

    console.log("Tabelle gefunden, fülle Daten ein...");

    const kunden = [
        { id: "26-BW01-01", name: 'Max Mustermann', ort: 'Bergisch Gladbach' },
        { id: "26-BW01-02", name: 'Erika Schmidt', ort: 'Köln' }
    ];

    tableBody.innerHTML = kunden.map(k => `
        <tr>
            <td style="padding: 8px;">${k.id}</td>
            <td style="padding: 8px;">${k.name}</td>
            <td style="padding: 8px;">${k.ort}</td>
        </tr>
    `).join('');
    
    console.log("Daten erfolgreich eingefügt.");
});
