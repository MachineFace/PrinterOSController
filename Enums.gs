/**
 * -----------------------------------------------------------------------------------------------------------------
 * Code Enumerations
 */
const SERVICE_NAME = `Jacobs Self-Service Printing Bot`;
const SERVICE_EMAIL = `jacobs-project-support@berkeley.edu`;

/** @private */
const THIS_SPREADSHEET = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty(`SPREADSHEET_ID`));

const PICKUP_HOURS = `Monday - Friday: 11am - 1pm & 4pm - 6pm`;

const COSTMULTIPLIER = 0.04;
const COSTMULTIPLIERBREAKAWAY = 0.20;
const COSTMULTIPLIER_AVERAGE = 0.12;

/**
 * Colors
 */
const COLORS = Object.freeze({
  green_light : `#d9ead3`,
  green : `74d975`, 
  green_dark : `#93c47d`, 
  green_dark_2 : `#38761d`,
  yellow_light : `#fff2cc`,
  yellow : `#f1c232`,
  yellow_dark : `#f1c232`,
  yellow_dark_2 : `#bf9000`,
  orange_light : `#fce5cd`,
  orange_bright : `#ff9900`,
  orange : `#f6b26b`,
  orange_dark : `#e69138`, 
  orange_dark_2 : `#b45f06`,
  red_light : `#f4cccc`, 
  red : `	#ff0000`,  
  red_dark : `#cc0000`,
  red_dark_2 : `#990000`,
  red_dark_berry_2 : `#85200c`,
  purle_light : `	#d9d2e9`,
  purple : `#b4a7d6`,
  purple_dark : `#20124d`,
  purple_dark_2 : `#351c75`,
  grey_light : `#efefef`,
  grey : `#cccccc`, 
  grey_dark : `#999999`,
  black : `#000000`,
});

/**
 * Event Colors
 */
const EVENT_COLORS = Object.freeze({
  PALE_BLUE	: 1,
  PALE_GREEN : 2,
  MAUVE : 3,
  PALE_RED : 4,
  YELLOW : 5,
  ORANGE : 6,
  CYAN : 7,
  GRAY : 8,
  BLUE : 9,
  GREEN : 10,
  RED : 11,
});

/**
 * Response Codes
 */
const RESPONSECODES = Object.freeze({
	200 : `OK`,
	201 : `Created`,
	202 : `Accepted`,
	203 : `Non-Authoritative Information`,
	204 : `No Content`,
	205 : `Reset Content`,
	206 : `Partial Content`,
	207 : `Multi-Status (WebDAV)`,
	208 : `Already Reported (WebDAV)`,
	226 : `IM Used`,
	300 : `Multiple Choices`,
	301 : `Moved Permanently`,
	302 : `Found`,
	303 : `See Other`,
	304 : `Not Modified`,
	305 : `Use Proxy`,
	306 : `(Unused)`,
	307 : `Temporary Redirect`,
	308 : `Permanent Redirect (experimental)`,
 	400 : `Bad Request`,
	401 : `Unauthorized`,
	402 : `Payment Required`,
	403 : `Forbidden`,
	404 : `Not Found`,
	405 : `Method Not Allowed`,
	406 : `Not Acceptable`,
	407 : `Proxy Authentication Required`,
	408 : `Request Timeout`,
	409 : `Conflict`,
	410 : `Gone`,
	411 : `Length Required`,
	412 : `Precondition Failed`,
	413 : `Request Entity Too Large`,
	414 : `Request-URI Too Long`,
	415 : `Unsupported Media Type`,
	416 : `Requested Range Not Satisfiable`,
	417 : `Expectation Failed`,
	418 : `I'm a teapot (RFC 2324)`,
	420 : `Enhance Your Calm (Twitter)`,
	422 : `Unprocessable Entity (WebDAV)`,
	423 : `Locked (WebDAV)`,
	424 : `Failed Dependency (WebDAV)`,
	425 : `Reserved for WebDAV`,
	426 : `Upgrade Required`,
	428 : `Precondition Required`,
	429 : `Too Many Requests`,
	431 : `Request Header Fields Too Large`,
	444 : `No Response (Nginx)`,
	449 : `Retry With (Microsoft)`,
	450 : `Blocked by Windows Parental Controls (Microsoft)`,
	451 : `Unavailable For Legal Reasons`,
	499 : `Client Closed Request (Nginx)`,
	500 : `Internal Server Error`,
	501 : `Not Implemented`,
	502 : `Bad Gateway`,
	503 : `Service Unavailable`,
	504 : `Gateway Timeout`,
	505 : `HTTP Version Not Supported`,
	506 : `Variant Also Negotiates (Experimental)`,
	507 : `Insufficient Storage (WebDAV)`,
	508 : `Loop Detected (WebDAV)`,
	509 : `Bandwidth Limit Exceeded (Apache)`,
	510 : `Not Extended`,
	511 : `Network Authentication Required`,
	598 : `Network read timeout error`,
	599 : `Network connect timeout error`,
});

