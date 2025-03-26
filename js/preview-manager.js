/**
 * Preview Manager for KV Broadcast System
 * Handles all preview window functionality
 */

class PreviewManager {
  constructor(dataService) {
    this.dataService = dataService;
    this.previewFrame = el("previewFrame");
    this.activeTemplate = "results"; // Default template
    this.templateViewUrls = {
      results: "views/results.html",
      candidates: "views/candidates.html",
      stations: "views/stations.html",
    };

    // Initialize
    this.init();
  }

  /**
   * Initialize the preview manager
   */
  init() {
    // Add event listeners for buttons
    el("btnRefreshPreview").addEventListener("click", () =>
      this.refreshPreview()
    );
    el("btnFullscreenPreview").addEventListener("click", () =>
      this.openFullscreen()
    );

    // Listen for template changes
    document.addEventListener("templateChanged", (event) => {
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
    if (!this.templateViewUrls[templateName]) {
      log(`Ukendt template: ${templateName}`, "error");
      return;
    }

    this.activeTemplate = templateName;
    log(`Preview template sat til: ${templateName}`);
    this.loadTemplate();
  }

  /**
   * Load the active template into the preview frame
   */
  loadTemplate() {
    const kommuneId = this.dataService.getActiveKommuneId();
    const valgstedId = this.dataService.getActiveValgstedId();

    let url = this.templateViewUrls[this.activeTemplate];

    // Add parameters based on template type
    if (kommuneId) {
      url += `?kommune=${kommuneId}`;

      if (this.activeTemplate === "stations" && valgstedId) {
        url += `&valgsted=${valgstedId}`;
      }
    }

    // Create scaled container if it doesn't exist
    this.createScaledContainer();

    // Set the iframe src
    const iframe = this.previewFrame.querySelector("iframe");
    if (iframe) {
      iframe.src = url;
      log(`Preview indlæser: ${url}`);
    } else {
      log("Preview iframe ikke fundet", "error");
    }
  }

  /**
   * Create a scaled container for the preview
   */
  createScaledContainer() {
    // Check if we already have the container
    if (this.previewFrame.querySelector(".scale-container")) {
      return;
    }

    // Clear the iframe
    this.previewFrame.innerHTML = "";

    // Create container elements
    const container = document.createElement("div");
    container.className = "scale-container";

    const content = document.createElement("div");
    content.className = "scaled-content";

    // Create a new iframe
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.src = "about:blank";

    // Add resolution indicator
    const indicator = document.createElement("div");
    indicator.className = "resolution-indicator";
    indicator.textContent = "1920×1080";

    // Append elements
    content.appendChild(iframe);
    content.appendChild(indicator);
    container.appendChild(content);
    this.previewFrame.appendChild(container);

    // Set up scale adjustment
    this.adjustScale();
    window.addEventListener("resize", () => this.adjustScale());
  }

  /**
   * Adjust the scale to maintain aspect ratio
   */
  adjustScale() {
    const container = this.previewFrame.querySelector(".scale-container");
    const content = this.previewFrame.querySelector(".scaled-content");

    if (!container || !content) return;

    // Get container dimensions
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate scale factor (minimum of width or height ratio)
    const scaleX = containerWidth / 1920;
    const scaleY = containerHeight / 1080;
    const scale = Math.min(scaleX, scaleY);

    // Apply scale
    content.style.transform = `scale(${scale})`;
  }

  /**
   * Update preview with new data
   * @param {Object} detail - Event detail object with updated data
   */
  updatePreview(detail) {
    // Check if preview frame is loaded
    const iframe = this.previewFrame.querySelector("iframe");
    if (!iframe || !iframe.contentWindow) {
      return;
    }

    // Send message to iframe with the new data
    iframe.contentWindow.postMessage(
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
   * Update preview with new data
   * @param {Object} detail - Event detail object with updated data
   */
  updatePreview(detail) {
    // Check if preview frame is loaded
    if (!this.previewFrame.contentWindow) {
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
   * Open the preview in fullscreen
   */
  openFullscreen() {
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
