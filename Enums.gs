/**
 * ----------------------------------------------------------------------------------------------------------------
 * Code Enumerations
 */
const RESPONSECODES = {
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
}

const STATUS = {
  queued : "Queued",
  inProgress : "In-Progress",
  complete : "Completed",
  failed : "FAILED",
  cancelled : "Cancelled",
  pickedUp : "Picked Up",
  closed : "CLOSED",
}

const POSSTATCODE = {
  11 : "Queued", 
  21 : "In-Progress", 
  43 : "FAILED", 
  45 : "Cancelled", 
  77 : "Completed",
}

const PRINTERIDS = { 
  Luteus : 79606,
  Caerulus : 79605,
  Photon : 75677,
  Quasar : 75675,
  Zardoz : 79166,
  Viridis :79167,
  Rubrum : 79170,
  Plumbus : 75140,
  Nimbus : 75670,
  Spectrum : 79165,
};


const SHEETS = {
  Spectrum : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Spectrum"), 
  Zardoz : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Zardoz"), 
  Nimbus : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Nimbus"), 
  Plumbus : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Plumbus"), 
  Rubrum : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Rubrum"), 
  Viridis : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Viridis"), 
  Quasar : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Quasar"), 
  Photon : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Photon"), 
  Caerulus : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Caerulus"), 
  Luteus : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Luteus"), 
};

const OTHERSHEETS = {
  Scanner : SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Pickup Scanner'),
  Summary : SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Summary'),
  Staff : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("StaffList"),
  Metrics : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data/Metrics"),
  Users : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users"),
  Logger : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Logger"),
  Unique : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("UniqueUsers"),
}

const WORKGROUPS = [
  3275, 3285, 3286, 3291, 3292, 3296, 3414, 3473, 3474, 3475,
];

const JACOBSWORKGROUPS = [
  3275, 3285, 3286, 3296, 3414,
];

const WORKGROUPS_ENUMERATED = {
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
}
