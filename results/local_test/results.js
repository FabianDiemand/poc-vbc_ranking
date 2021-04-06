/**
 * Creates and sends a SOAP request to the SV SOAP server.
 * Handles the response data.
 * @param {number} groupId 
 */
// TODO: ErrorHandling
function fetchResultData(groupId) {
  const url = 'https://myvolley.volleyball.ch/svserver.php';
  const requestBody = createResultRequestString(groupId);

  fetch(url, {
    body: requestBody,
    method: 'POST'
  }).then(response => response.text())
    .then(text => new DOMParser().parseFromString(text, 'text/xml'))
    .then(data => displayResultData(data));
};

/**
 * Create a SOAP request body for group specific game data
 * @param {number} groupId 
 * @return {string} represents a soap request 
 */
function createResultRequestString(groupId) {
  const soapEnverlopePrefix = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>'
    + '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:typens="https://myvolley.volleyball.ch" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/" xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" xmlns:tns="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" >';

  const soapEnvelopePostfix = '</SOAP-ENV:Envelope>'

  const soapBody = '<SOAP-ENV:Body>' +
    `<mns:getGames xmlns:mns="https://myvolley.volleyball.ch" SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">`
    + `<group_ID xsi:type="xsd:int">${ groupId }</group_ID>`
    + `</mns:getGames>`
    + '</SOAP-ENV:Body>'

  return soapEnverlopePrefix + soapBody + soapEnvelopePostfix;
}

/**
 * Takes all the data from the SOAP response and extracts the required part from each item.
 * Required data is temporarily stored in a JSON object.
 * @param {XMLDocument} data XML formatted response from the SV SOAP server
 * @return {Array} array containing all the JSON objects with the required data
 */
//TODO Create function to filter last games by team x 
function extractResultData(data) {
  const games = [];

  // Response is in XML format and contains several 'items' with data, that get iterated in this step
  for (let item of data.getElementsByTagName('item')) {

    // We only care for games whose results have already been commited
    if (getResultContent(item, 'IsResultCommited') == 1) {
      games.push({
        Game: {
          Datum: getResultContent(item, 'PlayDate').formatDateTimeCH(),
          Teams: [{
            Home: {
              Team: getResultContent(item, 'TeamHomeCaption'),
              Resultat: getResultContent(item, 'NumberOfWinsHome'),
              Satz1: getResultContent(item, 'Set1PointsHome').formatSetPoints(),
              Satz2: getResultContent(item, 'Set2PointsHome').formatSetPoints(),
              Satz3: getResultContent(item, 'Set3PointsHome').formatSetPoints(),
              Satz4: getResultContent(item, 'Set4PointsHome').formatSetPoints(),
              Satz5: getResultContent(item, 'Set5PointsHome').formatSetPoints(),
            },
            Away: {
              Team: getResultContent(item, 'TeamAwayCaption'),
              Resultat: getResultContent(item, 'NumberOfWinsAway'),
              Satz1: getResultContent(item, 'Set1PointsAway').formatSetPoints(),
              Satz2: getResultContent(item, 'Set2PointsAway').formatSetPoints(),
              Satz3: getResultContent(item, 'Set3PointsAway').formatSetPoints(),
              Satz4: getResultContent(item, 'Set4PointsAway').formatSetPoints(),
              Satz5: getResultContent(item, 'Set5PointsAway').formatSetPoints(),
            }
          }
          ]
        }
      })
    }
  }
  return games;
}

/**
 * Helper method to extract a data string from an XML tag
 * @param {'XML Document Element'} item the XML item to strip data from
 * @param {string} key the tag whose content we want to get
 * @return {string} String containing the XML tags content
 */
function getResultContent(item, key) {
  return item.getElementsByTagName(`${ key }`)[0].textContent
}

/**
 * Formats date from 'YYYY-MM-DD HH:MM:SS' to 'DD.MM.YYYY HH:MM' 
 * @return {string} swiss formated date
 */
String.prototype.formatDateTimeCH = function () {
  const dateTimeSplit = this.split(' ');
  const dateSplit = dateTimeSplit[0].split('-');
  const timeSplit = dateTimeSplit[1].split(':');
  return `${ dateSplit[2] }.${ dateSplit[1] }.${ dateSplit[0] } \n ${ timeSplit[0] }:${ timeSplit[1] }`;
}

/**
 * Removes the default '-1' for unplayed sets
 * @return {string} points won in a set or '' if a set has not been played
 */
