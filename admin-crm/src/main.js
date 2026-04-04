/**
 * Bergauf CRM - Master Control (main.js)
 * Stand: April 2026
 */

let allKunden = [];

// ---------------------------------------------------------
// 1. INITIALISIERUNG & NAVIGATION
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    console.log("Bergauf CRM Zentrale wird hochgefahren...");

    // Haupt-Navigation
    document.getElementById('btn-kunden').addEventListener('click', () => showSection('kunden'));
    document.getElementById('btn-reisen').addEventListener('click', () => showSection('reisen'));

    // Suche & Neuanlage-Formular
    document.getElementById('kunden-suche').addEventListener('input', handleKundenSuche);
    document.getElementById('kunde-form').addEventListener('submit', handleKundeSpeichern);

    // Modal Schließen (X-Button)
    const closeModal = document.getElementById('close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            document.getElementById('customer-modal').style.display = 'none';
        });
    }

    // Initialer Ladevorgang
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

// Hilfsfunktion: SQL-Datum (ISO) in HTML-Datum (YYYY-MM-DD) umwandeln
function formatDate(isoString) {
    if (!isoString) return '';
    return isoString.split('T')[0];
}

// ---------------------------------------------------------
// 2. KUNDEN-VERWALTUNG (DATENBLATT & EDIT)
// ---------------------------------------------------------

async function loadKunden() {
    try {
        const response = await fetch('/api/getKunden');
        allKunden = await response.json();
        renderKundenTable(allKunden);
    } catch (err) {
        console.error("Fehler beim Abruf der Kundendaten:", err);
    }
}

function renderKundenTable(daten) {
    const tableBody = document.getElementById('kunden-daten');
    if (!tableBody) return;

    tableBody.innerHTML = daten.map(k => `
        <tr onclick="window.openCustomerDetails(${k.Kunden_ID})" style="cursor: pointer;" title="Klicken für vollständiges Datenblatt">
            <td>${k.Kunden_ID}</td>
            <td><strong>${k.Nachname}</strong>, ${k.Vorname || ''}</td>
            <td>${k.Ort || '-'}</td>
            <td>${k.Email || '-'}</td>
        </tr>
    `).join('');
}

