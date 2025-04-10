/**
 * Main application script for KV Broadcast System
 * With Pusher integration for remote control
 */
// Importér fra centrale export modul
import {
  el,
  log,
  getUrlParam,
  dispatchCustomEvent,
  formatDateTime,
  kommuner,
  getKommuneNavn,
  getValgstedNavn,
  getValgstederForKommune,
  isMockDataEnabled,
  toggleMockData,
  toggleMockDataIndicator,
  ResultsTemplate,
  CandidatesTemplate,
  StationsTemplate,
  DataService,
  //KV25DataService,
  PreviewManager,
  ProgramManager,
  TransitionManager,
} from "./index.js";

// Global instances for managers
let dataService;
let previewManager;
let programManager;
let transitionManager;

// Auto-update timer og state
let autoUpdateTimer;
let autoUpdateEnabled = true;
let autoUpdateInterval = 30; // seconds

// Global variable for the current selected template
let currentSelectedTemplate = "results"; // Initialize with default

/**
 * Initialize the application
 */
function initApp() {
  // Determine if this is control panel or display based on URL parameter
  const isControlPanel = getUrlParam("mode") !== "display";

  // Log system start
  log(
    `KV Broadcast System starter som ${
      isControlPanel ? "KONTROLPANEL" : "VISNING"
    }...`
  );

  // Initialize UI based on mode
  if (isControlPanel) {
    initControlPanelUI();
    // Set default kommune after UI initialization
    setTimeout(() => {
      selectKommune("860"); // Default to kommune 860 (Hjørring)
    }, 100); // Small delay to ensure UI is ready
  } else {
    initDisplayUI();
  }

  // Create service and managers
  dataService = new DataService();
  dataService.setAsControlPanel(isControlPanel);

  // Initialiser KV25 dataservice for testing - gør den globalt tilgængelig
  window.DataService = new DataService();
  // Vi sætter den også som control panel for at aktivere Pusher-events
  window.DataService.setAsControlPanel(isControlPanel);

  if (isControlPanel) {
    previewManager = new PreviewManager(dataService);
    programManager = new ProgramManager(dataService);
    transitionManager = new TransitionManager(
      previewManager,
      programManager,
      dataService
    );

    // Initialize template managers
    window.templatesManager = {};
    window.templatesManager.results = new ResultsTemplate(dataService);
    window.templatesManager.candidates = new CandidatesTemplate(dataService);
    window.templatesManager.stations = new StationsTemplate(dataService);
    // I main.js eller lignende

    // Setup auto-update for control panel
    initAutoUpdate();
  }
  initMockDataToggle();

  // Log system ready
  log("KV Broadcast System er klar til brug");
}

/**
 * Initialize UI for control panel
 */
function initControlPanelUI() {
  document.title = "KV Broadcast - Kontrolpanel";

  // Add a class to body for control panel specific styling
  document.body.classList.add("control-panel-mode");

  // Initialize UI components for control panel
  initControlComponents();
}

/**
 * Initialize UI for display
 */
function initDisplayUI() {
  document.title = "KV Broadcast - Visning";

  // Add a class to body for display specific styling
  document.body.classList.add("display-mode");

  // Hide control components and show only display area
  document
    .querySelectorAll(".controls-panel, .transitions-panel, .data-panel")
    .forEach((el) => {
      el.style.display = "none";
    });

  // Make display area full width
  const visningPanel = document.querySelector(".visning-panel");
  if (visningPanel) {
    visningPanel.style.gridTemplateColumns = "1fr";

    // Hide preview frame
    const previewContainer = visningPanel.querySelector(
      ".visning-container:first-child"
    );
    if (previewContainer) {
      previewContainer.style.display = "none";
    }

    // Make program frame full size
    const programContainer = visningPanel.querySelector(
      ".visning-container:last-child"
    );
    if (programContainer) {
      programContainer.style.gridColumn = "1 / -1";
    }
  }
}

/**
 * Initialize control panel components
 */
function initControlComponents() {
  // Setup kommune buttons grid
  initializeKommuneButtons();

  // Add event listeners for template buttons
  el("templateResults").addEventListener("click", () =>
    selectTemplate("results")
  );
  el("templateCandidates").addEventListener("click", () =>
    selectTemplate("candidates")
  );
  el("templateStations").addEventListener("click", () =>
    selectTemplate("stations")
  );

  // Set up valgsted tab system
  setupValgstedTabs();

  // Add event listeners for data controls
  el("btnRefreshData").addEventListener("click", manualDataRefresh);
  el("autoUpdateToggle").addEventListener("change", toggleAutoUpdate);
  el("updateInterval").addEventListener("change", changeUpdateInterval);
  el("btnRefreshKommuner").addEventListener("click", handleRefreshKommuner);

  // Add event listeners for log controls
  el("btnClearLog").addEventListener("click", () => {
    el("logContainer").innerHTML = "";
    log("Log ryddet");
  });
}

