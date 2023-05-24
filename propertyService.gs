/**
 * Set the document properties
 */
try {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperties({
    SUPPORT_ALIAS : GmailApp.getAliases()[0],
    GMAIL_SERVICE_NAME : `Jacobs Self-Service Printing Bot`,
    SERVICENAME : `PrinterOS Controller`,
    THISGID : `1AWjs1PMJTRDXAeqhDgpGoUWQOJioNOcwbBCUAjsa6Zk`,
    TICKETGID : `1IsDlacmdVS-eOH1PMMjILIqaEU_I4fk-`,
    POS_username : `jacobsprojectsupport@berkeley.edu`,
    POS_password : `Jacobsde$ign1`,
    CALENDAR_ID : `c_4a25f6ed7657f8f65eac788278ef716a15b156dafcc51305bd4ce2a13623f5c8@group.calendar.google.com`,
    GoogleID : `576527286089-l5pr801cmggb0hisn5kcisanbsiv14ul.apps.googleusercontent.com`,
    Google_Secret : `6X5vHouCqFT6GeiPp3Cjmr93`,
    Cody_UID : `0df1ff70722211ebbc93fbb2f3299051`,
    UID : `ccee6140208011eca4f4fbb2f3299051`,
  });
} catch (err) {
  console.log(`Failed with error: ${err.message}`);
}
