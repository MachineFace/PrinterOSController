/**
 * Load GasT for Testing
 * See : https://github.com/huan/gast for instructions
 */
const gasT_URL = `https://raw.githubusercontent.com/huan/gast/master/src/gas-tap-lib.js`;
if ((typeof GasTap) === 'undefined') {
  var cs = CacheService.getScriptCache().get('gast');
  if(!cs){
    cs = UrlFetchApp.fetch(gasT_URL).getContentText();
    CacheService.getScriptCache().put('gast', cs, 21600);
  }
  eval(cs);
}

/**
 * Test PrinterOS with GasT
 * PASSED 6/16/2025
 */
const _gasT_PrinterOS_Testing = async () => {
  console.warn(`Testing: ${new Error().stack.split('\n')[1].split(`at `)[1]}`);  // Print Enclosing Function Name

  const test = new GasTap();

  const p = new PrinterOS();
  
  await test(`PrinterOS Self-Test`, (t) => {
    t.notThrow(() => p, `PrinterOS Self-Test SHOULD NOT throw error: ${JSON.stringify(p)}`);
  });

  await test(`Login`, (t) => {
    const x = p.Login();
    t.notThrow(() => x, `Login SHOULD NOT throw error: ${x}`);
  });

  await test(`Logout`, (t) => {
    const x = p.Logout();
    t.notThrow(() => x, `Logout SHOULD NOT throw error: ${x}`);
  });

  await test(`GetPrinters`, (t) => {
    const x = p.Login()
      .then(() => p.GetPrinters())
      .then(() => p.Logout());
    t.notThrow(() => x, `GetPrinters SHOULD NOT throw error: ${x}`);
  });

  await test(`GetPrinterData`, (t) => {
    const x = p.Login()
      .then(() => p.GetPrinterData())
      .then(() => p.Logout());
    t.notThrow(() => x, `GetPrinterData SHOULD NOT throw error: ${x}`);
  });

  await test(`GetPrinterTypes`, (t) => {
    const x = p.Login()
      .then(() => p.GetPrinterTypes())
      .then(() => p.Logout());
    t.notThrow(() => x, `GetPrinterTypes SHOULD NOT throw error: ${x}`);
  });

  await test(`GetPrintersJobList`, (t) => {
    const x = p.Login()
      .then(() => p.GetPrintersJobList())
      .then(() => p.Logout());
    t.notThrow(() => x, `GetPrintersJobList SHOULD NOT throw error: ${x}`);
  });

  await test(`GetPrintersLatestJob`, (t) => {
    const x = p.Login()
      .then(() => p.GetPrintersLatestJob())
      .then(() => p.Logout());
    t.notThrow(() => x, `GetPrintersLatestJob SHOULD NOT throw error: ${x}`);
  });

  await test(`GetLatestJobsForAllPrinters`, (t) => {
    const x = p.Login()
      .then(() => p.GetLatestJobsForAllPrinters())
      .then(() => p.Logout());
    t.notThrow(() => x, `GetLatestJobsForAllPrinters SHOULD NOT throw error: ${x}`);
  });

  await test(`GetJobInfo`, (t) => {
    const x = p.Login()
      .then(() => p.GetJobInfo(3046311))
      .then(() => p.Logout());
    t.notThrow(() => x, `GetJobInfo SHOULD NOT throw error: ${x}`);
  });

  /*
  p.Login()
    // .then(() => p.GetPrinters())
    // .then(() => p.GetPrinterData())
    // .then(() => p.GetPrinterTypes())
    // .then(() => p.GetPrintersJobList())
    // .then(() => p.GetPrintersLatestJob())
    // .then(() => p.GetLatestJobsForAllPrinters())
    // .then(() => p.GetJobInfo(3046311))
    // .then(() => p.GetMaterialWeight(3046311))
    // .then(() => p.CalculateCost(3046311))
    .then(() => p.GetWorkGroups())
    .then(() => p.GetUsersByWorkgroup(3275))
    // .then(() => p.GetUsers())
    // .then(() => p.GetPrinterNameFromID())
    // .then(() => p.GetLatestJobsForAllPrinters())
    .then(() => p.Logout())
  */
  await test.finish();
  if (test.totalFailed() > 0) throw "Some test(s) failed!";
}

