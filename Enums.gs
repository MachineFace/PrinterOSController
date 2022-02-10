/**
 * -----------------------------------------------------------------------------------------------------------------
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
  Purpura : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Purpura"), 
};

const OTHERSHEETS = {
  Scanner : SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Pickup Scanner'),
  Summary : SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Summary'),
  Staff : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("StaffList"),
  Metrics : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data/Metrics"),
  Users : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users"),
  Logger : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Logger"),
  Unique : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("UniqueUsers"),
  Report : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("REPORT"),
  Extra : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("AREYOUSURE?"),
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

//3291, 3292, 3473, 3474, 3475,
const NOT_JACOBS_ENUMERATED = {
  CED : 3291, 
  L_S : 3292, 
  CED_DFL_UNDERGRAD : 3473, 
  CED_STAFF : 3474, 
  CED_DFL_PDST : 3475,
}




const PAGESIZES = {
  /**
    * INPUTS
    * -argument-     :-inches-      :-mm-     :-points-
    * letter_size    :8.5"x11"      :216x279  :612.283x790.866
    * tabloid_size   :11"x17"       :279x432  :790.866x1224.57
    * legal_size     :8.5"x14"      :216x356  :612.283x1009.13
    * statement_size :5.5"x8.5"     :140x216  :396.85x612.283
    * executive_size :7.25"x10.5"   :184x267  :521.575x756.85
    * folio_size     :8.5"x13"      :216x330  :612.283x935.433
    * a3_size        :11.69"x16.54" :297x420  :841.89x1190.55
    * a4_size        :8.27"x11.69"  :210x297  :595.276x841.89
    * a5_size        :5.83"x8.27"   :148x210  :419.528x595.276
    * b4_size        :9.84"x13.9"   :250x353  :708.661x1000.63
    * b5_size        :6.93"x9.84"   :176x250  :498.898x708.661
  */
  letter: {width: 612.283, height: 790.866},
  tabloid: {width: 790.866,height: 1224.57},
  statement: {width: 396.85, height: 612.283},
  a3: {width: 841.89, height: 1190.55},
  a4: {width: 595.276, height: 841.89},
  a5: {width: 419.528, height: 595.276},
  custom: {width: 204.000, height: 566.000},

}

