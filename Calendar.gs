
/**
 * Factory for creating calendar events 
 */
class CalendarFactory {
  constructor() {
    this.calendar_name = `PrinterOS`;
    this.calendar_id = PropertiesService.getScriptProperties().getProperty(`CALENDAR_ID`);
    this.calendar = CalendarApp.getCalendarById(this.calendar_id);
  }

  async GetCalendars() {
    const calendars = CalendarApp.getAllCalendars();
    calendars.forEach(calendar => {
      console.info(`Name: ${calendar.getName()}, ID: ${calendar.getId()}`);
    });
    return await calendars;
  }

  GetEvents() {
    const events = this.calendar.getEvents(new Date(2019, 1, 1, 0, 0, 0), new Date());
    console.info(`Count: ${events.length}`);
    events.forEach(event => {
      console.info(`ID: ${event.getId()} \nTitle: ${event.getTitle()}`);
    });
    return events;
  }

  async CreateEvent( rowdata ) {
    const title = `${rowdata?.printerName}, JobID: ${rowdata?.jobID}, Email: ${rowdata?.email}, Filename:${rowdata?.filename}`;

    // Skip if it exists
    if(this._CheckIfEventExists(rowdata?.jobID) == true) return;

    const startTime =  new Date();
    const endTime = this._CalculateCompletionTime(startTime, rowdata?.duration);
    const color = PRINTERDATA[rowdata?.printerName].color;
    const location = `Jacobs Hall Rm 234 \n${rowdata?.printerName}`;
    let description = `${GMAIL_SERVICE_NAME} \n`;

    Object.entries(rowdata).forEach(entry => {
      let headername = HEADERNAMES[entry[0]];
      let value = entry[1];
      description += `${headername}: ${value}\n`;
    });

    let event = await this.calendar
      .createEvent(title, startTime, endTime)
      .setDescription(description)
      .setLocation(location)
      .setColor(color)
    console.info(event.getId());
    this._DeleteDuplicateEvents();
    return await event;
  }

  async DeleteEvent( jobID ) {
    const events = this.GetEvents();
    events.forEach(event => {
      const eventID = event.getId();
      let jID = event.getTitle()
        .replace(` `, ``)
        .split(",")[1]
        .replace(`JobID: `, ``);
      if(jID == jobID) {
        console.info(`Found Event: ${eventID} for JobID: ${jobID}, Deleting....`);
        this.calendar
          .getEventById(eventID)
          .deleteEvent();
        console.info(`Event: ${eventID}, Deleted`);
      }
    });
  }

  async DeleteAllEvents() {
    const events = GetEvents();
    events.forEach(event => {
      console.info(`Deleting Event: ${event.getTitle()}....`);
      this.calendar
        .getEventById(event.getId())
        .deleteEvent();
    });
  }

  _DeleteDuplicateEvents() {
    let singletons = {};
    const events = this.GetEvents();
    events.forEach(event => {
      const eventID = event.getId();
      let jID = event.getTitle()
        .replace(` `, ``)
        .split(",")[1]
        .replace(`JobID: `, ``);
      singletons[jID] = eventID;
    });
    console.info(JSON.stringify(singletons));
    events.forEach(event => {
      if(Object.values(singletons).indexOf(event.getId()) == -1) {
        console.error(`Gonna delete this one: ${event.getId()}`);
        let dupID = event.getTitle()
          .replace(` `, ``)
          .split(",")[1]
          .replace(`JobID: `, ``);
        this.DeleteEvent(dupID);
      }
    })
  }

  _CheckIfEventExists(jobID) {
    const events = this.GetEvents();
    for(let i = 0; i < events.length; i++) {
      const eventID = events[i].getId();
      let jID = events[i].getTitle()
        .replace(` `, ``)
        .split(",")[1]
        .replace(`JobID: `, ``);
        console.info(`JobID: ${jID}`);
      if(jID != jobID) return false;
      console.info(`Found Event: ${eventID} for JobID: ${jobID}....`);
      return true;
    }
  }

  _CalculateCompletionTime(start, duration) {
    start = start instanceof Date ? start : new Date();
    const s = new Date(start).getTime();
    const d = duration * 3600000;
    const date = new Date(s + d);
    return date;
  }


}

const _testCalendars = () => {
  let c = new CalendarFactory();
  // c.CreateEvent(GetRowData(SHEETS.Spectrum, 131));
  // c.CreateEvent(GetRowData(SHEETS.Luteus, 227));
  // c.CreateEvent(GetRowData(SHEETS.Zardoz, 150));
  // c.GetEvents();
  // c.DeleteEvent(3271817);
  // c.DeleteAllEvents();
  // const ch = c._CheckIfEventExists(`3250283`);
  const ch = c._DeleteDuplicateEvents();
  // console.info(ch);
}

















