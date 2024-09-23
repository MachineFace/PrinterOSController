
/**
 * -----------------------------------------------------------------------------------------------------------------
 * Factory for creating calendar events 
 */
class CalendarFactory {
  constructor() {
    /** @private */
    this.calendar_name = `PrinterOS`;
    /** @private */
    this.calendar_id = PropertiesService.getScriptProperties().getProperty(`CALENDAR_ID`);
    /** @private */
    this.calendar = CalendarApp.getCalendarById(this.calendar_id);
    /** @private */
    this.DeleteDuplicateEvents();
  }

  /**
   * Get Calendars
   * @return {object} calendar
   */
  get Calendars() {
    const calendars = CalendarApp.getAllCalendars();
    calendars.forEach(calendar => {
      console.info(`Name: ${calendar.getName()}, ID: ${calendar.getId()}`);
    });
    return calendars;
  }

  /**
   * Get Events
   * @return {object} events
   */
  get Events() {
    try {
      const events = this.calendar.getEvents(new Date(2019, 1, 1, 0, 0, 0), new Date());
      console.info(`Count: ${events.length}`);
      events.forEach(event => console.info(`ID: ${event.getId()} \nTitle: ${event.getTitle()}`));
      return events;
    } catch(err) {
      console.error(`"GetEvents()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Create Event from rowdata
   * @param {object} rowdata
   * @return {event} event
   */
  async CreateEvent( rowdata ) {
    try {
      const title = `${rowdata?.printerName}, JobID: ${rowdata?.jobID}, Email: ${rowdata?.email}, Filename:${rowdata?.filename}`; 
      if(this._CheckIfEventExists(rowdata?.jobID) == true) return; // Skip if it exists

      const startTime =  new Date();
      const endTime = this._CalculateCompletionTime(startTime, rowdata?.duration);
      const color = PRINTERDATA[rowdata?.printerName].color;
      const location = `Jacobs Hall Rm 234 \n${rowdata?.printerName}`;
      let description = `${SERVICE_NAME} \n`;

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
      this.DeleteDuplicateEvents();
      return await event;
    } catch(err) {
      console.error(`"CreateEvent()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Delete Event By JobID
   */
  async DeleteEvent( jobID ) {
    try {
      const events = [...this.Events]
        .filter(Boolean);
      if(events.length == 0) return 0; 
      events.forEach(event => {
        const eventID = event?.getId();
        let jID = event?.getTitle()
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
      return 0;
    } catch(err) {
      console.error(`"DeleteEvent()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Delete Event by Google ID
   */
  async DeleteEventByGID( googleId ) {
    try {
      console.info(`Deleting Event : ${googleId}....`);
      this.calendar
        .getEventById(googleId)
        .deleteEvent();
      console.info(`Event: ${googleId} deleted.`);
      return 0;
    } catch(err) {
      console.error(`"DeleteEventByGID()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Delete All Events
   */
  async DeleteAllEvents() {
    try {
      const events = this.Events;
      events.forEach(event => {
        console.info(`Deleting Event: ${event.getTitle()}....`);
        this.calendar
          .getEventById(event.getId())
          .deleteEvent();
      });
      return 0;
    } catch(err) {
      console.error(`"DeleteAllEvents()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Delete Duplicate Events
   */
  DeleteDuplicateEvents() {
    try {
      let singletons = {};
      const events = this.Events;
      events.forEach(event => {
        const eventID = event.getId();
        let jID = event.getTitle()
          .replace(` `, ``)
          .split(",")[1]
          .replace(`JobID: `, ``);
        singletons[jID] = eventID;
      });
      console.info(JSON.stringify(singletons));
      Object.values(singletons).forEach(id => this.DeleteEventByGID(id));
      return 0;
    } catch(err) {
      console.error(`"DeleteDuplicateEvents()" failed : ${err}`);
      return 1;
    }
  }

  /** 
   * Check If Event Exists
   * @private 
   * @param {string} jobID
   * @return {bool} true or false
   */
  _CheckIfEventExists(jobID) {
    try {
      const events = this.Events;
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
    } catch(err) {
      console.error(`"_CheckIfEventExists()" failed : ${err}`);
      return 1;
    }
  }

  /** 
   * Calculate Completion Time
   * @private 
   * @param {Date} start
   * @param {number} duration in hours
   * @return {Date} end
   */
  _CalculateCompletionTime(start = new Date(), duration = 3.75) {
    try {
      const s = new Date(start).getTime();
      const d = (duration + 0.5) * 3600000;
      const date = new Date(s + d);
      return date;
    } catch(err) {
      console.error(`"_CalculateCompletionTime()" failed : ${err}`);
      return 1;
    }
  }


}

/**
 * Delete Duplicate Events
 * @TRIGGERED
 */
const deleteDupEvents = () => new CalendarFactory().DeleteDuplicateEvents();

const _testCalendars = () => {
  let c = new CalendarFactory();
  c.CreateEvent(GetRowData(SHEETS.Plumbus, 22));
  c.CreateEvent(GetRowData(SHEETS.Luteus, 227));
  c.CreateEvent(GetRowData(SHEETS.Zardoz, 150));
  // c.Events;
  c.Events;
  // c.DeleteEvent(3271817);
  // c.DeleteAllEvents();
  // const d = c._CalculateCompletionTime(new Date(2012, 5, 3), 1000);
  // console.info(d)
  // const ch = c._CheckIfEventExists(`3250283`);
  // const ch = c.DeleteDuplicateEvents();
  // console.info(ch);
}

















