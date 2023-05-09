/**
 * Set the document properties
 */
try {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperties({
    SUPPORT_ALIAS : GmailApp.getAliases()[0],
    GMAIL_SERVICE_NAME : `Jacobs Self-Service Printing Bot`,
    SERVICENAME : `PrinterOS Controller`,
    POS_username : `jacobsprojectsupport@berkeley.edu`,
    POS_password : `Jacobsde$ign1`,
    CALENDAR_ID : `c_4a25f6ed7657f8f65eac788278ef716a15b156dafcc51305bd4ce2a13623f5c8@group.calendar.google.com`,
  });
} catch (err) {
  console.log(`Failed with error: ${err.message}`);
}
