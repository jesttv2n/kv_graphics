/**
 * Program Manager for KV Broadcast System
 * Handles all program (PGM) window functionality using scaled display viewer
 */

class ProgramManager {
  constructor(dataService) {
    this.dataService = dataService;
    this.programFrame = document.getElementById("programFrame");
    this.activeTemplate = null; // No active template on start
    this.isOnAir = false;
    this.viewerUrl = "scaled-display-viewer.html"; // The scaled viewer HTML

    // Initialize
    this.init();
  }

  /**
   * Initialize the program manager
   */
  init() {
    // Add event listeners for buttons
    const refreshBtn = document.getElementById("btnRefreshProgram");
    const fullscreenBtn = document.getElementById("btnFullscreenProgram");

    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.refreshProgram());
    }

    if (fullscreenBtn) {
      fullscreenBtn.addEventListener("click", () => this.openFullscreen());
    }

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
    const validTemplates = ["results", "candidates", "stations"];
    if (!validTemplates.includes(templateName)) {
      log(`Ukendt template: ${templateName}`, "error");
      return;
    }

    this.activeTemplate = templateName;
    log(`Program template sat til: ${templateName}`);
    this.loadTemplate(params);
  }

  /**
   * Load the active template into the program frame using scaled viewer
   * @param {Object} params - Parameters for the template
   */
  loadTemplate(params = {}) {
    // Ensure we have a program frame
    if (!this.programFrame) {
      this.programFrame = document.getElementById("programFrame");
      if (!this.programFrame) {
        log("Program iframe ikke fundet", "error");
        return;
      }
    }

    // Build URL for the scaled viewer
    let url =
      this.viewerUrl + `?viewer=program&template=${this.activeTemplate}`;

    // Add kommune parameter if available
    if (params.kommuneId || this.dataService.getActiveKommuneId()) {
      url += `&kommune=${
        params.kommuneId || this.dataService.getActiveKommuneId()
      }`;
    }

    // Add valgsted parameter if stations template and valgsted is available
    if (this.activeTemplate === "stations") {
      if (params.valgstedId || this.dataService.getActiveValgstedId()) {
        url += `&valgsted=${
          params.valgstedId || this.dataService.getActiveValgstedId()
        }`;
      }
    }

    // Set the iframe src
    this.programFrame.src = url;
    log(`Program indlæser: ${url}`);

    // Add a load event handler
    this.programFrame.onload = () => {
      log(`Program template ${this.activeTemplate} indlæst korrekt`);
    };

    // Update status indicator
    this.updateStatus();
  }

  /**
   * Update program with new data
   * @param {Object} detail - Event detail object with updated data
   */
  updateProgram(detail) {
    // Check if program frame is loaded and we're on air
    if (
      !this.programFrame ||
      !this.programFrame.contentWindow ||
      !this.isOnAir
    ) {
      log("Program frame ikke tilgængelig for dataopdatering", "warning");
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
   * Open the program in fullscreen
   */
  openFullscreen() {
    if (!this.programFrame) {
      log("Program frame ikke fundet", "error");
      return;
    }

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

    // Update visual indicator (find parent element with correct class)
    if (this.programFrame) {
      const parent =
        this.programFrame.closest(".visning-frame") ||
        this.programFrame.parentNode;
      if (parent) {
        if (status) {
          parent.classList.add("on-air");
        } else {
          parent.classList.remove("on-air");
        }
      }
    }

    // Update status
    this.updateStatus();

    log(`Program er ${status ? "PÅ LUFTEN" : "ikke på luften"}`);
  }

  /**
   * Update program status indicator in the UI
   */
  updateStatus() {
    const statusIndicator = document.getElementById("statusIndicator");
    const statusText = document.getElementById("statusText");

    if (!statusIndicator || !statusText) {
      return; // Elements not found, can happen in display mode
    }

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

    // Clear the frame
    if (this.programFrame) {
      this.programFrame.src = "about:blank";
    }

    this.activeTemplate = null;
    log("Program taget af luften");
  }
}