/**
 * Status
 */
const STATUS = Object.freeze({
  queued : {
    plaintext : `Queued`,
    statusCode : 11,
  },
  inProgress : {
    plaintext : `In-Progress`,
    statusCode : 21,
  },
  complete : {
    plaintext : `Completed`,
    statusCode : 77,
  },
  failed : {
    plaintext : `FAILED`,
    statusCode : 43,
  },
  cancelled : {
    plaintext : `Cancelled`,
    statusCode : 45,
  },
  pickedUp : {
    plaintext : `Picked Up`,
    statusCode : 99,
  },
  closed : {
    plaintext : `CLOSED`,
    statusCode : 98,
  },
  abandoned : {
    plaintext : `Abandoned`,
    statusCode : 97,
  },
});

/**
 * Printer IDS
 */
const PRINTERIDS = Object.freeze({ 
  Luteus : 116705,
  Caerulus : 116704,
  Photon : 116707,
  Quasar : 116708,
  Zardoz : 116696,
  Viridis : 116699,
  Rubrum : 116702,
  Plumbus : 116712,
  Nimbus : 116710,
  Spectrum : 116693,
  Purpura : 110479,
  Crystallum : 113601,
  Aurum : 110558,
  Alpha: 120697,
  Beta : 120699,
  Gamma : 120700,
});

/** 
12:03:57 PM	Info	PrinterID: 110479, Name: Pupura, IPAddress: 192.168.1.141
12:03:57 PM	Info	PrinterID: 110558, Name: Aurum, IPAddress: 192.168.1.147
12:03:57 PM	Info	PrinterID: 113601, Name: Crystallum, IPAddress: 192.168.1.138
12:03:57 PM	Info	PrinterID: 116693, Name: Spectrum, IPAddress: 192.168.1.131
12:03:57 PM	Info	PrinterID: 116696, Name: Zardoz, IPAddress: 192.168.1.136
12:03:57 PM	Info	PrinterID: 116699, Name: Viridis, IPAddress: 192.168.1.135
12:03:57 PM	Info	PrinterID: 116702, Name: Rubrum, IPAddress: 192.168.1.112
12:03:57 PM	Info	PrinterID: 116704, Name: Caerulus, IPAddress: 192.168.1.122
12:03:57 PM	Info	PrinterID: 116705, Name: Luteus, IPAddress: 192.168.1.113
12:03:57 PM	Info	PrinterID: 116707, Name: Photon, IPAddress: 192.168.1.128
12:03:57 PM	Info	PrinterID: 116708, Name: Quasar, IPAddress: 192.168.1.129
12:03:57 PM	Info	PrinterID: 116710, Name: Nimbus, IPAddress: 192.168.1.111
12:03:57 PM	Info	PrinterID: 116712, Name: Plumbus, IPAddress: 192.168.1.126
12:03:57 PM	Info	PrinterID: 120697, Name: Alpha, IPAddress: 192.168.1.137
12:03:57 PM	Info	PrinterID: 120699, Name: Beta, IPAddress: 192.168.1.140
12:03:57 PM	Info	PrinterID: 120700, Name: Gamma, IPAddress: 192.168.1.139
*/

/**
 * Printer Data
 */
