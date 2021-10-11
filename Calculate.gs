
/**
 * ----------------------------------------------------------------------------------------------------------------
 * Calculate the turnaround time for a given sheet and return the average
 * @param {spreadsheet} sheet
 * @returns {duration} formatted time in hours
 */
const CalculateAverageTurnaround = (sheet) => {

    let last = sheet.getLastRow();
    let completionTimes = sheet.getRange(2, 8, last, 1).getValues(); 

    //Get list of times and remove all the Bullshit
    let revisedTimes = [];
    try {
      completionTimes.forEach(time => {
        if (time[0] != '' || time[0] != undefined || time[0] != null || time[0] != ' ' || time[0] != NaN || time[0] != '[]') {
          revisedTimes.push(time[0]);
        }
      })
    }
    catch (err) {
        Logger.log(`${err} : Could not fetch list of times. Probably a sheet error.`);
    }

    // Sum all the totals
    let total = 0;
    for (let i = 0; i < revisedTimes.length; i++) {
        total += revisedTimes[i];
    }
    // Average the totals (a list of times in minutes)
    let average = (total / revisedTimes.length).toFixed(2);
    // Logger.log(`Total : ${total}, Average: ${average}`)

    return average;
}


/**
 * Prints Above turnaround to a Sheet
 */
const PrintTurnarounds = () => {
  let obj = {}
  for(const [key, value] of Object.entries(SHEETS)) {
    let turnaround = CalculateAverageTurnaround(value);
    obj[key] = turnaround;
  }

  Object.entries(obj).forEach(([key, value], index) => {
    Logger.log(`${index} : ${key} : ${value}`);
    OTHERSHEETS.Metrics.getRange(4 + index, 1, 1, 1).setValue(key);
    OTHERSHEETS.Metrics.getRange(4 + index, 5, 1, 1).setValue(value);
  })
}


/**
 * Sorts the Statuses and Counts them.
 */
const SumStatuses = (sheet) => {
  let count = {};
  let statuses = sheet.getRange(2, 1, sheet.getLastRow(), 1).getValues();
  statuses = [].concat(...statuses);

  let countFunc = (keys) => {
    count[keys] = ++count[keys] || 1;
  }
  statuses.forEach(countFunc);
  return count;
}


/**
 * Status Counts Per Printer
 */
const PrintStatusCounts = () => {
  let obj = {};
  for(const [key, value] of Object.entries(SHEETS)) {
    let counts = SumStatuses(value);
    obj[key] = counts;
  }

  Object.entries(obj).forEach(([key, value], index) => {
    Logger.log(`${index} : ${key} : ${JSON.stringify(value)}`);
    
    const ratio = Number(value.Completed / (value.Completed + value.Cancelled)).toFixed(3);
    OTHERSHEETS.Metrics.getRange(4 + index, 2, 1, 1).setValue(value.Completed);
    OTHERSHEETS.Metrics.getRange(4 + index, 3, 1, 1).setValue(value.Cancelled);
    OTHERSHEETS.Metrics.getRange(4 + index, 4, 1, 1).setValue(ratio);
  })
}


/**
 * Sort Users by Number of Jobs
 */
const CalculateDistribution = () => {
  let count = {};
  let userList = [];
  for(const [name, sheet] of Object.entries(SHEETS)) { 
    let users = sheet.getRange(2, 6, sheet.getLastRow(), 1).getValues();
    users = [].concat(...users);
    users.forEach( user => {
      if(user != null || user != undefined || user != "") {
        userList.push(user);
      }
    })
  }
  let occurrences = userList.reduce( (acc, curr) => {
    return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
  }, {});
  let items = Object.keys(occurrences).map((key) => {
    if (key != "" || key != undefined || key != null) {
      return [key, occurrences[key]];
    }
  });
  items.sort((first, second) => {
    return second[1] - first[1];
  });
  return items;  
}


/**
 * ----------------------------------------------------------------------------------------------------------------
 * Calculate the Distribution in the JPS population
 * Writes the distribution to a sheet, and returns the top ten most active users
 * @returns {[string]} names
 */
const PrintTopTen = () => {

  const distribution = CalculateDistribution();

  // Create a new array with only the first 10 items
  let chop = distribution.slice(0, 11);
  Logger.log(chop);

  chop.forEach((pair, index) => {
    Logger.log(`${pair[0]} -----> ${pair[1]}`);
    OTHERSHEETS.Metrics.getRange(27 + index, 1, 1, 1).setValue(index + 1);
    OTHERSHEETS.Metrics.getRange(27 + index, 2, 1, 1).setValue(pair[0]);
    OTHERSHEETS.Metrics.getRange(27 + index, 3, 1, 1).setValue(pair[1]);
  })

}


