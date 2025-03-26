/**
 * Program Manager for KV Broadcast System
 * Handles all program (PGM) window functionality
 */

class ProgramManager {
  constructor(dataService) {
    this.dataService = dataService;
    this.programFrame = el("programFrame");
    this.activeTemplate = null; // No active template on start
    this.isOnAir = false;
    this.templateViewUrls = {
      results: "views/results.html",
      candidates: "views/candidates.html",
      stations: "views/stations.html",
    };

    // Initialize
    this.init();
  }

  /**
   * Initialize the program manager
   */
  init() {
    // Add event listeners for buttons
    el("btnRefreshProgram").addEventListener("click", () =>
      this.refreshProgram()
    );
    el("btnFullscreenProgram").addEventListener("click", () =>
      this.openFullscreen()
    );

    // Listen for transition events
    document.addEventListener("transitionExecuted", (event) => {
      this.setTemplate(event.detail.template, event.detail.params);
      this.setOnAir(true);
    });

    // Listen for data updates to pass to program if it's on air
    document.addEventListener("kommuneDataUpdated", (event) => {
      if (
        this.isOnAir &&
        (this.activeTemplate === "results" ||
          this.activeTemplate === "candidates")
      ) {
        this.updateProgram(event.detail);
      }
    });

    document.addEventListener("valgstedDataUpdated", (event) => {
      if (this.isOnAir && this.activeTemplate === "stations") {
        this.updateProgram(event.detail);
      }
    });

    document.addEventListener("kandidatDataUpdated", (event) => {
      if (this.isOnAir && this.activeTemplate === "candidates") {
        this.updateProgram(event.detail);
      }
    });

    log("Program Manager initialiseret");
  }

  /**
   * Set the active template for program view
   * @param {string} templateName - Template name (results, candidates, stations)
   * @param {Object} params - Parameters for the template
   */
  setTemplate(templateName, params = {}) {
    if (!this.templateViewUrls[templateName]) {
      log(`Ukendt template: ${templateName}`, "error");
      return;
    }

    this.activeTemplate = templateName;
    log(`Program template sat til: ${templateName}`);
    this.loadTemplate(params);
  }

  /**
   * Load the active template into the program frame
   * @param {Object} params - Parameters for the template
   */
  loadTemplate(params = {}) {
    let url = this.templateViewUrls[this.activeTemplate];

    // Build URL parameters
    const urlParams = new URLSearchParams();

    // Add kommune parameter if available
    if (params.kommuneId || this.dataService.getActiveKommuneId()) {
      urlParams.append(
        "kommune",
        params.kommuneId || this.dataService.getActiveKommuneId()
      );
    }

    // Add valgsted parameter if stations template and valgsted is available
    if (this.activeTemplate === "stations") {
      if (params.valgstedId || this.dataService.getActiveValgstedId()) {
        urlParams.append(
          "valgsted",
          params.valgstedId || this.dataService.getActiveValgstedId()
        );
      }
    }

    // Add parameters to URL if any are set
    if (urlParams.toString()) {
      url += `?${urlParams.toString()}`;
    }

    // Create scaled container if it doesn't exist
    this.createScaledContainer();

    // Set the iframe src
    const iframe = this.programFrame.querySelector("iframe");
    if (iframe) {
      iframe.src = url;
      log(`Program indlæser: ${url}`);
    } else {
      log("Program iframe ikke fundet", "error");
    }

    // Update status indicator
    this.updateStatus();
  }

  /**
   * Create a scaled container for the program
   */
  createScaledContainer() {
    // Check if we already have the container
    if (this.programFrame.querySelector(".scale-container")) {
      return;
    }

    // Clear the iframe
    this.programFrame.innerHTML = "";

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
    this.programFrame.appendChild(container);

    // Set up scale adjustment
    this.adjustScale();
    window.addEventListener("resize", () => this.adjustScale());
  }

