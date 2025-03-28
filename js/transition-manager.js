/**
 * Transition Manager for KV Broadcast System
 * Handles transitions between preview and program
 * With Pusher integration for remote control
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
      this.executeTransition("fade")
    );
    this.btnPush.addEventListener("click", () =>
      this.executeTransition("push")
    );
    this.btnWipe.addEventListener("click", () =>
      this.executeTransition("wipe")
    );

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

    log("Transition Manager initialiseret");
  }

  /**
   * Execute a transition from preview to program
   * Send via Pusher if this is control panel
   * @param {string} type - Transition type (cut, fade, push, wipe)
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
    // Execute the transition based on type
    switch (type) {
      case "cut":
        this.executeCutTransition(templateName, params);
        break;
      case "fade":
        this.executeFadeTransition(templateName, params);
        break;
      case "push":
        this.executePushTransition(templateName, params);
        break;
      case "wipe":
        this.executeWipeTransition(templateName, params);
        break;
      default:
        log(`Ukendt transitions-type: ${type}`, "error");
        return;
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
   * Execute a fade transition (gradual opacity change)
   * @param {string} templateName - Template to transition to
   * @param {Object} params - Parameters for the template
   */
  executeFadeTransition(templateName, params) {
    // First set up the new content
    this.programManager.setTemplate(templateName, params);

    // Get the program frame element
    const frameElement = this.programManager.programFrame.parentNode;

    // Apply fade effect
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

  /**
   * Execute a push transition (slide effect)
   * This is simulated since we're working with iframes
   * @param {string} templateName - Template to transition to
   * @param {Object} params - Parameters for the template
   */
  executePushTransition(templateName, params) {
    // For now, this is similar to fade but could be enhanced with CSS animations
    this.executeFadeTransition(templateName, params);

    // Add a special class to indicate the push transition
    // In a production environment, this would trigger a CSS animation
    const frameElement = this.programManager.programFrame.parentNode;
    frameElement.classList.add("push-transition");

    // Remove the class after animation
    setTimeout(() => {
      frameElement.classList.remove("push-transition");
    }, 1000);
  }

  /**
   * Execute a wipe transition
   * This is simulated since we're working with iframes
   * @param {string} templateName - Template to transition to
   * @param {Object} params - Parameters for the template
   */
  executeWipeTransition(templateName, params) {
    // Similar to other transitions, but with wipe effect indicator
    this.executeFadeTransition(templateName, params);

    // Add a special class to indicate the wipe transition
    const frameElement = this.programManager.programFrame.parentNode;
    frameElement.classList.add("wipe-transition");

    // Remove the class after animation
    setTimeout(() => {
      frameElement.classList.remove("wipe-transition");
    }, 1000);
  }
  /**
   * Execute a push transition (slide effect)
   * This is simulated since we're working with iframes
   * @param {string} templateName - Template to transition to
   * @param {Object} params - Parameters for the template
   */
  executePushTransition(templateName, params) {
    // For now, this is similar to fade but could be enhanced with CSS animations
    this.executeFadeTransition(templateName, params);

    // Add a special class to indicate the push transition
    // In a production environment, this would trigger a CSS animation
    const frameElement =
      this.programManager.programFrame.querySelector(".scaled-content") ||
      this.programManager.programFrame.parentNode;
    frameElement.classList.add("push-transition");

    // Remove the class after animation
    setTimeout(() => {
      frameElement.classList.remove("push-transition");
    }, 1000);
  }

  /**
   * Execute a wipe transition
   * This is simulated since we're working with iframes
   * @param {string} templateName - Template to transition to
   * @param {Object} params - Parameters for the template
   */
  executeWipeTransition(templateName, params) {
    // Similar to other transitions, but with wipe effect indicator
    this.executeFadeTransition(templateName, params);

    // Add a special class to indicate the wipe transition
    const frameElement =
      this.programManager.programFrame.querySelector(".scaled-content") ||
      this.programManager.programFrame.parentNode;
    frameElement.classList.add("wipe-transition");

    // Remove the class after animation
    setTimeout(() => {
      frameElement.classList.remove("wipe-transition");
    }, 1000);
  }
  /**
   * Execute a fade transition (gradual opacity change)
   * @param {string} templateName - Template to transition to
   * @param {Object} params - Parameters for the template
   */
  executeFadeTransition(templateName, params) {
    // First set up the new content
    this.programManager.setTemplate(templateName, params);

    // Get the scaled content element
    const frameElement =
      this.programManager.programFrame.querySelector(".scaled-content");
    if (!frameElement) {
      log("Scaled content element ikke fundet for transition", "warning");
      // Fallback to old behavior
      const frameParent = this.programManager.programFrame.parentNode;
      frameParent.style.opacity = 0;

      // Set on air status
      this.programManager.setOnAir(true);

      // Fade in
      setTimeout(() => {
        frameParent.style.transition = "opacity 1s ease-in-out";
        frameParent.style.opacity = 1;

        // Reset transition property after animation
        setTimeout(() => {
          frameParent.style.transition = "";
        }, 1000);
      }, 50);

      return;
    }

    // Apply fade effect
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
