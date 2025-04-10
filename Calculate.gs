/**
 * -----------------------------------------------------------------------------------------------------------------
 * Calculate Metrics
 */
class Calculate {
  constructor() {
    this.userDistribution = this.UserDistribution();
  }

  /**
   * Calculate Average Turnaround for a sheet
   * @param {sheet} sheet
   * @return {number} average (hrs)
   */
  GetAverageTurnaroundPerSheet(sheet = SHEETS.Spectrum) {
    try {
      let completionTimes = [...SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.duration)];
      let average = StatisticsService.ArithmeticMean(completionTimes);
      average = !isNaN(average) ? Number(average).toFixed(3) : 0;
      return average;
    } catch (err) {
      console.error(`"GetAverageTurnaroundPerSheet()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Print Turnaround Averages
   */
  PrintTurnarounds() {
    try {
      let entries = [];
      Object.entries(SHEETS).forEach(([key, sheet], idx) => {
        let turnaround = `${this.GetAverageTurnaroundPerSheet(sheet)} days`;
        entries.push([ key, turnaround, ]);
      }); 
      
      const values = [
        [ `Printer`, `Turnaround` ],
        ...entries,
      ];
      OTHERSHEETS.Metrics.getRange(1, 2, values.length, 2).setValues(values);
      return 0;
    } catch(err) {
      console.error(`"PrintTurnarounds()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Sum all Statuses
   */
  StatusCountsPerSheet(sheet = SHEETS.Spectrum) {
    try {
      const statuses = [...SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.status)]
        .filter(Boolean);
      const distribution = statuses.length > 0 ? [...StatisticsService.Distribution(statuses)] : [];
      const distSet = new Set(distribution.map(([key, _]) => key));

      let data = {}
      if(distribution.length > 0) distribution.forEach(([key, value]) => data[key] = value);
      
      // Add Missing Values
      let list = Object.values(STATUS);
      list.forEach(entry => {
        if (!distSet.has(entry.plaintext)) {
          data[entry.plaintext] = 0;
        }
      });
      // console.info(JSON.stringify(data, null, 2));
      return data;
    } catch(err) {
      console.error(`"StatusCountsPerSheet()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Print Status Counts
   */
  PrintStatusCounts() {
    try {
      OTHERSHEETS.Metrics.getRange(1, 4, 1, 4).setValues([[ `Completed`, `Cancelled`, `Failed`, `Completion Ratio`, ]]);
      Object.entries(SHEETS).forEach(([key, sheet], idx) => {
        const counts = this.StatusCountsPerSheet(sheet);
        const sum = (counts.Completed + counts.CLOSED);
        const completed = !isNaN(sum) && sum != null && sum != undefined && sum > 0 ? Number(sum).toFixed(3) : 0.0;
        const cancelled = !isNaN(counts.Cancelled) && counts.Cancelled != null && counts.Cancelled != undefined && counts.Cancelled > 0 ? Number(counts.Cancelled).toFixed(3) : 0.0;
        const failed = !isNaN(counts.FAILED) && counts.FAILED != null && counts.FAILED != undefined && counts.FAILED > 0 ? Number(counts.FAILED).toFixed(3) : 0.0;
        const total = StatisticsService.Sum(Object.values(counts)) || 0;
        let ratio = total > 0 ? `${Number(Number(completed / total).toFixed(3) * 100).toFixed(1)} %` : `0 %`;
        console.info(`COMPLETED: ${completed}, CANCELLED: ${cancelled}, FAILED: ${failed}, TOTAL: ${total}, COMPLETED RATIO: ${ratio}`);
        const values = [ [ completed, cancelled, failed, ratio ], ];
        OTHERSHEETS.Metrics.getRange(2 + idx, 4, 1, 4).setValues(values);
      }); 
      return 0;
    } catch(err) {
      console.error(`"PrintStatusCounts()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Calculate User Distribution
   * @return {[]} users and counts
   */
  UserDistribution() {
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
      console.error(`"UserDistribution()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Get User Counts from PrinterOS
   * @return {object} counts
   */
  async GetUserCount() {
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
   * Count Unique Users
   */
  CountUniqueUsers() {
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
      console.error(`"CountUniqueUsers()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Count Total Submissions
   * @return {number} count
   */
  CountTotalSubmissions() {
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
      console.error(`"CountTotalSubmissions()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Status Counts
   * @return {object} counts
   */
  StatusCounts() {
    let statuses = {}
    Object.values(SHEETS).forEach(sheet => {
      const data = this.StatusCountsPerSheet(sheet);
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
   * Count Unique Users Who Have Printed
   * return {object} users
   */
  CountUniqueUsersWhoHavePrinted() {
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
   * Arithmetic Mean
   * @return {number} mean
   */
  GetUserArithmeticMean() {
    try {
      const mean = StatisticsService.ArithmeticMean(this.userDistribution);
      const values = [
        [ `Average # of Submissions Per User` ], 
        [ mean ],
      ];
      OTHERSHEETS.Metrics.getRange(1, 15, 2, 1).setValues(values);
      return mean;
    } catch(err) {
      console.error(`"GetUserArithmeticMean()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Standard Deviation for Users
   * @return {number} standard deviation
   */
  UserStandardDeviation() {
    try {
      const standardDeviation = StatisticsService.StandardDeviation(this.userDistribution);
      const values = [
        [ `Std. Deviation for # of Submissions per User` ], 
        [ `+/- ${Number(standardDeviation).toFixed(4)}` ],
      ];
      console.info(values);
      OTHERSHEETS.Metrics.getRange(1, 16, 2, 1).setValues(values);
      return standardDeviation;
    } catch(err) {
      console.error(`"UserStandardDeviation()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Standard Deviation for Users
   * @return {number} standard deviation
   */
  UserKurtosisAndSkewness() {
    try {
      const standardDeviation = StatisticsService.StandardDeviation(this.userDistribution);
      const kurtosis = StatisticsService.Kurtosis(this.userDistribution, standardDeviation);
      const skewness = StatisticsService.Skewness(this.userDistribution, standardDeviation);
      const values = [
        [ `Kurtosis (High Kurtosis means more outliers in data)`, `Skewness (Measure of asymmetry of the data)`  ], 
        [ kurtosis, skewness, ],
      ];
      console.info(values);
      OTHERSHEETS.Metrics.getRange(1, 17, 2, 2).setValues(values);
      return standardDeviation;
    } catch(err) {
      console.error(`"UserKurtosisAndSkewness()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Print Top Ten
   */
  PrintTopTen() {
    try {
      const distribution = this.userDistribution
        .slice(0, 11);
      console.info(distribution);

      OTHERSHEETS.Metrics.getRange(1, 20, 1, 3).setValues([[ `Place`, `Email`, `# of Submissions`, ]]);
      distribution.forEach(([email, count], idx) => {
        const values = [ [ idx + 1, email, count ], ];
        OTHERSHEETS.Metrics.getRange(2 + idx, 20, 1, 3).setValues(values); 
      });
      return 0;
    } catch(err) {
      console.error(`"PrintTopTen()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Print Zscore / Distribution / Detect Outliers
   */
  PrintZscoreDistribution() {
    try {
      const stdDev = StatisticsService.StandardDeviation(this.userDistribution);
      const zScore = StatisticsService.ZScore(this.userDistribution, stdDev);
      const outliers = StatisticsService.DetectOutliers(this.userDistribution, stdDev);

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
      console.error(`"PrintZscoreDistribution()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Count Categorical
   * @private
   */
  _CountCategorical(list) {
    let count = {}
    list.forEach( key => count[key] = ++count[key] || 1);
    return count;
  }

  /** 
   * Sum Single Sheet Materials
   * @private 
   */
  _SumSingleSheetMaterials(sheet) {
    try {
      if(SheetService.IsValidSheet(sheet) == false) throw new Error(`Sheet is FORBIDDEN.`);
      let weights = SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.weight);
      let statuses = SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.status);
      for(let i = 0; i < weights.length; i++) {
        if(statuses[i] != STATUS.complete.plaintext && statuses[i] != STATUS.closed.plaintext) weights[i] = 0.0;
        if(weights[i] == null || !weights[i] || weights[i] == ' ' || isNaN(weights[i])) weights[i] = 0.0;
      }
      let sum = StatisticsService.Sum(weights);
      console.info(`SUM for ${sheet.getSheetName()} = ${sum} grams`);
      return sum;
    } catch(err) {
      console.error(`"_SumSingleSheetMaterials()" failed : ${err}`);
      return 1;
    }
  }
  

  /**
   * Print Sheet Materials
   */
  PrintSheetMaterials() {
    try {
      let counts = [];
      Object.values(SHEETS).forEach(sheet => counts.push([this._SumSingleSheetMaterials(sheet)]));
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
      return 0;
    } catch(err) {
      console.error(`"PrintSheetMaterials()" failed : ${err}`);
      return 1;
    }
   
  }

  /** 
   * _SumSingleSheetCost
   * @private 
   * @param {sheet} sheet
   */
  _SumSingleSheetCost(sheet) {
    try {
      if(SheetService.IsValidSheet(sheet) == false) throw new Error(`Sheet is FORBIDDEN.`);
      let costs = SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.cost);
      let statuses = SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.status);
      for(let i = 0; i < costs.length; i++) {
        if(statuses[i] == STATUS.complete.plaintext || statuses[i] == STATUS.closed.plaintext) costs[i] = 0.0;
        if(costs[i] === null || !costs[i] || costs[i] == ' ' || isNaN(costs[i])) costs[i] = 0.0;
      }
      let sum = StatisticsService.Sum(costs);
      console.info(`SUM for ${sheet.getSheetName()} = $${sum}`);
      return sum;
    } catch(err) {
      console.error(`"_SumSingleSheetCost()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Sum Costs
   */
  SumCosts() {
    try {
      let count = [];
      Object.values(SHEETS).forEach(sheet => count.push(this._SumSingleSheetCost(sheet)));
      const total = StatisticsService.Sum(count);
      const values = [
        [ `Sum of All Funds Generated ($)` ], 
        [ total ],
      ];
      console.info(values);
      OTHERSHEETS.Metrics.getRange(19, 9, values.length, 1).setValues(values);
      return total;
    } catch(err) {
      console.error(`"SumCosts()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Print Sheet Costs
   */
  PrintSheetCosts() {
    try {
      let counts = [];
      Object.values(SHEETS).forEach(sheet => counts.push([this._SumSingleSheetCost(sheet)]));
      const values = [
        [ `Funds Generated ($)`, ],
        ...counts,
      ];
      OTHERSHEETS.Metrics.getRange(1, 9, values.length, 1).setValues(values);
      return 0;
    } catch(err) {
      console.error(`"PrintSheetCosts()" failed : ${err}`);
      return 1;
    }
   
  }

  
}



/**
 * -----------------------------------------------------------------------------------------------------------------
 * Run Metrics
 */
const Metrics = () => {
  try {
    const c = new Calculate();
    console.warn(`Calculating Metrics .... `);
    c.GetUserCount()
    c.PrintTurnarounds();
    c.PrintStatusCounts();
    c.CountUniqueUsers();
    c.CountTotalSubmissions();
    c.PrintTopTen();
    c.GetUserArithmeticMean();
    c.UserStandardDeviation();
    c.UserKurtosisAndSkewness();
    c.StatusCounts();
    c.CountUniqueUsersWhoHavePrinted();
    c.SumCosts();
    c.PrintSheetCosts();
    c.PrintSheetMaterials();
    c.PrintZscoreDistribution();
    console.info(`Recalculated Metrics`);
    return 0;
  } catch (err) {
    console.error(`"Metrics()" failed : ${err}`);
    return 1;
  }
}


/**
 * -----------------------------------------------------------------------------------------------------------------
 * Testing for Metrics
 */
const _testMetrics = () => {
  const c = new Calculate();
  c.StatusCounts();
}






