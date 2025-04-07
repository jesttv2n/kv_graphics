/**
 * Konsoliderede utilities til KV Broadcast System
 *
 * Denne fil erstatter og konsoliderer følgende utility-filer:
 * - js/utils/common.js
 * - js/utils/timestamp-utils.js
 * - Dele af andre utility-funktioner
 */

/**************************************
 * DOM og Element-relaterede utilities
 **************************************/

/**
 * Shorthand for getting document elements by ID
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} - DOM element eller null hvis ikke fundet
 */
const el = (id) => document.getElementById(id);

/**
 * Sikkert element query - returnerer element eller null
 * @param {string} selector - CSS selector
 * @param {Element|Document} context - Kontekst at søge i (default: document)
 * @returns {Element|null} - Det fundne element eller null
 */
const query = (selector, context = document) => {
  try {
    return context.querySelector(selector);
  } catch (e) {
    console.error(`Fejl ved søgning efter "${selector}":`, e);
    return null;
  }
};

/**
 * Sikkert element query all - returnerer array af elementer
 * @param {string} selector - CSS selector
 * @param {Element|Document} context - Kontekst at søge i (default: document)
 * @returns {Element[]} - Array af fundne elementer (tom hvis ingen eller fejl)
 */
const queryAll = (selector, context = document) => {
  try {
    return Array.from(context.querySelectorAll(selector));
  } catch (e) {
    console.error(`Fejl ved søgning efter alle "${selector}":`, e);
    return [];
  }
};

/**
 * Create and dispatch a custom event
 * @param {string} eventName - Name of the event
 * @param {Object} data - Data to pass with the event
 */
function dispatchCustomEvent(eventName, data = {}) {
  const event = new CustomEvent(eventName, {
    detail: data,
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(event);
}

/**
 * Fade in element animation
 * @param {Element} element - Element to fade in
 * @param {number} duration - Animation duration in ms
 * @returns {Promise} - Promise der resolver når animation er færdig
 */
function fadeIn(element, duration = 300) {
  return new Promise((resolve) => {
    if (!element) {
      resolve();
      return;
    }

    element.style.opacity = 0;
    element.style.display = "block";

    let start = null;
    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      element.style.opacity = Math.min(progress / duration, 1);

      if (progress < duration) {
        window.requestAnimationFrame(step);
      } else {
        resolve();
      }
    }

    window.requestAnimationFrame(step);
  });
}

/**
 * Fade out element animation
 * @param {Element} element - Element to fade out
 * @param {number} duration - Animation duration in ms
 * @returns {Promise} - Promise der resolver når animation er færdig
 */
function fadeOut(element, duration = 300) {
  return new Promise((resolve) => {
    if (!element) {
      resolve();
      return;
    }

    element.style.opacity = 1;

    let start = null;
    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      element.style.opacity = Math.max(1 - progress / duration, 0);

      if (progress < duration) {
        window.requestAnimationFrame(step);
      } else {
        element.style.display = "none";
        resolve();
      }
    }

    window.requestAnimationFrame(step);
  });
}