/**
 * Test with GasT
 * PASSED 6/16/2025
 */
const _gasT_MessagingAndStaff_Testing = async () => {
  console.warn(`Testing: ${new Error().stack.split('\n')[1].split(`at `)[1]}`);  // Print Enclosing Function Name

  const test = new GasTap();

  await test(`Messages`, (t) => {
    console.time(`Execution Timer`);

    const message = new MessageService({
      name : 'Stew Dent',
      projectname : 'Pro Ject',
      weight : 523,
      designspecialist : `Mike Spec`,
      designspecialistemaillink : `LinkyLink`
    })

    let x;
    x = `DEFAULT ${message.defaultMessage}`;
    t.notEqual(x, undefined || null, `DEFAULT message should not return undefined or null. \n${x}`);
    x = `QUEUED ${message.queuedMessage}`;
    t.notEqual(x, undefined || null, `QUEUED message should not return undefined or null. \n${x}`);
    x = `IN-PROGRESS ${message.inProgressMessage}`;
    t.notEqual(x, undefined || null, `IN-PROGRESS message should not return undefined or null. \n${x}`);
    x = `COMPLETED ${message.completedMessage}`;
    t.notEqual(x, undefined || null, `COMPLETED message should not return undefined or null. \n${x}`);
    x = `PICKEDUP ${message.pickedUpMessage}`;
    t.notEqual(x, undefined || null, `PICKEDUP message should not return undefined or null. \n${x}`);
    x = `FAILED ${message.failedMessage}`;
    t.notEqual(x, undefined || null, `FAILED message should not return undefined or null. \n${x}`);
    x = `BILLED ${message.billedMessage}`;
    t.notEqual(x, undefined || null, `BILLED message should not return undefined or null. \n${x}`);
    x = `NO ACCESS ${message.noAccessMessage}`;
    t.notEqual(x, undefined || null, `NO ACCESS message should not return undefined or null. \n${x}`);
    x = `ABANDONED ${message.abandonedMessage}`;
    t.notEqual(x, undefined || null, `ABANDONED message should not return undefined or null. \n${x}`);

    const message2 = new MessageService({});
    x = `DEFAULT ${message2.defaultMessage}`;
    t.notEqual(x, undefined || null, `DEFAULT message should not return undefined or null. \n${x}`);
    x = `QUEUED ${message2.queuedMessage}`;
    t.notEqual(x, undefined || null, `QUEUED message should not return undefined or null. \n${x}`);
    x = `IN-PROGRESS ${message2.inProgressMessage}`;
    t.notEqual(x, undefined || null, `IN-PROGRESS message should not return undefined or null. \n${x}`);
    x = `COMPLETED ${message2.completedMessage}`;
    t.notEqual(x, undefined || null, `COMPLETED message should not return undefined or null. \n${x}`);
    x = `PICKEDUP ${message2.pickedUpMessage}`;
    t.notEqual(x, undefined || null, `PICKEDUP message should not return undefined or null. \n${x}`);
    x = `FAILED ${message2.failedMessage}`;
    t.notEqual(x, undefined || null, `FAILED message should not return undefined or null. \n${x}`);
    x = `BILLED ${message2.billedMessage}`;
    t.notEqual(x, undefined || null, `BILLED message should not return undefined or null. \n${x}`);
    x = `NO ACCESS ${message2.noAccessMessage}`;
    t.notEqual(x, undefined || null, `NO ACCESS message should not return undefined or null. \n${x}`);
    x = `ABANDONED ${message2.abandonedMessage}`;
    t.notEqual(x, undefined || null, `ABANDONED message should not return undefined or null. \n${x}`);
    console.timeEnd(`Execution Timer`);

  });
  
  await test(`Design Specialist Creation`, (t) => {
    const x = new DesignSpecialist({ name : `Testa`, fullname : `Testa Nama`, email: `some@thing.com` });
    t.equal(x.fullname, `Testa Nama`, `DS ${x.name} created.`);
    t.equal(x.isAdmin, true, `Admin check should be true.`);
  });

  await test(`Manager Creation`, (t) => {
    const x = new Manager({ name : `Testa`, fullname : `Testa Nama`, email: `some@thing.com` });
    t.equal(x.fullname, `Testa Nama`, `DS ${x.name} created.`);
    t.equal(x.isAdmin, true, `Admin check should be true.`);
  });

  await test(`StudentSupervisor Creation`, (t) => {
    const x = new StudentSupervisor({ name : `Testa`, fullname : `Testa Nama`, email: `some@thing.com` });
    t.equal(x.fullname, `Testa Nama`, `DS ${x.name} created.`);
    t.equal(x.isAdmin, false, `Admin check should be false.`);
  });
  
  await test(`BuildStaff`, (t) => {
    const x = BuildStaff();
    t.notEqual(x, undefined || null, `BuildStaff SHOULD NOT return null or undefined: ${JSON.stringify(x)}`);
  });

  await test(`StaffBuilder`, (t) => {
    const x = new StaffBuilder().get();
    for(const [name, values] of Object.entries(x)) {
      console.info(`${name} ----> First Name :${values.name}, Full : ${values.fullname} ~~ ${JSON.stringify(values)}`)
    }
    const y = x["Cody"];
    t.notEqual(y, undefined || null, `StaffBuilder SHOULD NOT return null or undefined: ${JSON.stringify(y)}`);
  });

  await test.finish();
  if (test.totalFailed() > 0) throw "Some test(s) failed!";
}

