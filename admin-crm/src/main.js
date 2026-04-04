// Sektionen umschalten
function showSection(name) {
    const kSec = document.getElementById('section-kunden');
    const rSec = document.getElementById('section-reisen');
    
    if (name === 'reisen') {
        kSec.style.display = 'none';
        rSec.style.display = 'block';
        loadReisen();
    } else {
        kSec.style.display = 'block';
        rSec.style.display = 'none';
        loadKunden();
    }
}

// Daten laden
async function loadKunden() {
    const res = await fetch('/api/getKunden');
    const data = await res.json();
    document.getElementById('kunden-daten').innerHTML = data.map(k => 
        `<tr><td>${k.Kunden_ID}</td><td>${k.Nachname}</td><td>${k.Ort}</td></tr>`
    ).join('');
}

async function loadReisen() {
    const res = await fetch('/api/getReisen');
    const data = await res.json();
    document.getElementById('reisen-daten').innerHTML = data.map(r => 
        `<tr><td>${r.Reise_ID}</td><td>${r.Titel}</td><td>${r.Start}</td><td>${r.Verkaufspreis} €</td></tr>`
    ).join('');
}

// Event Listener binden (Der Vite-Weg)
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-kunden').addEventListener('click', () => showSection('kunden'));
    document.getElementById('btn-reisen').addEventListener('click', () => showSection('reisen'));
    loadKunden(); // Start mit Kunden
});