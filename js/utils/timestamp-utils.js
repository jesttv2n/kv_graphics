/**
 * Utility functions for handling timestamps and countdown timers
 * This module provides consistent timestamp formatting and countdown functionality
 * across all visualization types
 */

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
    const date = new Date(timestamp);
    return `Sidst opdateret: ${date.toLocaleTimeString("da-DK")}`;
  } catch (error) {
    console.error("Error parsing timestamp:", error);
    return "";
  }
}

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