/**
 * Test Ticket with GasT
 */
const _gasT_Ticket_Testing = async () => {
  console.warn(`Testing: ${new Error().stack.split('\n')[1].split(`at `)[1]}`);  // Print Enclosing Function Name

  const test = new GasTap();
  
  await test(`New Ticket Creation`, async (t) => {
    const dummyObj = {
      designspecialist : "Staff",
      submissiontime : new Date(),
      name : "Stu Dent",
      printerID : "123876",
      printerName : "Dingus",
      filename : "somefile.gcode",
      weight : 53.34,
    }
    let ticket = await TicketService.CreateTicket(dummyObj);
    t.notEqual(ticket, undefined || null, `Ticket SHOULD NOT be null or undefined: ${ticket}`); 
  });

  /**
   * -----------------------------------------------------------------------------------------------------------------
   * datetime=**, extruders=[**], id=**, print_time=**, gif_image=**, heated_bed_temperature=**, cost=**, raft=**, email=**, notes=**, material_type=**, filename=**.gcode, file_id=**,
   * picture=**.png, heated_bed=**, status_id=**, printing_duration=**, layer_height=**, file_size=**, printer_id=**, supports=**, weight=**
   */
  // await test(`New Ticket From POS`, async(t) => {
  //   const pos = new PrinterOS();
  //   await pos.Login();

  //   const jobs = pos.GetPrintersJobList(79165);
  //   const jobID = jobs[0].id;
  //   console.info(jobID);

  //   const info = pos.GetJobInfo(jobID);
  //   console.info(info);
  //   const dummyObj = {
  //     designspecialist : "Staff",
  //     submissiontime : new Date(),
  //     name : "Stu Dent",
  //     email : info?.email,
  //     jobID : info?.id,
  //     projectname : info?.filename,
  //     weight : info?.weight,
  //     printerID : "123876",
  //     printerName : "Dingus",
  //     filename : "somefile.gcode",
  //     image : image,
  //   }
  //   let ticket = TicketService.CreateTicket(dummyObj);
  //   t.notEqual(ticket, undefined || null, `Ticket SHOULD NOT be null or undefined: ${ticket}`);

  // });

  await test(`FixMissingTicketsForSingleSheet`, (t) => {
    const x = FixMissingTicketsForSingleSheet(SHEETS.Nimbus);
    t.equal(x, 0, `FixMissingTicketsForSingleSheet SHOULD return 0: ${x}`);
  });

  await test(`FixMissingTickets for ALL Sheets`, (t) => {
    const x = FixMissingTickets();
    t.equal(x, 0, `FixMissingTickets SHOULD return 0: ${x}`);
  });

  await test.finish();
  if (test.totalFailed() > 0) throw "Some test(s) failed!";
}

/**
 * Test Misc with GasT
 * PASSED 6/16/2025
 */
