var teamName = 'VBC Uni Bern';
// Main method to send the request and handle the response
// TODO: ErrorHandling!!!
function fetchTableData(groupId, team) {
  const url = 'https://myvolley.volleyball.ch/svserver.php';
  const requestBody = createTableRequestString(groupId)
  const requestMethod = 'POST';

  fetch(url, {
    body: requestBody,
    method: requestMethod
  }).then(response => response.text())
    .then(text => new DOMParser().parseFromString(text, 'text/xml'))
    .then(data => displayTableData(extractTableData(data)));

  if (team) teamName = team;
};

// Create different requests
function createTableRequestString(groupId) {
  const soapEnverlopePrefix = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>'
    + '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:typens="https://myvolley.volleyball.ch" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/" xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" xmlns:tns="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" >';

  const soapEnvelopePostfix = '</SOAP-ENV:Envelope>'

  const soapBody = '<SOAP-ENV:Body>'
    + `<mns:getTable xmlns:mns="https://myvolley.volleyball.ch" SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">`
    + `<group_ID xsi:type="xsd:int">${ groupId }</group_ID>`
    + `</mns:getTable>`
    + '</SOAP-ENV:Body>';

  return soapEnverlopePrefix + soapBody + soapEnvelopePostfix;
}

// Extracts the required data from the xml response body
function extractTableData(data) {
  const ranking = [];
  var numOfEntries = data.getElementsByTagName('item').length;
  for (let i = 0; i < numOfEntries; i++) {
    var entry = data.getElementsByTagName('item')[i];
    var tmpRank = getTableContent(entry, 'Rank') === '&amp;nbsp;' ? tmpRank : getTableContent(entry, 'Rank');
    ranking.push({
      Rang: tmpRank,
      Team: getTableContent(entry, 'Caption'),
      Siege: getTableContent(entry, 'Wins'),
      Niederlagen: getTableContent(entry, 'Defeats'),
      Punkte: getTableContent(entry, 'Points'),
    })
  }

  return ranking;
}

function createContainer() {
  let refNode = document.getElementsByClassName('cd-group-detail')[0];
  let container = document.createElement('div');
  container.id = 'table_container';
  refNode.children[0].insertAdjacentElement('afterend', container);
}

function getTableContent(element, key) {
  return element.getElementsByTagName(`${ key }`)[0].textContent;
}

// Controls table creation
function displayTableData(dataArray) {
  if (!document.getElementById('table_container')) createContainer();

  if (document.getElementById('ranking')) {
    let tmp = document.getElementById('ranking');
    tmp.parentNode.removeChild(tmp);
  }

  const container = document.getElementById('table_container');
  const table = document.createElement('table');
  table.id = 'ranking';
  container.append(table);

  const data = Object.keys(dataArray[0]);
  createRankingTableHead(table, data);
  createRankingTableBody(table, dataArray);
}

// Creates table head, using the keys from the data-json-object
function createRankingTableHead(table, data) {
  let thead = table.createTHead();
  let row = thead.insertRow();


  for (let key of data) {
    let th = document.createElement('th');
    th.setAttribute('class', key.toLowerCase());
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
}

// Creates table body
function createRankingTableBody(table, data) {
  let tbody = table.createTBody();


  for (let element of data) {
    let row = tbody.insertRow();

    for (key in element) {
      let cell = row.insertCell();
      cell.setAttribute('class', key.toLowerCase());
      let text = document.createTextNode(element[key]);
      if (element[key].includes(teamName)) {
        row.style.backgroundColor = ' rgba(221, 142, 142, 0.100)';
      }
      cell.appendChild(text);
    }
  }
}