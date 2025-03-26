/**
 * Results template handling
 * Manages the election results visualization
 */

class ResultsTemplate {
  constructor(dataService) {
    this.dataService = dataService;
    this.currentKommuneId = null;
    this.settingsContainer = null;
    this.activeTemplate = false;

    this.init();
  }

  /**
   * Initialize the results template
   */
  init() {
    // Listen for template selection
    document.addEventListener("templateChanged", (event) => {
      if (event.detail.template === "results") {
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

    log("Results template initialiseret");
  }

  /**
   * Activate this template
   */
  activate() {
    log("Results template aktiveret");
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
          <h3>Resultater visning</h3>
          <div class="input-group">
            <label class="checkbox-container">
              <input type="checkbox" id="showDifference" checked>
              <span class="checkmark"></span>
              Vis forskel fra forrige valg
            </label>
          </div>
          <div class="input-group">
            <label class="checkbox-container">
              <input type="checkbox" id="sortByVotes" checked>
              <span class="checkmark"></span>
              Sortér efter stemmeantal
            </label>
          </div>
          <div class="input-group">
            <label>Antal partier:</label>
            <select id="partyLimit" class="input-control-sm">
              <option value="0">Alle</option>
              <option value="5">Top 5</option>
              <option value="8">Top 8</option>
              <option value="10" selected>Top 10</option>
            </select>
          </div>
        </div>
      `;

    // Add event listeners
    el("showDifference").addEventListener("change", () =>
      this.updateSettings()
    );
    el("sortByVotes").addEventListener("change", () => this.updateSettings());
    el("partyLimit").addEventListener("change", () => this.updateSettings());
  }

  /**
   * Update settings
   */
  updateSettings() {
    const settings = {
      showDifference: el("showDifference").checked,
      sortByVotes: el("sortByVotes").checked,
      partyLimit: parseInt(el("partyLimit").value, 10),
    };

    // Save settings to local storage
    localStorage.setItem("resultsSettings", JSON.stringify(settings));

    log("Resultater indstillinger opdateret");

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
        localStorage.getItem("resultsSettings") || "{}"
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
//   window.templatesManager.results = new ResultsTemplate(dataService);
// });