/**************************************
 * Formatering og værdihåndtering
 **************************************/

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) {
    return "0";
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Format date/time as local string
 * @param {Date|number|string} date - Date object, timestamp or date string
 * @param {boolean} includeDate - Inkluder dato (default: false)
 * @returns {string} - Formatted date string
 */
function formatDateTime(date, includeDate = false) {
  if (!date) return "";

  try {
    const dateObj = typeof date === "object" ? date : new Date(date);

    if (includeDate) {
      return dateObj.toLocaleString("da-DK");
    } else {
      return dateObj.toLocaleTimeString("da-DK");
    }
  } catch (e) {
    console.error("Fejl ved formatering af dato:", e);
    return "";
  }
}

/**
 * Get and format timestamp from data object
 * Handles different API response structures
 * @param {Object} data - Data object from API
 * @returns {string} - Formatted timestamp string or empty string if not found
 */
function getFormattedTimestamp(data) {
  if (!data) return "";

  // Check multiple possible locations for timestamp data
  let timestamp = null;

  // Try lastUpdated (used in some endpoints)
  if (data.lastUpdated) {
    timestamp = data.lastUpdated;
  }
  // Try timestamp field (used in results endpoint)
  else if (data.timestamp) {
    timestamp = data.timestamp;
  }
  // Try result.timestamp
  else if (data.result && data.result.timestamp) {
    timestamp = data.result.timestamp;
  }

  // If no timestamp found, return empty string
  if (!timestamp) return "";

  // Parse and format the timestamp
  try {
    return `Sidst opdateret: ${formatDateTime(timestamp)}`;
  } catch (error) {
    console.error("Error parsing timestamp:", error);
    return "";
  }
}

/**
 * Get URL parameter value
 * @param {string} name - Parameter name
 * @returns {string|null} - Parameter value or null if not found
 */
function getUrlParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * Generate current timestamp to use as cache buster
 * @returns {number} - Current timestamp
 */
function getCacheBuster() {
  return Date.now();
}

/**
 * Simple object deep clone
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    console.error("Fejl ved deep clone:", e);
    return { ...obj }; // Fallback til shallow copy
  }
}

/**************************************
 * Logger og diagnostik
 **************************************/

/**
 * Logger helper function
 * Logs message to console and optionally to a log container if it exists
 * @param {string} message - Message to log
 * @param {string} type - Log type (info, error, warning)
 */
function log(message, type = "info") {
  // Log til konsol med korrekt log type
  if (type === "error") {
    console.error(message);
  } else if (type === "warning") {
    console.warn(message);
  } else {
    console.log(message);
  }

  // Log til UI hvis log container findes
  const logContainer = el("logContainer");
  if (logContainer) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();

    const logEntry = document.createElement("div");
    logEntry.className = "log-entry";
    logEntry.innerHTML = `
      <span class="log-time">[${timeStr}]</span>
      <span class="log-message ${
        type === "error" ? "log-error" : type === "warning" ? "log-warning" : ""
      }">${message}</span>
    `;

    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;

    // Begræns antal log-indlæg
    while (logContainer.children.length > 100) {
      logContainer.removeChild(logContainer.firstChild);
    }
  }
}

/**************************************
 * Countdown og timer utilities
 **************************************/

/**
 * Initialize countdown timer
 * @param {string} elementId - ID of element to update
 * @param {number} interval - Update interval in seconds
 * @param {Function} callback - Optional callback function when countdown reaches zero
 * @returns {Object} - Timer control object with start, stop, and reset methods
 */
function initCountdownTimer(elementId, interval = 30, callback = null) {
  let secondsRemaining = interval;
  let timerId = null;
  let isPaused = true;

  // Get the element
  const timerElement = document.getElementById(elementId);

  // Update the timer display
  function updateDisplay() {
    if (!timerElement) return;

    if (secondsRemaining <= 0) {
      timerElement.innerHTML = `
        <svg class="update-icon pulse" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z"/>
        </svg>
        Opdaterer data...
      `;
    } else {
      timerElement.innerHTML = `
        <svg class="update-icon ${
          secondsRemaining <= 5 ? "pulse" : ""
        }" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z"/>
        </svg>
        Opdaterer om: ${secondsRemaining} sek
      `;
    }
  }

  // Countdown tick function
  function tick() {
    if (isPaused) return;

    secondsRemaining--;

    if (secondsRemaining <= 0) {
      // Reset timer and execute callback if provided
      secondsRemaining = interval;
      if (typeof callback === "function") {
        callback();
      }
    }

    updateDisplay();
  }

  // Timer control methods
  const timer = {
    start: function () {
      if (!isPaused) return;

      isPaused = false;
      if (!timerId) {
        timerId = setInterval(tick, 1000);
      }
      updateDisplay();
      return this;
    },

    stop: function () {
      isPaused = true;
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      return this;
    },

    reset: function (newInterval = null) {
      if (newInterval && typeof newInterval === "number") {
        interval = newInterval;
      }
      secondsRemaining = interval;
      updateDisplay();
      return this;
    },

    getTimeRemaining: function () {
      return secondsRemaining;
    },

    setCallback: function (newCallback) {
      if (typeof newCallback === "function") {
        callback = newCallback;
      }
      return this;
    },
  };

  // Initial display update
  updateDisplay();

  return timer;
}

// Eksportér alle funktioner
export {
  // DOM og Element
  el,
  query,
  queryAll,
  dispatchCustomEvent,
  fadeIn,
  fadeOut,

  // Formatering og værdier
  formatNumber,
  formatDateTime,
  getFormattedTimestamp,
  getUrlParam,
  getCacheBuster,
  deepClone,

  // Logger
  log,

  // Countdown
  initCountdownTimer,
};