/**
 * Initialize kommune buttons grid
 */
function initializeKommuneButtons() {
  const kommuneButtonsEl = el("kommuneButtons");
  kommuneButtonsEl.innerHTML = "";

  // Sort alphabetically by default
  const sortedKommuner = [...kommuner].sort((a, b) =>
    a.navn.localeCompare(b.navn)
  );

  sortedKommuner.forEach((kommune) => {
    const button = document.createElement("button");
    button.textContent = kommune.navn;
    button.dataset.id = kommune.id;
    button.addEventListener("click", () => {
      selectKommune(kommune.id);
    });
    kommuneButtonsEl.appendChild(button);
  });

  log(`Kommuneknapper initialiseret: ${sortedKommuner.length} kommuner`);
}

/**
 * Set up valgsted tabs and search functionality
 */
function setupValgstedTabs() {
  el("tabSystematic").addEventListener("click", () => {
    el("tabSystematic").classList.add("active");
    el("tabSearch").classList.remove("active");
    el("systematicContent").style.display = "block";
    el("searchContent").style.display = "none";
  });

  el("tabSearch").addEventListener("click", () => {
    el("tabSearch").classList.add("active");
    el("tabSystematic").classList.remove("active");
    el("systematicContent").style.display = "none";
    el("searchContent").style.display = "block";
    el("searchInput").focus();
  });

  // Set up search function
  el("searchInput").addEventListener("input", (e) => {
    updateValgstedListe(e.target.value);
  });

  // Setup valgsted refresh button
  el("btnRefreshValgsteder").addEventListener("click", () => {
    populateValgstedGrid();
    updateValgstedListe();
    log("Valgstedsliste opdateret");
  });
}

/**
 * Select a template
 * @param {string} templateName - Template to select
 */
function selectTemplate(templateName) {
  // Update UI to show active template
  document.querySelectorAll(".btn-template-circle").forEach((btn) => {
    btn.classList.remove("active");
  });
  el(
    `template${templateName.charAt(0).toUpperCase() + templateName.slice(1)}`
  ).classList.add("active");

  // Show/hide valgsted section based on template
  const valgstedSection = el("valgstedSection");
  const valgstedInfo = el("valgstedInfo");

  if (templateName === "stations") {
    valgstedSection.style.display = "block";
    valgstedInfo.style.display = "block";
    populateValgstedGrid();

    // Add this: Set default valgsted for the current kommune
    const kommuneId = dataService.getActiveKommuneId();
    if (kommuneId) {
      const valgsteder = getValgstederForKommune(kommuneId);
      if (valgsteder && valgsteder.length > 0) {
        // Select the first valgsted by default
        selectValgsted(valgsteder[0].id);
      }
    }
  } else {
    valgstedSection.style.display = "none";
    valgstedInfo.style.display = "none";
  }

  // Dispatch event to notify the system locally
  dispatchCustomEvent("previewTemplateChanged", { template: templateName });

  // Store the template choice for later use during transition
  currentSelectedTemplate = templateName;

  log(`Preview template ændret til: ${templateName}`);
}

/**
 * Select a kommune
 * @param {string} kommuneId - Kommune ID to select
 */
function selectKommune(kommuneId) {
  // Update UI - highlight selected kommune button
  document.querySelectorAll("#kommuneButtons button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.id === kommuneId);
  });

  // Set active kommune in dataservice
  dataService.setActiveKommune(kommuneId);

  // Update UI info display
  el("currentKommune").textContent = getKommuneNavn(kommuneId);

  // If stations template is active, populate valgsted grid
  if (previewManager.getCurrentTemplate() === "stations") {
    populateValgstedGrid();
  }

  // Fetch data for the selected kommune
  fetchDataForActiveTemplate();
}

/**
 * Populate valgsted buttons grid for selected kommune
 */
