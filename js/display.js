/**
 * Display.js - Håndterer visning af valgdata i standalone display mode
 * Dette modul erstatter inline script fra display.html og følger modulsystemet
 */

// Import nødvendige utilities og funktioner
import { el, log, getUrlParam, dispatchCustomEvent } from "./index.js";

// Modul-lokale variabler (erstatter tidligere globale variabler)
let pusher = null;
let channel = null;
let debugMode = false;
let currentTemplate = null;
// Flag til at indikere om display er aktivt (template er indlæst)
let isActivated = false;
// Reference til iframe programFrame
let programFrame = null;

/**
 * Initialize the display
 */
function init() {
  // Get reference to program frame
  programFrame = document.getElementById("programFrame");

  // Check for debug mode
  debugMode = getUrlParam("debug") === "true";
  if (debugMode) {
    document.getElementById("debugPanel").classList.add("visible");
  }

  // Get Pusher credentials from local storage or URL params
  const pusherKey =
    getUrlParam("key") ||
    localStorage.getItem("pusherKey") ||
    "cd56da67c28807fe3818";
  const pusherCluster =
    getUrlParam("cluster") || localStorage.getItem("pusherCluster") || "eu";

  if (pusherKey) {
    // Store credentials for future use
    localStorage.setItem("pusherKey", pusherKey);
    localStorage.setItem("pusherCluster", pusherCluster);

    // Initialize Pusher
    initPusher(pusherKey, pusherCluster);
  } else {
    log("Ingen Pusher nøgle angivet. Brug ?key=YOUR_KEY i URL", "error");
    updateConnectionStatus("offline", "Ingen Pusher nøgle");
  }

  // Add keyboard shortcut for debug panel
  document.addEventListener("keydown", function (e) {
    // Ctrl+Shift+D
    if (e.ctrlKey && e.shiftKey && e.key === "D") {
      toggleDebugPanel();
    }
  });

  // Load initial template from URL params if available
  const initialTemplate = getUrlParam("template");
  const kommuneId = getUrlParam("kommune");
  const valgstedId = getUrlParam("valgsted");

  if (initialTemplate) {
    const params = {};
    if (kommuneId) params.kommuneId = kommuneId;
    if (valgstedId) params.valgstedId = valgstedId;

    loadTemplate(initialTemplate, params);
  } else {
    // Default to results template if available
    const defaultParams = {};
    if (kommuneId) defaultParams.kommuneId = kommuneId;
    loadTemplate("results", defaultParams);
  }
}

/**
 * Initialize Pusher connection
 */
function initPusher(key, cluster) {
  updateConnectionStatus("connecting", "Forbinder...");

  try {
    pusher = new Pusher(key, {
      cluster: cluster,
      forceTLS: true,
      authEndpoint:
        "https://reliable-cuchufli-e643b7.netlify.app/.netlify/functions/auth",
    });

    // Subscribe to channel
    channel = pusher.subscribe("private-kv-broadcast-channel");

    // Connection events
    pusher.connection.bind("connected", () => {
      updateConnectionStatus("online", "Forbundet til Pusher");
      log("Forbundet til Pusher");
    });

    pusher.connection.bind("disconnected", () => {
      updateConnectionStatus("offline", "Afbrudt fra Pusher");
      log("Afbrudt fra Pusher", "warning");
    });

    pusher.connection.bind("error", (err) => {
      updateConnectionStatus("offline", "Fejl i Pusher forbindelse");
      log(`Pusher forbindelsesfejl: ${err.message}`, "error");
    });

    // Listen for events
    setupPusherEventHandlers();
  } catch (error) {
    updateConnectionStatus("offline", "Kunne ikke forbinde");
    log(`Fejl ved initialisering af Pusher: ${error.message}`, "error");
  }
}

/**
 * Set up Pusher event handlers
 */
