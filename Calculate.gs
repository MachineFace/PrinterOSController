/**
 * -----------------------------------------------------------------------------------------------------------------
 * ## Calculate Metrics
 */
class Calculate {
  constructor() {

  }

  /**
   * ### Calculate Average Turnaround for a sheet
   * 
   * @param {sheet} sheet
   * @return {number} average (hrs)
   */
  static GetAverageTurnaroundPerSheet(sheet = SHEETS.Spectrum) {
    try {
      let completionTimes = [...SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.duration)];

      let average = StatisticsService.Mean(completionTimes);
      average = !isNaN(average) ? Number(average).toFixed(3) : 0;

      return average;
    } catch (err) {
      console.error(`"GetAverageTurnaroundPerSheet()" failed: ${err}`);
      return null;
    }
  }

  /**
   * ### Print Turnaround Averages
   */
  static PrintTurnarounds() {
    try {
      let entries = [];
      Object.entries(SHEETS).forEach(([key, sheet], idx) => {
        let turnaround = `${Calculate.GetAverageTurnaroundPerSheet(sheet)} days`;
        entries.push([ key, turnaround, ]);
      }); 
      
      const values = [
        [ `Printer`, `Turnaround` ],
        ...entries,
      ];
      console.info(values);
      OTHERSHEETS.Metrics.getRange(1, 2, values.length, 2).setValues(values);

    } catch(err) {
      console.error(`"PrintTurnarounds()" failed: ${err}`);
      return null;
    }
  }

  /**
   * ### Sum all Statuses
   * 
   * @ returns {object} status data
   */
  static StatusCountsPerSheet(sheet = SHEETS.Spectrum) {
    try {
      const statuses = [...SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.status)]
        .filter(Boolean);

      let distribution = StatisticsService.Distribution(statuses);
      
      // Add Missing Values
      let list = Object.values(STATUS);
      list.forEach(entry => {
        if (!distribution.hasOwnProperty(entry.plaintext)) {
          distribution[entry.plaintext] = 0;
        }
      });
      console.info(JSON.stringify(distribution, null, 2));
      return distribution;
    } catch(err) {
      console.error(`"StatusCountsPerSheet()" failed: ${err}`);
      return null;
    }
  }

  /**
   * ### Print Status Counts
   */
  static PrintStatusCounts() {
    try {
      let values = [
        [ `Completed`, `Cancelled`, `Failed`, `Completion Ratio`, ],
      ];

      Object.entries(SHEETS).forEach(([key, sheet], idx) => {
        const counts = Calculate.StatusCountsPerSheet(sheet);
        const sum = (counts.Completed + counts.CLOSED);

        const completed = !isNaN(sum) && sum != null && sum != undefined && sum > 0 ? Math.floor(sum) : 0;
        const cancelled = !isNaN(counts.Cancelled) && counts.Cancelled != null && counts.Cancelled != undefined && counts.Cancelled > 0 ? Math.floor(counts.Cancelled) : 0;
        const failed = !isNaN(counts.FAILED) && counts.FAILED != null && counts.FAILED != undefined && counts.FAILED > 0 ? Math.floor(counts.FAILED) : 0;

        const total = StatisticsService.Sum(Object.values(counts)) || 0;

        let ratio = total > 0 ? `${Number(Number(completed / total).toFixed(3) * 100).toFixed(1)} %` : `0 %`;

        values.push([ completed, cancelled, failed, ratio ]);
      }); 

      console.info(values);
      OTHERSHEETS.Metrics.getRange(1, 4, values.length, 4).setValues(values);

    } catch(err) {
      console.error(`"PrintStatusCounts()" failed: ${err}`);
      return null;
    }
  }

  /**
   * ### Calculate User Distribution
   * 
   * @return {object} users and counts
   */
  static UserDistribution() {
    try {
      let userList = [];
      let staff = SheetService.GetColumnDataByHeader(OTHERSHEETS.Staff, `EMAIL`);
      Object.values(SHEETS).forEach(sheet => {
        [...SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.email)]
          .filter(Boolean)
          .forEach( user => {
            if(staff.indexOf(user) == -1) userList.push(user);
          });
      });

      let items = StatisticsService.Distribution(userList);
      return items;  
    } catch(err) {
      console.error(`"UserDistribution()" failed: ${err}`);
      return null;
    }
  }

  /**
   * ### Get User Counts from PrinterOS
   * 
   * @return {object} counts
   */
  static async GetUserCount() {
    const pos = new PrinterOS();
    pos.Login()
      .then(async () => {
        await pos.GetUserCount()
          .then(count => {
            const values = [
              [ `User Count (From PrinterOS)` ], 
              [ count ],
            ];
            console.info(values);
            OTHERSHEETS.Metrics.getRange(1, 12, 2, 1).setValues(values);
          });
      });
    return count;
  }

  /**
   * ### Count Unique Users
   */
  static CountUniqueUsers() {
    try {
      let userList = [];
      Object.values(SHEETS).forEach(sheet => {
        [...SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.email)]
          .filter(Boolean)
          .forEach( user => userList.push(user));
      });
      const count = new Set(userList).size;
      const values = [
        [ `Unique Users` ], 
        [ count ],
      ];
      console.info(values);
      OTHERSHEETS.Metrics.getRange(1, 13, 2, 1).setValues(values);
      return count;
    } catch(err) {
      console.error(`"CountUniqueUsers()" failed: ${err}`);
      return null;
    }
  }

  /**
   * ### Count Total Submissions
   * 
   * @return {number} count
   */
  static CountTotalSubmissions() {
    try {
      let count = 0;
      Object.values(SHEETS).forEach(sheet => {
        let last = sheet.getLastRow() - 1;
        count += last;
      });
      const values = [
        [ `Total Submissions` ], 
        [ count ],
      ];
      console.info(values);
      OTHERSHEETS.Metrics.getRange(1, 14, 2, 1).setValues(values);
      return count;
    } catch(err) {
      console.error(`"CountTotalSubmissions()" failed: ${err}`);
      return null;
    }
  }

  /**
   * ### Status Counts
   * 
   * @return {object} counts
   */
  static StatusCounts() {
    let statuses = {}
    Object.values(SHEETS).forEach(sheet => {
      const data = Calculate.StatusCountsPerSheet(sheet);
      Object.entries(data).forEach(([key, value], idx) => {
        if(statuses[key]) statuses[key] += value;
        else statuses[key] = value;
      });
    });
    const stats = Object.entries(statuses).map(([key, value], idx) => [ key, value ]);

    const values = [
      [ `Status`, `Count`, ], 
      ...stats,
    ];
    console.info(values);
    OTHERSHEETS.Metrics.getRange(1, 24, values.length, 2).setValues(values);
    return statuses;
  }
  
  /**
   * ### Count Unique Users Who Have Printed
   * 
   * return {object} users
   */
  static CountUniqueUsersWhoHavePrinted() {
    let userList = [];
    Object.values(SHEETS).forEach(sheet => {
      let status = SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.status);
      let users = SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.email);
      status.forEach( (stat, index) => {
        if(stat == STATUS.complete.plaintext) userList.push(users[index])
      });
    })
    const userSet = [...new Set(userList)].length;
    const values = [
      [ `Users who have printed` ], 
      [ userSet ],
    ];
    console.info(values);
    OTHERSHEETS.Metrics.getRange(1, 11, 2, 1).setValues(values);
    return userSet;
  }

  /**
   * ### Arithmetic Mean
   * 
   * @return {number} mean
   */
  static GetUserArithmeticMean() {
    try {
      const distribution = Calculate.UserDistribution();
      const dist_list = [...Object.entries(distribution)];
      const mean = Number(StatisticsService.Mean(dist_list)).toFixed(3);
      const values = [
        [ `Average # of Submissions Per User` ], 
        [ mean ],
      ];
      console.info(values);
      OTHERSHEETS.Metrics.getRange(1, 15, 2, 1).setValues(values);
      return mean;
    } catch(err) {
      console.error(`"GetUserArithmeticMean()" failed: ${err}`);
      return null;
    }
  }

  /**
   * ### Standard Deviation for Users
   * 
   * @return {number} standard deviation
   */
  static UserStandardDeviation() {
    try {
      const distribution = Calculate.UserDistribution();
      const dist_list = [...Object.entries(distribution)];

      const standardDeviation = StatisticsService.StandardDeviation(dist_list);

      const values = [
        [ `Std. Deviation for # of Submissions per User` ], 
        [ `+/- ${Number(standardDeviation).toFixed(4)}` ],
      ];
      console.info(values);
      OTHERSHEETS.Metrics.getRange(1, 16, 2, 1).setValues(values);
      return standardDeviation;
    } catch(err) {
      console.error(`"UserStandardDeviation()" failed: ${err}`);
      return null;
    }
  }

  /**
   * ### Standard Deviation for Users
   * 
   * @return {number} standard deviation
   */
  static UserKurtosisAndSkewness() {
    try {
      const distribution = Calculate.UserDistribution();
      const dist_list = [...Object.values(distribution)];


      const kurtosis = Number(StatisticsService.Sample_Kurtosis(dist_list)).toFixed(3);
      const skewness = Number(StatisticsService.Sample_Skewness(dist_list)).toFixed(3);
      const values = [
        [ `Kurtosis (High Kurtosis means more outliers in data)`, `Skewness (Measure of asymmetry of the data)`  ], 
        [ kurtosis, skewness, ],
      ];
      console.info(values);
      OTHERSHEETS.Metrics.getRange(1, 17, 2, 2).setValues(values);
      return kurtosis;
    } catch(err) {
      console.error(`"UserKurtosisAndSkewness()" failed: ${err}`);
      return null;
    }
  }

  /**
   * ### Print Top Ten
   */
  static PrintTopTen() {
    try {
      const distribution = Calculate.UserDistribution();
      const dist_list = [...Object.entries(distribution)];

      const dist = dist_list
        .slice(0, 11);

      let values = [
        [ `Place`, `Email`, `# of Submissions`, ],
      ];

      dist.forEach(([email, count], idx) => {
        const entry = [ idx + 1, email, count ];
        values.push(entry)
      });

      console.info(values);
      OTHERSHEETS.Metrics.getRange(1, 20, values.length, 3).setValues(values);

    } catch(err) {
      console.error(`"PrintTopTen()" failed: ${err}`);
      return null;
    }
  }

  /**
   * ### Print Zscore / Distribution / Detect Outliers
   */
  static PrintZscoreDistribution() {
    try {
      const distribution = Calculate.UserDistribution();
      const dist_list = [...Object.entries(distribution)];

      const stdDev = StatisticsService.StandardDeviation(dist_list);

      const zScore = StatisticsService.ZScore(dist_list, `arithmetic`, stdDev);
      const outliers = StatisticsService.Detect_Outliers(distribution, stdDev);

      // console.warn(`<<< Outliers >>>`);
      // console.info(outliers);

      console.warn(`<<< Z Score >>>`);
      const values = [
        [ `Email`, `Count`, `Zscore`, ],
        ...zScore,
      ];
      console.info(values);
      OTHERSHEETS.Metrics.getRange(1, 33, values.length, 3).setValues(values);

    } catch(err) {
      console.error(`"PrintZscoreDistribution()" failed: ${err}`);
      return null;
    }
  }

  /** 
   * ### Sum Single Sheet Materials
   * @private 
   */
  static _SumSingleSheetMaterials(sheet) {
    try {
      if(SheetService.IsValidSheet(sheet) == false) {
        throw new Error(`Sheet is FORBIDDEN.`);
      }

      let weights = SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.weight);
      let statuses = SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.status);

      for(let i = 0; i < weights.length; i++) {
        if(statuses[i] != STATUS.complete.plaintext && statuses[i] != STATUS.closed.plaintext) {
          weights[i] = 0.0;
        }
        if(weights[i] == null || !weights[i] || weights[i] == ' ' || isNaN(weights[i])) {
          weights[i] = 0.0;
        }
      }

      let sum = StatisticsService.Sum(weights);
      console.info(`SUM for ${sheet.getSheetName()} = ${sum} grams`);
      return sum;

    } catch(err) {
      console.error(`"_SumSingleSheetMaterials()" failed: ${err}`);
      return null;
    }
  }
  

  /**
   * ### Print Sheet Materials
   */
  static PrintSheetMaterials() {
    try {
      let counts = [];
      Object.values(SHEETS).forEach(sheet => counts.push([Calculate._SumSingleSheetMaterials(sheet)]));
      const values = [
        [ `PLA Used (grams)` ],
        ...counts,
      ];
      OTHERSHEETS.Metrics.getRange(1, 8, values.length, 1).setValues(values);

      let total = StatisticsService.Sum(counts);
      const numOfSpools = Number(total * 0.001).toFixed(2);
      const sumValues = [
        [ `Sum of All Materials (Grams)` ],
        [ total ],
        [``,],
        [ `Number of Spools Used` ], 
        [ numOfSpools ],
      ];
      OTHERSHEETS.Metrics.getRange(values.length + 2, 8, sumValues.length, 1).setValues(sumValues);
      
    } catch(err) {
      console.error(`"PrintSheetMaterials()" failed: ${err}`);
      return null;
    }
   
  }

  /** 
   * ### _SumSingleSheetCost
   * 
   * @private 
   * @param {sheet} sheet
   */
  static _SumSingleSheetCost(sheet) {
    try {
      if(SheetService.IsValidSheet(sheet) == false) {
        throw new Error(`Sheet is FORBIDDEN.`);
      }

      let costs = SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.cost);
      let statuses = SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.status);

      for(let i = 0; i < costs.length; i++) {
        if(statuses[i] == STATUS.complete.plaintext || statuses[i] == STATUS.closed.plaintext) {
          costs[i] = 0.0;
        }
        if(costs[i] === null || !costs[i] || costs[i] == ' ' || isNaN(costs[i])) {
          costs[i] = 0.0;
        }
      }

      let sum = StatisticsService.Sum(costs);
      console.info(`SUM for ${sheet.getSheetName()} = $${sum}`);

      return sum;

    } catch(err) {
      console.error(`"_SumSingleSheetCost()" failed: ${err}`);
      return null;
    }
  }

  /**
   * ### Sum Costs
   */
  static SumCosts() {
    try {
      let count = [];
      Object.values(SHEETS).forEach(sheet => count.push(Calculate._SumSingleSheetCost(sheet)));
      const total = StatisticsService.Sum(count);

      const values = [
        [ `Sum of All Funds Generated ($)` ], 
        [ total ],
      ];

      console.info(values);
      OTHERSHEETS.Metrics.getRange(19, 9, values.length, 1).setValues(values);

      return total;

    } catch(err) {
      console.error(`"SumCosts()" failed: ${err}`);
      return null;
    }
  }

  /**
   * ### Print Sheet Costs
   */
  static PrintSheetCosts() {
    try {
      let counts = [];
      Object.values(SHEETS).forEach(sheet => counts.push([Calculate._SumSingleSheetCost(sheet)]));
      const values = [
        [ `Funds Generated ($)`, ],
        ...counts,
      ];
      OTHERSHEETS.Metrics.getRange(1, 9, values.length, 1).setValues(values);
      
    } catch(err) {
      console.error(`"PrintSheetCosts()" failed: ${err}`);
      return null;
    }
   
  }

  
}