/**
 * Count Total Number of Submissions.
 */
const CountTotalSubmissions = () => {
  let count = 0;
  for(const [name, sheet] of Object.entries(SHEETS)) {
    let last = sheet.getLastRow() - 1;
    count += last;
  }
  Logger.log(`Total Count : ${count}`);
  OTHERSHEETS.Metrics.getRange(19, 3, 1, 1).setValue(count);
  return count;
}


/**
 * ----------------------------------------------------------------------------------------------------------------
 * Count Active Users on Each Sheet
 * Mimic =COUNTUNIQUE('Canon Plotter'!J3:J,'Other Tools'!J3:J,Creaform!J3:J,Othermill!J3:J,'Vinyl Cutter'!J3:J,'Haas & Tormach'!J3:J,Shopbot!J5:J,'Advanced Lab'!J3:J,Waterjet!J3:J,Fablight!J3:J,Ultimaker!J3:J,'Laser Cutter'!J3:J)
 * @returns {number} count
 */
const CountUniqueUsers = () => {
  const countUnique = (iterable) => {
    return new Set(iterable).size;
  }
  userList = [];
  for(const [key, sheet] of Object.entries(SHEETS)) { 
    let users = sheet.getRange(2, 6, sheet.getLastRow(), 1).getValues();
    users = [].concat(...users);
    users.forEach( user => {
      userList.push(user);
    })
  }
  
  const count = countUnique(userList);
  OTHERSHEETS.Metrics.getRange(18, 3, 1, 1).setValue(count);
  Logger.log(`Number of Users -----> ${count}`);
  return count;
}


/**
 * ----------------------------------------------------------------------------------------------------------------
 * Calculate the Standard Deviation in the JPS Population
 * @param {[any]} array
 * @returns {number} standard deviation
 */
const CalculateStandardDeviation = () => {
     
  const distribution = CalculateDistribution();
  const n = distribution.length;
  Logger.log(`n = ${n}`);

  const data = []
  distribution.forEach(item => data.push(item[1]));
  // Logger.log(`Data ----> : ${data}`); 
    
  let mean = data.reduce((a, b) => a + b) / n;
  Logger.log(`Mean = ${mean}`);

  let standardDeviation = Math.sqrt(data.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
  Logger.log(`Standard Deviation for Number of Submissions : ${standardDeviation}`);
  OTHERSHEETS.Metrics.getRange(43, 3, 1, 1).setValue(standardDeviation);
  return standardDeviation;
}


/**
 * Arithmetic Mean
 */
const CalculateArithmeticMean = () => {
     
  const distribution = CalculateDistribution();
  const n = distribution.length;
  Logger.log(`n = ${n}`);

  const data = []
  distribution.forEach(item => data.push(item[1]));
    
  let mean = data.reduce((a, b) => a + b) / n;
  Logger.log(`Mean = ${mean}`);

  OTHERSHEETS.Metrics.getRange(44, 3, 1, 1).setValue(mean);
  return mean;
}


/**
 * Count Statuses and Put them on Metrics Sheet
 */
const StatusCounts = () => {
  let count = {};
  for(const [key, sheet] of Object.entries(SHEETS)) {
    let statuses = sheet.getRange(2, 1, sheet.getLastRow(), 1).getValues();
    statuses = [].concat(...statuses);
    temp = [];
    statuses.forEach(stat => {
      if(stat != null || stat != undefined || stat != "" || stat != " ") {
        temp.push(stat.split('-').join('').toLowerCase());
      }
    })
    let countFunc = (keys) => {
      count[keys] = ++count[keys] || 1;
    }
    temp.forEach(countFunc);
  }
  Logger.log(count);
  OTHERSHEETS.Metrics.getRange(20, 3, 1, 1).setValue(count.completed);
  OTHERSHEETS.Metrics.getRange(21, 3, 1, 1).setValue(count.cancelled);
  OTHERSHEETS.Metrics.getRange(22, 3, 1, 1).setValue(count.inprogress);
  OTHERSHEETS.Metrics.getRange(23, 3, 1, 1).setValue(count.queued);
}


/**
 * ----------------------------------------------------------------------------------------------------------------
 * Metrics - DO NOT DELETE
 * Used to Calculate Average Turnaround times and write to 'Data/Metrics' sheet
 */
const Metrics = () => {
    try {
      Logger.log(`Calculating Metrics .... `)
      PrintTurnarounds();
      PrintStatusCounts();
      CountUniqueUsers();
      CountTotalSubmissions();
      PrintTopTen();
      CalculateStandardDeviation();
      CalculateArithmeticMean();
      StatusCounts();
      Logger.log(`Recalculated Metrics`);
    }
    catch (err) {
      Logger.log(`${err} : Couldn't generate statistics on Metrics.`);
    }

}