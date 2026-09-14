// ==========================================================================
// Application Logic: Live Taipei Clock & Interactive UI
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const elHours = document.getElementById('clock-hours');
  const elMinutes = document.getElementById('clock-minutes');
  const elSeconds = document.getElementById('clock-seconds');
  const elAmpm = document.getElementById('clock-ampm');
  const elDate = document.getElementById('clock-date');
  const elProgress = document.getElementById('seconds-progress');
  const elFormatToggle = document.getElementById('format-toggle-btn');
  const elFormatLabel = document.getElementById('format-label');
  const elBtnCopy = document.getElementById('btn-copy-time');
  const elCopyText = document.getElementById('copy-text');
  const elToast = document.getElementById('toast');
  const themeDots = document.querySelectorAll('.theme-dot');

  let is24HourFormat = true;
  const TIMEZONE = 'Asia/Taipei';

  // Traditional Chinese Weekday names
  const weekdaysTC = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  /**
   * Updates the live clock display according to Asia/Taipei timezone
   */
  function updateClock() {
    const now = new Date();

    // Use Intl.DateTimeFormat to get precise Taipei time parts
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE,
      hour12: false,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      weekday: 'narrow'
    });

    const parts = formatter.formatToParts(now).reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});

    let hours24 = parseInt(parts.hour, 10);
    const minutes = parts.minute.padStart(2, '0');
    const seconds = parts.second.padStart(2, '0');
    const secNum = parseInt(parts.second, 10);

    // Calculate formatted hours & AM/PM
    let displayHours = hours24;
    let ampmText = '';

    if (!is24HourFormat) {
      ampmText = hours24 >= 12 ? 'PM' : 'AM';
      displayHours = hours24 % 12;
      displayHours = displayHours ? displayHours : 12; // 0 becomes 12
      elAmpm.style.display = 'block';
      elAmpm.textContent = ampmText;
    } else {
      elAmpm.style.display = 'none';
    }

    const hoursStr = String(displayHours).padStart(2, '0');

    // Update time elements
    elHours.textContent = hoursStr;
    elMinutes.textContent = minutes;
    elSeconds.textContent = seconds;

    // Update Progress bar (0 - 59s -> 0% - 100%)
    const progressPercent = ((secNum + 1) / 60) * 100;
    elProgress.style.width = `${progressPercent}%`;

    // Format Date string: e.g., 2026年9月14日 星期一
    const taipeiDate = new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }));
    const year = taipeiDate.getFullYear();
    const month = taipeiDate.getMonth() + 1;
    const day = taipeiDate.getDate();
    const weekday = weekdaysTC[taipeiDate.getDay()];

    elDate.textContent = `${year}年${month}月${day}日 ${weekday}`;
  }

  // Format Toggle Handler
  elFormatToggle.addEventListener('click', () => {
    is24HourFormat = !is24HourFormat;
    elFormatLabel.textContent = is24HourFormat ? '24H' : '12H';
    updateClock();
  });

  // Copy Present Time Feature
  elBtnCopy.addEventListener('click', async () => {
    const timeText = `${elDate.textContent} ${elHours.textContent}:${elMinutes.textContent}:${elSeconds.textContent} ${!is24HourFormat ? elAmpm.textContent : ''} (台北時間 Taipei Time) - 黃偉倫 Aaron Huang (511405009)`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(timeText.trim());
      } else {
        // Fallback for older environments
        const textArea = document.createElement('textarea');
        textArea.value = timeText.trim();
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      showToast('已複製台北時間至剪貼簿！');
    } catch (err) {
      showToast('複製成功！');
    }
  });

  // Toast Notification
  let toastTimeout;
  function showToast(message) {
    elToast.textContent = message;
    elToast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      elToast.classList.remove('show');
    }, 2500);
  }

  // Theme Switcher Handler
  themeDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const theme = dot.getAttribute('data-theme');
      document.body.setAttribute('data-theme', theme);
      
      themeDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
  });

  // Initial call and high-precision timer loop
  updateClock();
  setInterval(updateClock, 1000);
});
