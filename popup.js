document.addEventListener('DOMContentLoaded', () => {
    // Load saved settings
    chrome.storage.sync.get(['interval', 'notifications'], (data) => {
      document.getElementById('interval').value = data.interval || 30;
      document.getElementById('notifications').checked = data.notifications !== false;
    });
  
    // Save settings
    document.getElementById('save').addEventListener('click', () => {
      const interval = parseInt(document.getElementById('interval').value);
      const notifications = document.getElementById('notifications').checked;
  
      chrome.storage.sync.set({
        interval: interval,
        notifications: notifications
      }, () => {
        // Recreate alarm with new interval
        chrome.alarms.clearAll(() => {
          if (notifications) {
            chrome.alarms.create('reminders', {
              periodInMinutes: interval
            });
          }
        });
        window.close();
      });
    });
  });