/**
 * -----------------------------------------------------------------------------------------------------------------
 * Code Enumerations
 */
const PICKUPHOURS = `Monday - Friday: 11am - 1pm & 4pm - 6pm`;
const COSTMULTIPLIER = 0.04;

const COLORS = {
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
}

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
  queued : {
    plaintext : `Queued`,
    statusCode : `11`,
  },
  inProgress : {
    plaintext : `In-Progress`,
    statusCode : `21`,
  },
  complete : {
    plaintext : `Completed`,
    statusCode : `77`,
  },
  failed : {
    plaintext : `FAILED`,
    statusCode : `43`,
  },
  cancelled : {
    plaintext : `Cancelled`,
    statusCode : `45`,
  },
  pickedUp : {
    plaintext : `Picked Up`,
    statusCode : `0`,
  },
  closed : {
    plaintext : `CLOSED`,
    statusCode : `1`
  },
  abandoned : {
    plaintext : `Abandoned`,
    statusCode : `2`
  },
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
  Purpura : 87199,
  Crystallum : 87200,
  Aurum : 89128,
};

const PRINTERDATA = { 
  Luteus : { 
    name : `Luteus`,
    printerID : 79606,
    sheet : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Luteus"),
    type : "UM3",
  },
  Caerulus : {
    name : `Caerulus`,
    printerID : 79605,
    sheet : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Caerulus"),
    type : "UM3",
  },
  Photon : {
    name : `Photon`,
    printerID : 75677,
    sheet : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Photon"),
    type : "UM3",
  },
  Quasar : {
    name : `Quasar`,
    printerID : 75675,
    sheet : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Quasar"),
    type : "UM3",
  },
  Zardoz : {
    name : `Zardoz`,
    printerID : 79166,
    sheet : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Zardoz"),
    type : "UM3 Extended",
  },
  Viridis : {
    name : `Viridis`,
    printerID : 79167,
    sheet : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Viridis"),
    type : "UM3",
  },
  Rubrum : {
    name : `Rubrum`,
    printerID : 79170,
    sheet : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Rubrum"),
    type : "UM3",
  },
  Plumbus : {
    name : `Plumbus`,
    printerID : 75140,
    sheet : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Plumbus"),
    type : "UM3",
  },
  Nimbus : {
    name : `Nimbus`,
    printerID : 75670,
    sheet : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Nimbus"),
    type : "UM3",
  },
  Spectrum : {
    name : `Spectrum`,
    printerID : 79165,
    sheet : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Spectrum"),
    type : "UM3 Extended",
  },
  Purpura : {
    name : `Purpura`,
    printerID : 87199,
    sheet : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Purpura"),
    type : "S3",
  },
  Crystallum : {
    name : `Crystallum`,
    printerID : 87200,
    sheet : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Crystallum"),
    type : "S3",
  },
  Aurum : {
    name : `Aurum`,
    printerID : 89128,
    sheet : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Aurum"),
    type : "S3",
  },
};

const HEADERNAMES = {
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
  Crystallum : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Crystallum"),
  Aurum : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Aurum"),
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
  Oops : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("AREYOUSURE?"),
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

const THISGID = `1AWjs1PMJTRDXAeqhDgpGoUWQOJioNOcwbBCUAjsa6Zk`;


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