const _gasT_Misc_Testing = async () => {
  console.warn(`Testing: ${new Error().stack.split('\n')[1].split(`at `)[1]}`);  // Print Enclosing Function Name

  const test = new GasTap();

  // ------------------------------------------------------------------------------------------------------------------------------
  await test(`GetByHeader`, (t) => {
    let x;
    x = SheetService.GetByHeader(SHEETS.Caerulus, HEADERNAMES.email, 2);
    t.notEqual(x, undefined || null, `GetByHeader SHOULD NOT return undefined or null: ${x}`);

    x = SheetService.GetByHeader(SHEETS.Caerulus, `BAD COLUMN NAME`, 2);
    t.equal(x, 1, `GetByHeader SHOULD return "1": Actual: ${x}`);

    x = SheetService.GetByHeader(`BAD SHEET`, HEADERNAMES.filename, 2);
    t.equal(x, 1, `GetByHeader SHOULD return null: ${x}`);

    x = SheetService.GetByHeader(`BAD SHEET`, `BAD COLUMN NAME`, `BAD ROW NUMBER`);
    t.equal(x, 1, `GetByHeader SHOULD return null: ${x}`);

  });

  await test(`GetColumnDataByHeader`, (t) => {
    let x;
    x = SheetService.GetColumnDataByHeader(SHEETS.Crystallum, HEADERNAMES.email);
    t.notEqual(x, undefined || null, `GetColumnDataByHeader SHOULD NOT return undefined or null: ${x}`);

    x = SheetService.GetColumnDataByHeader(SHEETS.Photon, `BAD COLUMN NAME`);
    t.equal(x, 1, `GetColumnDataByHeader SHOULD return "1": Actual: ${x}`);

    x = SheetService.GetColumnDataByHeader(`BAD SHEET`, `BAD COLUMN NAME`);
    t.equal(x, 1, `GetColumnDataByHeader SHOULD return "1": Actual: ${x}`);

  });

  await test(`GetRowData`, (t) => {
    let x;
    x = SheetService.GetRowData(SHEETS.Plumbus, 2);
    t.notEqual(x, undefined || null, `GetRowData SHOULD NOT return undefined or null: ${JSON.stringify(x)}`);

    x = SheetService.GetRowData(SHEETS.Quasar, `BAD COLUMN NAME`);
    t.equal(x, 1, `GetRowData SHOULD return undefined or null: ${x}`);

    x = SheetService.GetRowData(`BAD SHEET`, `BAD COLUMN NAME`);
    t.equal(x, 1, `GetRowData SHOULD return undefined or null: ${x}`);

  });

  await test(`Search`, (t) => {
    let x = SheetService.Search(`Cody`);
    t.notEqual(x, undefined || null, `Search should not return undefined or null. ${JSON.stringify(x)}`);
  });

  await test(`FindOne`, (t) => {
    let x;
    x = SheetService.FindOne(`Cancelled`);
    t.notEqual(x, undefined || null, `FindOne should not return undefined or null. ${JSON.stringify(x)}`);

    x = SheetService.FindOne(`BAD NAME`);
    t.equal(0, Object.entries(x).length, `FindOne SHOULD return empty object: ${JSON.stringify(x)}`);
  });

  await test(`Search Specific Sheet`, (t) => {
    const x = SheetService.SearchSpecificSheet(SHEETS.Luteus,`Cancelled`);
    t.notEqual(x, undefined || null, `SearchSpecificSheet should not return undefined or null. ${JSON.stringify(x)}`);
  });

  // ------------------------------------------------------------------------------------------------------------------------------
  await test(`GetImage`, (t) => {
    let png = SheetService.GetByHeader(SHEETS.Spectrum, "Picture", 10);
    let x = TicketService.GetImage(png);
    t.notEqual(x, undefined || null, `GetImage SHOULD NOT return undefined or null. ${JSON.stringify(x)}`);
  });

  await test(`IsValidDate`, (t) => {
    let x;
    x = IsValidDate(new Date(2023, 01, 01));
    t.equal(x, true, `IsValidDate SHOULD return true: ${x}`)

    x = IsValidDate(`2023, 01, 01`);
    t.equal(x, false, `IsValidDate SHOULD return false: ${x}`);
  });

  await test(`SetStatusDropdowns`, (t) => {
    const x = SetStatusDropdowns();
    t.equal(x, 0, `SetStatusDropdowns SHOULD return 0: ${x}`)
  });

  await test(`TitleCase`, (t) => {
    let x;
    x = TitleCase(`some name`);
    t.equal(x, `Some Name`, `TitleCase SHOULD return "Some Name": ${x}`);
    x = TitleCase(`s0M3 n4M3`);
    t.equal(x, `S0m3 N4m3`, `TitleCase SHOULD return "S0m3 N4m3": ${x}`);
  });

  // await test(`OpenQRGenerator`, (t) => {
  //   const data = {url : `https://docs.google.com/forms/d/e/1FAIpQLSfLTLKre-6ZPU0qsxTkbvmfqm56p_Y_ajoRD1tKALLMvPfdMQ/viewform`, size : `1000x1000`}
  //   const x = new OpenQRGenerator(data).CreatePrintableQRCode();
  //   t.notEqual(x, undefined || null, `OpenQRGenerator SHOULD NOT return null or undefined: ${x}`);
  // });

  await test.finish();
  if (test.totalFailed() > 0) throw "Some test(s) failed!";
}

