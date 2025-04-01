/**
 * Transition Manager for KV Broadcast System
 * Forenklet version med kun cut og dissolve funktioner
 */

class TransitionManager {
  constructor(previewManager, programManager, dataService) {
    this.previewManager = previewManager;
    this.programManager = programManager;
    this.dataService = dataService;

    // Transition buttons
    this.btnCut = el("btnCut");
    this.btnFade = el("btnFade");
    this.btnPush = el("btnPush");
    this.btnWipe = el("btnWipe");

    // Initialize
    this.init();
  }

  /**
   * Initialize the transition manager
   */
  init() {
    // Add event listeners for transition buttons
    this.btnCut.addEventListener("click", () => this.executeTransition("cut"));
    this.btnFade.addEventListener("click", () =>
      this.executeTransition("dissolve")
    );

    // Omdøber "Fade" knappen til "Dissolve" hvis muligt
    if (this.btnFade.textContent === "FADE") {
      this.btnFade.textContent = "DISSOLVE";
    }

    // Deaktiverer Push og Wipe knapperne eller giver dem fade-funktionalitet
    if (this.btnPush) {
      this.btnPush.style.opacity = "0.5";
      this.btnPush.addEventListener("click", () =>
        this.executeTransition("dissolve")
      );
    }

    if (this.btnWipe) {
      this.btnWipe.style.opacity = "0.5";
      this.btnWipe.addEventListener("click", () =>
        this.executeTransition("dissolve")
      );
    }

    // Add event listener for Pusher transitions (if this is display mode)
    if (!this.dataService.isControlPanel) {
      document.addEventListener("transitionExecuted", (event) => {
        const detail = event.detail;
        this.executeLocalTransition(
          detail.type,
          detail.template,
          detail.params
        );
      });
    }

    log("Transition Manager initialiseret (simplificeret version)");
  }

  /**
   * Execute a transition from preview to program
   * Send via Pusher if this is control panel
   * @param {string} type - Transition type (cut, dissolve)
   */
  executeTransition(type) {
    if (!currentSelectedTemplate) {
      log("No template selected for transition", "warning");
      return;
    }

    const params = {
      kommuneId: dataService.getActiveKommuneId(),
      valgstedId: dataService.getActiveValgstedId(),
    };

    // Local transition
    programManager.setTemplate(currentSelectedTemplate, params);
    programManager.setOnAir(true);

    // Now send via Pusher to display
    dataService.sendTransitionCommand(type, currentSelectedTemplate, params);

    log(
      `Executed ${type} transition with template: ${currentSelectedTemplate}`
    );
  }

  /**
   * Execute a local transition (no Pusher sending)
   * @param {string} type - Transition type
   * @param {string} templateName - Template to transition to
   * @param {Object} params - Parameters for the template
   */
  executeLocalTransition(type, templateName, params) {
    // Simplificeret: bruger kun cut og dissolve
    if (type === "cut") {
      this.executeCutTransition(templateName, params);
    } else {
      // Alle andre typer bliver til dissolve
      this.executeDissolveTransition(templateName, params);
    }

    // Dispatch local event to notify system of the transition
    dispatchCustomEvent("transitionCompleted", {
      type: type,
      template: templateName,
      params: params,
    });
  }

  /**
   * Execute a cut transition (immediate switch)
   * @param {string} templateName - Template to transition to
   * @param {Object} params - Parameters for the template
   */
  executeCutTransition(templateName, params) {
    // For cut, we directly set the program template
    this.programManager.setTemplate(templateName, params);
    this.programManager.setOnAir(true);
  }

  /**
   * Execute a dissolve transition (gradual opacity change)
   * @param {string} templateName - Template to transition to
   * @param {Object} params - Parameters for the template
   */
  executeDissolveTransition(templateName, params) {
    // First set up the new content
    this.programManager.setTemplate(templateName, params);

    // Get the program frame element
    const frameElement = this.programManager.programFrame.parentNode;

    // Apply dissolve effect
    frameElement.style.opacity = 0;

    // Set on air status
    this.programManager.setOnAir(true);

    // Fade in
    setTimeout(() => {
      frameElement.style.transition = "opacity 1s ease-in-out";
      frameElement.style.opacity = 1;

      // Reset transition property after animation
      setTimeout(() => {
        frameElement.style.transition = "";
      }, 1000);
    }, 50);
  }
}
