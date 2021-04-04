function setupPage() {
  fetchTableData(13965);

  document.getElementById('hnlb').addEventListener('click', () => fetchTableData(13882));
  document.getElementById('h1l').addEventListener('click', () => fetchTableData(13931));
  document.getElementById('h2l').addEventListener('click', () => fetchTableData(13965));
  document.getElementById('h3l').addEventListener('click', () => fetchTableData(13993));
  document.getElementById('h4l').addEventListener('click', () => fetchTableData(13968));
  document.getElementById('d1l').addEventListener('click', () => fetchTableData(13916));
  document.getElementById('d2l').addEventListener('click', () => fetchTableData(13976));
  document.getElementById('d3l').addEventListener('click', () => fetchTableData(13959));
  document.getElementById('d4l').addEventListener('click', () => fetchTableData(13958));
  document.getElementById('d5l').addEventListener('click', () => fetchTableData(13976));
  document.getElementById('jmu20').addEventListener('click', () => fetchTableData(14211));
  document.getElementById('jmu18').addEventListener('click', () => fetchTableData(14207));
  document.getElementById('jmu16').addEventListener('click', () => fetchTableData(14255));
  document.getElementById('jwu19').addEventListener('click', () => fetchTableData(14197));
}

// Main method to send the request and handle the response
// TODO: ErrorHandling!!!
function fetchTableData(groupID) {
  const xml = new XMLHttpRequest();
  xml.open('POST', 'https://myvolley.volleyball.ch/svserver.php', true);
  var strRequest = createTableRequestString(groupID);

  xml.onreadystatechange = function () {
    if (xml.readyState == 4) {
      displayTableData(extractTableData(xml.responseXML));
    }
  };

  xml.send(strRequest);
};

// Create different requests
function createTableRequestString(groupId) {
  return '<?xml version="1.0" encoding="UTF-8" standalone="no"?>'
    + '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:typens="https://myvolley.volleyball.ch" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/" xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" xmlns:tns="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" >'
    + '<SOAP-ENV:Body>'
    + `<mns:getTable xmlns:mns="https://myvolley.volleyball.ch" SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><group_ID xsi:type="xsd:int">${ groupId }</group_ID></mns:getTable>`
    + '</SOAP-ENV:Body>'
    + '</SOAP-ENV:Envelope>'
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

function getTableContent(element, key) {
  return element.getElementsByTagName(`${ key }`)[0].textContent
}

// Controls table creation
// TODO: Adapt to work relative to clubdesk elements if needed.
function displayTableData(dataArray) {

  if (document.getElementById('ranking')) {
    let tmp = document.getElementById('ranking');
    tmp.parentNode.removeChild(tmp);
  }

  const container = document.getElementById('container');
  const table = document.createElement('table');
  table.id = 'ranking';
  container.append(table);

  const data = Object.keys(dataArray[0]);
  createRankingTableHead(table, data);
  createRankingTableBody(table, dataArray)
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
      if (element[key].includes('VBC Uni Bern')) {
        row.style.backgroundColor = ' rgba(221, 142, 142, 0.589)';
      }
      cell.appendChild(text);
    }
  }
}