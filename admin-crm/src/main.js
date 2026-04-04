/**
 * Bergauf CRM - Hauptlogik (main.js)
 */

// Globaler Speicher, damit die Suche blitzschnell ohne Server-Anfrage funktioniert
let allKunden = [];

// 1. INITIALISIERUNG
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    console.log("Bergauf CRM geladen. Starte Initialisierung...");

    // Event Listener für die Navigation
    document.getElementById('btn-kunden').addEventListener('click', () => showSection('kunden'));
    document.getElementById('btn-reisen').addEventListener('click', () => showSection('reisen'));

    // Event Listener für die Kundensuche
    document.getElementById('kunden-suche').addEventListener('input', handleKundenSuche);

    // Event Listener für das Kunden-Formular (Neuanlage)
    document.getElementById('kunde-form').addEventListener('submit', handleKundeSpeichern);

    // Startansicht: Kunden laden
    loadKunden();
});


// 2. NAVIGATION & SEKTIONEN
// ---------------------------------------------------------
function showSection(sectionName) {
    const kundenSec = document.getElementById('section-kunden');
    const reisenSec = document.getElementById('section-reisen');

    if (sectionName === 'reisen') {
        kundenSec.classList.remove('active');
        reisenSec.classList.add('active');
        loadReisen();
    } else {
        reisenSec.classList.remove('active');
        kundenSec.classList.add('active');
        loadKunden();
    }
}


// 3. KUNDEN-LOGIK
// ---------------------------------------------------------

// Kunden von der API abrufen
async function loadKunden() {
    try {
        const response = await fetch('/api/getKunden');
        if (!response.ok) throw new Error('Fehler beim Laden der Kunden');
        
        allKunden = await response.json();
        renderKundenTable(allKunden);
    } catch (err) {
        console.error("API Fehler (Kunden):", err);
    }
}

// Kunden in die Tabelle schreiben
function renderKundenTable(daten) {
    const tableBody = document.getElementById('kunden-daten');
    if (!tableBody) return;

    if (daten.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">Keine Kunden gefunden.</td></tr>';
        return;
    }

    tableBody.innerHTML = daten.map(k => `
        <tr>
            <td>${k.Kunden_ID}</td>
            <td><strong>${k.Nachname}</strong>, ${k.Vorname || ''}</td>
            <td>${k.Ort || '-'}</td>
            <td>${k.Email || '-'}</td>
        </tr>
    `).join('');
}

// Suchfunktion (Filtert den globalen Speicher allKunden)
function handleKundenSuche(e) {
    const term = e.target.value.toLowerCase();
    
    const gefiltert = allKunden.filter(k => {
        return (k.Nachname || "").toLowerCase().includes(term) ||
               (k.Vorname || "").toLowerCase().includes(term) ||
               (k.Email || "").toLowerCase().includes(term) ||
               (k.Kunden_ID || "").toString().includes(term);
    });

    renderKundenTable(gefiltert);
}

// Neuen Kunden an die API senden
async function handleKundeSpeichern(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Speichere...';

    const neuerKunde = {
        Anrede: document.getElementById('k-anrede').value,
        Vorname: document.getElementById('k-vorname').value,
        Nachname: document.getElementById('k-nachname').value,
        Email: document.getElementById('k-email').value,
        Strasse: document.getElementById('k-strasse').value,
        PLZ: document.getElementById('k-plz').value,
        Ort: document.getElementById('k-ort').value,
        Access_ID: document.getElementById('k-accessid').value ? parseInt(document.getElementById('k-accessid').value) : null
    };

    try {
        const response = await fetch('/api/createKunde', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(neuerKunde)
        });

        if (response.ok) {
            alert('Kunde erfolgreich angelegt!');
            e.target.reset(); // Formular leeren
            loadKunden();     // Liste aktualisieren
        } else {
            const errorText = await response.text();
            alert('Fehler beim Speichern: ' + errorText);
        }
    } catch (err) {
        console.error("Sende-Fehler:", err);
        alert('Netzwerkfehler beim Speichern.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Kunde in Datenbank speichern';
    }
}


// 4. REISEN-LOGIK
// ---------------------------------------------------------

async function loadReisen() {
    try {
        const response = await fetch('/api/getReisen');
        if (!response.ok) throw new Error('Fehler beim Laden der Reisen');
        
        const reisen = await response.json();
        renderReisenTable(reisen);
    } catch (err) {
        console.error("API Fehler (Reisen):", err);
    }
}

function renderReisenTable(reisen) {
    const tableBody = document.getElementById('reisen-daten');
    if (!tableBody) return;

    if (reisen.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">Keine Reisen geplant.</td></tr>';
        return;
    }

    tableBody.innerHTML = reisen.map(r => `
        <tr>
            <td>${r.Reise_ID}</td>
            <td><strong>${r.Titel}</strong><br><small>${r.Zielort || ''}</small></td>
            <td>${r.Start} - ${r.Ende}</td>
            <td>${r.Verkaufspreis ? r.Verkaufspreis.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'}) : '-'}</td>
            <td><span class="status-badge">${r.Status || 'Geplant'}</span></td>
        </tr>
    `).join('');
}