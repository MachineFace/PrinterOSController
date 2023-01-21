/**
 * -----------------------------------------------------------------------------------------------------------------
 * MISC
 */


/**
 * ----------------------------------------------------------------------------------------------------------------
 * Return the value of a cell by column name and row number
 * @param {sheet} sheet
 * @param {string} colName
 * @param {number} row
 */
const GetByHeader = (sheet, columnName, row) => {
  try {
    let data = sheet.getDataRange().getValues();
    let col = data[0].indexOf(columnName);
    if (col != -1) return data[row - 1][col];
  } catch (err) {
    console.error(`${err} : GetByHeader failed - Sheet: ${sheet} Col Name specified: ${columnName} Row: ${row}`);
  }
};


/**
 * ----------------------------------------------------------------------------------------------------------------
 * Return the values of a column by the name
 * @param {sheet} sheet
 * @param {string} colName
 * @param {number} row
 */
const GetColumnDataByHeader = (sheet, columnName) => {
  try {
    const data = sheet.getDataRange().getValues();
    const col = data[0].indexOf(columnName);
    let colData = data.map(d => d[col]);
    colData.splice(0, 1);
    if (col != -1) return colData;
  } catch (err) {
    console.error(`${err} : GetByHeader failed - Sheet: ${sheet} Col Name specified: ${columnName}`);
  }
};


/**
 * ----------------------------------------------------------------------------------------------------------------
 * Return the values of a row by the number
 * @param {sheet} sheet
 * @param {number} row
 * @returns {dict} {header, value}
 */
const GetRowData = (sheet, row) => {
  let dict = {};
  try {
    let headers = sheet.getRange(1, 1, 1, sheet.getMaxColumns()).getValues()[0];
    headers.forEach( (name, index) => {
      headers[index] = Object.keys(HEADERNAMES).find(key => HEADERNAMES[key] === name);
    })
    let data = sheet.getRange(row, 1, 1, sheet.getMaxColumns()).getValues()[0];
    headers.forEach( (header, index) => {
      dict[header] = data[index];
    });
    dict[`sheetName`] = sheet.getSheetName();
    dict[`row`] = row;
    // console.info(dict);
    return dict;
  } catch (err) {
    console.error(`${err} : GetRowData failed - Sheet: ${sheet} Row: ${row}`);
  }
}



/**
 * ----------------------------------------------------------------------------------------------------------------
 * Set the value of a cell by column name and row number
 * @param {sheet} sheet
 * @param {string} colName
 * @param {number} row
 * @param {any} val
 */
const SetByHeader = (sheet, columnName, row, val) => {
  try {
    const data = sheet.getDataRange().getValues();
    const col = data[0].indexOf(columnName) + 1;
    sheet.getRange(row, col).setValue(val);
  } catch (err) {
    console.error(`${err} : setByHeader failed - Sheet: ${sheet} Row: ${row} Col: ${col} Value: ${val}`);
  }
};




/**
 * Find Image blob from File
 */
const GetImage = async (pngFile) => {
  let image;
  const repo = `https://live3dprinteros.blob.core.windows.net/render/${pngFile}`;

  const params = {
    "method" : "GET",
    contentType : "image/png",
    followRedirects : true,
    muteHttpExceptions : true
  };

  const html = await UrlFetchApp.fetch(repo, params);

  const responseCode = html.getResponseCode();
  console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

  if(responseCode != 200) return false; 
  const folder = DriveApp.getFoldersByName(`Job Tickets`);
  const blob = html.getBlob().setName(`IMAGE_${pngFile}`);
  return blob;
}


/**
 * Search all Sheets for a value
 * @required {string} value
 * @returns {[sheet, [values]]} list of sheets with lists of indexes
 */
const Search = (value) => {
  value ? value.toString().replace(/\s+/g, "") : ``;
  let res = {};
  Object.values(SHEETS).forEach(sheet => {
    const finder = sheet.createTextFinder(value).findAll();
    if (finder != null) {
      temp = [];
      finder.forEach(result => temp.push(result.getRow()));
      res[sheet.getName()] = temp;
    }
  })
  // console.info(JSON.stringify(res));
  return res;
}


/**
 * Search all Sheets for one specific value
 * @required {string} value
 * @returns {[sheet, [number]]} [sheetname, row]
 */