const PRINTERDATA = Object.freeze({ 
  Luteus : { 
    name : `Luteus`,
    printerID : 116705,
    sheet : THIS_SPREADSHEET.getSheetByName(`Luteus`),
    type : `UM3`,
    local_ip : `192.168.1.113`,
    color : EVENT_COLORS.BLUE,
  },
  Caerulus : {
    name : `Caerulus`,
    printerID : 116704,
    sheet : THIS_SPREADSHEET.getSheetByName(`Caerulus`),
    type : `UM3`,
    local_ip : `192.168.1.122`,
    color : EVENT_COLORS.CYAN,
  },
  Photon : {
    name : `Photon`,
    printerID : 116707,
    sheet : THIS_SPREADSHEET.getSheetByName(`Photon`),
    type : `UM3`,
    local_ip : `192.168.1.128`,
    color : EVENT_COLORS.GRAY,
  },
  Quasar : {
    name : `Quasar`,
    printerID : 116708,
    sheet : THIS_SPREADSHEET.getSheetByName(`Quasar`),
    type : `UM3`,
    local_ip : `192.168.1.129`,
    color : EVENT_COLORS.GREEN,
  },
  Zardoz : {
    name : `Zardoz`,
    printerID : 116696,
    sheet : THIS_SPREADSHEET.getSheetByName(`Zardoz`),
    type : `UM3 Extended`,
    local_ip : `192.168.1.136`,
    color : EVENT_COLORS.MAUVE,
  },
  Viridis : {
    name : `Viridis`,
    printerID : 116699,
    sheet : THIS_SPREADSHEET.getSheetByName(`Viridis`),
    type : `UM3`,
    local_ip : `192.168.1.135`,
    color : EVENT_COLORS.ORANGE,
  },
  Rubrum : {
    name : `Rubrum`,
    printerID : 116702,
    sheet : THIS_SPREADSHEET.getSheetByName(`Rubrum`),
    type : `UM3`,
    local_ip : `192.168.1.112`,
    color : EVENT_COLORS.PALE_BLUE,
  },
  Plumbus : {
    name : `Plumbus`,
    printerID : 116712,
    sheet : THIS_SPREADSHEET.getSheetByName(`Plumbus`),
    type : `UM3`,
    local_ip : `192.168.1.126`,
    color : EVENT_COLORS.PALE_GREEN,
  },
  Nimbus : {
    name : `Nimbus`,
    printerID : 116710,
    sheet : THIS_SPREADSHEET.getSheetByName(`Nimbus`),
    type : `UM3`,
    local_ip : `192.168.1.111`,
    color : EVENT_COLORS.PALE_RED,
  },
  Spectrum : {
    name : `Spectrum`,
    printerID : 116693,
    sheet : THIS_SPREADSHEET.getSheetByName(`Spectrum`),
    type : `UM3 Extended`,
    local_ip : `192.168.1.131`,
    color : EVENT_COLORS.RED,
  },
  Purpura : {
    name : `Purpura`,
    printerID : 110479,
    sheet : THIS_SPREADSHEET.getSheetByName(`Purpura`),
    type : `S3`,
    local_ip : `192.168.1.141`,
    color : EVENT_COLORS.YELLOW,
  },
  Crystallum : {
    name : `Crystallum`,
    printerID : 113601,
    sheet : THIS_SPREADSHEET.getSheetByName(`Crystallum`),
    type : `S3`,
    local_ip : `192.168.1.138`,
    color : EVENT_COLORS.BLUE,
  },
  Aurum : {
    name : `Aurum`,
    printerID : 110558,
    sheet : THIS_SPREADSHEET.getSheetByName(`Aurum`),
    type : `S3`,
    local_ip : `192.168.1.147`,
    color : EVENT_COLORS.CYAN,
  },
  Alpha : {
    name : `Alpha`,
    printerID : 120697,
    sheet : THIS_SPREADSHEET.getSheetByName(`Alpha`),
    type : `S3`,
    local_ip : `192.168.1.137`,
    color : EVENT_COLORS.MAUVE,
  },
  Beta : {
    name : `Beta`,
    printerID : 120699,
    sheet : THIS_SPREADSHEET.getSheetByName(`Beta`),
    type : `S3`,
    local_ip : `192.168.1.140`,
    color : EVENT_COLORS.ORANGE,
  },
  Gamma : {
    name : `Gamma`,
    printerID : 120700,
    sheet : THIS_SPREADSHEET.getSheetByName(`Gamma`),
    type : `S3`,
    local_ip : `192.168.1.139`,
    color : EVENT_COLORS.RED,
  },
});

/**
 * Headernames
 */
const HEADERNAMES = Object.freeze({
  status : `Status`,
  printerID :	`PrinterID`,
  printerName :	`PrinterName`,
  jobID :	`JobID`,
  timestamp :	`Timestamp`,
  email :	`Email`,
  posStatCode :	`POS Stat Code`,
  duration : `Duration (Hours)`,
  notes :	`Notes`,
  picture :	`Picture`,
  ticket : `Ticket`,
  filename : `Filename`,
  weight : `Material (grams)`,
  cost : `Cost ($)`,												
});

/**
 * Sheets
 */
