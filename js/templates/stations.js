/**
 * Stations template handling
 * Manages the polling station results visualization
 */

class StationsTemplate {
  constructor(dataService) {
    this.dataService = dataService;
    this.currentKommuneId = null;
    this.currentValgstedId = null;
    this.settingsContainer = null;
    this.activeTemplate = false;

    this.init();
  }

  /**
   * Initialize the stations template
   */
  init() {
    // Listen for template selection
    document.addEventListener("templateChanged", (event) => {
      if (event.detail.template === "stations") {
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

    // Listen for valgsted changes
    document.addEventListener("valgstedChanged", (event) => {
      if (this.activeTemplate) {
        this.currentValgstedId = event.detail.valgstedId;
      }
    });

    log("Stations template initialiseret");
  }

  /**
   * Activate this template
   */
  activate() {
    log("Stations template aktiveret");
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
          <h3>Valgsted visning</h3>
          <div class="input-group">
            <label class="checkbox-container">
              <input type="checkbox" id="compareToMunicipality" checked>
              <span class="checkmark"></span>
              Sammenlign med kommuneresultat
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
            <label>Antal partier:</label>
            <select id="stationPartyLimit" class="input-control-sm">
              <option value="0">Alle</option>
              <option value="5">Top 5</option>
              <option value="8">Top 8</option>
              <option value="10" selected>Top 10</option>
            </select>
          </div>
        </div>
      `;

    // Add event listeners
    el("compareToMunicipality").addEventListener("change", () =>
      this.updateSettings()
    );
    el("showVoteCounts").addEventListener("change", () =>
      this.updateSettings()
    );
    el("stationPartyLimit").addEventListener("change", () =>
      this.updateSettings()
    );
  }

  /**
   * Update settings
   */
  updateSettings() {
    const settings = {
      compareToMunicipality: el("compareToMunicipality").checked,
      showVoteCounts: el("showVoteCounts").checked,
      partyLimit: parseInt(el("stationPartyLimit").value, 10),
    };

    // Save settings to local storage
    localStorage.setItem("stationsSettings", JSON.stringify(settings));

    log("Valgsted indstillinger opdateret");

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
        localStorage.getItem("stationsSettings") || "{}"
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
//   window.templatesManager.stations = new StationsTemplate(dataService);
// });
