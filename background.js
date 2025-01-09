//functionality to customise messages , a clock timer too maybe
let reminderMessages = [
  {
    title: "Time for a Break!",
    message: "Stand up and stretch, use the unused muscles 🧘‍♂️",
    type: "break"
  },
  {
    title: "Stay Hydrated!",
    message: "DRINK WATERRRR 💧",
    type: "water"
  },
  {
    title: "Mindfulness Moment",
    message: "Take three deep breaths, look away from the screen and focus on something else 🌱",
    type: "mindfulness"
  },
  {
    title: "Snack Time!",
    message: "get a biscut, a banana or glucose powder 🍎",
    type: "snack"
  }
];

// Initialize default settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    interval: 30,
    notifications: true
  });
  createAlarm();
});

// Create alarm for reminders
function createAlarm() {
  chrome.storage.sync.get(['interval'], (data) => {
    chrome.alarms.create('reminders', {
      periodInMinutes: data.interval || 30
    });
  });
}

// Function to inject content script if not already present
async function ensureContentScriptInjected(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        return window.hasReminderContentScript === true;
      }
    });
  } catch (error) {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });
    await chrome.scripting.insertCSS({
      target: { tabId: tabId },
      files: ['styles.css']
    });
  }
}

// Handling alarm
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'reminders') {
    const data = await chrome.storage.sync.get(['notifications']);
    if (data.notifications) {
      const reminder = reminderMessages[Math.floor(Math.random() * reminderMessages.length)];
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      
      if (tabs[0]) {
        try {
          // Ensure content script is injected before sending message
          await ensureContentScriptInjected(tabs[0].id);
          await chrome.tabs.sendMessage(tabs[0].id, {
            type: 'showReminder',
            reminder: reminder
          });
        } catch (error) {
          console.error('Failed to show reminder:', error);
        }
      }
    }
  }
});