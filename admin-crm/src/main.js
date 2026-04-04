/**
 * Bergauf CRM - Master Control (main.js)
 * Stand: April 2026 - Layout-Upgrade & PLZ-Autofill
 */

let allKunden = [];

// ---------------------------------------------------------
// 1. INITIALISIERUNG & NAVIGATION
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-kunden').addEventListener('click', () => showSection('kunden'));
    document.getElementById('btn-reisen').addEventListener('click', () => showSection('reisen'));
    document.getElementById('kunden-suche').addEventListener('input', handleKundenSuche);
    document.getElementById('kunde-form').addEventListener('submit', handleKundeSpeichern);

    const closeModal = document.getElementById('close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            document.getElementById('customer-modal').style.display = 'none';
        });
    }
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

function formatDate(isoString) {
    if (!isoString) return '';
    return isoString.split('T')[0];
}

// ---------------------------------------------------------
// 2. PLZ-AUTOMATIK
// ---------------------------------------------------------
window.lookupPLZ = async function(plz) {
    if (plz.length === 5) {
        try {
            const response = await fetch(`https://api.zippopotam.us/de/${plz}`);
            if (response.ok) {
                const data = await response.json();
                const city = data.places[0]['place name'];
                document.getElementById('edit-ort').value = city;
            }
        } catch (err) {
            console.error("PLZ-Fehler:", err);
        }
    }
};

// ---------------------------------------------------------
// 3. KUNDEN-VERWALTUNG & DETAIL-ANSICHT
// ---------------------------------------------------------

async function loadKunden() {
    try {
        const response = await fetch('/api/getKunden');
        allKunden = await response.json();
        renderKundenTable(allKunden);
    } catch (err) { console.error(err); }
}

function renderKundenTable(daten) {
    const tableBody = document.getElementById('kunden-daten');
    if (!tableBody) return;
    tableBody.innerHTML = daten.map(k => `
        <tr onclick="window.openCustomerDetails(${k.Kunden_ID})" style="cursor: pointer;">
            <td>${k.Kunden_ID}</td>
            <td><strong>${k.Nachname}</strong>, ${k.Vorname || ''}</td>
            <td>${k.Ort || '-'}</td>
            <td>${k.Email || '-'}</td>
        </tr>
    `).join('');
}

