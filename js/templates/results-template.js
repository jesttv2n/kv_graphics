/**
 * Results template handler
 * Manages the election results visualization
 * Refaktoreret til at bruge TemplateManager baseclass
 */

import TemplateManager from "../core/template-manager.js";
import { log, el } from "../utils/utils.js";

class ResultsTemplate extends TemplateManager {
  /**
   * Create a new ResultsTemplate instance
   * @param {Object} dataService - Data service instance
   */
  constructor(dataService) {
    // Default settings for Results template
    const defaultSettings = {
      showDifference: true,
      sortByVotes: true,
      partyLimit: 10,
    };

    // Call parent constructor with template-specific details
    super(dataService, "results", "resultsSettings", defaultSettings);
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
    header.textContent = "Resultater visning";
    settingsSection.appendChild(header);

    // Add checkbox for showing difference from previous election
    const showDifferenceGroup = this.createCheckboxSetting(
      "showDifference",
      "showDifference",
      "Vis forskel fra forrige valg"
    );
    settingsSection.appendChild(showDifferenceGroup);

    // Add checkbox for sorting by vote counts
    const sortByVotesGroup = this.createCheckboxSetting(
      "sortByVotes",
      "sortByVotes",
      "Sortér efter stemmeantal"
    );
    settingsSection.appendChild(sortByVotesGroup);

    // Add dropdown for party limit
    const partyLimitOptions = [
      { value: "0", text: "Alle" },
      { value: "5", text: "Top 5" },
      { value: "8", text: "Top 8" },
      { value: "10", text: "Top 10" },
    ];

    const partyLimitGroup = this.createSelectSetting(
      "partyLimit",
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
    const showDifference = el("showDifference").checked;
    const sortByVotes = el("sortByVotes").checked;
    const partyLimit = parseInt(el("partyLimit").value, 10);

    // Update all settings at once
    this.updateAllSettings({
      showDifference,
      sortByVotes,
      partyLimit,
    });
  }
}

export default ResultsTemplate;