function setupPusherEventHandlers() {
  // Listen for template changes
  channel.bind("client-template-changed", (data) => {
    log(`Modtog template ændring: ${data.template}`);
    // Vi gør ikke noget ved disse direkte - de håndteres via transitions
  });

  // Listen for transition commands - DISSE SKAL HÅNDTERES
  channel.bind("client-transition-executed", (data) => {
    log(`Modtog transitions-kommando: ${data.type} til ${data.template}`);
    executeTransition(data.type, data.template, data.params);
  });

  // Listen for kommune changes - DISSE SKAL IKKE HÅNDTERES DIREKTE
  channel.bind("client-kommune-changed", (data) => {
    log(`Modtog kommune ændring: ${data.kommuneId}`);
    // Vi gør ikke noget her - ændringen kommer via transitions
  });

  // Listen for valgsted changes - DISSE SKAL IKKE HÅNDTERES DIREKTE
  channel.bind("client-valgsted-changed", (data) => {
    log(`Modtog valgsted ændring: ${data.kommuneId}/${data.valgstedId}`);
    // Vi gør ikke noget her - ændringen kommer via transitions
  });

  // DATA UPDATES - Disse skal blot videregives til aktiv iframe, IKKE indlæse nyt template
  channel.bind("client-kommune-data-updated", (data) => {
    log(`Modtog kommunedata opdatering for ${data.kommuneId}`);
    if (isActivated && programFrame && programFrame.contentWindow) {
      // Send data til iframe uden at genindlæse template
      sendDataToFrame(data);
    } else {
      log("Ignorerer data opdatering da skærmen ikke er aktiveret endnu");
    }
  });

  channel.bind("client-valgsted-data-updated", (data) => {
    log(
      `Modtog valgstedsdata opdatering for ${data.kommuneId}/${data.valgstedId}`
    );
    if (isActivated && programFrame && programFrame.contentWindow) {
      // Send data til iframe uden at genindlæse template
      sendDataToFrame(data);
    } else {
      log("Ignorerer valgsted opdatering da skærmen ikke er aktiveret endnu");
    }
  });

  channel.bind("client-kandidat-data-updated", (data) => {
    log(`Modtog kandidatdata opdatering for ${data.kommuneId}`);
    if (isActivated && programFrame && programFrame.contentWindow) {
      // Send data til iframe uden at genindlæse template
      sendDataToFrame(data);
    } else {
      log("Ignorerer kandidat opdatering da skærmen ikke er aktiveret endnu");
    }
  });
}

/**
 * Helper method to send data to an iframe without reloading it
 * @param {Object} dataObj - Data object to send
 */
function sendDataToFrame(dataObj) {
  if (programFrame && programFrame.contentWindow) {
    programFrame.contentWindow.postMessage(
      {
        action: "opdaterData",
        payload: dataObj.data,
        noAnimation: true, // Add this flag to prevent re-animations
      },
      "*"
    );
    log("Data sendt til visningsramme med noAnimation flag");
  } else {
    log("Kunne ikke sende data - ingen aktiv frame", "warning");
  }
}

/**
 * Load a template
 * @param {string} templateName - Template name
 * @param {Object} params - Parameters
 */
function loadTemplate(templateName, params = {}) {
  // Save current template
  currentTemplate = templateName;

  // Get parameters
  const kommuneId = params.kommuneId || getUrlParam("kommune");
  const valgstedId = params.valgstedId || getUrlParam("valgsted");

  // Determine URL based on template
  let url;
  switch (templateName) {
    case "results":
      url = `views/results.html${kommuneId ? `?kommune=${kommuneId}` : ""}`;
      break;
    case "candidates":
      url = `views/candidates.html${kommuneId ? `?kommune=${kommuneId}` : ""}`;
      break;
    case "stations":
      url = `views/stations.html?kommune=${kommuneId || ""}&valgsted=${
        valgstedId || ""
      }`;
      break;
    default:
      log(`Ukendt template: ${templateName}`, "error");
      return;
  }

  // Hide initial loader when we have loaded a template
  const initialLoader = document.querySelector(".initial-loader");
  if (initialLoader) {
    initialLoader.style.display = "none";
  }

  // Opdater programFrame reference
  programFrame = document.getElementById("programFrame");

  // Show the iframe
  if (programFrame) {
    programFrame.style.display = "block";

    // Load template into iframe
    programFrame.src = url;
    log(`Indlæst template: ${url}`);

    // Listen for iframe load event to log success
    programFrame.onload = function () {
      log(`Template ${templateName} indlæst korrekt`);
      isActivated = true; // Markér display som aktiveret, nu hvor template er indlæst
    };
  } else {
    log("Kunne ikke finde program frame", "error");
  }
}

/**
 * Execute a transition
 * @param {string} type - Transition type
 * @param {string} template - Template name
 * @param {Object} params - Parameters
 */