/**
 * Test Calculations with GasT
 * PASSED 6/16/2025
 */
const _gasT_Calculation_Testing = async () => {
  console.warn(`Testing: ${new Error().stack.split('\n')[1].split(`at `)[1]}`);  // Print Enclosing Function Name

  const test = new GasTap();
  const c = new Calculate();
  
  await test(`Calc Average Turnaround`, (t) => {
    let x, y;
    x = c.GetAverageTurnaroundPerSheet(SHEETS.Aurum);
    y = undefined || null || NaN;
    t.notEqual(x, y, `Average Turnaround SHOULD NOT return ${y}, Actual: ${x}`);

    y = true;
    t.equal(!isNaN(x), y, `GetAverageTurnaroundPerSheet SHOULD return ${y}, Actual: ${JSON.stringify(GetObjectType(x))}`);

    x = c.GetAverageTurnaroundPerSheet(OTHERSHEETS.Logger);
    y = false;
    t.equal(isNaN(x), y, `GetAverageTurnaroundPerSheet SHOULD return ${y}, Actual: ${x}`);

    x = c.GetAverageTurnaroundPerSheet(`Fuck`);
    y = false;
    t.equal(isNaN(x), y, `GetAverageTurnaroundPerSheet SHOULD return ${y}, Actual: ${x}`);
  });

  await test(`StatusCountsPerSheet`, (t) => {
    let x, y;
    x = c.StatusCountsPerSheet(SHEETS.Aurum);
    y = undefined || null || NaN;
    t.notEqual(x, y, `StatusCountsPerSheet SHOULD NOT return ${y}, Actual: ${JSON.stringify(x)}`);

    x = c.StatusCountsPerSheet(OTHERSHEETS.Logger);
    y = true;
    t.equal(!isNaN(x), y, `StatusCountsPerSheet SHOULD return ${y} for forbidden sheet: ${x}`);
  });

  await test(`Calc Distribution`, (t) => {
    let x, y;
    x = c.UserDistribution();
    y = undefined || null
    t.notEqual(x, y, `Distribution should not return ${y}, Actual: ${x.slice(0, 20)}`);
  });

  await test(`GetUserCount`, (t) => {
    let x, y;
    x = c.GetUserCount();
    y = undefined || null;
    t.notEqual(x, y, `GetUserCount should not return ${y}, Actual: ${x}`);
  });

  await test(`CountUniqueUsers`, (t) => {
    let x, y;
    x = c.CountUniqueUsers();
    y = undefined || null;
    t.notEqual(x, y, `CountUniqueUsers should not return ${y}, Actual: ${x}`);

    y = true;
    t.equal(!isNaN(x), y, `CountUniqueUsers SHOULD return a number: ${JSON.stringify(GetObjectType(x))}`)
  });

  await test(`CountTotalSubmissions`, (t) => {
    let x, y;
    x = c.CountTotalSubmissions();
    y = undefined || null;
    t.notEqual(x, y, `CountTotalSubmissions should not return ${y}, Actual: ${x}`);

    y = true;
    t.equal(!isNaN(x), y, `CountTotalSubmissions SHOULD return a number: ${JSON.stringify(GetObjectType(x))}`)
  });

  await test(`StatusCounts`, (t) => {
    let x, y;
    x = c.StatusCounts();
    y = undefined || null;
    t.notEqual(x, y, `StatusCounts SHOULD NOT return ${y}, Actual: ${x}`);
  });

  await test(`CountUniqueUsersWhoHavePrinted`, (t) => {
    let x, y;
    x = c.CountUniqueUsersWhoHavePrinted();
    y = undefined || null;
    t.notEqual(x, y, `CountUniqueUsersWhoHavePrinted SHOULD NOT return ${y}, Actual: ${x}`);
  });

  await test(`Calc Standard Deviation`, (t) => {
    let x, y;
    x = c.UserStandardDeviation();
    y = undefined || null;
    t.notEqual(x, y, `Standard Deviation SHOULD NOT return ${y}, Actual: ${x}`);
    t.equal(!isNaN(x), true, `UserStandardDeviation SHOULD return a number: ${JSON.stringify(GetObjectType(x))}`)
  });

  await test(`Calculate Arithmetic Mean`, (t) => {
    let x, y;
    x = c.GetUserArithmeticMean();
    y = undefined || null;
    t.notEqual(x, y, `Arithmetic Mean SHOULD NOT return ${y}, Actual: ${x}`);
    t.equal(!isNaN(x), true, `GetUserArithmeticMean SHOULD return a number: ${JSON.stringify(GetObjectType(x))}`)
  });

  await test(`SumSingleSheetMaterials`, (t) => {
    let x, y;
    x = c._SumSingleSheetMaterials(SHEETS.Aurum);
    y = undefined || null;
    t.notEqual(x, y, `SumSingleSheetMaterials SHOULD NOT return ${y}, Actual: ${x}`);
    t.equal(!isNaN(x), true, `SumSingleSheetMaterials SHOULD return a number: ${JSON.stringify(GetObjectType(x))}`)
  });

  await test(`SumCosts`, (t) => {
    let x, y;
    x = c.SumCosts();
    y = undefined || null;
    t.notEqual(x, y, `SumCosts SHOULD NOT return ${y}, Actual: ${x}`);
    t.equal(!isNaN(x), true, `SumCosts SHOULD return a number: ${JSON.stringify(GetObjectType(x))}`)
  });
  
  await test.finish();
  if (test.totalFailed() > 0) throw "Some test(s) failed!";
}

