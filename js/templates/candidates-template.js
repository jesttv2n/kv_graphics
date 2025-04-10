/**
 * Candidates template handler
 * Manages the elected candidates visualization
 * Refaktoreret til at bruge TemplateManager baseclass
 */

import TemplateManager from "../core/template-manager.js";
import { log, el } from "../utils/utils.js";

class CandidatesTemplate extends TemplateManager {
  /**
   * Create a new CandidatesTemplate instance
   * @param {Object} dataService - Data service instance
   */
  constructor(dataService) {
    // Default settings for Candidates template
    const defaultSettings = {
      highlightMayor: true,
      showPartyLogos: true,
      showVoteCounts: true,
      candidateSorting: "votes", // 'votes', 'party', or 'name'
    };

    // Call parent constructor with template-specific details
    super(dataService, "candidates", "candidatesSettings", defaultSettings);
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
    header.textContent = "Kandidater visning";
    settingsSection.appendChild(header);

    // Add checkbox for highlighting mayor
    const highlightMayorGroup = this.createCheckboxSetting(
      "highlightMayor",
      "highlightMayor",
      "Fremhæv borgmester"
    );
    settingsSection.appendChild(highlightMayorGroup);

    // Add checkbox for showing party logos
    const showPartyLogosGroup = this.createCheckboxSetting(
      "showPartyLogos",
      "showPartyLogos",
      "Vis partisymboler"
    );
    settingsSection.appendChild(showPartyLogosGroup);

    // Add checkbox for showing vote counts
    const showVoteCountsGroup = this.createCheckboxSetting(
      "showVoteCounts",
      "showVoteCounts",
      "Vis stemmetal"
    );
    settingsSection.appendChild(showVoteCountsGroup);

    // Add dropdown for candidate sorting
    const candidateSortingOptions = [
      { value: "votes", text: "Efter stemmetal" },
      { value: "party", text: "Efter parti" },
      { value: "name", text: "Efter navn" },
    ];

    const candidateSortingGroup = this.createSelectSetting(
      "candidateSorting",
      "candidateSorting",
      "Sortering:",
      candidateSortingOptions
    );
    settingsSection.appendChild(candidateSortingGroup);

    // Add settings section to container
    this.settingsContainer.appendChild(settingsSection);
  }

  /**
   * Update settings based on form values
   * Called when manual update is needed rather than through event handlers
   */
  updateSettingsFromForm() {
    // Get values from form elements
    const highlightMayor = el("highlightMayor").checked;
    const showPartyLogos = el("showPartyLogos").checked;
    const showVoteCounts = el("showVoteCounts").checked;
    const candidateSorting = el("candidateSorting").value;

    // Update all settings at once
    this.updateAllSettings({
      highlightMayor,
      showPartyLogos,
      showVoteCounts,
      candidateSorting,
    });
  }
}

export default CandidatesTemplate;
