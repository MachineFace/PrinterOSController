

const BillingPerSheet = (sheet) => {
  let data = {}
  let statuses = GetColumnDataByHeader(sheet, HEADERNAMES.status);
  let emails = GetColumnDataByHeader(sheet, HEADERNAMES.email);
  let costs = GetColumnDataByHeader(sheet, HEADERNAMES.cost);
  let staff = GetColumnDataByHeader(OTHERSHEETS.Staff, `EMAIL`);
  statuses.forEach( (status, index) => {
    if(status == STATUS.complete.plaintext || status == STATUS.closed.plaintext || status == STATUS.abandoned.plaintext || status == STATUS.pickedUp.plaintext) {
      let email = emails[index];
      let cost = Number(costs[index]).toFixed(2);
      email in data ? data[email] = Number(Number(data[email]) + Number(cost)).toFixed(2) : data[email] = cost;
    }
  });
  staff.forEach(member => member in data ? delete(data[member]) : null);
  // console.info(data);
  return data;
}

const Billing = () => {
  let data = {}
  Object.values(SHEETS).forEach(sheet => {
    let sheetdata = BillingPerSheet(sheet);
    Object.entries(sheetdata).forEach(([key, value]) => {
      key in data ? data[key] = Number(Number(data[key]) + Number(value)).toFixed(2) : data[key] = value;
    })
  })
  Object.entries(data).sort().forEach(([key, value], index) => {
    SetByHeader(OTHERSHEETS.Report, `Account Email`, index + 2, key);
    SetByHeader(OTHERSHEETS.Report, `Total Sum ($)`, index + 2, value);
  })
  console.info(data);
}

const _testBillingPerSheet = () => {
  let data = BillingPerSheet(SHEETS.Spectrum);
  console.info(Object.entries(data).sort())
}



/** 
const SaveAsCSV = () => {
  let sheet = OTHERSHEETS.Report;
  let folder = DriveApp.createFolder(`${gmailName.replace(/ /g,'')}_${new Date().getTime()}`);
  fileName = `${sheet.getName()}.csv`;
  let csvFile = ConvertRangeToCsvFile(sheet);
  let file = folder.createFile(fileName, csvFile);
  let downloadURL = file.getDownloadUrl().slice(0, -8);
  Showurl(downloadURL);
}

const Showurl = (downloadURL) => {
  let app = UiApp.createApplication()
    .setHeight('60')
    .setWidth('150')
    .setTitle(`Your Billing Report is Ready...`)
  let panel = app.createPopupPanel()
  panel.add(app.createAnchor('Click here to download', downloadURL));
  app.add(panel);
  SpreadsheetApp
    .getActive()
    .show(app);
}

const ConvertRangeToCsvFile = (sheet) => {
  let activeRange = sheet.getDataRange();
  try {
    let data = activeRange.getValues();
    let csv;

    if (data.length <= 1) return; 
    for (let row = 0; row < data.length; row++) {
      for (let col = 0; col < data[row].length; col++) {
        if(data[row][col].toString().indexOf(",") == -1) return;
        data[row][col] = "\"" + data[row][col] + "\"";
      }
      if (row < data.length - 1) csvFile += data[row].join(",") + "\r\n";
      else csv += data[row];
    }    
    return csv;
  }
  catch(err) {
    console.error(err);
    Browser.msgBox(err);
  }
}
*/


/**
 * Calculate PrintCost
 * @param {number} weight
 * @return {number} value
 */
const PrintCost = (weight) => {
  weight = weight instanceof Number || weight > 0.0 ? weight : 0.0;
  return Number(weight * COSTMULTIPLIER).toFixed(2);
}


const _testComputeCost = () => {
  let p =  PrintCost(123.0);
  console.info(p)
}





