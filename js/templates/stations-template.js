/**
 * Stations template handler
 * Manages the polling station results visualization
 * Refaktoreret til at bruge TemplateManager baseclass
 */

import TemplateManager from "../core/template-manager.js";
import { log, el } from "../utils/utils.js";

class StationsTemplate extends TemplateManager {
  /**
   * Create a new StationsTemplate instance
   * @param {Object} dataService - Data service instance
   */
  constructor(dataService) {
    // Default settings for Stations template
    const defaultSettings = {
      compareToMunicipality: true,
      showVoteCounts: true,
      partyLimit: 10,
    };

    // Call parent constructor with template-specific details
    super(dataService, "stations", "stationsSettings", defaultSettings);
  }

  /**
   * Load template-specific settings UI
   */
  loadSettings() {
    // Get settings container from parent method
    super.loadSettings();

    if (!this.settingsContainer) return;

    // Create settings section container
    const settingsSection = document.createElement("div");
    settingsSection.className = "settings-section";

    // Add header
    const header = document.createElement("h3");
    header.textContent = "Valgsted visning";
    settingsSection.appendChild(header);

    // Add checkbox for comparing to municipality
    const compareToMunicipalityGroup = this.createCheckboxSetting(
      "compareToMunicipality",
      "compareToMunicipality",
      "Sammenlign med kommuneresultat"
    );
    settingsSection.appendChild(compareToMunicipalityGroup);

    // Add checkbox for showing vote counts
    const showVoteCountsGroup = this.createCheckboxSetting(
      "showVoteCounts",
      "showVoteCounts",
      "Vis stemmetal"
    );
    settingsSection.appendChild(showVoteCountsGroup);

    // Add dropdown for party limit
    const partyLimitOptions = [
      { value: "0", text: "Alle" },
      { value: "5", text: "Top 5" },
      { value: "8", text: "Top 8" },
      { value: "10", text: "Top 10" },
    ];

    const partyLimitGroup = this.createSelectSetting(
      "stationPartyLimit",
      "partyLimit",
      "Antal partier:",
      partyLimitOptions
    );
    settingsSection.appendChild(partyLimitGroup);

    // Add settings section to container
    this.settingsContainer.appendChild(settingsSection);
  }

  /**
   * Update settings based on form values
   * Called when manual update is needed rather than through event handlers
   */
  updateSettingsFromForm() {
    // Get values from form elements
    const compareToMunicipality = el("compareToMunicipality").checked;
    const showVoteCounts = el("showVoteCounts").checked;
    const partyLimit = parseInt(el("stationPartyLimit").value, 10);

    // Update all settings at once
    this.updateAllSettings({
      compareToMunicipality,
      showVoteCounts,
      partyLimit,
    });
  }
}

export default StationsTemplate;