window.openCustomerDetails = function(id) {
    const k = allKunden.find(kunde => kunde.Kunden_ID === id);
    if (!k) return;

    const modal = document.getElementById('customer-modal');
    const content = document.getElementById('modal-content');
    
    // Hilfsfunktion für Auswahlfelder
    const createOptions = (opts, selected) => {
        return opts.map(o => `<option value="${o}" ${o === selected ? 'selected' : ''}>${o || '(leer)'}</option>`).join('');
    };

    const anreden = ['', 'Herr', 'Frau', 'Familie', 'Eheleute', 'Firma'];
    const laender = ['Deutschland', 'Österreich', 'Schweiz', 'Niederlande', 'Belgien', 'Luxemburg', 'Frankreich', 'Italien', 'Dänemark', 'Polen', 'Tschechien'];
    const nationalitaeten = ['Deutsch', 'Österreichisch', 'Schweizer', 'Niederländisch', 'Belgisch', 'Luxemburgisch', 'Französisch', 'Italienisch', 'Dänisch', 'Polnisch', 'Tschechisch'];

    document.getElementById('modal-titel').innerText = `Kunden-Dossier: ${k.Nachname} (#${k.Kunden_ID})`;

    content.innerHTML = `
        <div class="modal-layout-container" style="display: flex; gap: 20px; width: 100%;">
            
            <div style="flex: 1; min-width: 0; border-right: 1px solid #eee; padding-right: 15px;">
                <div style="display: flex; background: #f4f4f4; margin-bottom: 10px;">
                    <button onclick="window.showTab('tab-basis')" class="tab-btn active">Basis</button>
                    <button onclick="window.showTab('tab-kontakt')" class="tab-btn">Kontakt</button>
                    <button onclick="window.showTab('tab-docs')" class="tab-btn">Dokumente</button>
                    <button onclick="window.showTab('tab-bank')" class="tab-btn">Bank</button>
                </div>

                <div id="tab-basis" class="tab-content active">
                    <label>Anrede</label>
                    <select id="edit-anrede">${createOptions(anreden, k.Anrede)}</select>
                    
                    <label>Vorname</label><input type="text" id="edit-vorname" value="${k.Vorname || ''}">
                    <label>Nachname *</label><input type="text" id="edit-nachname" value="${k.Nachname || ''}">
                    <label>Zusatz</label><input type="text" id="edit-zusatz" value="${k.Name_Zusatz || ''}">
                    
                    <label>Geburtsdatum</label><input type="date" id="edit-geburt" value="${formatDate(k.Geburtsdatum)}">
                    
                    <label>Nationalität</label>
                    <select id="edit-national">${createOptions(nationalitaeten, k.Nationalitaet || 'Deutsch')}</select>
                    
                    <div style="grid-column: span 2; margin-top: 10px;">
                        <label>👨‍👩‍👧‍👦 Zugehörige Personen / Familie</label>
                        <textarea id="edit-zugehoerige" style="width:100%; height:60px;">${k.Zugehoerige_Personen || ''}</textarea>
                    </div>
                </div>

                <div id="tab-kontakt" class="tab-content">
                    <label>PLZ (Auto-Ort)</label><input type="text" id="edit-plz" maxlength="5" value="${k.PLZ || ''}" oninput="window.lookupPLZ(this.value)">
                    <label>Ort</label><input type="text" id="edit-ort" value="${k.Ort || ''}">
                    <label>Straße</label><input type="text" id="edit-strasse" value="${k.Strasse || ''}" style="grid-column: span 2;">
                    <label>Land</label>
                    <select id="edit-land" style="grid-column: span 2;">${createOptions(laender, k.Land || 'Deutschland')}</select>
                    <hr style="grid-column: span 2;">
                    <label>E-Mail</label><input type="email" id="edit-email" value="${k.Email || ''}" style="grid-column: span 2;">
                    <label>Tel. Tag</label><input type="text" id="edit-teltag" value="${k.Telefon_Tag || ''}">
                    <label>Mobil</label><input type="text" id="edit-mobil" value="${k.Mobil || ''}">
                </div>

                <div id="tab-docs" class="tab-content">
                    <label>Pass-Nr.</label><input type="text" id="edit-passnr" value="${k.Pass_Nummer || ''}">
                    <label>Gültig bis</label><input type="date" id="edit-passbis" value="${formatDate(k.Pass_Gueltig_Bis)}">
                    <label>Ausstellungsort</label><input type="text" id="edit-passort" value="${k.Pass_Ausstellungsort || ''}" style="grid-column: span 2;">
                </div>

                <div id="tab-bank" class="tab-content">
                    <label>Kontoinhaber</label><input type="text" id="edit-binhaber" value="${k.Bank_Kontoinhaber || ''}" style="grid-column: span 2;">
                    <label>IBAN</label><input type="text" id="edit-iban" value="${k.Bank_IBAN || ''}" style="grid-column: span 2;">
                    <label>BIC</label><input type="text" id="edit-bic" value="${k.Bank_BIC || ''}">
                </div>
            </div>

            <div style="width: 300px; display: flex; flex-direction: column; gap: 15px;">
                <div style="background: #fff8e1; padding: 10px; border: 1px solid #ffe082; border-radius: 4px;">
                    <label style="font-weight: bold; color: #f57f17;">📢 Notizen / Bemerkungen</label>
                    <textarea id="edit-memo" style="width: 100%; height: 100px; margin-top: 5px;">${k.Bemerkungen || ''}</textarea>
                </div>
                
                <div style="background: #f1f8ff; padding: 10px; border: 1px solid #c8e1ff; border-radius: 4px;">
                    <label style="font-weight: bold; color: #0366d6;">📜 Buchungshistorie</label>
                    <textarea id="edit-alte" style="width: 100%; height: 150px; margin-top: 5px;">${k.Alte_Buchungen || ''}</textarea>
                </div>

                <div style="margin-top: auto; padding: 10px; background: #f9f9f9; border-radius: 4px; font-size: 0.8em;">
                    <label><input type="checkbox" id="edit-mailing" ${k.Mailing_erlaubt ? 'checked' : ''}> Mailing erlaubt</label><br>
                    <label><input type="checkbox" id="edit-freigabe" ${k.Kontaktdaten_freigegeben ? 'checked' : ''}> Kontaktfreigabe</label>
                </div>
            </div>
        </div>

        <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #eee;">
            <button onclick="window.saveCustomerChanges(${k.Kunden_ID})" class="btn-save" style="width:100%; padding:15px; font-weight:bold; background: #28a745; color: white; border: none; cursor: pointer;">
                💾 Alle Daten in Azure SQL speichern
            </button>
        </div>
    `;

    if(!document.getElementById('tab-styles')) {
        const style = document.createElement('style');
        style.id = 'tab-styles';
        style.innerHTML = `
            .tab-btn { padding: 10px; cursor: pointer; border: none; background: #e0e0e0; flex: 1; border-right: 1px solid #ccc; font-size: 13px; }
            .tab-btn.active { background: white; border-bottom: 2px solid #004a99; font-weight: bold; }
            .tab-content { display: none; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 15px; }
            .tab-content.active { display: grid; }
            .tab-content label { font-size: 11px; font-weight: bold; color: #666; margin-bottom: -5px; }
            .tab-content input, .tab-content select, .tab-content textarea { padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
        `;
        document.head.appendChild(style);
    }
    modal.style.display = 'block';
};

