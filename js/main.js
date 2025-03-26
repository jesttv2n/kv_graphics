/**
 * Main application script for KV Broadcast System
 * With Pusher integration for remote control
 */

// Global instances for managers
let dataService;
let previewManager;
let programManager;
let transitionManager;

// Application mode - control panel or display
let isControlPanel = false;

// Auto-update timer
let autoUpdateTimer;
let autoUpdateEnabled = true;
let autoUpdateInterval = 30; // seconds

/**
 * Initialize the application
 */
function initApp() {
  // Determine if this is control panel or display based on URL parameter
  isControlPanel = getUrlParam("mode") !== "display";

  // Log system start
  log(
    `KV Broadcast System starter som ${
      isControlPanel ? "KONTROLPANEL" : "VISNING"
    }...`
  );

  // Initialize UI based on mode
  if (isControlPanel) {
    initControlPanelUI();
  } else {
    initDisplayUI();
  }

  // Create service and managers
  dataService = new DataService();
  dataService.setAsControlPanel(isControlPanel);

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

    // Setup auto-update for control panel
    initAutoUpdate();
  }

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
  // Populate kommune dropdown
  const kommuneSelect = el("kommuneSelect");
  kommuner.forEach((kommune) => {
    const option = document.createElement("option");
    option.value = kommune.id;
    option.textContent = kommune.navn;
    kommuneSelect.appendChild(option);
  });

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

  // Add event listener for kommune select
  kommuneSelect.addEventListener("change", function () {
    const kommuneId = this.value;
    if (kommuneId) {
      selectKommune(kommuneId);
    }
  });

  // Add event listeners for data controls
  el("btnRefreshData").addEventListener("click", manualDataRefresh);
  el("autoUpdateToggle").addEventListener("change", toggleAutoUpdate);
  el("updateInterval").addEventListener("change", changeUpdateInterval);

  // Add event listeners for log controls
  el("btnClearLog").addEventListener("click", () => {
    el("logContainer").innerHTML = "";
    log("Log ryddet");
  });

  // Add event listener for CasparCG send button
  el("btnCasparCG").addEventListener("click", sendToCasparCG);
}

/**
 * Select a template
 * @param {string} templateName - Template to select
 */
function selectTemplate(templateName) {
  // Update UI to show active template
  document.querySelectorAll(".btn-template").forEach((btn) => {
    btn.classList.remove("active");
  });
  el(
    `template${templateName.charAt(0).toUpperCase() + templateName.slice(1)}`
  ).classList.add("active");

  // Show/hide valgsted selector based on template
  const valgstedContainer = el("valgstedContainer");
  const valgstedInfo = el("valgstedInfo");

  if (templateName === "stations") {
    valgstedContainer.style.display = "block";
    valgstedInfo.style.display = "block";
    populateValgstedDropdown();
  } else {
    valgstedContainer.style.display = "none";
    valgstedInfo.style.display = "none";
  }

  // Dispatch event to notify the system locally
  dispatchCustomEvent("templateChanged", { template: templateName });

  // Send via Pusher
  dataService.sendTemplateChange(templateName);

  log(`Template ændret til: ${templateName}`);
}

/**
 * Select a kommune
 * @param {string} kommuneId - Kommune ID to select
 */
function selectKommune(kommuneId) {
  // Set active kommune in dataservice
  dataService.setActiveKommune(kommuneId);

  // Update UI
  el("currentKommune").textContent = getKommuneNavn(kommuneId);

  // If stations template is active, populate valgsted dropdown
  if (previewManager.getCurrentTemplate() === "stations") {
    populateValgstedDropdown();
  }

  // Fetch data for the selected kommune
  fetchDataForActiveTemplate();
}

/**
 * Populate valgsted dropdown for selected kommune
 */
function populateValgstedDropdown() {
  const kommuneId = dataService.getActiveKommuneId();
  if (!kommuneId) return;

  const valgstedSelect = el("valgstedSelect");
  valgstedSelect.innerHTML = '<option value="">Vælg valgsted...</option>';

  const valgsteder = getValgstederForKommune(kommuneId);
  valgsteder.forEach((valgsted) => {
    const option = document.createElement("option");
    option.value = valgsted.id;
    option.textContent = valgsted.navn;
    valgstedSelect.appendChild(option);
  });

  // Add event listener
  valgstedSelect.onchange = function () {
    const valgstedId = this.value;
    if (valgstedId) {
      selectValgsted(valgstedId);
    }
  };
}

/**
 * Select a valgsted
 * @param {string} valgstedId - Valgsted ID to select
 */
function selectValgsted(valgstedId) {
  // Set active valgsted in dataservice
  dataService.setActiveValgsted(valgstedId);

  // Update UI
  const valgstedNavn = getValgstedNavn(
    dataService.getActiveKommuneId(),
    valgstedId
  );
  el("currentValgsted").textContent = valgstedNavn;

  // Fetch data for the valgsted
  dataService
    .getValgstedData()
    .then((data) => {
      updateDataDisplay(data);
    })
    .catch((error) => {
      log(`Fejl: ${error.message}`, "error");
    });
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
    el("lastUpdate").textContent = dato.toLocaleTimeString("da-DK");
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
 * Send to CasparCG
 */
function sendToCasparCG() {
  const host = el("casparHost").value;
  const port = el("casparPort").value;
  const channel = el("casparChannel").value;

  const kommune = getKommuneNavn(dataService.getActiveKommuneId());
  const template = previewManager.getCurrentTemplate();
  let templateName = "";

  switch (template) {
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

  // This would be implemented for a real CasparCG setup
  log(
    `Sender til CasparCG (${host}:${port}): ${templateName} for ${kommune} på kanal ${channel}`
  );

  // Simulate success
  setTimeout(() => {
    log(`CasparCG bekræftelse modtaget`, "info");
  }, 500);
}

// Initialize application when DOM content loaded
document.addEventListener("DOMContentLoaded", initApp);
