document.addEventListener('DOMContentLoaded', () => {

  const emailSubjectInput = document.getElementById('emailSubject');
  const emailRecipientInput = document.getElementById('emailRecipient');
  const emailBodyInput = document.getElementById('emailBody');
  const saveBtn = document.getElementById('saveBtn');

  // 1) Load existing settings
  chrome.storage.sync.get(
    ['emailSubject', 'emailRecipient', 'emailBody'],
    (data) => {
      if (data.emailSubject) emailSubjectInput.value = data.emailSubject;
      if (data.emailRecipient) emailRecipientInput.value = data.emailRecipient;
      if (data.emailBody) emailBodyInput.value = data.emailBody;
    }
  );

  // 2) Save them when "Save" is clicked
  saveBtn.addEventListener('click', () => {
    const emailSubject = emailSubjectInput.value.trim();
    const emailRecipient = emailRecipientInput.value.trim();
    const emailBody = emailBodyInput.value;

    chrome.storage.sync.set(
      { emailSubject, emailRecipient, emailBody },
      () => {
        // Confirmation (in a popup, a quick visual is enough)
        alert('Settings saved!');
      }
    );
  });
  
});