window.showTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
};

window.saveCustomerChanges = async function(id) {
    const data = {
        Kunden_ID: id,
        Anrede: document.getElementById('edit-anrede').value,
        Vorname: document.getElementById('edit-vorname').value,
        Nachname: document.getElementById('edit-nachname').value,
        Name_Zusatz: document.getElementById('edit-zusatz').value,
        Geburtsdatum: document.getElementById('edit-geburt').value || null,
        Nationalitaet: document.getElementById('edit-national').value,
        Strasse: document.getElementById('edit-strasse').value,
        PLZ: document.getElementById('edit-plz').value,
        Ort: document.getElementById('edit-ort').value,
        Land: document.getElementById('edit-land').value,
        Email: document.getElementById('edit-email').value,
        Telefon_Tag: document.getElementById('edit-teltag').value,
        Mobil: document.getElementById('edit-mobil').value,
        Pass_Nummer: document.getElementById('edit-passnr').value,
        Pass_Gueltig_Bis: document.getElementById('edit-passbis').value || null,
        Pass_Ausstellungsort: document.getElementById('edit-passort').value,
        Bank_Kontoinhaber: document.getElementById('edit-binhaber').value,
        Bank_IBAN: document.getElementById('edit-iban').value,
        Bank_BIC: document.getElementById('edit-bic').value,
        Bemerkungen: document.getElementById('edit-memo').value,
        Mailing_erlaubt: document.getElementById('edit-mailing').checked,
        Kontaktdaten_freigegeben: document.getElementById('edit-freigabe').checked,
        Alte_Buchungen: document.getElementById('edit-alte').value,
        Zugehoerige_Personen: document.getElementById('edit-zugehoerige').value
    };

    try {
        const res = await fetch('/api/updateKunde', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
            alert('Datenblatt gespeichert!');
            document.getElementById('customer-modal').style.display = 'none';
            loadKunden();
        }
    } catch (err) { console.error(err); }
};

// ---------------------------------------------------------
// 4. SUCHE & REISEN (REST)
// ---------------------------------------------------------
function handleKundenSuche(e) {
    const term = e.target.value.toLowerCase();
    const gefiltert = allKunden.filter(k => 
        (k.Nachname || "").toLowerCase().includes(term) || 
        (k.Vorname || "").toLowerCase().includes(term) || 
        (k.Kunden_ID || "").toString().includes(term)
    );
    renderKundenTable(gefiltert);
}

async function handleKundeSpeichern(e) {
    e.preventDefault();
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
}

async function loadReisen() {
    try {
        const response = await fetch('/api/getReisen');
        const reisen = await response.json();
        renderReisenTable(reisen);
    } catch (err) { console.error(err); }
}

function renderReisenTable(reisen) {
    const tableBody = document.getElementById('reisen-daten');
    if (!tableBody) return;
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