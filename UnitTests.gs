/**
 * Load GasT for Testing
 * See : https://github.com/huan/gast for instructions
 */


/**
 * Test with GasT
 */
const _gasTMessagingAndStaffTesting = async () => {
  if ((typeof GasTap) === 'undefined') { 
    eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/huan/gast/master/src/gas-tap-lib.js').getContentText())
  } 
  const test = new GasTap();

  // await test(`Checking...`, (t) => {    
  //     let i = 3 + 4
  //     t.equal(i, 7, `Calc : 3 + 4 = 7  : Correct`)
  // })

  await test(`Messages`, (t) => {
    console.time(`Execution Timer`);

    const message = new CreateMessage({
      name : 'Stew Dent',
      projectname : 'Pro Ject',
      weight : 523,
      designspecialist : `Mike Spec`,
      designspecialistemaillink : `LinkyLink`
    })

    const a = `DEFAULT ${message.defaultMessage}`;
    t.notEqual(a, undefined || null, `DEFAULT message should not return undefined or null. \n${a}`);
    const b = `QUEUED ${message.queuedMessage}`;
    t.notEqual(b, undefined || null, `QUEUED message should not return undefined or null. \n${b}`);
    const c = `IN-PROGRESS ${message.inProgressMessage}`;
    t.notEqual(c, undefined || null, `IN-PROGRESS message should not return undefined or null. \n${c}`);
    const d = `COMPLETED ${message.completedMessage}`;
    t.notEqual(d, undefined || null, `COMPLETED message should not return undefined or null. \n${d}`);
    const e = `PICKEDUP ${message.pickedUpMessage}`;
    t.notEqual(e, undefined || null, `PICKEDUP message should not return undefined or null. \n${e}`);
    const f = `FAILED ${message.failedMessage}`;
    t.notEqual(f, undefined || null, `FAILED message should not return undefined or null. \n${f}`);
    const g = `BILLED ${message.billedMessage}`;
    t.notEqual(g, undefined || null, `BILLED message should not return undefined or null. \n${g}`);
    const h = `NO ACCESS ${message.noAccessMessage}`;
    t.notEqual(h, undefined || null, `NO ACCESS message should not return undefined or null. \n${h}`);
    const i = `ABANDONED ${message.abandonedMessage}`;
    t.notEqual(i, undefined || null, `ABANDONED message should not return undefined or null. \n${i}`);

    const message2 = new CreateMessage({});
    const j = `DEFAULT ${message2.defaultMessage}`;
    t.notEqual(j, undefined || null, `DEFAULT message should not return undefined or null. \n${j}`);
    const k = `QUEUED ${message2.queuedMessage}`;
    t.notEqual(k, undefined || null, `QUEUED message should not return undefined or null. \n${k}`);
    const l = `IN-PROGRESS ${message2.inProgressMessage}`;
    t.notEqual(l, undefined || null, `IN-PROGRESS message should not return undefined or null. \n${l}`);
    const m = `COMPLETED ${message2.completedMessage}`;
    t.notEqual(m, undefined || null, `COMPLETED message should not return undefined or null. \n${m}`);
    const n = `PICKEDUP ${message2.pickedUpMessage}`;
    t.notEqual(n, undefined || null, `PICKEDUP message should not return undefined or null. \n${n}`);
    const o = `FAILED ${message2.failedMessage}`;
    t.notEqual(o, undefined || null, `FAILED message should not return undefined or null. \n${o}`);
    const p = `BILLED ${message2.billedMessage}`;
    t.notEqual(p, undefined || null, `BILLED message should not return undefined or null. \n${p}`);
    const q = `NO ACCESS ${message2.noAccessMessage}`;
    t.notEqual(q, undefined || null, `NO ACCESS message should not return undefined or null. \n${q}`);
    const r = `ABANDONED ${message2.abandonedMessage}`;
    t.notEqual(r, undefined || null, `ABANDONED message should not return undefined or null. \n${r}`);
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
const _gasTTicketTesting = async () => {
  if ((typeof GasTap) === 'undefined') { 
    eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/huan/gast/master/src/gas-tap-lib.js').getContentText())
  } 
  const test = new GasTap();

  /**
   * -----------------------------------------------------------------------------------------------------------------
   * datetime=**, extruders=[**], id=**, print_time=**, gif_image=**, heated_bed_temperature=**, cost=**, raft=**, email=**, notes=**, material_type=**, filename=**.gcode, file_id=**,
   * picture=**.png, heated_bed=**, status_id=**, printing_duration=**, layer_height=**, file_size=**, printer_id=**, supports=**, weight=**
   */
  await test(`New Ticket Creation`, (t) => {
    let jobID;
    let info;
    let image;
    const pos = new PrinterOS();
    pos.Login()
    .then( async () => {
      const jobs = await pos.GetPrintersJobList(79165);
      jobID = jobs[0].id;
      console.info(jobID);
    })
    .then( async () => {
      info = await pos.GetJobInfo(jobID);
      image = await pos.imgBlob;
      console.info(info);
      const dummyObj = {
        designspecialist : "Staff",
        submissiontime : new Date(),
        name : "Stu Dent",
        email : info.email,
        jobID : info.id,
        projectname : info.filename,
        weight : info.weight,
        printerID : "123876",
        printerName : "Dingus",
        filename : "somefile.gcode",
        image : image,
      }
      let ticket = new Ticket(dummyObj).CreateTicket();
      t.notEqual(ticket, undefined || null, `Ticket SHOULD NOT be null or undefined: ${ticket}`);
    }); 
  });

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
 */
const _gasTMiscTesting = async () => {
  if ((typeof GasTap) === 'undefined') { 
    eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/huan/gast/master/src/gas-tap-lib.js').getContentText())
  } 
  const test = new GasTap();

  // ------------------------------------------------------------------------------------------------------------------------------
  await test(`GetByHeader`, (t) => {
    const x = GetByHeader(SHEETS.Caerulus, HEADERNAMES.email, 2);
    t.notEqual(x, undefined || null, `GetByHeader SHOULD NOT return undefined or null: ${x}`);

    const y = GetByHeader(SHEETS.Caerulus, `BAD COLUMN NAME`, 2);
    t.equal(y, undefined || null, `GetByHeader SHOULD return undefined or null: ${y}`);

    const z = GetByHeader(`BAD SHEET`, HEADERNAMES.filename, 2);
    t.equal(y, undefined || null, `GetByHeader SHOULD return undefined or null: ${y}`);

    const a = GetByHeader(`BAD SHEET`, `BAD COLUMN NAME`, `BAD ROW NUMBER`);
    t.equal(a, undefined || null, `GetByHeader SHOULD return undefined or null: ${a}`);

  });

  await test(`GetColumnDataByHeader`, (t) => {
    const x = GetColumnDataByHeader(SHEETS.Crystallum, HEADERNAMES.email);
    t.notEqual(x, undefined || null, `GetColumnDataByHeader SHOULD NOT return undefined or null: ${x}`);

    const y = GetColumnDataByHeader(SHEETS.Photon, `BAD COLUMN NAME`);
    t.equal(y, undefined || null, `GetByHeader SHOULD return undefined or null: ${y}`);

    const z = GetColumnDataByHeader(`BAD SHEET`, `BAD COLUMN NAME`);
    t.equal(z, undefined || null, `GetByHeader SHOULD return undefined or null: ${z}`);

  });

  await test(`GetRowData`, (t) => {
    const x = GetRowData(SHEETS.Plumbus, 2);
    t.notEqual(x, undefined || null, `GetRowData SHOULD NOT return undefined or null: ${JSON.stringify(x)}`);

    const y = GetRowData(SHEETS.Quasar, `BAD COLUMN NAME`);
    t.equal(y, undefined || null, `GetRowData SHOULD return undefined or null: ${y}`);

    const z = GetRowData(`BAD SHEET`, `BAD COLUMN NAME`);
    t.equal(z, undefined || null, `GetRowData SHOULD return undefined or null: ${z}`);

  });

  await test(`Search`, (t) => {
    const x = Search(`Cody`);
    t.notEqual(x, undefined || null, `Search should not return undefined or null. ${JSON.stringify(x)}`);
  });

  await test(`FindOne`, (t) => {
    const x = FindOne(`Cancelled`);
    t.notEqual(x, undefined || null, `FindOne should not return undefined or null. ${JSON.stringify(x)}`);

    const y = FindOne(`BAD NAME`);
    t.equal(0, Object.entries(y).length, `FindOne SHOULD return empty object: ${JSON.stringify(y)}`);
  });

  await test(`Search Specific Sheet`, (t) => {
    const x = SearchSpecificSheet(SHEETS.Luteus,`Cancelled`);
    t.notEqual(x, undefined || null, `SearchSpecificSheet should not return undefined or null. ${JSON.stringify(x)}`);
  });

  // ------------------------------------------------------------------------------------------------------------------------------
  await test(`GetImage`, (t) => {
    let png = GetByHeader(SHEETS.Spectrum, "Picture", 10);
    let x = GetImage(png);
    t.notEqual(x, undefined || null, `GetImage SHOULD NOT return undefined or null. ${JSON.stringify(x)}`);
  });

  await test(`IsValidDate`, (t) => {
    const x = IsValidDate(new Date(2023, 01, 01));
    t.equal(x, true, `IsValidDate SHOULD return true: ${x}`)

    const y = IsValidDate(`2023, 01, 01`);
    t.equal(y, false, `IsValidDate SHOULD return false: ${y}`);
  });

  await test(`FixStatus`, (t) => {
    const x = FixStatus();
    t.equal(x, 0, `FixStatus SHOULD return 0: ${x}`)
  });

  await test(`SetStatusDropdowns`, (t) => {
    const x = SetStatusDropdowns();
    t.equal(x, 0, `SetStatusDropdowns SHOULD return 0: ${x}`)
  });

  await test(`TitleCase`, (t) => {
    const x = TitleCase(`some name`);
    t.equal(x, `Some Name`, `TitleCase SHOULD return "Some Name": ${x}`);
    const y = TitleCase(`s0M3 n4M3`);
    t.equal(y, `S0m3 N4m3`, `TitleCase SHOULD return "S0m3 N4m3": ${y}`);
  });

  await test(`OpenQRGenerator`, (t) => {
    const data = {url : `https://docs.google.com/forms/d/e/1FAIpQLSfLTLKre-6ZPU0qsxTkbvmfqm56p_Y_ajoRD1tKALLMvPfdMQ/viewform`, size : `1000x1000`};
    const x = new OpenQRGenerator(data).CreatePrintableQRCode();
    t.notEqual(x, undefined || null, `OpenQRGenerator SHOULD NOT return null or undefined: ${x}`);
  });

  await test.finish();
  if (test.totalFailed() > 0) throw "Some test(s) failed!";
}


/**
 * Test Calculations with GasT
 */
const _gasTCalculationTesting = async () => {
  if ((typeof GasTap) === 'undefined') { 
    eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/huan/gast/master/src/gas-tap-lib.js').getContentText())
  } 
  const test = new GasTap();
  const calc = new Calculate();

  // ------------------------------------------------------------------------------------------------------------------------------
  await test(`Calc Average Turnaround`, (t) => {
    const x = calc.CalculateAverageTurnaround(SHEETS.Aurum);
    t.notEqual(x, undefined || null || NaN, `Average Turnaround SHOULD NOT return null or undefined: ${x}`);
  });

  await test(`SumStatuses`, (t) => {
    const x = calc.SumStatuses(SHEETS.Aurum);
    t.notEqual(x, undefined || null || NaN, `SumStatuses SHOULD NOT return null or undefined: ${JSON.stringify(x)}`);
  });

  await test(`Calc Distribution`, (t) => {
    const x = calc.CalculateDistribution();
    t.notEqual(x, undefined || null, `Distribution should not return undefined: ${x.slice(0, 3)}`);
  });

  await test(`GetUserCount`, (t) => {
    const x = calc.GetUserCount();
    t.notEqual(x, undefined || null, `GetUserCount should not return undefined: ${x}`);
  });

  await test(`CountUniqueUsers`, (t) => {
    const x = calc.CountUniqueUsers();
    t.notEqual(x, undefined || null, `CountUniqueUsers should not return undefined: ${x}`);
  });
  
  await test(`CountTotalSubmissions`, (t) => {
    const x = calc.CountTotalSubmissions();
    t.notEqual(x, undefined || null, `CountTotalSubmissions should not return undefined: ${x}`);
  });

  await test(`StatusCounts`, (t) => {
    const x = calc.StatusCounts();
    t.notEqual(x, undefined || null, `StatusCounts SHOULD return 0: ${x}`);
  });

  await test(`CountUniqueUsersWhoHavePrinted`, (t) => {
    const x = calc.CountUniqueUsersWhoHavePrinted();
    t.notEqual(x, undefined || null, `CountUniqueUsersWhoHavePrinted SHOULD NOT return null or undefined: ${x.slice(0, 5)}`);
  });

  await test(`Calc Standard Deviation`, (t) => {
    const x = calc.CalculateStandardDeviation();
    t.notEqual(x, undefined || null, `Standard Deviation should not return undefined or null. ${x}`);
  });

  await test(`Calculate Arithmetic Mean`, (t) => {
    const x = calc.CalculateArithmeticMean();
    t.notEqual(x, undefined || null, `Arithmetic Mean SHOULD NOT return undefined or null. ${x}`);
  });

  await test(`SumSingleSheetMaterials`, (t) => {
    const x = calc.SumSingleSheetMaterials(SHEETS.Aurum);
    t.notEqual(x, undefined || null, `SumSingleSheetMaterials SHOULD NOT return undefined or null. ${x}`);
  });

  await test(`SumMaterials`, (t) => {
    const x = calc.SumMaterials();
    t.notEqual(x, undefined || null, `SumMaterials SHOULD NOT return undefined or null. ${x}`);
  });

  await test(`SumSingleSheetCost`, (t) => {
    const x = calc.SumSingleSheetCost(SHEETS.Aurum);
    t.notEqual(x, undefined || null, `SumSingleSheetCost SHOULD NOT return undefined or null. ${x}`);
  });

  await test(`SumCosts`, (t) => {
    const x = calc.SumCosts();
    t.notEqual(x, undefined || null, `SumCosts SHOULD NOT return undefined or null. ${x}`);
  });

  await test.finish();
  if (test.totalFailed() > 0) throw "Some test(s) failed!";
}


/**
 * Test Logger with GasT
 */
const _gasTLoggerTesting = async () => {
  if ((typeof GasTap) === 'undefined') { 
    eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/huan/gast/master/src/gas-tap-lib.js').getContentText())
  } 
  const test = new GasTap();

  await test(`WriteLogger`, (t) => {
    console.time(`EXECUTION TIMER`);
    const write = new WriteLogger();

    const w = write.Warning(`Ooopsies ----> Warning`);
    const i = write.Info(`Some Info`);
    const e = write.Error(`ERROR`);
    const d = write.Debug(`Debugging`);
    const c = write._CleanupSheet();
    

    console.timeEnd(`EXECUTION TIMER`);
    t.notThrow(() => w,`Warning SHOULD NOT throw error.`);
    t.notThrow(() => i,`Info SHOULD NOT throw error.`);
    t.notThrow(() => e,`Error SHOULD NOT throw error.`);
    t.notThrow(() => d,`Debug SHOULD NOT throw error.`);
    t.notThrow(() => c,`_CleanupSheet SHOULD NOT throw error.`);
  });

  await test(`SetConditionalFormatting`, t => {
    const x = SetConditionalFormatting();
    t.notThrow(() => x,`SetConditionalFormatting SHOULD NOT throw error.`);
  });

  await test(`Drive`, t => {
    t.skip();
    const d = new DriveController();

    const f = d.GetAllFileNamesInRoot();
    const m = d.MoveTicketsOutOfRoot();
    const o = d.TrashOldTickets();
    const c = d.CountTickets();

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
 */
const _gasTEmailTesting = async () => {
  if ((typeof GasTap) === 'undefined') { 
    eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/huan/gast/master/src/gas-tap-lib.js').getContentText())
  } 
  const test = new GasTap();

  await test(`Emailer`, t => {
    Object.values(STATUS).forEach(async (status) => {
      const em = await new Emailer({
        email : "codyglen@berkeley.edu",
        status : status.plaintext,
        name : `Dingus Dongus`,
        projectname : `Dingus Project`,
        jobnumber : 9234875,
        weight : 200,
      });
      t.notThrow(() => em,`Emailer SHOULD NOT throw error.`);
    });
  });

  await test.finish();
  if (test.totalFailed() > 0) throw "Some test(s) failed!";
}



const _gasTUpdateTesting = async () => {
  if ((typeof GasTap) === 'undefined') { 
    eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/huan/gast/master/src/gas-tap-lib.js').getContentText())
  } 
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

  await test(`FetchNewDataforSingleSheet`, t => {
    const x = FetchNewDataforSingleSheet(SHEETS.Zardoz);
    t.notThrow(() => x,`FetchNewDataforSingleSheet SHOULD NOT throw error.`);
  });

  await test(`TriggerRemoveDuplicates`, t => {
    const x = TriggerRemoveDuplicates();
    t.notThrow(() => x,`TriggerRemoveDuplicates SHOULD NOT throw error.`);
  });   

  await test(`Filename Cleanup`, t => {
    const s = {
      good : `somename1.gcode`,
      mod : `somename.modified.gcode`,
      bad : `@#$%.exe&*()`,
      worse : `\n\n\n\n\n\n`,
    }
    const x = FileNameCleanup(s.good);
    t.equal(x, `Somename`, `Pre: ${s.good}, Post: Assert ${x} = Somename`);
    const y = FileNameCleanup(s.bad);
    t.equal(y, `@#$%.exe&*()`, `Pre: ${s.bad}, Post: Assert ${y} = @#$%.exe&*()`);
    const z = FileNameCleanup(s.worse);
    t.equal(z, `\n\n\n\n\n\n`, `Pre: ${s.bad}, Post: Assert ${z} = 6 returns`);
    const a = FileNameCleanup(s.mod);
    t.equal(a, `Somename`, `Pre: ${s.mod}, Post: Assert ${a} = Somename`);
  });

  await test.finish();
  if (test.totalFailed() > 0) throw "Some test(s) failed!";
}


/**
 * Test All with GasT
 */
const _gasTTestAll = async () => {
  _gasTMessagingAndStaffTesting();
  _gasTTicketTesting();
  _gasTMiscTesting();
  _gasTCalculationTesting();
  _gasTLoggerTesting();
  _gasTEmailTesting();
}






