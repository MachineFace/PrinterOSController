const CheckEmails = () => {
  // Set of Everyone who printed
  let masterSet = [];
  Object.values(SHEETS).forEach(sheet => {
    // console.warn(`Checking Sheet: ${sheet.getSheetName()}`);
    let emails = [].concat(...sheet.getRange(2, 6, sheet.getLastRow(), 1).getValues()); 
    emails = emails.filter(Boolean);
    const unique = [...new Set(emails)];
    masterSet.push(...unique);
  });
  masterSet = [...new Set(masterSet)];
  // console.info(`Length After Setting: ${masterSet.length}`); 

  // Set of Everyone Billed:
  let billedSet = [];
  let billedemails = [].concat(...OTHERSHEETS.Report.getRange(2, 1, OTHERSHEETS.Report.getLastRow(), 1).getValues()); 
  billedemails = billedemails.filter(Boolean);
  billedSet = [...new Set(billedemails)];
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
  
  // billedSet.forEach(email => {
  //   masterSet.find(email => {

  //   })
  // })
}