const SHEETS = Object.freeze({
  Spectrum :   THIS_SPREADSHEET.getSheetByName(`Spectrum`), 
  Zardoz :     THIS_SPREADSHEET.getSheetByName(`Zardoz`), 
  Nimbus :     THIS_SPREADSHEET.getSheetByName(`Nimbus`), 
  Plumbus :    THIS_SPREADSHEET.getSheetByName(`Plumbus`), 
  Rubrum :     THIS_SPREADSHEET.getSheetByName(`Rubrum`), 
  Viridis :    THIS_SPREADSHEET.getSheetByName(`Viridis`), 
  Quasar :     THIS_SPREADSHEET.getSheetByName(`Quasar`), 
  Photon :     THIS_SPREADSHEET.getSheetByName(`Photon`), 
  Caerulus :   THIS_SPREADSHEET.getSheetByName(`Caerulus`), 
  Luteus :     THIS_SPREADSHEET.getSheetByName(`Luteus`), 
  Purpura :    THIS_SPREADSHEET.getSheetByName(`Purpura`), 
  Crystallum : THIS_SPREADSHEET.getSheetByName(`Crystallum`),
  Aurum :      THIS_SPREADSHEET.getSheetByName(`Aurum`),
  Alpha :      THIS_SPREADSHEET.getSheetByName(`Alpha`),
  Beta :       THIS_SPREADSHEET.getSheetByName(`Beta`),
  Gamma :      THIS_SPREADSHEET.getSheetByName(`Gamma`),
});

// const GetSheets = () => {
//   const sheets = THIS_SPREADSHEET.getSheets();
//   const names = sheets.map(x => x.getSheetName());
//   console.info(names);
// }

/**
 * Other Sheets
 */
const OTHERSHEETS = Object.freeze({
  Summary : THIS_SPREADSHEET.getSheetByName('Summary'),
  Staff :   THIS_SPREADSHEET.getSheetByName(`StaffList`),
  Metrics : THIS_SPREADSHEET.getSheetByName(`Data/Metrics`),
  Users :   THIS_SPREADSHEET.getSheetByName(`Users`),
  Logger :  THIS_SPREADSHEET.getSheetByName(`Logger`),
  Report :  THIS_SPREADSHEET.getSheetByName(`REPORT`),
  All :     THIS_SPREADSHEET.getSheetByName(`All`),
});

/**
 * Workgroups
 */
const WORKGROUPS = [
  3275, 3285, 3286, 3291, 3292, 3296, 3414, 3473, 3474, 3475,
];

/**
 * Jacobs Specific Workgroups
 */
const JACOBSWORKGROUPS = [
  3275, 3285, 3286, 3296, 3414,
];

/**
 * Workgroups Enumerated
 */
const WORKGROUPS_ENUMERATED = Object.freeze({
  STUDENTS_GENERAL : 3275, 
  MDES : 3285, 
  ENG : 3286, 
  CED : 3291, 
  L_S : 3292, 
  STAFF : 3296, 
  TEMP_INCREASE : 3414, 
  CED_DFL_UNDERGRAD : 3473, 
  CED_STAFF : 3474, 
  CED_DFL_PDST : 3475,
});

/**
 * Non-Jacobs Workgroups Enumerated
 * 3291, 3292, 3473, 3474, 3475,
 */
const NOT_JACOBS_ENUMERATED = Object.freeze({
  CED : 3291, 
  L_S : 3292, 
  CED_DFL_UNDERGRAD : 3473, 
  CED_STAFF : 3474, 
  CED_DFL_PDST : 3475,
});

/**
 * Page Sizes
 * INPUTS
 * -argument-     :-inches-      :-mm-     :-points-
 * letter_size    :8.5`x11`      :216x279  :612.283x790.866
 * tabloid_size   :11`x17`       :279x432  :790.866x1224.57
 * legal_size     :8.5`x14`      :216x356  :612.283x1009.13
 * statement_size :5.5`x8.5`     :140x216  :396.85x612.283
 * executive_size :7.25`x10.5`   :184x267  :521.575x756.85
 * folio_size     :8.5`x13`      :216x330  :612.283x935.433
 * a3_size        :11.69`x16.54` :297x420  :841.89x1190.55
 * a4_size        :8.27`x11.69`  :210x297  :595.276x841.89
 * a5_size        :5.83`x8.27`   :148x210  :419.528x595.276
 * b4_size        :9.84`x13.9`   :250x353  :708.661x1000.63
 * b5_size        :6.93`x9.84`   :176x250  :498.898x708.661
 */
const PAGESIZES = Object.freeze({
  letter: {width: 612.283, height: 790.866},
  tabloid: {width: 790.866,height: 1224.57},
  statement: {width: 396.85, height: 612.283},
  a3: {width: 841.89, height: 1190.55},
  a4: {width: 595.276, height: 841.89},
  a5: {width: 419.528, height: 595.276},
  custom: {width: 204.000, height: 566.000},

});






