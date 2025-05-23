/**
 * Error Checker
 * Functions for determining who was overbilled
 * @NOTIMPLEMENTED until end of semester
 */
class ErrorChecker {
  constructor() {

  }

  /**
   * Check Emails
   */
  static CheckEmails() {
    // Set of Everyone who printed
    let masterSet = [];
    Object.values(SHEETS).forEach(sheet => {
      // console.warn(`Checking Sheet: ${sheet.getSheetName()}`);
      let emails = [...SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.email)]
        .filter(Boolean);
      masterSet.push(...emails);
    });
    masterSet = [...new Set(masterSet)];
    // console.info(`Length After Setting: ${masterSet.length}`); 

    // Set of Everyone Billed:
    const billedemails = [...OTHERSHEETS.Report.getRange(2, 1, OTHERSHEETS.Report.getLastRow(), 1).getValues()]
      .filter(Boolean);
    const billedSet = [...new Set(billedemails)];
    // console.info(`Length of Billed: ${billedSet.length}`);

    // Difference
    const difference = billedSet.filter(x => { return masterSet.indexOf(x) < 0 });
    console.warn(`Total Students Overbilled: ${difference.length}`)
    console.info(`Difference: ${difference}`);

    // Find How Much we OverBilled:
    let userObj = [];
    difference.forEach(email => {
      const finder = OTHERSHEETS.Report.createTextFinder(email).findAll();
      if (finder != null) {
        let row = [];
        finder.forEach(result => {
          let index = result.getRow();
          row.push(index);
          userObj.push({
            index : index,
            email : email,
            money : OTHERSHEETS.Report.getRange(index, 8, 1, 1).getValue(),
          })
        });
      }
    })
    userObj.forEach( (user, index) => {
      console.info(user);
      OTHERSHEETS.Oops.getRange(2 + index, 1, 1, 1).setValue(user.email);
      OTHERSHEETS.Oops.getRange(2 + index, 2, 1, 1).setValue(user.money);
    });
    
  }

  /**
   * Function for determining who was overbilled
   * @NOTIMPLEMENTED until end of semester
   */
  static RemoveStudentsWhoDidntPrint() {
    // Set of Everyone who printed
    let masterSet = [];
    Object.values(SHEETS).forEach(sheet => {
      // console.warn(`Checking Sheet: ${sheet.getSheetName()}`);
      let emails = [...SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.email)]
        .filter(Boolean);
      masterSet.push(...emails);
    });
    masterSet = [...new Set(masterSet)];
    console.info(`Length After Setting: ${masterSet.length}`); 

    // Set of Everyone Billed:
    let billedemails = [...OTHERSHEETS.Report.getRange(2, 1, OTHERSHEETS.Report.getLastRow(), 1).getValues()]
      .filter(Boolean);
    
    let notInSet = [];

    // Get Emails NOT in masterSet
    billedemails.filter(email => {
      if(masterSet.indexOf(email) == -1) {
        notInSet.push(email);
      }
    });

    // Remove Users who didn't print with us
    notInSet.forEach(email => {
      const finder = OTHERSHEETS.Report.createTextFinder(email).findAll();
      if (finder != null) {
        finder.forEach(result => {
          let row = result.getRow();
          if(row == 1) return;
          console.info(`Deleting User: ${email} @ Row: ${row}`);
          OTHERSHEETS.Report.deleteRows(row, 1);
        });
      } else {
        console.info(`List is CLEAN.`);
      }
    })

  }

  /**
   * Remove Bad Statuses
   */
  static RemoveShitStatuses() {
    // Remove Shitty status
    let statuses = [`LOST_CONNECTION`, `CANCELLED_WEB`, `IN_QUEUE`, `IN_PROGRESS`];
    let rows = [];
    statuses.forEach(status => {
      const finder = OTHERSHEETS.Report.createTextFinder(status).findAll();
      if(finder) {
        finder.forEach(result => {
          if(result.getRow() == 1) return;
          else rows.push(result.getRow());
        });
      } 
    });
    let sorted = rows.sort((a,b) => a - b).reverse();
    sorted.forEach(row => OTHERSHEETS.Report.deleteRow(row));
  }

  /**
   * Check Non-Existant Job Ids
   */
  static CheckNonExistantJobIDs() {
    // Set of Everyone who printed
    let masterSet = [];
    Object.values(SHEETS).forEach(sheet => {
      let jobIDs = [...SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.jobID)]
        .filter(Boolean);
      masterSet.push(...jobIDs);
    });
    masterSet = [...new Set(masterSet)];
    console.info(`This JobCount Length ---> ${masterSet.length}`); 

    // Set of Everyone Billed:
    let jobIDSFromPOS = [].concat(...OTHERSHEETS.Report.getRange(2, 1, OTHERSHEETS.Report.getLastRow(), 1).getValues()); 
    jobIDSFromPOS = jobIDSFromPOS.filter(Boolean);
    console.info(`JobIDS Count from POS ---> ${jobIDSFromPOS.length}`);

    let notInSet = [];

    // Get Emails NOT in masterSet
    jobIDSFromPOS.filter(jobID => {
      if(masterSet.indexOf(jobID) == -1) {
        notInSet.push(jobID);
      }
    });

    console.info(`Job Not one of ours: ${notInSet}`);

    // Remove Users who didn't print with us
    let jobs = []
    notInSet.forEach(jobID => {
      const finder = OTHERSHEETS.Report.createTextFinder(jobID).findAll();
      if (finder != null) {
        finder.forEach(result => {
          let row = result.getRow();
          if(row == 1) return;
          jobs.push(row);
        });
      } else {
        console.info(`List is CLEAN.`);
      }
    });
    let sorted = jobs.sort((a,b) => a - b).reverse();
    console.log(`Not Ours: ${sorted}`);
    sorted.forEach(row => OTHERSHEETS.Report.deleteRow(row));

  }

  /**
   * Calculate Material Costs for Billing
   */
  static CalculateMaterialCostForBilling() {
    let materialUsed = SheetService.GetColumnDataByHeader(OTHERSHEETS.Report, `Material Used (∑,kg)`); //Material in kg
    materialUsed.forEach( (value, index) => {
      let row = index + 2;
      let grams = value * 1000;
      let cost = PrintCost(weight);
      console.info(`Row: ${row}, Grams: ${grams}, Cost: ${cost}`)
      SheetService.SetByHeader(OTHERSHEETS.Report, `Computed Material Cost (∑,$)`, row, cost);
    });
  }
}

const Check = () => {
  ErrorChecker.CheckEmails();
  ErrorChecker.RemoveStudentsWhoDidntPrint();
  ErrorChecker.RemoveShitStatuses();
  ErrorChecker.CheckNonExistantJobIDs();
  ErrorChecker.CalculateMaterialCostForBilling();
}