/**
 * Test Logger with GasT
 * PASSED 6/16/2025
 */
const _gasT_Logger_Testing = async () => {
  console.warn(`Testing: ${new Error().stack.split('\n')[1].split(`at `)[1]}`);  // Print Enclosing Function Name

  const test = new GasTap();

  await test(`Logger`, (t) => {
    console.time(`EXECUTION TIMER`);

    const w = Log.Warning(`Ooopsies ----> Warning`);
    const i = Log.Info(`Some Info`);
    const e = Log.Error(`ERROR`);
    const d = Log.Debug(`Debugging`);
    

    console.timeEnd(`EXECUTION TIMER`);
    t.notThrow(() => w,`Warning SHOULD NOT throw error.`);
    t.notThrow(() => i,`Info SHOULD NOT throw error.`);
    t.notThrow(() => e,`Error SHOULD NOT throw error.`);
    t.notThrow(() => d,`Debug SHOULD NOT throw error.`);
  });

  await test(`SetConditionalFormatting`, t => {
    const x = SetConditionalFormatting();
    t.notThrow(() => x,`SetConditionalFormatting SHOULD NOT throw error.`);
  });

  await test.finish();
  if (test.totalFailed() > 0) throw "Some test(s) failed!";
}

/**
 * Test Drive Controller with GasT
 * FAILED 6/16/2025
 */