// Das große Datenblatt öffnen (Global für Vite/HTML)
window.openCustomerDetails = function(id) {
    const k = allKunden.find(kunde => kunde.Kunden_ID === id);
    if (!k) return;

    const modal = document.getElementById('customer-modal');
    const content = document.getElementById('modal-content');
    
    document.getElementById('modal-titel').innerText = `Kunden-Dossier: ${k.Nachname} (ID #${k.Kunden_ID})`;

    content.innerHTML = `
        <div style="grid-column: span 2; display: flex; border-bottom: 1px solid #ddd; margin-bottom: 15px; background: #f4f4f4;">
            <button onclick="window.showTab('tab-basis')" class="tab-btn active">Basisdaten</button>
            <button onclick="window.showTab('tab-kontakt')" class="tab-btn">Kontakt</button>
            <button onclick="window.showTab('tab-docs')" class="tab-btn">Dokumente</button>
            <button onclick="window.showTab('tab-bank')" class="tab-btn">Bank & Zahlungsdaten</button>
            <button onclick="window.showTab('tab-memo')" class="tab-btn">Historie & Intern</button>
        </div>

        <div id="tab-basis" class="tab-content active">
            <label>Anrede</label><input type="text" id="edit-anrede" value="${k.Anrede || ''}">
            <label>Vorname</label><input type="text" id="edit-vorname" value="${k.Vorname || ''}">
            <label>Nachname *</label><input type="text" id="edit-nachname" value="${k.Nachname || ''}">
            <label>Namenszusatz</label><input type="text" id="edit-zusatz" value="${k.Name_Zusatz || ''}">
            <label>Geschlecht (M/W/D)</label><input type="text" id="edit-geschlecht" value="${k.Geschlecht || ''}">
            <label>Geburtsdatum</label><input type="date" id="edit-geburt" value="${formatDate(k.Geburtsdatum)}">
            <label>Nationalität</label><input type="text" id="edit-national" value="${k.Nationalitaet || ''}">
            <label>System Kunden-ID</label><input type="text" value="${k.Kunden_ID}" disabled style="background:#eee;">
        </div>

        <div id="tab-kontakt" class="tab-content">
            <label>Straße & Hausnr.</label><input type="text" id="edit-strasse" value="${k.Strasse || ''}">
            <label>PLZ</label><input type="text" id="edit-plz" value="${k.PLZ || ''}">
            <label>Ort</label><input type="text" id="edit-ort" value="${k.Ort || ''}">
            <label>Land</label><input type="text" id="edit-land" value="${k.Land || 'Deutschland'}">
            <hr style="grid-column: span 2; margin: 10px 0;">
            <label>E-Mail</label><input type="email" id="edit-email" value="${k.Email || ''}">
            <label>Telefon (Tag)</label><input type="text" id="edit-teltag" value="${k.Telefon_Tag || ''}">
            <label>Telefon (Abend)</label><input type="text" id="edit-telabend" value="${k.Telefon_Abend || ''}">
            <label>Mobiltelefon</label><input type="text" id="edit-mobil" value="${k.Mobil || ''}">
        </div>

        <div id="tab-docs" class="tab-content">
            <label>Reisepass-Nr.</label><input type="text" id="edit-passnr" value="${k.Pass_Nummer || ''}">
            <label>Gültig bis</label><input type="date" id="edit-passbis" value="${formatDate(k.Pass_Gueltig_Bis)}">
            <label>Ausstellungsort</label><input type="text" id="edit-passort" value="${k.Pass_Ausstellungsort || ''}">
            <label>Ausstellungsdatum</label><input type="date" id="edit-passvon" value="${formatDate(k.Pass_Ausstellungsdatum)}">
        </div>

        <div id="tab-bank" class="tab-content">
            <label>Kontoinhaber</label><input type="text" id="edit-binhaber" value="${k.Bank_Kontoinhaber || ''}">
            <label>Bank Name</label><input type="text" id="edit-bname" value="${k.Bank_Name || ''}">
            <label>IBAN</label><input type="text" id="edit-iban" value="${k.Bank_IBAN || ''}">
            <label>BIC</label><input type="text" id="edit-bic" value="${k.Bank_BIC || ''}">
            <hr style="grid-column: span 2; margin: 10px 0;">
            <label>KK Typ</label><input type="text" id="edit-kktyp" value="${k.KK_Typ || ''}">
            <label>KK Inhaber</label><input type="text" id="edit-kkinhaber" value="${k.KK_Inhaber || ''}">
            <label>KK Nr (Maskiert)</label><input type="text" id="edit-kknr" value="${k.KK_Nummer_Maskiert || ''}">
            <label>KK Gültig bis</label><input type="text" id="edit-kkbis" value="${k.KK_Gueltig_Bis || ''}">
        </div>

        <div id="tab-memo" class="tab-content">
            <label style="display:flex; align-items:center; gap:10px;">
                <input type="checkbox" id="edit-mailing" ${k.Mailing_erlaubt ? 'checked' : ''}> Mailing erlaubt
            </label>
            <label style="display:flex; align-items:center; gap:10px;">
                <input type="checkbox" id="edit-freigabe" ${k.Kontaktdaten_freigegeben ? 'checked' : ''}> Kontaktfreigabe (Fahrgem.)
            </label>
            <label style="grid-column: span 2; margin-top:10px;">Bemerkungen</label>
            <textarea id="edit-memo" style="grid-column: span 2; height: 60px;">${k.Bemerkungen || ''}</textarea>
            <label style="grid-column: span 2;">Alte Buchungen / Historie</label>
            <textarea id="edit-alte" style="grid-column: span 2; height: 100px;">${k.Alte_Buchungen || ''}</textarea>
            <div style="grid-column: span 2; font-size: 0.8em; color: #777; margin-top: 15px; border-top: 1px solid #eee; padding-top: 5px;">
                Erstellt am: ${k.Erstellt_Am || '-'} | Letztes Update: ${k.Letztes_Update || '-'} | Access-ID: ${k.Access_ID || '-'}
            </div>
        </div>

        <div style="grid-column: span 2; margin-top: 25px; border-top: 2px solid #eee; padding-top: 15px;">
            <button onclick="window.saveCustomerChanges(${k.Kunden_ID})" class="btn-save" style="width:100%; padding:15px; font-size:1.1em;">
                💾 Gesamtes Datenblatt in Azure SQL speichern
            </button>
        </div>
    `;

    // CSS für die Tabs (einmalig einfügen)
    if(!document.getElementById('tab-styles')) {
        const style = document.createElement('style');
        style.id = 'tab-styles';
        style.innerHTML = `
            .tab-btn { padding: 12px; cursor: pointer; border: none; background: #e0e0e0; flex: 1; transition: 0.2s; border-right: 1px solid #ccc; font-weight: bold; }
            .tab-btn.active { background: white; border-bottom: 3px solid #004a99; color: #004a99; }
            .tab-content { display: none; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px; }
            .tab-content.active { display: grid; }
            .tab-content label { font-size: 0.85em; font-weight: bold; color: #444; margin-bottom: -8px; }
            .tab-content input, .tab-content textarea { padding: 10px; border: 1px solid #bbb; border-radius: 4px; font-size: 14px; }
            .tab-content input:focus { border-color: #004a99; outline: none; background: #fdfdfd; }
        `;
        document.head.appendChild(style);
    }
    
    modal.style.display = 'block';
};

