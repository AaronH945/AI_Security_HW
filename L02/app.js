/**
 * STARK INDUSTRIES // JARVIS OS v3000
 * Core Interface Logic & Telemetry
 */

(function () {
  'use strict';

  // State Management
  const state = {
    is24Hour: true,
    currentTheme: localStorage.getItem('stark_theme') || 'cyan',
    soundEnabled: true
  };

  // DOM Elements
  const hoursEl = document.getElementById('clock-hours');
  const minutesEl = document.getElementById('clock-minutes');
  const secondsEl = document.getElementById('clock-seconds');
  const ampmEl = document.getElementById('clock-ampm');
  const dateEl = document.getElementById('clock-date');
  const progressBarEl = document.getElementById('seconds-progress');
  const formatToggleBtn = document.getElementById('format-toggle-btn');
  const formatLabel = document.getElementById('format-label');
  const copyBtn = document.getElementById('btn-copy-time');
  const copyText = document.getElementById('copy-text');
  const toast = document.getElementById('toast');
  const themeButtons = document.querySelectorAll('.theme-dot');
  const coreStatusEl = document.getElementById('core-power-val');

  // Web Audio Context for Sci-Fi Feedback
  let audioCtx = null;
  function playSciFiSound(freq = 880, type = 'sine', duration = 0.08) {
    if (!state.soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + duration);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio might be blocked by browser policy until gesture
    }
  }

  /**
   * Updates Clock display in Taipei timezone (Asia/Taipei, UTC+8)
   */
  function updateClock() {
    const now = new Date();
    
    // Convert to Taipei Time (UTC+8)
    const taipeiTimeStr = now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' });
    const taipeiDate = new Date(taipeiTimeStr);

    let hours = taipeiDate.getHours();
    const minutes = taipeiDate.getMinutes();
    const seconds = taipeiDate.getSeconds();
    const millis = now.getMilliseconds();

    // 12/24 hour formatting
    let ampm = '';
    if (!state.is24Hour) {
      ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      if (ampmEl) {
        ampmEl.textContent = ampm;
        ampmEl.style.display = 'inline-block';
      }
    } else {
      if (ampmEl) {
        ampmEl.style.display = 'none';
      }
    }

    const pad = (n) => String(n).padStart(2, '0');

    if (hoursEl) hoursEl.textContent = pad(hours);
    if (minutesEl) minutesEl.textContent = pad(minutes);
    if (secondsEl) secondsEl.textContent = pad(seconds);

    // Format Full Date in Traditional Chinese
    const year = taipeiDate.getFullYear();
    const month = taipeiDate.getMonth() + 1;
    const date = taipeiDate.getDate();
    const weekdaysZh = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const dayOfWeek = weekdaysZh[taipeiDate.getDay()];

    if (dateEl) {
      dateEl.textContent = `${year}年${month}月${date}日 ${dayOfWeek}`;
    }

    // Smooth Progress Bar for Current Minute
    if (progressBarEl) {
      const progressPercent = ((seconds + millis / 1000) / 60) * 100;
      progressBarEl.style.width = `${progressPercent.toFixed(2)}%`;
    }

    // Telemetry subtle fluctuation for Iron Man HUD
    if (coreStatusEl && Math.random() < 0.05) {
      const pwr = (99.4 + Math.random() * 0.6).toFixed(1);
      coreStatusEl.textContent = `${pwr}%`;
    }
  }

  /**
   * Theme Switcher
   */
  function applyTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    state.currentTheme = themeName;
    localStorage.setItem('stark_theme', themeName);

    themeButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === themeName);
    });
  }

  // Initialize Event Listeners
  function initListeners() {
    // 12H / 24H Toggle
    if (formatToggleBtn) {
      formatToggleBtn.addEventListener('click', () => {
        state.is24Hour = !state.is24Hour;
        if (formatLabel) {
          formatLabel.textContent = state.is24Hour ? '24H' : '12H';
        }
        playSciFiSound(720, 'sine', 0.06);
        updateClock();
      });
    }

    // Theme Switch Buttons
    themeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        if (theme) {
          applyTheme(theme);
          playSciFiSound(1100, 'triangle', 0.1);
        }
      });
    });

    // Copy Time to Clipboard
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const now = new Date();
        const taipeiTimeStr = now.toLocaleString('zh-TW', {
          timeZone: 'Asia/Taipei',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });

        const copyContent = `[TAIPEI TIME (UTC+8)] ${taipeiTimeStr} (黃偉倫 Aaron Huang / 511405009)`;

        try {
          await navigator.clipboard.writeText(copyContent);
          showToast('⚡ 已複製台北時間與 STARK 遙測數據至剪貼簿！');
          playSciFiSound(1400, 'sine', 0.15);
        } catch (err) {
          // Fallback
          const tempInput = document.createElement('textarea');
          tempInput.value = copyContent;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
          showToast('⚡ 已複製台北時間至剪貼簿！');
          playSciFiSound(1400, 'sine', 0.15);
        }
      });
    }

    // Arc Reactor interactive hover sound
    const arcReactor = document.getElementById('arc-reactor');
    if (arcReactor) {
      arcReactor.addEventListener('mouseenter', () => {
        playSciFiSound(600, 'sine', 0.12);
      });
    }
  }

  // Toast Notification
  let toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // Initialization
  function init() {
    applyTheme(state.currentTheme);
    initListeners();
    updateClock();
    setInterval(updateClock, 250); // fast refresh for smooth visual telemetry
  }

  // Boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
