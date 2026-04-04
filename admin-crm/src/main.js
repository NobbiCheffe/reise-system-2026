/**
 * Bergauf CRM - Vollständige Hauptlogik (main.js)
 */

let allKunden = [];

// 1. INITIALISIERUNG
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    console.log("Bergauf CRM geladen...");

    // Navigation
    document.getElementById('btn-kunden').addEventListener('click', () => showSection('kunden'));
    document.getElementById('btn-reisen').addEventListener('click', () => showSection('reisen'));

    // Suche & Formular
    document.getElementById('kunden-suche').addEventListener('input', handleKundenSuche);
    document.getElementById('kunde-form').addEventListener('submit', handleKundeSpeichern);

    // Modal Schließen-Button
    const closeModal = document.getElementById('close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            document.getElementById('customer-modal').style.display = 'none';
        });
    }

    // Start-Ansicht
    loadKunden();
});

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

// 2. KUNDEN-LOGIK & MODAL (GLOBAL FÜR VITE)
// ---------------------------------------------------------

// Lädt die Kundenliste
async function loadKunden() {
    try {
        const response = await fetch('/api/getKunden');
        allKunden = await response.json();
        renderKundenTable(allKunden);
    } catch (err) {
        console.error("Fehler beim Laden der Kunden:", err);
    }
}

// Rendert die Tabelle
function renderKundenTable(daten) {
    const tableBody = document.getElementById('kunden-daten');
    if (!tableBody) return;

    tableBody.innerHTML = daten.map(k => `
        <tr onclick="window.openCustomerDetails(${k.Kunden_ID})" style="cursor: pointer;" title="Klicken für Datenblatt">
            <td>${k.Kunden_ID}</td>
            <td><strong>${k.Nachname}</strong>, ${k.Vorname || ''}</td>
            <td>${k.Ort || '-'}</td>
            <td>${k.Email || '-'}</td>
        </tr>
    `).join('');
}

// Das "Geheimnis" für Vite: Funktionen an window hängen
window.openCustomerDetails = function(id) {
    const kunde = allKunden.find(k => k.Kunden_ID === id);
    if (!kunde) return;

    const modal = document.getElementById('customer-modal');
    const content = document.getElementById('modal-content');
    
    document.getElementById('modal-titel').innerText = `Datenblatt: ${kunde.Nachname}`;

    content.innerHTML = `
        <div style="display:flex; flex-direction:column;"><label>Vorname</label><input type="text" id="edit-vorname" value="${kunde.Vorname || ''}"></div>
        <div style="display:flex; flex-direction:column;"><label>Nachname</label><input type="text" id="edit-nachname" value="${kunde.Nachname || ''}"></div>
        <div style="display:flex; flex-direction:column;"><label>E-Mail</label><input type="email" id="edit-email" value="${kunde.Email || ''}"></div>
        <div style="display:flex; flex-direction:column;"><label>Ort</label><input type="text" id="edit-ort" value="${kunde.Ort || ''}"></div>
        <div style="display:flex; flex-direction:column;"><label>Straße</label><input type="text" id="edit-strasse" value="${kunde.Strasse || ''}"></div>
        <div style="display:flex; flex-direction:column;"><label>PLZ</label><input type="text" id="edit-plz" value="${kunde.PLZ || ''}"></div>
        <div style="grid-column: span 2; margin-top: 20px;">
            <button onclick="window.saveCustomerChanges(${kunde.Kunden_ID})" 
                    style="width:100%; padding:15px; background:#28a745; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">
                💾 Änderungen speichern
            </button>
        </div>
    `;
    modal.style.display = 'block';
};

window.saveCustomerChanges = async function(id) {
    const updatedData = {
        Kunden_ID: id,
        Vorname: document.getElementById('edit-vorname').value,
        Nachname: document.getElementById('edit-nachname').value,
        Email: document.getElementById('edit-email').value,
        Ort: document.getElementById('edit-ort').value,
        Strasse: document.getElementById('edit-strasse').value,
        PLZ: document.getElementById('edit-plz').value
    };

    try {
        const response = await fetch('/api/updateKunde', {
            method: 'POST',
            body: JSON.stringify(updatedData),
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            alert('Daten erfolgreich aktualisiert!');
            document.getElementById('customer-modal').style.display = 'none';
            loadKunden();
        } else {
            alert('Fehler beim Speichern der Änderungen.');
        }
    } catch (err) {
        console.error("Update Fehler:", err);
    }
};

// Suche
function handleKundenSuche(e) {
    const term = e.target.value.toLowerCase();
    const gefiltert = allKunden.filter(k => 
        (k.Nachname || "").toLowerCase().includes(term) || 
        (k.Kunden_ID || "").toString().includes(term)
    );
    renderKundenTable(gefiltert);
}

// Neuanlage
async function handleKundeSpeichern(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button');
    submitBtn.disabled = true;

    const neuerKunde = {
        Nachname: document.getElementById('k-nachname').value,
        Vorname: document.getElementById('k-vorname').value,
        Email: document.getElementById('k-email').value,
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
            alert('Kunde angelegt!');
            e.target.reset();
            loadKunden();
        }
    } catch (err) { console.error(err); }
    finally { submitBtn.disabled = false; }
}


// 3. REISEN-LOGIK (WICHTIG: DARF NICHT FEHLEN!)
// ---------------------------------------------------------
async function loadReisen() {
    try {
        const response = await fetch('/api/getReisen');
        if (!response.ok) throw new Error('Fehler');
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
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Keine Reisen gefunden.</td></tr>';
        return;
    }

    tableBody.innerHTML = reisen.map(r => `
        <tr>
            <td>${r.Reise_ID}</td>
            <td><strong>${r.Titel}</strong></td>
            <td>${r.Start} - ${r.Ende}</td>
            <td>${r.Verkaufspreis ? r.Verkaufspreis.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'}) : '-'}</td>
            <td>${r.Status || 'Geplant'}</td>
        </tr>
    `).join('');
}