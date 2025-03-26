/**
 * Candidates template handling
 * Manages the elected candidates visualization
 */

class CandidatesTemplate {
  constructor(dataService) {
    this.dataService = dataService;
    this.currentKommuneId = null;
    this.settingsContainer = null;
    this.activeTemplate = false;

    this.init();
  }

  /**
   * Initialize the candidates template
   */
  init() {
    // Listen for template selection
    document.addEventListener("templateChanged", (event) => {
      if (event.detail.template === "candidates") {
        this.activeTemplate = true;
        this.activate();
      } else {
        this.activeTemplate = false;
      }
    });

    // Listen for kommune changes
    document.addEventListener("kommuneChanged", (event) => {
      if (this.activeTemplate) {
        this.currentKommuneId = event.detail.kommuneId;
      }
    });

    log("Candidates template initialiseret");
  }

  /**
   * Activate this template
   */
  activate() {
    log("Candidates template aktiveret");
    this.loadSettings();
  }

  /**
   * Load template-specific settings
   */
  loadSettings() {
    // Get the settings container
    this.settingsContainer = el("templateSpecificSettings");
    if (!this.settingsContainer) return;

    // Clear previous settings
    this.settingsContainer.innerHTML = "";

    // Create settings HTML
    this.settingsContainer.innerHTML = `
        <div class="settings-section">
          <h3>Kandidater visning</h3>
          <div class="input-group">
            <label class="checkbox-container">
              <input type="checkbox" id="highlightMayor" checked>
              <span class="checkmark"></span>
              Fremhæv borgmester
            </label>
          </div>
          <div class="input-group">
            <label class="checkbox-container">
              <input type="checkbox" id="showPartyLogos" checked>
              <span class="checkmark"></span>
              Vis partisymboler
            </label>
          </div>
          <div class="input-group">
            <label class="checkbox-container">
              <input type="checkbox" id="showVoteCounts" checked>
              <span class="checkmark"></span>
              Vis stemmetal
            </label>
          </div>
          <div class="input-group">
            <label>Sortering:</label>
            <select id="candidateSorting" class="input-control-sm">
              <option value="votes" selected>Efter stemmetal</option>
              <option value="party">Efter parti</option>
              <option value="name">Efter navn</option>
            </select>
          </div>
        </div>
      `;

    // Add event listeners
    el("highlightMayor").addEventListener("change", () =>
      this.updateSettings()
    );
    el("showPartyLogos").addEventListener("change", () =>
      this.updateSettings()
    );
    el("showVoteCounts").addEventListener("change", () =>
      this.updateSettings()
    );
    el("candidateSorting").addEventListener("change", () =>
      this.updateSettings()
    );
  }

  /**
   * Update settings
   */
  updateSettings() {
    const settings = {
      highlightMayor: el("highlightMayor").checked,
      showPartyLogos: el("showPartyLogos").checked,
      showVoteCounts: el("showVoteCounts").checked,
      candidateSorting: el("candidateSorting").value,
    };

    // Save settings to local storage
    localStorage.setItem("candidatesSettings", JSON.stringify(settings));

    log("Kandidater indstillinger opdateret");

    // Update preview
    this.sendSettingsToPreview();
  }

  /**
   * Send settings to preview
   */
  sendSettingsToPreview() {
    const previewFrame = el("previewFrame");
    if (previewFrame && previewFrame.contentWindow) {
      const settings = JSON.parse(
        localStorage.getItem("candidatesSettings") || "{}"
      );

      previewFrame.contentWindow.postMessage(
        {
          action: "updateSettings",
          settings: settings,
        },
        "*"
      );

      log("Indstillinger sendt til preview");
    }
  }
}

// Denne del skal ikke bruges når vi initialiserer i main.js
// document.addEventListener('DOMContentLoaded', () => {
//   if (typeof window.templatesManager === 'undefined') {
//     window.templatesManager = {};
//   }
//
//   window.templatesManager.candidates = new CandidatesTemplate(dataService);
// });