function populateValgstedGrid() {
  const kommuneId = dataService.getActiveKommuneId();
  if (!kommuneId) return;

  const valgstedGrid = el("valgstedButtons");
  valgstedGrid.innerHTML = "";

  const kommuneValgsteder = getValgstederForKommune(kommuneId);

  log(
    `Initialiserer valgstedknapper: Fandt ${kommuneValgsteder.length} valgsteder for kommune ${kommuneId}`
  );

  if (kommuneValgsteder.length === 0) {
    valgstedGrid.innerHTML =
      '<div class="empty-state">Ingen valgsteder fundet for denne kommune.</div>';
    return;
  }

  kommuneValgsteder.forEach((valgsted) => {
    const button = document.createElement("button");
    button.textContent = valgsted.navn;
    button.dataset.id = valgsted.id;
    button.addEventListener("click", () => {
      selectValgsted(valgsted.id);
    });
    valgstedGrid.appendChild(button);
  });

  // Also update search list
  updateValgstedListe();
}

/**
 * Update the valgsted search list
 * @param {string} searchTerm - Search term (optional)
 */
function updateValgstedListe(searchTerm = "") {
  const kommuneId = dataService.getActiveKommuneId();
  if (!kommuneId) return;

  const valgstedListeEl = el("valgstedListe");
  valgstedListeEl.innerHTML = "";

  const kommuneValgsteder = getValgstederForKommune(kommuneId);

  if (kommuneValgsteder.length === 0) {
    valgstedListeEl.innerHTML =
      '<div class="empty-state">Ingen valgsteder fundet for denne kommune.</div>';
    return;
  }

  // Filter valgsteder based on search term
  const filteredValgsteder = searchTerm
    ? kommuneValgsteder.filter((v) =>
        v.navn.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : kommuneValgsteder;

  if (filteredValgsteder.length === 0) {
    valgstedListeEl.innerHTML =
      '<div class="empty-state">Ingen valgsteder matcher søgningen.</div>';
    return;
  }

  filteredValgsteder.forEach((valgsted) => {
    const item = document.createElement("div");
    item.className = "valgsted-item";
    item.textContent = valgsted.navn;
    item.dataset.id = valgsted.id;

    if (valgsted.id === dataService.getActiveValgstedId()) {
      item.classList.add("active");
    }

    item.addEventListener("click", () => {
      selectValgsted(valgsted.id);
    });

    valgstedListeEl.appendChild(item);
  });
}

/**
 * Select a valgsted
 * @param {string} valgstedId - Valgsted ID to select
 */
function selectValgsted(valgstedId) {
  const kommuneId = dataService.getActiveKommuneId();
  const valgstedNavn = getValgstedNavn(kommuneId, valgstedId);

  // Update UI - highlight selected valgsted items
  document.querySelectorAll("#valgstedButtons button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.id === valgstedId);
  });

  document.querySelectorAll(".valgsted-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.id === valgstedId);
  });

  // Set active valgsted in dataservice
  dataService.setActiveValgsted(valgstedId);

  // Update UI info display
  el("currentValgsted").textContent = valgstedNavn;

  // Important addition: Check if current template is stations, and if so, refresh preview
  if (previewManager.getCurrentTemplate() === "stations") {
    previewManager.refreshPreview(); // Refresh preview to show the new valgsted
  }

  // Fetch data for the valgsted
  dataService
    .getValgstedData()
    .then((data) => {
      updateDataDisplay(data);
    })
    .catch((error) => {
      log(`Fejl: ${error.message}`, "error");
    });

  log(`Skiftet til valgsted: ${valgstedNavn} (ID: ${valgstedId})`);
}

/**
 * Fetch data for active template
 */
function fetchDataForActiveTemplate() {
  const template = previewManager.getCurrentTemplate();
  const kommuneId = dataService.getActiveKommuneId();

  if (!kommuneId) {
    log("Ingen kommune valgt", "warning");
    return;
  }

  try {
    if (template === "results") {
      // Fetch kommune data
      dataService.getKommuneData().then((data) => {
        updateDataDisplay(data);
      });
    } else if (template === "candidates") {
      // Fetch both kommune and kandidat data
      Promise.all([
        dataService.getKommuneData(),
        dataService.getKandidatData(),
      ]).then(([kommuneData, kandidatData]) => {
        updateDataDisplay(kommuneData);
        // kandidatData is handled by the event system
      });
    } else if (template === "stations") {
      const valgstedId = dataService.getActiveValgstedId();
      if (valgstedId) {
        dataService.getValgstedData().then((data) => {
          updateDataDisplay(data);
        });
      } else {
        log("Intet valgsted valgt", "warning");
      }
    }
  } catch (error) {
    log(`Fejl ved hentning af data: ${error.message}`, "error");
  }
}

/**
 * Update data display in UI
 * @param {Object} data - Data object
 */
