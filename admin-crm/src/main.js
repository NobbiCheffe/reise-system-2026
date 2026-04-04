// Navigation umschalten
window.showSection = function(section) {
    document.getElementById('section-kunden').style.display = section === 'kunden' ? 'block' : 'none';
    document.getElementById('section-reisen').style.display = section === 'reisen' ? 'block' : 'none';
    
    if (section === 'reisen') loadReisen();
    else loadKunden();
}

async function loadReisen() {
    try {
        const response = await fetch('/api/getReisen');
        const reisen = await response.json();
        renderReisenTable(reisen);
    } catch (err) {
        console.error("Fehler beim Laden der Reisen:", err);
    }
}

function renderReisenTable(reisen) {
    const tableBody = document.querySelector('#reisen-daten');
    tableBody.innerHTML = reisen.map(r => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${r.Reise_ID}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${r.Titel}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${r.Start} - ${r.Ende}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${r.Verkaufspreis} €</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <span style="background: #e0f0ff; padding: 2px 6px; border-radius: 4px;">${r.Status}</span>
            </td>
        </tr>
    `).join('');
}

// Beim Start Kunden laden
loadKunden();