  /**
   * Adjust the scale to maintain aspect ratio
   */
  adjustScale() {
    const container = this.programFrame.querySelector(".scale-container");
    const content = this.programFrame.querySelector(".scaled-content");

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
   * Update program with new data
   * @param {Object} detail - Event detail object with updated data
   */
  updateProgram(detail) {
    // Check if program frame is loaded and we're on air
    const iframe = this.programFrame.querySelector("iframe");
    if (!iframe || !iframe.contentWindow || !this.isOnAir) {
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

    log("Data sendt til program");
  }

  /**
   * Refresh the program frame
   */
  refreshProgram() {
    if (this.activeTemplate) {
      this.loadTemplate();
      log("Program opdateret");
    } else {
      log("Intet aktivt program template at opdatere", "warning");
    }
  }

  /**
   * Update program with new data
   * @param {Object} detail - Event detail object with updated data
   */
  updateProgram(detail) {
    // Check if program frame is loaded and we're on air
    if (!this.programFrame.contentWindow || !this.isOnAir) {
      return;
    }

    // Send message to iframe with the new data
    this.programFrame.contentWindow.postMessage(
      {
        action: "opdaterData",
        payload: detail.data,
      },
      "*"
    );

    log("Data sendt til program");
  }

  /**
   * Open the program in fullscreen
   */
  openFullscreen() {
    if (this.programFrame.requestFullscreen) {
      this.programFrame.requestFullscreen();
    } else if (this.programFrame.webkitRequestFullscreen) {
      /* Safari */
      this.programFrame.webkitRequestFullscreen();
    } else if (this.programFrame.msRequestFullscreen) {
      /* IE11 */
      this.programFrame.msRequestFullscreen();
    }

    log("Program åbnet i fuld skærm");
  }

  /**
   * Set on air status
   * @param {boolean} status - Whether program is on air
   */
  setOnAir(status) {
    this.isOnAir = status;

    // Update visual indicator
    const frame = el("programFrame").parentNode;
    if (status) {
      frame.classList.add("on-air");
    } else {
      frame.classList.remove("on-air");
    }

    // Update status
    this.updateStatus();

    log(`Program er ${status ? "PÅ LUFTEN" : "ikke på luften"}`);
  }

  /**
   * Update program status indicator in the UI
   */
  updateStatus() {
    const statusIndicator = el("statusIndicator");
    const statusText = el("statusText");

    if (this.isOnAir && this.activeTemplate) {
      statusIndicator.className = "status-indicator status-online";

      let templateName = "";
      switch (this.activeTemplate) {
        case "results":
          templateName = "Valgresultater";
          break;
        case "candidates":
          templateName = "Valgte Kandidater";
          break;
        case "stations":
          templateName = "Valgstedsresultater";
          break;
      }

      const kommuneNavn =
        getKommuneNavn(this.dataService.getActiveKommuneId()) || "";
      let statusMessage = `PÅ LUFTEN: ${templateName}`;

      if (kommuneNavn) {
        statusMessage += ` - ${kommuneNavn}`;

        if (this.activeTemplate === "stations") {
          const valgstedId = this.dataService.getActiveValgstedId();
          if (valgstedId) {
            const valgstedNavn = getValgstedNavn(
              this.dataService.getActiveKommuneId(),
              valgstedId
            );
            statusMessage += ` - ${valgstedNavn}`;
          }
        }
      }

      statusText.textContent = statusMessage;
    } else {
      statusIndicator.className = "status-indicator status-offline";
      statusText.textContent = "Systemet er klar";
    }
  }

  /**
   * Get current template name
   * @returns {string|null} - Current template name or null if none active
   */
  getCurrentTemplate() {
    return this.activeTemplate;
  }

  /**
   * Check if program is currently on air
   * @returns {boolean} - Whether program is on air
   */
  isCurrentlyOnAir() {
    return this.isOnAir;
  }

  /**
   * Take program off air
   */
  takeOffAir() {
    this.setOnAir(false);
    this.programFrame.src = "about:blank";
    this.activeTemplate = null;
    log("Program taget af luften");
  }
}