function updateDataDisplay(data) {
  if (!data || !data.result) return;

  // Update count status
  const pct = data.result.electionProgress || 0;
  el("countStatus").textContent = `${pct}%`;
  el("countStatus").style.color =
    pct >= 95 ? "#1eaa5c" : pct >= 50 ? "#f0ad4e" : "#d9534f";

  // Update voter turnout
  if (data.result.votesPercentage) {
    el("valgdeltagelse").textContent = `${data.result.votesPercentage.toFixed(
      1
    )}%`;
  } else {
    el("valgdeltagelse").textContent = "Afventer";
  }

  // Update last update timestamp
  if (data.lastUpdated) {
    const dato = new Date(data.lastUpdated);
    el("lastUpdate").textContent = formatDateTime(dato);
  }
}

/**
 * Initialize mock data toggle button
 * This function adds a button to the control panel to enable/disable mock data
 */
function initMockDataToggle() {
  // Create the toggle button
  const toggleButton = document.createElement("button");
  toggleButton.id = "toggleMockData";
  toggleButton.className = "btn btn-warning";
  toggleButton.innerHTML = `
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="margin-right: 8px;">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
    Brug Test Data
  `;

  // Find a good place to insert the button
  const dataControls = document.querySelector(".data-controls");
  if (dataControls) {
    dataControls.appendChild(toggleButton);
  }

  // Add event listener
  toggleButton.addEventListener("click", toggleMockData);

  // Check if mock data is active
  updateMockDataToggleState();
}

/**
 * Update toggle button state based on current setting
 */
function updateMockDataToggleState() {
  const button = document.getElementById("toggleMockData");
  if (!button) return;

  const isActive = isMockDataEnabled();

  if (isActive) {
    button.classList.add("active");
    button.textContent = "Bruger Test Data";

    // Set global flag that can be detected by templates
    window.usingMockData = true;

    // Add indicator to control panel
    let indicator = document.getElementById("mockDataControlIndicator");
    if (!indicator) {
      indicator = document.createElement("div");
      indicator.id = "mockDataControlIndicator";
      indicator.style.cssText =
        "position: fixed; top: 70px; right: 20px; background-color: rgba(255, 193, 7, 0.9); color: black; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; z-index: 1000;";
      indicator.textContent = "TESTVISNING MED FIKTIVE DATA";
      document.body.appendChild(indicator);
    }
  } else {
    button.classList.remove("active");
    button.textContent = "Brug Test Data";

    // Clear global flag
    window.usingMockData = false;

    // Remove indicator if it exists
    const indicator = document.getElementById("mockDataControlIndicator");
    if (indicator) {
      indicator.remove();
    }
  }
}

/**
 * Manual data refresh
 */
function manualDataRefresh() {
  log("Manuel opdatering startet");
  fetchDataForActiveTemplate();
}

/**
 * Initialize auto-update functionality
 */
function initAutoUpdate() {
  // Set initial state from UI
  autoUpdateEnabled = el("autoUpdateToggle").checked;
  autoUpdateInterval = parseInt(el("updateInterval").value, 10);

  // Start timer if enabled
  if (autoUpdateEnabled) {
    startAutoUpdateTimer();
  }
}

/**
 * Start auto-update timer
 */
function startAutoUpdateTimer() {
  // Clear any existing timer
  clearInterval(autoUpdateTimer);

  // Set up new timer
  autoUpdateTimer = setInterval(() => {
    log(`Auto-opdatering kører (interval: ${autoUpdateInterval} sek)`);
    fetchDataForActiveTemplate();
  }, autoUpdateInterval * 1000);

  log(`Auto-opdatering aktiveret (hver ${autoUpdateInterval} sek)`);
}

/**
 * Toggle auto-update
 */
function toggleAutoUpdate() {
  autoUpdateEnabled = el("autoUpdateToggle").checked;

  if (autoUpdateEnabled) {
    startAutoUpdateTimer();
  } else {
    clearInterval(autoUpdateTimer);
    log("Auto-opdatering deaktiveret");
  }
}

/**
 * Change auto-update interval
 */
function changeUpdateInterval() {
  autoUpdateInterval = parseInt(el("updateInterval").value, 10);

  // Restart timer if enabled
  if (autoUpdateEnabled) {
    startAutoUpdateTimer();
  }

  log(`Auto-opdateringsinterval ændret til ${autoUpdateInterval} sekunder`);
}

/**
 * Handle refresh kommuner button
 */
function handleRefreshKommuner() {
  initializeKommuneButtons();
  log("Kommuneliste opdateret");
}

// Initialize application when DOM content loaded
document.addEventListener("DOMContentLoaded", initApp);
