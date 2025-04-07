/**
 * Base TemplateManager Class
 * Provides common functionality for all template managers
 * Reducerer kode duplikation mellem Results, Candidates, og Stations templates
 */

import { log, el, dispatchCustomEvent } from "../utils/utils.js";

class TemplateManager {
  /**
   * Create a template manager
   * @param {Object} dataService - Data service instance
   * @param {string} templateName - Template name/id
   * @param {string} settingsKey - LocalStorage key for settings
   * @param {Object} defaultSettings - Default settings for this template
   */
  constructor(dataService, templateName, settingsKey, defaultSettings = {}) {
    this.dataService = dataService;
    this.templateName = templateName;
    this.settingsKey = settingsKey;
    this.defaultSettings = defaultSettings;
    this.settings = { ...this.defaultSettings };
    this.currentKommuneId = null;
    this.currentValgstedId = null;
    this.settingsContainer = null;
    this.activeTemplate = false;

    // Load settings from localStorage
    this.loadSavedSettings();

    // Initialize event listeners
    this.initEventListeners();

    log(`${this.templateName} template initialiseret`);
  }

  /**
   * Initialize event listeners for template
   */
  initEventListeners() {
    // Listen for template selection
    document.addEventListener("templateChanged", (event) => {
      const isActive = event.detail.template === this.templateName;
      this.activeTemplate = isActive;

      if (isActive) {
        this.activate();
      }
    });

    // Listen for kommune changes
    document.addEventListener("kommuneChanged", (event) => {
      if (this.activeTemplate) {
        this.currentKommuneId = event.detail.kommuneId;
      }
    });

    // Listen for valgsted changes - override in subclasses if needed
    if (this.templateName === "stations") {
      document.addEventListener("valgstedChanged", (event) => {
        if (this.activeTemplate) {
          this.currentValgstedId = event.detail.valgstedId;
        }
      });
    }
  }

  /**
   * Load settings from localStorage
   */
  loadSavedSettings() {
    const storedSettings = localStorage.getItem(this.settingsKey);
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        this.settings = { ...this.defaultSettings, ...parsed };
      } catch (e) {
        console.error(`Failed to parse ${this.templateName} settings:`, e);
      }
    }
  }

  /**
   * Save settings to localStorage
   */
  saveSettings() {
    localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
    log(`${this.templateName} indstillinger opdateret`);
  }

  /**
   * Activate this template
   */
  activate() {
    log(`${this.templateName} template aktiveret`);
    this.loadSettings();
  }

  /**
   * Load template-specific settings UI
   * (Override in subclasses)
   */
  loadSettings() {
    // Get the settings container
    this.settingsContainer = el("templateSpecificSettings");
    if (!this.settingsContainer) return;

    // Clear previous settings
    this.settingsContainer.innerHTML = "";

    // Sub-classes should implement their own UI here
  }

  /**
   * Update settings
   * @param {string} settingKey - Setting key to update
   * @param {any} value - New value
   */
  updateSetting(settingKey, value) {
    this.settings[settingKey] = value;
    this.saveSettings();
    this.sendSettingsToPreview();
  }

  /**
   * Update all settings
   * @param {Object} newSettings - New settings object
   */
  updateAllSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.sendSettingsToPreview();
  }

  /**
   * Send settings to preview window
   */
  sendSettingsToPreview() {
    const previewFrame = el("previewFrame");
    if (previewFrame && previewFrame.contentWindow) {
      previewFrame.contentWindow.postMessage(
        {
          action: "updateSettings",
          settings: this.settings,
        },
        "*"
      );

      log(`${this.templateName} indstillinger sendt til preview`);
    }
  }

  /**
   * Handle setting change event
   * @param {string} settingKey - Setting key
   * @param {Event} event - Event object
   */
  handleSettingChange(settingKey, event) {
    const target = event.target;
    let value;

    // Handle different input types
    if (target.type === "checkbox") {
      value = target.checked;
    } else if (target.type === "number") {
      value = parseInt(target.value, 10);
    } else {
      value = target.value;
    }

    this.updateSetting(settingKey, value);
  }

  /**
   * Create a checkbox setting in the settings UI
   * @param {string} id - Element ID
   * @param {string} settingKey - Setting key
   * @param {string} label - Label text
   * @returns {HTMLElement} - Created element
   */
  createCheckboxSetting(id, settingKey, label) {
    const inputGroup = document.createElement("div");
    inputGroup.className = "input-group";

    const labelEl = document.createElement("label");
    labelEl.className = "checkbox-container";
    labelEl.innerHTML = `
      <input type="checkbox" id="${id}" ${
      this.settings[settingKey] ? "checked" : ""
    }>
      <span class="checkmark"></span>
      ${label}
    `;

    inputGroup.appendChild(labelEl);

    // Add event listener
    const input = labelEl.querySelector(`#${id}`);
    input.addEventListener("change", (e) =>
      this.handleSettingChange(settingKey, e)
    );

    return inputGroup;
  }

  /**
   * Create a select setting in the settings UI
   * @param {string} id - Element ID
   * @param {string} settingKey - Setting key
   * @param {string} label - Label text
   * @param {Array} options - Options array of {value, text} objects
   * @returns {HTMLElement} - Created element
   */
  createSelectSetting(id, settingKey, label, options) {
    const inputGroup = document.createElement("div");
    inputGroup.className = "input-group";

    const labelEl = document.createElement("label");
    labelEl.textContent = label;
    inputGroup.appendChild(labelEl);

    const select = document.createElement("select");
    select.id = id;
    select.className = "input-control-sm";

    options.forEach((option) => {
      const optEl = document.createElement("option");
      optEl.value = option.value;
      optEl.textContent = option.text;

      if (this.settings[settingKey] == option.value) {
        optEl.selected = true;
      }

      select.appendChild(optEl);
    });

    inputGroup.appendChild(select);

    // Add event listener
    select.addEventListener("change", (e) =>
      this.handleSettingChange(settingKey, e)
    );

    return inputGroup;
  }
}

export default TemplateManager;
