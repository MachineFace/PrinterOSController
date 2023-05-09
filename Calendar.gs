
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

  async ReadCalendar() {
    const desc = this.calendar.getDescription();
    console.info(`Desc: ${desc}`);
    this.calendar.setDescription(`This is a calendar to track printer allocation using the PrinterOS service.`);
  }

  CreateEvent(printer, startTime, endTime, user, ) {
    let event = this.calendar
      .createEvent(printer, startTime, endTime)
      .setColor(10)
      .setDescription(`User: ${user}`)
      .setLocation(`${printer}`)
    console.info(event.getId());
  }
}

const _testCalendars = () => {
  let c = new CalendarFactory();
  c.CreateEvent(`SomePrinter`, new Date(2023, 5, 9, 6, 25, 10), new Date(2023, 5, 10, 6, 25, 10), `Some dummy user.`);
}