import './style.css'

// Diese Funktion holt die Daten von deiner Azure Function API
async function ladeKunden() {
  const tableBody = document.querySelector('#kunden-daten');
  
  try {
    // Später: const response = await fetch('/api/getKunden');
    // Für den ersten Test simulieren wir die SQL-Antwort:
    const kunden = [
      { id: 1, name: 'Max Mustermann', ort: 'Köln', email: 'max@beispiel.de' },
      { id: 2, name: 'Erika Schmidt', ort: 'Berlin', email: 'erika@web.de' }
    ];

    tableBody.innerHTML = kunden.map(k => `
      <tr>
        <td>${k.id}</td>
        <td>${k.name}</td>
        <td>${k.ort}</td>
        <td>${k.email}</td>
        <td><button onclick="alert('Details für ${k.name}')">Öffnen</button></td>
      </tr>
    `).join('');

  } catch (error) {
    tableBody.innerHTML = '<tr><td colspan="5">Fehler beim Laden der Daten.</td></tr>';
  }
}

ladeKunden();