// Tab-Umschaltung
window.showTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
};

// Update an die API senden
window.saveCustomerChanges = async function(id) {
    const data = {
        Kunden_ID: id,
        Anrede: document.getElementById('edit-anrede').value,
        Vorname: document.getElementById('edit-vorname').value,
        Nachname: document.getElementById('edit-nachname').value,
        Name_Zusatz: document.getElementById('edit-zusatz').value,
        Geschlecht: document.getElementById('edit-geschlecht').value,
        Geburtsdatum: document.getElementById('edit-geburt').value || null,
        Nationalitaet: document.getElementById('edit-national').value,
        Strasse: document.getElementById('edit-strasse').value,
        PLZ: document.getElementById('edit-plz').value,
        Ort: document.getElementById('edit-ort').value,
        Land: document.getElementById('edit-land').value,
        Email: document.getElementById('edit-email').value,
        Telefon_Tag: document.getElementById('edit-teltag').value,
        Telefon_Abend: document.getElementById('edit-telabend').value,
        Mobil: document.getElementById('edit-mobil').value,
        Pass_Nummer: document.getElementById('edit-passnr').value,
        Pass_Gueltig_Bis: document.getElementById('edit-passbis').value || null,
        Pass_Ausstellungsort: document.getElementById('edit-passort').value,
        Pass_Ausstellungsdatum: document.getElementById('edit-passvon').value || null,
        Bank_Kontoinhaber: document.getElementById('edit-binhaber').value,
        Bank_Name: document.getElementById('edit-bname').value,
        Bank_IBAN: document.getElementById('edit-iban').value,
        Bank_BIC: document.getElementById('edit-bic').value,
        KK_Typ: document.getElementById('edit-kktyp').value,
        KK_Inhaber: document.getElementById('edit-kkinhaber').value,
        KK_Nummer_Maskiert: document.getElementById('edit-kknr').value,
        KK_Gueltig_Bis: document.getElementById('edit-kkbis').value,
        Bemerkungen: document.getElementById('edit-memo').value,
        Mailing_erlaubt: document.getElementById('edit-mailing').checked,
        Kontaktdaten_freigegeben: document.getElementById('edit-freigabe').checked,
        Alte_Buchungen: document.getElementById('edit-alte').value
    };

    try {
        const res = await fetch('/api/updateKunde', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
            alert('Datenblatt erfolgreich gespeichert!');
            document.getElementById('customer-modal').style.display = 'none';
            loadKunden();
        } else {
            alert('Fehler beim Speichern in der Datenbank.');
        }
    } catch (err) {
        console.error("Netzwerkfehler beim Update:", err);
    }
};

// ---------------------------------------------------------
// 3. SUCHE & NEUANLAGE
// ---------------------------------------------------------

function handleKundenSuche(e) {
    const term = e.target.value.toLowerCase();
    const gefiltert = allKunden.filter(k => 
        (k.Nachname || "").toLowerCase().includes(term) || 
        (k.Vorname || "").toLowerCase().includes(term) || 
        (k.Email || "").toLowerCase().includes(term) || 
        (k.Kunden_ID || "").toString().includes(term)
    );
    renderKundenTable(gefiltert);
}

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
            alert('Kunde erfolgreich angelegt!');
            e.target.reset();
            loadKunden();
        }
    } catch (err) { console.error(err); }
    finally { submitBtn.disabled = false; }
}

// ---------------------------------------------------------
// 4. REISEN-VERWALTUNG
// ---------------------------------------------------------

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
    const tableBody = document.getElementById('reisen-daten');
    if (!tableBody) return;

    if (reisen.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">Keine Reisen gefunden.</td></tr>';
        return;
    }

    tableBody.innerHTML = reisen.map(r => `
        <tr>
            <td>${r.Reise_ID}</td>
            <td><strong>${r.Titel}</strong></td>
            <td>${r.Start || ''} - ${r.Ende || ''}</td>
            <td>${r.Verkaufspreis ? r.Verkaufspreis.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'}) : '-'}</td>
            <td>${r.Status || 'Geplant'}</td>
        </tr>
    `).join('');
}