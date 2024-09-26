/**
 * -----------------------------------------------------------------------------------------------------------------
 * Calculate Metrics
 */
class Calculate {
  constructor() {

  }

  /**
   * Calculate Average Turnaround for a sheet
   * @param {sheet} sheet
   * @return {number} average (hrs)
   */
  static GetAverageTurnaroundPerSheet(sheet = SHEETS.Spectrum) {
    try {
      let completionTimes = [...GetColumnDataByHeader(sheet, HEADERNAMES.duration)];
      let average = Calculate.GeometricMean(completionTimes);
      return average;
    } catch (err) {
      console.error(`"GetAverageTurnaroundPerSheet()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Print Turnaround Averages
   */
  static PrintTurnarounds() {
    try {
      let entries = [];
      Object.entries(SHEETS).forEach(([key, sheet], idx) => {
        let turnaround = `${Number(Calculate.GetAverageTurnaroundPerSheet(sheet)).toFixed(3) || 0} days`;
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
  static StatusCountsPerSheet(sheet = SHEETS.Spectrum) {
    try {
      const statuses = [...GetColumnDataByHeader(sheet, HEADERNAMES.status)];
      const distribution = [...Calculate.Distribution(statuses)] || [];
      const distSet = new Set(distribution.map(([key, _]) => key));

      let data = {};
      distribution.forEach(([key, value]) => data[key] = value);
      
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
  static PrintStatusCounts() {
    try {
      OTHERSHEETS.Metrics.getRange(1, 4, 1, 4).setValues([[ `Completed`, `Cancelled`, `Failed`, `Completion Ratio`, ]]);
      Object.entries(SHEETS).forEach(([key, sheet], idx) => {
        const counts = Calculate.StatusCountsPerSheet(sheet);
        const completed = (counts.Completed + counts.CLOSED) || 0;
        const cancelled = counts.Cancelled || 0;
        const failed = counts.FAILED || 0;
        const total = Calculate.Sum(Object.values(counts)) || 0;
        let ratio = `${Number(Number(completed / total).toFixed(3) * 100).toFixed(1) || 0} %`;
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
  static UserDistribution() {
    try {
      let userList = [];
      let staff = GetColumnDataByHeader(OTHERSHEETS.Staff, `EMAIL`);
      Object.values(SHEETS).forEach(sheet => {
        [...GetColumnDataByHeader(sheet, HEADERNAMES.email)]
          .filter(Boolean)
          .forEach( user => {
            if(staff.indexOf(user) == -1) userList.push(user);
          });
      });

      let items = Calculate.Distribution(userList);
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
  static async GetUserCount() {
    const pos = new PrinterOS();
    let count = 0
    pos.Login()
      .then(async () => {
        await pos.GetUserCount()
          .then(cx => count = cx);
      });
    const values = [
      [ `User Count (From PrinterOS)` ], 
      [ await count ],
    ];
    console.info( await values);
    OTHERSHEETS.Metrics.getRange(1, 12, 2, 1).setValues(await values);
    return count;
  }

  /**
   * Count Unique Users
   */
  static CountUniqueUsers() {
    try {
      let userList = [];
      Object.values(SHEETS).forEach(sheet => {
        [...GetColumnDataByHeader(sheet, HEADERNAMES.email)]
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
      console.error(`"CountTotalSubmissions()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Status Counts
   * @return {object} counts
   */
  static StatusCounts() {
    let count = {};
    Object.values(SHEETS).forEach(sheet => {
      let temp = [];
      GetColumnDataByHeader(sheet, HEADERNAMES.status)
        .filter(Boolean)
        .forEach( (stat, index) => {
          temp.push(Object.keys(STATUS).find(key => STATUS[key].plaintext === stat));
        });
      temp.forEach(key => count[key] = ++count[key] || 1);
    });

    console.info(count);
    const values = [
      [ `Completed Prints`, `Cancelled Prints`, `In-Progress Prints`, `Queued Prints`, ], 
      [ count.complete ? count.complete : 0, count.cancelled ? count.cancelled : 0, count.inProgress ? count.inProgress : 0, count.queued ? count.queued : 0  ],
    ];
    OTHERSHEETS.Metrics.getRange(1, 24, values.length, 4).setValues(values);
    return count;
  }
  
  /**
   * Count Unique Users Who Have Printed
   * return {object} users
   */
  static CountUniqueUsersWhoHavePrinted() {
    let userList = [];
    Object.values(SHEETS).forEach(sheet => {
      let status = GetColumnDataByHeader(sheet, HEADERNAMES.status);
      let users = GetColumnDataByHeader(sheet, HEADERNAMES.email);
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
   * Standard Deviation for Users
   * @return {number} standard deviation
   */
  static UserStandardDeviation() {
    try {
      const distribution = Calculate.UserDistribution();
      const standardDeviation = Calculate.StandardDeviation(distribution);
      const values = [
        [ `Std. Deviation for # of Submissions per User` ], 
        [ `+/- ${standardDeviation}` ],
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
   * Arithmetic Mean
   * @return {number} mean
   */
  static GetUserArithmeticMean() {
    try {
      const distribution = Calculate.UserDistribution();
      const mean = Calculate.ArithmeticMean(distribution);
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
   * Print Top Ten
   */
  static PrintTopTen() {
    try {
      const distribution = Calculate.UserDistribution()
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
   * Count Categorical
   * @private
   */
  _CountCategorical(list) {
    let count = {};
    list.forEach( key => count[key] = ++count[key] || 1);
    return count;
  }

  /** 
   * Sum Single Sheet Materials
   * @private 
   */
  static _SumSingleSheetMaterials(sheet) {
    try {
      if(CheckSheetIsForbidden(sheet)) throw new Error(`Sheet is FORBIDDEN.`);
      let weights = GetColumnDataByHeader(sheet, HEADERNAMES.weight);
      let statuses = GetColumnDataByHeader(sheet, HEADERNAMES.status);
      for(let i = 0; i < weights.length; i++) {
        if(statuses[i] != STATUS.complete.plaintext && statuses[i] != STATUS.closed.plaintext) weights[i] = 0.0;
        if(weights[i] == null || !weights[i] || weights[i] == ' ' || isNaN(weights[i])) weights[i] = 0.0;
      }
      let sum = Calculate.Sum(weights);
      console.info(`SUM for ${sheet.getSheetName()} = ${sum} grams`);
      return sum;
    } catch(err) {
      console.error(`"_SumSingleSheetMaterials()" failed : ${err}`);
      return 1;
    }
  }
  
  /**
   * Sum Materials
   * @return {object} number
   */
  static SumMaterials() {
    try {
      let count = [];
      Object.values(SHEETS).forEach(sheet => count.push(Calculate._SumSingleSheetMaterials(sheet)));
      const total = Calculate.Sum(count);
      const values = [
        [ `Sum of All Materials (Grams)`, total ],
      ];
      console.info(values);
      OTHERSHEETS.Metrics.getRange(46, 2, 1, 2).setValues(values);
      return total;
    } catch(err) {
      console.error(`"SumMaterials()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Print Sheet Materials
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

      let total = Calculate.Sum(counts);
      const numOfSpools = Number(total * 0.001).toFixed(2);
      console.info(`Number of Spools Used: ${numOfSpools}`);
      OTHERSHEETS.Metrics.getRange(48, 2, 1, 2).setValues([[ `Number of Spools Used`, numOfSpools ]]);
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
  static _SumSingleSheetCost(sheet) {
    try {
      if(CheckSheetIsForbidden(sheet)) throw new Error(`Sheet is FORBIDDEN.`);
      let costs = GetColumnDataByHeader(sheet, HEADERNAMES.cost);
      let statuses = GetColumnDataByHeader(sheet, HEADERNAMES.status);
      for(let i = 0; i < costs.length; i++) {
        if(statuses[i] == STATUS.complete.plaintext || statuses[i] == STATUS.closed.plaintext) costs[i] = 0.0;
        if(costs[i] === null || !costs[i] || costs[i] == ' ' || isNaN(costs[i])) costs[i] = 0.0;
      }
      let sum = Calculate.Sum(costs);
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
  static SumCosts() {
    try {
      let count = [];
      Object.values(SHEETS).forEach(sheet => count.push(Calculate._SumSingleSheetCost(sheet)));
      const total = Calculate.Sum(count);
      const values = [
        [ `Sum of All Funds Generated ($)`, total ],
      ];
      console.info(values);
      OTHERSHEETS.Metrics.getRange(47, 2, 1, 2).setValues(values);
      return total;
    } catch(err) {
      console.error(`"SumCosts()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Print Sheet Costs
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
      return 0;
    } catch(err) {
      console.error(`"PrintSheetCosts()" failed : ${err}`);
      return 1;
    }
   
  }

  /**
   * --------------------------------------------------------------------------------------------------------------
   */

  /**
   * Sum Numbers
   * @param {Array} numbers
   * @returns {number} sum
   */
  static Sum(numbers = []) {
    if(numbers.length > 1) {
      return Number(numbers.reduce((a, b) => Number(a) + Number(b), 0)).toFixed(2);
    } else if(numbers.length == 1) return numbers[0];
    else return 0;
  }

  /**
   * Calculate Distribution
   * @param {Array} input array to calculate Distribution
   * @returns {[string, number]} sorted list of users
   */
  static Distribution(numbers = []) {
    try {
      if(numbers.length <= 0) throw new Error(`List is empty: ${numbers.length}`);
      if(numbers.length == 1) return [numbers[0], 1];
      let values = [];
      if (Array.isArray(numbers[0])) values = numbers.map(item => item[1]);
      else values = numbers;
      const occurrences = values.reduce( (acc, curr) => {
        return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
      }, {});

      let items = Object.keys(occurrences).map((key) => {
        if (key != "" || key != undefined || key != null || key != " ") {
          return [key, occurrences[key]];
        }
      });

      items.sort((first, second) => second[1] - first[1]);
      console.warn(items);
      return items;  
    } catch(err) {
      console.error(`"Distribution()" failed: ${err}`);
      return 1;
    }
  }


  /**
   * Calculate Standard Deviation
   * @param {Array} array of keys and values: "[[key, value],[]...]"
   * @returns {number} Standard Deviation
   */
  static StandardDeviation(numbers = []) {
    try {
      if(numbers.length < 2) throw new Error(`List is empty: ${numbers.length}`);

      let values = [];
      if (Array.isArray(numbers[0])) values = numbers.map(item => item[1]);
      else values = numbers;

      const mean = Calculate.GeometricMean(values);
      console.warn(`Mean = ${mean}`);

      const s = Math.sqrt(values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / values.length);
      const standardDeviation = Math.abs(Number(s - mean).toFixed(3)) || 0;
      console.warn(`Standard Deviation: +/-${standardDeviation}`);
      return standardDeviation;
    } catch(err) {
      console.error(`"StandardDeviation()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Z Scores for Each Distribution Entry
   * @param {Array} distribution [[key, value], [key, value], ... ]
   * @param {number} standard deviation
   * @returns {Array} ZScored Entries [[key, value, score], [key, value, score], ... ]
   */
  static ZScore(distribution = [], stdDev = 0) {
    try {
      if(distribution.length < 2) throw new Error(`Distribution Empty: ${distribution.length}`);
      const mean = Calculate.GeometricMean(distribution);

      // Compute the Z-Score for each entry
      const zScore = distribution.map(([key, value]) => {
        const zScore = (value - mean) / stdDev;
        return [key, value, zScore];
      });
      return zScore;
    } catch(err) {
      console.error(`"ZScore()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Kurtosis
   * Measures the "tailedness" of the data distribution.
   * High kurtosis means more outliers; Low kurtosis means fewer outliers.
   * @param {Array} distribution [[key, value], [key, value], ... ]
   * @param {number} standard deviation
   * @returns {number} Kurtosis Number
   */
  static Kurtosis(distribution = [], stdDev = 0) {
    try {
      if(distribution.length < 2) throw new Error(`Distribution Empty: ${distribution.length}`);

      const mean = Calculate.GeometricMean(distribution);

      // Calculate the fourth moment
      const fourthMoment = distribution.reduce((acc, curr) => {
        return acc + Math.pow(curr[1] - mean, 4);
      }, 0) / distribution.length;

      // Calculate variance (standard deviation squared)
      const variance = Math.pow(stdDev, 2);

      // Compute kurtosis
      const kurtosis = fourthMoment / Math.pow(variance, 2);

      // Excess kurtosis (subtract 3 to make kurtosis of a normal distribution zero)
      const excessKurtosis = kurtosis - 3;
      console.warn(`KURTOSIS (Measures the "tailedness" of the data distribution.): ${excessKurtosis}`);
      return excessKurtosis;
    } catch(err) {
      console.error(`"Kurtosis()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Skewness
   * Measures the asymmetry of the data distribution.
   * Positive skew means a long right tail; Negative skew means a long left tail.
   * @param {Array} distribution [[key, value], [key, value], ... ]
   * @param {number} standard deviation
   * @returns {number} Skewness Number
   */
  static Skewness(distribution = [], stdDev = 0) {
    try {
      // Calculate the mean of the distribution
      const mean = Calculate.GeometricMean(distribution);

      // Calculate the third moment
      const thirdMoment = distribution.reduce((acc, curr) => {
        return acc + Math.pow(curr[1] - mean, 3);
      }, 0) / distribution.length;

      // Calculate the skewness
      const skewness = thirdMoment / Math.pow(stdDev, 3);
      console.warn(`SKEWNESS (Measures the asymmetry of the data distribution): ${skewness}`);
      return skewness;
    } catch(err) {
      console.error(`"Skewness()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Detect Outliers
   * Outlier detection typically involves identifying data points that are far from the mean of a distribution, 
   * often using a threshold based on the standard deviation. 
   * A common method for detecting outliers is to flag values that are more than a certain number of standard deviations away from the mean. 
   * For example, values beyond 2 or 3 standard deviations can be considered outliers.
   * @param {Array} distribution [[key, value], [key, value], ... ]
   * @param {number} standard deviation
   * @param {number} threshold
   * @returns {Array} Outliers
   */
  static DetectOutliers(distribution = [], stdDev = 0, threshold = 3) {
    try {
      // Calculate the mean of the distribution
      const mean = Calculate.GeometricMean(distribution);

      // Find outliers
      const outliers = distribution.filter(x => {
        const diff = Math.abs(x[1] - mean);
        return diff > threshold * stdDev;
      });

      // Return the outliers as an array of [key, value] pairs
      return outliers;
    } catch(err) {
      console.error(`"DetectOutliers()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Calculate Arithmetic Mean
   * @returns {number} arithmetic mean
   */
  static ArithmeticMean(distribution = []) {
    try {
      const n = distribution.length;
      if(n == 0) throw new Error(`Distribution is empty: ${n}`);

      let values = [];
      if (Array.isArray(distribution[0])) values = distribution.map(item => item[1]);
      else values = distribution;

      const mean = values.reduce((a, b) => a + b) / n;
      console.warn(`ARITHMETIC MEAN: ${mean}`);
      return mean.toFixed(3);
    } catch(err) {
      console.error(`"ArithmeticMean()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Geometric Mean
   * @param {Array} numbers
   * @returns {number} Geometric Mean
   */
  static GeometricMean(numbers = []) {
    try {
      if(numbers.length < 1) throw new Error(`Distribution is empty: ${numbers.length}`);

      let values = [];
      if (Array.isArray(numbers[0])) values = numbers.map(item => Number(item[1]));
      else values = numbers.map(x => Number(x));

      const product = values.reduce((product, num) => product * num, 1);
      const geometricMean = Math.pow(product, 1 / values.length);
      console.warn(`GEOMETRIC MEAN: ${geometricMean}`);
      return geometricMean;
    } catch(err) {
      console.error(`"GeometricMean()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Harmonic Mean
   * @param {Array} numbers
   * @returns {number} Harmonic Mean
   */
  static HarmonicMean(numbers = []) {
    try {
      if(numbers.length < 2) throw new Error(`Distribution is empty: ${numbers.length}`);
      
      let values = [];
      if (Array.isArray(numbers[0])) values = numbers.map(item => item[1]);
      else values = numbers;

      const harmonicMean = values.length / values.reduce((a, b) => a + 1 / b, 0);
      console.warn(`HERMONIC MEAN: ${harmonicMean}`);
      return harmonicMean;
    } catch(err) {
      console.error(`"HarmonicMean()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Quadratic Mean
   * @param {Array} numbers
   * @returns {number} Quadratic Mean
   */
  static QuadraticMean(numbers = []) {
    try {
      if(numbers.length < 2) throw new Error(`Distribution is empty: ${numbers.length}`);

      let values = [];
      if (Array.isArray(numbers[0])) values = numbers.map(item => item[1]);
      else values = numbers;

      const quadraticMean = Math.sqrt(values.reduce((a, b) => a + b * b, 0) / values.length);
      console.warn(`QUADRATIC MEAN: ${quadraticMean}`);
      return quadraticMean;
    } catch(err) {
      console.error(`"QuadraticMean()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Median Mean
   * @param {Array} numbers
   * @returns {number} Median
   */
  static Median(numbers = []) {
    try {
      if(numbers.length < 2) throw new Error(`Input less than 2: ${numbers.length}`);

      let values = [];
      if (Array.isArray(numbers[0])) values = numbers.map(item => item[1]);
      else values = numbers;

      const sortedNumbers = [...values].sort((a, b) => a - b);
      const middle = Math.floor(sortedNumbers.length / 2);
      const median = sortedNumbers.length % 2 === 0 ?
          (sortedNumbers[middle - 1] + sortedNumbers[middle]) / 2 :
          sortedNumbers[middle];

      console.warn(`MEDIAN: ${median}`);
      return median;
    } catch(err) {
      console.error(`"Median()" failed : ${err}`);
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
    console.warn(`Calculating Metrics .... `);
    Calculate.GetUserCount()
    Calculate.PrintTurnarounds();
    Calculate.PrintStatusCounts();
    Calculate.CountUniqueUsers();
    Calculate.CountTotalSubmissions();
    Calculate.PrintTopTen();
    Calculate.GetUserArithmeticMean();
    Calculate.UserStandardDeviation();
    Calculate.StatusCounts();
    Calculate.CountUniqueUsersWhoHavePrinted();
    Calculate.SumMaterials();
    Calculate.SumCosts();
    Calculate.PrintSheetCosts();
    Calculate.PrintSheetMaterials();
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
  Calculate.GetUserCount();
}