String.prototype.formatSetPoints = function () {
  return this == '-1' ? '' : this;
}

/**
 * Orchestrator method that creates the table containing all game data.
 * @param {XMLDocument} data the XML formatted game data 
 */
function displayResultData(data) {
  const table = document.getElementById('results');

  // Returns an array, containing JSON Objects with the required data.
  const dataArray = extractResultData(data);

  if (!table.firstChild) createResultTableHead(table);

  // Pass the extracted data to a tbody creation method.
  createResultTableBody(table, dataArray);

  formatTableContent();
}

/**
 * Creates and classifies the table's header with the given keywords
 * @param {HTMLTableElement} table html table element created by the caller
 */
function createResultTableHead(table) {
  const headerTitles = ['Datum', 'Team', 'Resultat', 'Sätze'];
  const thead = table.createTHead();

  for (let title of headerTitles) {
    let th = document.createElement('th');
    th.className = title.toLowerCase().replace(' ', '');

    if (title.startsWith('Sätze')) {
      th.className = `satz ${ title.toLowerCase().replace(' ', '') }`;
      th.colSpan = 5;
    }

    let text = document.createTextNode(title);
    th.appendChild(text);
    thead.appendChild(th);
  }
}

/**
 * Creates and classifies the table's body elements with their respective content.
 * @param {HTMLTableElement} table html table element created by the caller 
 * @param {Array} games array containing game data in JSON Objects
 */
function createResultTableBody(table, games) {
  games.forEach(entry => {
    const game = entry.Game;

    const tbody = table.createTBody();
    tbody.className = 'game';

    // Create the date cell, that spans two rows 
    const dateCell = document.createElement('td');
    dateCell.className = 'datum';
    dateCell.rowSpan = 2;

    const dateText = document.createTextNode(game.Datum);
    dateCell.appendChild(dateText);

    for (let teams of game['Teams']) {
      for (let team in teams) {
        let row = tbody.insertRow(0);
        row.className = team.toLowerCase();
        row.appendChild(dateCell);

        for (let key in teams[team]) {
          let gameInfoCell = row.insertCell();
          gameInfoCell.className = key.toLowerCase().replace(' ', '');

          if (key.startsWith('Satz')) gameInfoCell.className = `satz ${ key.toLowerCase().replace(' ', '') }`;

          let text = document.createTextNode((teams[team])[key]);
          gameInfoCell.appendChild(text);
        }
      }
    }
  }
  )
}

/**
 * Marks the teams, set points and sets with classes 'win' or 'defeat'
 * respective to who won/ lost the game or set.
 * 'win' or 'defeat' is referenced within the stylesheet.
 */
function formatTableContent() {
  const table = document.getElementById('results');
  const games = table.getElementsByClassName('game');

  for (let game of games) {
    const homeTeam = game.getElementsByClassName('home')[0];
    const awayTeam = game.getElementsByClassName('away')[0];

    const homeTeamSets = homeTeam.getElementsByClassName('satz');
    const awayTeamSets = awayTeam.getElementsByClassName('satz');

    for (let i = 0; i < homeTeamSets.length; i++) {
      if (homeTeamSets[i].innerText > awayTeamSets[i].innerText) {
        addClassName([homeTeamSets[i]], 'win');
        addClassName([awayTeamSets[i]], 'defeat');
      } else {
        addClassName([homeTeamSets[i]], 'defeat');
        addClassName([awayTeamSets[i]], 'win');
      }
    }

    const homeTeamName = homeTeam.getElementsByClassName('team')[0];
    const homeTeamWins = homeTeam.getElementsByClassName('resultat')[0];

    const awayTeamName = awayTeam.getElementsByClassName('team')[0];
    const awayTeamWins = awayTeam.getElementsByClassName('resultat')[0];

    if (homeTeamWins.innerText > awayTeamWins.innerText) {
      addClassName([homeTeamName, homeTeamWins], 'win');
      addClassName([awayTeamName, awayTeamWins], 'defeat');
    } else {
      addClassName([homeTeamName, homeTeamWins], 'defeat');
      addClassName([awayTeamName, awayTeamWins], 'win');
    }
  }
}

/**
 * Helper function that adds classNames to elements
 * instead of replacing the existing ones.
 * @param {Array} htmlElements
 * @param {string} newClassName 
 */
function addClassName(htmlElements, newClassName) {
  htmlElements.forEach(htmlElement => {
    const oldClassName = htmlElement.className;
    htmlElement.className = `${ oldClassName } ${ newClassName }`
  })
}