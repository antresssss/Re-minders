// Add flag to indicate content script is loaded
window.hasReminderContentScript = true;

let dragItem = null;
let dragOffset = { x: 0, y: 0 };

// Create and show reminder card
function showReminderCard(reminder) {
  const card = document.createElement('div');
  card.className = 'reminder-card';
  card.innerHTML = `
    <div class="reminder-header">
      <span class="reminder-title">${reminder.title}</span>
      <button class="close-button">×</button>
    </div>
    <div class="reminder-content">
      ${reminder.message}
    </div>
    <div class="reminder-actions">
      <button class="reminder-button secondary-button" id="snooze">Snooze</button>
      <button class="reminder-button primary-button" id="acknowledge">Got it!</button>
    </div>
  `;

  // Add drag functionality
  card.addEventListener('mousedown', handleDragStart);
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', handleDragEnd);

  // Add button handlers
  card.querySelector('.close-button').addEventListener('click', () => card.remove());
  card.querySelector('#snooze').addEventListener('click', () => {
    card.remove();
    // Snooze for 5 minutes
    setTimeout(() => showReminderCard(reminder), 5 * 60 * 1000);
  });
  card.querySelector('#acknowledge').addEventListener('click', () => card.remove());

  document.body.appendChild(card);
}

// Drag handlers
function handleDragStart(e) {
  if (e.target.closest('.reminder-card')) {
    dragItem = e.target.closest('.reminder-card');
    const rect = dragItem.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
  }
}

function handleDrag(e) {
  if (dragItem) {
    e.preventDefault();
    dragItem.style.left = (e.clientX - dragOffset.x) + 'px';
    dragItem.style.top = (e.clientY - dragOffset.y) + 'px';
  }
}

function handleDragEnd() {
  dragItem = null;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'showReminder') {
    showReminderCard(request.reminder);
  }
});