/**
 * -----------------------------------------------------------------------------------------------------------------
 * ### Run Metrics
 */
const Metrics = () => {
  try {
    console.warn(`Calculating Metrics .... `);
    Calculate.GetUserCount()
    Calculate.PrintTurnarounds();
    Calculate.PrintStatusCounts();
    Calculate.CountUniqueUsers();
    Calculate.CountTotalSubmissions();
    Calculate.PrintTopTen();
    Calculate.GetUserArithmeticMean();
    Calculate.UserStandardDeviation();
    Calculate.UserKurtosisAndSkewness();
    Calculate.StatusCounts();
    Calculate.CountUniqueUsersWhoHavePrinted();
    Calculate.SumCosts();
    Calculate.PrintSheetCosts();
    Calculate.PrintSheetMaterials();
    Calculate.PrintZscoreDistribution();
    console.info(`Recalculated Metrics`);
  } catch (err) {
    console.error(`"Metrics()" failed: ${err}`);
    return null;
  }
}


/**
 * -----------------------------------------------------------------------------------------------------------------
 * ### Testing for Metrics
 */
const _testMetrics = () => {
  // Calculate.PrintTurnarounds(); // g
  // Calculate.StatusCountsPerSheet();  // g
  Calculate.PrintStatusCounts(); // g
  // Calculate.UserDistribution(); // g
  // Calculate.GetUserCount();
  // Calculate.CountUniqueUsers();
  // Calculate.CountTotalSubmissions();
  // Calculate.PrintTopTen(); // g
  // Calculate.PrintZscoreDistribution(); // g
  // Calculate.GetUserArithmeticMean();
  // Calculate.StatusCounts(); // g
  // Calculate.UserStandardDeviation(); // g
  // Calculate.UserKurtosisAndSkewness(); // g
  // Calculate.StatusCounts();
  // Calculate.CountUniqueUsersWhoHavePrinted();
  // Calculate.SumCosts();
  // Calculate.PrintSheetCosts(); // g
  // Calculate.PrintSheetMaterials(); // g
}