const FindOne = (value) => {
  if (value) value.toString().replace(/\s+/g, "");
  let res = {};
  for(const [key, sheet] of Object.entries(SHEETS)) {
    const finder = sheet.createTextFinder(value).findNext();
    if (finder != null) {
      // res[key] = finder.getRow();
      res = GetRowData(sheet, finder.getRow());
    }
  }
  return res;
}


/**
 * Search a Specific Sheets for a value
 * @required {string} value
 * @returns {[sheet, [values]]} list of sheets with lists of indexes
 */
const SearchSpecificSheet = (sheet, value) => {
  if (value) value.toString().replace(/\s+/g, "");

  const finder = sheet.createTextFinder(value).findNext();
  if (finder != null) {
    return finder.getRow();
  } else return false;

}







/**
 * Fix Statuses
 */
const FixStatus = () => {
  console.info(`Checking Statuses....`);
  Object.values(SHEETS).forEach(sheet => {
    let posCodes = GetColumnDataByHeader(sheet, HEADERNAMES.posStatCode);
    let statuses = GetColumnDataByHeader(sheet, HEADERNAMES.status);
    posCodes.forEach( (code, index) => {
      switch(code) {
        case STATUS.queued.statusCode:
          if (statuses[index + 2] != STATUS.queued.plaintext) {
            SetByHeader(sheet, HEADERNAMES.status, index + 2, STATUS.queued.plaintext);
            console.warn(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
          }
          break;
        case STATUS.inProgress.statusCode:
          if (statuses[index + 2] != STATUS.inProgress.plaintext) {
            SetByHeader(sheet, HEADERNAMES.status, index + 2, STATUS.inProgress.plaintext);
            console.warn(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
          }
          break;
        case STATUS.failed.statusCode:
          if (statuses[index + 2] != STATUS.failed.plaintext) {
            SetByHeader(sheet, HEADERNAMES.status, index + 2, STATUS.failed.plaintext);
            console.warn(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
          }
          break;
        case STATUS.cancelled.statusCode:
          if (statuses[index + 2] != STATUS.cancelled.plaintext) {
            SetByHeader(sheet, HEADERNAMES.status, index + 2, STATUS.cancelled.plaintext);
            console.warn(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
          }
          break;
      }
    });
  })
  console.warn(`Statuses Checked and Fixed....`);
  return 0;
}


/**
 * ----------------------------------------------------------------------------------------------------------------
 * Test if value is a date and return true or false
 * @param {date} d
 * @returns {boolean} b
 */
const IsValidDate = (d) => {
  if (Object.prototype.toString.call(d) !== "[object Date]") return false;
  return !isNaN(d.getTime());
};

const FormatDate = (date) => Utilities.formatDate(date ? date : new Date(), "PST", "MM/dd/yyyy 'at' HH:mm:ss z");


/**
 * Helper to make Sheets
 */
const _helperMakeSheets = async () => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  for(const [key, value] of Object.entries(PRINTERIDS)) {
    console.info(key);
    await ss.insertSheet().setName(key);
  }
}


/**
 * ----------------------------------------------------------------------------------------------------------------
 * Unit tests
 */





/**
 * Set Dropdowns for status
 */
const SetStatusDropdowns = () => {
  let statuses = [];
  Object.values(STATUS).forEach(status => statuses.push(status.plaintext));
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(statuses);
  Object.values(SHEETS).forEach(sheet => sheet.getRange(2, 1, sheet.getLastRow(), 1).setDataValidation(rule));
  // console.info(statuses)
  return 0;
}


/**
 * Helper Method for TitleCasing Names
 * @param {string} string
 * @returns {string} titlecased
 */
const TitleCase = (str) => {
  str = str
    .toLowerCase()
    .split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
  }
  return str.join(' ');
}





/**
 * Search Class
 */
/** 
class Seek
{
  constructor() {
  }
  Search (value) {
    if (value) value.toString().replace(/\s+/g, "");
    let res = {};
    Object.values(SHEETS).forEach(sheet => {
      const finder = sheet.createTextFinder(value).findAll();
      if (finder != null) {
        let temp = [];
        finder.forEach(result => temp.push(result.getRow()));
        res[sheet.getName()] = temp;
      }
    });
    console.warn(JSON.stringify(res));
    return res;
  }
  SearchSpecificSheet (sheet, value) {
    if (value) value.toString().replace(/\s+/g, "");
    const finder = sheet.createTextFinder(value).findNext();
    if (finder != null) {
      return finder.getRow();
    } else return false;
  }
}
const _testSeek = () => new Seek().Search("Water Box");
*/


