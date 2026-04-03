console.log("Bergauf-Logik geladen!");

const tableBody = document.querySelector('#kunden-daten');

const kunden = [
  { id: "26-BW01-01", name: 'Max Mustermann', ort: 'Bergisch Gladbach' },
  { id: "26-BW01-02", name: 'Erika Schmidt', ort: 'Köln' }
];

if (tableBody) {
  tableBody.innerHTML = kunden.map(k => `
    <tr>
      <td>${k.id}</td>
      <td>${k.name}</td>
      <td>${k.ort}</td>
    </tr>
  `).join('');
} else {
  console.error("Tabelle wurde nicht gefunden!");
}