const _gasT_DriveController_Testing = async () => {
  console.warn(`Testing: ${new Error().stack.split('\n')[1].split(`at `)[1]}`);  // Print Enclosing Function Name

  const test = new GasTap();

  await test(`Drive Controller`, t => {
    // t.skip();
    const f = DriveController.AllFileNamesInRoot()
    const m = DriveController.MoveTicketsOutOfRoot();
    const o = DriveController.DeleteOldTickets();
    const c = DriveController.CountTickets();

    t.notThrow(() => f,`MoveTicketsOutOfRoot SHOULD NOT throw error.`);
    t.notThrow(() => m,`MoveTicketsOutOfRoot SHOULD NOT throw error.`);
    t.notThrow(() => o,`MoveTicketsOutOfRoot SHOULD NOT throw error.`);
    t.notThrow(() => c,`MoveTicketsOutOfRoot SHOULD NOT throw error.`);

  });

  await test.finish();
  if (test.totalFailed() > 0) throw "Some test(s) failed!";
}

/**
 * Test Emailing with GasT
 * PASSED 6/16/2025
 */
const _gasT_Email_Testing = async () => {
  console.warn(`Testing: ${new Error().stack.split('\n')[1].split(`at `)[1]}`);  // Print Enclosing Function Name

  const test = new GasTap();

  await test(`EmailService`, t => {
    Object.values(STATUS).forEach( status => {
      const em = new EmailService({
        email : SERVICE_EMAIL,
        status : status.plaintext,
        name : `Testa Fiesta`,
        projectname : `Testa Project`,
        jobnumber : 9234875,
        weight : 200,
      });
      t.notThrow(() => em,`EmailService SHOULD NOT throw error. ${em}`);
    });
  });

  await test.finish();
  if (test.totalFailed() > 0) throw "Some test(s) failed!";
}

/**
 * Test Updating with GasT
 * PASSED 6/16/2025
 */
const _gasT_Update_Testing = async () => {
  console.warn(`Testing: ${new Error().stack.split('\n')[1].split(`at `)[1]}`);  // Print Enclosing Function Name
  const test = new GasTap();

  await test(`WriteAllNewDataToSheets`, t => {
    const x = WriteAllNewDataToSheets();
    t.notThrow(() => x,`WriteAllNewDataToSheets SHOULD NOT throw error.`);
  });

  await test(`UpdateAll`, t => {
    const x = UpdateAll();
    t.notThrow(() => x,`UpdateAll SHOULD NOT throw error.`);
  });

  await test(`MissingTicketUpdater`, t => {
    const x = MissingTicketUpdater();
    t.notThrow(() => x,`MissingTicketUpdater SHOULD NOT throw error.`);
  });

  await test(`RunCleanup`, t => {
    const x = RunCleanup();
    t.notThrow(() => x,`RunCleanup SHOULD NOT throw error.`);
  });   

  await test(`Filename Cleanup`, t => {
    const s = {
      good : `somename1.gcode`,
      mod : `somename.modified.gcode`,
      bad : `@#$%.exe&*()`,
      worse : `\n\n\n\n\n\n`,
    }
    const x = CleanupService.FileNameCleanup(s.good);
    t.equal(x, `Somename`, `Pre: ${s.good}, Post: Assert ${x} = Somename`);
    const y = CleanupService.FileNameCleanup(s.bad);
    t.equal(y, `@#$%.exe&*()`, `Pre: ${s.bad}, Post: Assert ${y} = @#$%.exe&*()`);
    const z = CleanupService.FileNameCleanup(s.worse);
    t.equal(z, `\n\n\n\n\n\n`, `Pre: ${s.bad}, Post: Assert ${z} = 6 returns`);
    const a = CleanupService.FileNameCleanup(s.mod);
    t.equal(a, `Somename`, `Pre: ${s.mod}, Post: Assert ${a} = Somename`);
  });

  await test.finish();
  if (test.totalFailed() > 0) throw "Some test(s) failed!";
}



/**
 * Test All with GasT
 */
const _gasTTestAll = async () => {
  console.time(`TESTING TIMER`);
  Promise.all([
    await _gasT_MessagingAndStaff_Testing(),
    await _gasT_Ticket_Testing(),
    await _gasT_Misc_Testing(),
    await _gasT_Calculation_Testing(),
    await _gasT_Logger_Testing(),
    await _gasT_DriveController_Testing(),
    await _gasT_Email_Testing(),
    await _gasT_Update_Testing(),
  ])
  .then(console.info('Test Success'))
  .catch(err => {
    console.error(`"TestAll()" failed : ${err}`);
    return null;
  });
  console.timeEnd(`TESTING TIMER`);
}