function executeTransition(type, template, params) {
  const container = document.querySelector(".display-container");
  const currentFrame = document.getElementById("programFrame");

  if (!container || !currentFrame) {
    log("Kunne ikke finde nødvendige DOM elementer for transition", "error");
    return;
  }

  if (type === "cut") {
    // Just load the template immediately
    loadTemplate(template, params);
    return;
  }

  // For any other transition type, perform a dissolve transition
  log(`Starter dissolve transition til ${template}...`);

  // Show loading indicator during preparation
  const loadingIndicator = document.querySelector(".initial-loader");
  if (loadingIndicator) {
    loadingIndicator.textContent = "Forbereder transition...";
    loadingIndicator.style.display = "none"; // Vi viser ikke loaderen, da den vil forstyrre visningen
  }

  // Create a new iframe that will hold the new content
  const newFrame = document.createElement("iframe");
  newFrame.className = "program-frame";
  newFrame.style.opacity = "0";
  newFrame.style.transition = "opacity 1s ease-in-out";
  newFrame.style.position = "absolute";
  newFrame.style.top = "0";
  newFrame.style.left = "0";
  newFrame.style.width = "100%";
  newFrame.style.height = "100%";
  newFrame.style.border = "none";
  newFrame.style.zIndex = "5"; // Sæt den over den gamle iframe

  // Construct URL for the new template
  let url;
  switch (template) {
    case "results":
      url = `views/results.html${
        params.kommuneId ? `?kommune=${params.kommuneId}` : ""
      }`;
      break;
    case "candidates":
      url = `views/candidates.html${
        params.kommuneId ? `?kommune=${params.kommuneId}` : ""
      }`;
      break;
    case "stations":
      url = `views/stations.html?kommune=${params.kommuneId || ""}&valgsted=${
        params.valgstedId || ""
      }`;
      break;
    default:
      log(`Ukendt template: ${template}`, "error");
      return;
  }

  // Prepare currentFrame for transition
  currentFrame.style.transition = "opacity 1s ease-in-out";

  // Add the new frame to the DOM
  container.appendChild(newFrame);

  // Set source for the new frame
  newFrame.src = url;

  // Wait for the new frame to load before starting the transition
  newFrame.onload = function () {
    log(`Ny template ${template} indlæst - starter dissolve sekvens`);

    // Start the synchronized transition
    // First, a small delay to ensure the browser is ready
    setTimeout(() => {
      // Begin fade out of current and fade in of new simultaneously
      requestAnimationFrame(() => {
        currentFrame.style.opacity = "0";
        newFrame.style.opacity = "1";

        log(`Dissolve i gang...`);
      });

      // When animation is complete, clean up
      setTimeout(() => {
        // Remove original frame
        container.removeChild(currentFrame);

        // Make the new frame the main programFrame
        newFrame.id = "programFrame";
        programFrame = newFrame; // Opdater vores reference til den nye frame
        isActivated = true; // Markér display som aktiveret med den nye frame

        // Reset transition styling
        newFrame.style.position = "";
        newFrame.style.zIndex = "";

        log(`Dissolve transition komplet for ${template}`);
      }, 1100); // Lidt længere end transition varigheden for sikkerhed
    }, 50); // Kort forsinkelse inden opstart
  };

  // Log at processen er begyndt
  log(`Dissolve transition påbegyndt - venter på indlæsning af ${template}`);
}

/**
 * Update connection status display
 * @param {string} status - Status (online, offline, connecting)
 * @param {string} message - Status message
 */
function updateConnectionStatus(status, message) {
  const statusEl = document.getElementById("connectionStatus");
  const textEl = document.getElementById("connectionText");

  if (statusEl && textEl) {
    statusEl.className = `connection-status status-${status}`;
    textEl.textContent = message;
  }
}

/**
 * Toggle debug panel
 */
function toggleDebugPanel() {
  const panel = document.getElementById("debugPanel");
  if (panel) {
    panel.classList.toggle("visible");
    debugMode = panel.classList.contains("visible");
  }
}

// Initialiser når DOM er klar
document.addEventListener("DOMContentLoaded", init);

// Eksportér nødvendige funktioner for tests eller fremtidig modularitet
export {
  init,
  loadTemplate,
  executeTransition,
  sendDataToFrame,
  updateConnectionStatus,
  toggleDebugPanel,
};
