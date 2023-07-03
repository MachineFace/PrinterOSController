/**
 * Set the document properties
 */
try {
  PropertiesService.getScriptProperties()
    .setProperties({
      SUPPORT_ALIAS : GmailApp.getAliases()[0],
      GMAIL_SERVICE_NAME : `Jacobs Self-Service Printing Bot`,
      SERVICENAME : `PrinterOS Controller`,
      THISGID : `1AWjs1PMJTRDXAeqhDgpGoUWQOJioNOcwbBCUAjsa6Zk`,
      TICKET_FOLDER_GID : `1IsDlacmdVS-eOH1PMMjILIqaEU_I4fk-`, 
      POS_username : `jacobsprojectsupport@berkeley.edu`,
      POS_password : `Jacobsde$ign1`,
      CALENDAR_ID : `c_08805e76ff16010538e912a3c4354f8c580ab2ccff143e8aa0be0a3153f7ad07@group.calendar.google.com`,
      GoogleID : `576527286089-l5pr801cmggb0hisn5kcisanbsiv14ul.apps.googleusercontent.com`,
      Google_Secret : `6X5vHouCqFT6GeiPp3Cjmr93`,
      Cody_UID : `0df1ff70722211ebbc93fbb2f3299051`,
      UID : `ccee6140208011eca4f4fbb2f3299051`,
    });
} catch (err) {
  console.log(`Failed with error: ${err.message}`);
}
