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

// Funktion zum Anzeigen der Details
function openCustomerDetails(kundenId) {
    const kunde = allKunden.find(k => k.Kunden_ID === kundenId);
    if (!kunde) return;

    const modal = document.getElementById('customer-modal');
    const content = document.getElementById('modal-content');
    
    document.getElementById('modal-titel').innerText = `Datenblatt: ${kunde.Nachname}, ${kunde.Vorname || ''}`;

    // Alle Felder schön aufbereitet anzeigen
    content.innerHTML = `
        <div><strong>Kunden-ID:</strong><br> ${kunde.Kunden_ID}</div>
        <div><strong>Alte Access-ID:</strong><br> ${kunde.Access_ID || '---'}</div>
        <div><strong>Anrede:</strong><br> ${kunde.Anrede || '---'}</div>
        <div><strong>E-Mail:</strong><br> ${kunde.Email || '---'}</div>
        <div><strong>Straße:</strong><br> ${kunde.Strasse || '---'}</div>
        <div><strong>PLZ / Ort:</strong><br> ${kunde.PLZ || ''} ${kunde.Ort || ''}</div>
    `;

    modal.style.display = 'block';
}

// Tabellen-Ansicht aktualisieren (jetzt mit Klick-Funktion)
function renderKundenTable(daten) {
    const tableBody = document.getElementById('kunden-daten');
    if (!tableBody) return;

    tableBody.innerHTML = daten.map(k => `
        <tr onclick="openCustomerDetails(${k.Kunden_ID})" style="cursor: pointer;" title="Klicken für Details">
            <td>${k.Kunden_ID}</td>
            <td><strong>${k.Nachname}</strong>, ${k.Vorname || ''}</td>
            <td>${k.Ort || '-'}</td>
            <td>${k.Email || '-'}</td>
        </tr>
    `).join('');
}

// Schließen-Event für das Modal
document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('customer-modal').style.display = 'none';
});