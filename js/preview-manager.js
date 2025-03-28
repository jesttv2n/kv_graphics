/**
 * Preview Manager for KV Broadcast System
 * Handles all preview window functionality using scaled display viewer
 */

class PreviewManager {
  constructor(dataService) {
    this.dataService = dataService;
    this.previewFrame = document.getElementById("previewFrame");
    this.activeTemplate = "results"; // Default template
    this.viewerUrl = "scaled-display-viewer.html"; // The scaled viewer HTML

    // Initialize
    this.init();
  }
  /**
   * Initialize the preview manager
   */
  init() {
    // Add event listeners for buttons
    const refreshBtn = document.getElementById("btnRefreshPreview");
    const fullscreenBtn = document.getElementById("btnFullscreenPreview");

    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.refreshPreview());
    }

    if (fullscreenBtn) {
      fullscreenBtn.addEventListener("click", () => this.openFullscreen());
    }

    // Listen for template changes - MODIFIED LINE
    document.addEventListener("previewTemplateChanged", (event) => {
      this.setTemplate(event.detail.template);
    });

    // Listen for data updates
    document.addEventListener("kommuneDataUpdated", (event) => {
      if (
        this.activeTemplate === "results" ||
        this.activeTemplate === "candidates"
      ) {
        this.updatePreview(event.detail);
      }
    });

    document.addEventListener("valgstedDataUpdated", (event) => {
      if (this.activeTemplate === "stations") {
        this.updatePreview(event.detail);
      }
    });

    document.addEventListener("kandidatDataUpdated", (event) => {
      if (this.activeTemplate === "candidates") {
        this.updatePreview(event.detail);
      }
    });

    // Set default template
    this.setTemplate(this.activeTemplate);

    log("Preview Manager initialiseret");
  }

  /**
   * Set the active template
   * @param {string} templateName - Template name (results, candidates, stations)
   */
  setTemplate(templateName) {
    const validTemplates = ["results", "candidates", "stations"];
    if (!validTemplates.includes(templateName)) {
      log(`Ukendt template: ${templateName}`, "error");
      return;
    }

    this.activeTemplate = templateName;
    log(`Preview template sat til: ${templateName}`);
    this.loadTemplate();
  }

  /**
   * Load the active template into the preview frame using scaled viewer
   */
  loadTemplate() {
    const kommuneId = this.dataService.getActiveKommuneId();
    const valgstedId = this.dataService.getActiveValgstedId();

    // Build URL for the scaled viewer
    let url =
      this.viewerUrl + `?viewer=preview&template=${this.activeTemplate}`;

    if (kommuneId) {
      url += `&kommune=${kommuneId}`;
    }

    if (this.activeTemplate === "stations" && valgstedId) {
      url += `&valgsted=${valgstedId}`;
    }

    // Ensure we have a preview frame
    if (!this.previewFrame) {
      this.previewFrame = document.getElementById("previewFrame");
      if (!this.previewFrame) {
        log("Preview iframe ikke fundet", "error");
        return;
      }
    }

    // Set the iframe src
    this.previewFrame.src = url;
    log(`Preview indlæser: ${url}`);

    // Add a load event handler
    this.previewFrame.onload = () => {
      log(`Preview template ${this.activeTemplate} indlæst korrekt`);

      // Send template settings if available
      this.sendTemplateSettings();
    };
  }

  /**
   * Send template settings to the preview viewer
   */
  sendTemplateSettings() {
    if (!this.previewFrame || !this.previewFrame.contentWindow) {
      return;
    }

    // Get template-specific settings from localStorage
    let settings = null;

    switch (this.activeTemplate) {
      case "results":
        settings = JSON.parse(localStorage.getItem("resultsSettings") || "{}");
        break;
      case "candidates":
        settings = JSON.parse(
          localStorage.getItem("candidatesSettings") || "{}"
        );
        break;
      case "stations":
        settings = JSON.parse(localStorage.getItem("stationsSettings") || "{}");
        break;
    }

    if (settings) {
      this.previewFrame.contentWindow.postMessage(
        {
          action: "updateSettings",
          settings: settings,
        },
        "*"
      );
      log("Template-indstillinger sendt til preview");
    }
  }

  /**
   * Update preview with new data
   * @param {Object} detail - Event detail object with updated data
   */
  updatePreview(detail) {
    // Check if preview frame is available
    if (!this.previewFrame || !this.previewFrame.contentWindow) {
      log("Preview frame ikke tilgængelig for dataopdatering", "warning");
      return;
    }

    // Send message to iframe with the new data
    this.previewFrame.contentWindow.postMessage(
      {
        action: "opdaterData",
        payload: detail.data,
      },
      "*"
    );

    log("Data sendt til preview");
  }

  /**
   * Refresh the preview frame
   */
  refreshPreview() {
    this.loadTemplate();
    log("Preview opdateret");
  }

  /**
   * Open the preview in fullscreen
   */
  openFullscreen() {
    if (!this.previewFrame) {
      log("Preview frame ikke fundet", "error");
      return;
    }

    if (this.previewFrame.requestFullscreen) {
      this.previewFrame.requestFullscreen();
    } else if (this.previewFrame.webkitRequestFullscreen) {
      /* Safari */
      this.previewFrame.webkitRequestFullscreen();
    } else if (this.previewFrame.msRequestFullscreen) {
      /* IE11 */
      this.previewFrame.msRequestFullscreen();
    }

    log("Preview åbnet i fuld skærm");
  }

  /**
   * Get current template name
   * @returns {string} - Current template name
   */
  getCurrentTemplate() {
    return this.activeTemplate;
  }
}
