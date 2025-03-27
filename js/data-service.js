/**
 * Data Service for KV Broadcast System
 * Handles all API requests and data management
 * Integrated with Pusher for real-time communication
 */

class DataService {
  constructor() {
    this.apiBaseUrl = "https://election-api.services.tv2.dk/kv/kv21";
    this.cache = {
      kommuneData: {},
      valgstedData: {},
      kandidatData: {},
    };
    this.activeKommuneId = null;
    this.activeValgstedId = null;
    this.lastUpdateTimestamp = null;

    // Initialize Pusher
    this.pusher = null;
    this.channel = null;
    this.isControlPanel = false; // Set to true for control panel, false for display
    this.pendingEvents = []; // Queue for events to be sent when Pusher is ready

    this.initPusher();
  }

  // Hjælperfunktion til at sende events
  sendPusherEvent(eventName, data) {
    if (!this.channelReady) {
      console.log(`Kanal ikke klar endnu, sætter event '${eventName}' i kø`);
      this.pendingEvents.push({ name: eventName, data: data });
      return false;
    }

    try {
      this.channel.trigger(eventName, data);
      return true;
    } catch (error) {
      console.error(`Fejl ved sending af event: ${error.message}`);
      return false;
    }
  }
  /**
   * Initialize Pusher connection
   */
  initPusher() {
    // Initialize Pusher with your app key and auth endpoint
    this.pusher = new Pusher("cd56da67c28807fe3818", {
      cluster: "eu",
      forceTLS: true,
      authEndpoint: "https://din-netlify-app.netlify.app/pusher/auth",
    });

    // Marker kanalen som ikke klar
    this.channelReady = false;

    // Subscribe to the private channel
    this.channel = this.pusher.subscribe("private-kv-broadcast-channel");

    // VIGTIGT: Vent på at abonnementet er færdigt, før du tillader sending af events
    this.channel.bind("pusher:subscription_succeeded", () => {
      console.log("Subscription succeeded - nu kan vi sende events!");
      this.channelReady = true;

      // Hvis der er ventende events i kø, send dem nu
      if (this.pendingEvents && this.pendingEvents.length > 0) {
        console.log(`Sender ${this.pendingEvents.length} ventende events`);
        this.pendingEvents.forEach((event) => {
          this.channel.trigger(event.name, event.data);
        });
        this.pendingEvents = [];
      }
    });

    // Set up event handlers
    this.setupPusherEventHandlers();

    log("Pusher forbindelse initialiseret med autentificering");
  }

  /**
   * Set if this is the control panel (sender) or display (receiver)
   * @param {boolean} isControlPanel - True if this is the control panel
   */
  setAsControlPanel(isControlPanel) {
    this.isControlPanel = isControlPanel;
    log(`Sat som ${isControlPanel ? "kontrolpanel" : "visning"}`);
  }

  /**
   * Set up Pusher event handlers
   */
  setupPusherEventHandlers() {
    // Only set up event listeners if this is the display (receiver)
    if (this.isControlPanel) return;

    // Listen for kommune data updates
    this.channel.bind("client-kommune-data-updated", (data) => {
      // Update cache
      this.cache.kommuneData[data.kommuneId] = data.data;
      this.lastUpdateTimestamp = new Date();

      // Set active kommune
      this.activeKommuneId = data.kommuneId;

      // Dispatch event
      dispatchCustomEvent("kommuneDataUpdated", data);

      log(`Modtaget kommunedata for ${data.kommuneId} via Pusher`);
    });

    // Listen for valgsted data updates
    this.channel.bind("client-valgsted-data-updated", (data) => {
      // Update cache
      if (!this.cache.valgstedData[data.kommuneId]) {
        this.cache.valgstedData[data.kommuneId] = {};
      }
      this.cache.valgstedData[data.kommuneId][data.valgstedId] = data.data;
      this.lastUpdateTimestamp = new Date();

      // Set active kommune and valgsted
      this.activeKommuneId = data.kommuneId;
      this.activeValgstedId = data.valgstedId;

      // Dispatch event
      dispatchCustomEvent("valgstedDataUpdated", data);

      log(
        `Modtaget valgstedsdata for ${data.kommuneId}/${data.valgstedId} via Pusher`
      );
    });

    // Listen for kandidat data updates
    this.channel.bind("client-kandidat-data-updated", (data) => {
      // Update cache
      this.cache.kandidatData[data.kommuneId] = data.data;
      this.lastUpdateTimestamp = new Date();

      // Set active kommune
      this.activeKommuneId = data.kommuneId;

      // Dispatch event
      dispatchCustomEvent("kandidatDataUpdated", data);

      log(`Modtaget kandidatdata for ${data.kommuneId} via Pusher`);
    });

    // Listen for template changes
    this.channel.bind("client-template-changed", (data) => {
      dispatchCustomEvent("templateChanged", data);
      log(`Modtaget template ændring til: ${data.template} via Pusher`);
    });

    // Listen for transition commands
    this.channel.bind("client-transition-executed", (data) => {
      dispatchCustomEvent("transitionExecuted", data);
      log(`Modtaget transitions-kommando: ${data.type} via Pusher`);
    });
  }
  /**
   * Set active kommune ID
   * @param {string} kommuneId - Kommune ID
   */
  setActiveKommune(kommuneId) {
    this.activeKommuneId = kommuneId;
    // Reset valgsted when changing kommune
    this.activeValgstedId = null;

    // Dispatch event locally
    dispatchCustomEvent("kommuneChanged", { kommuneId });

    // If control panel, trigger Pusher event
    if (this.isControlPanel) {
      // For client events, we need to prefix with 'client-'
      this.sendPusherEvent("client-kommune-changed", {
        kommuneId: kommuneId,
      });
    }

    log(`Aktiv kommune sat til: ${kommuneId} (${getKommuneNavn(kommuneId)})`);
    return this.getKommuneData(kommuneId);
  }

  /**
   * Set active valgsted ID
   * @param {string} valgstedId - Valgsted ID
   */
  setActiveValgsted(valgstedId) {
    this.activeValgstedId = valgstedId;

    // Dispatch event locally
    dispatchCustomEvent("valgstedChanged", {
      kommuneId: this.activeKommuneId,
      valgstedId: valgstedId,
    });

    // If control panel, trigger Pusher event
    if (this.isControlPanel) {
      // For client events, we need to prefix with 'client-'
      this.sendPusherEvent("client-valgsted-changed", {
        kommuneId: this.activeKommuneId,
        valgstedId: valgstedId,
      });
    }

    const valgstedNavn = getValgstedNavn(this.activeKommuneId, valgstedId);
    log(`Aktivt valgsted sat til: ${valgstedId} (${valgstedNavn})`);
    return this.getValgstedData(this.activeKommuneId, valgstedId);
  }
  /**
   * Get active kommune ID
   * @returns {string|null} - Active kommune ID
   */
  getActiveKommuneId() {
    return this.activeKommuneId;
  }

  /**
   * Get active valgsted ID
   * @returns {string|null} - Active valgsted ID
   */
  getActiveValgstedId() {
    return this.activeValgstedId;
  }

  /**
   * Generate cache key for API requests
   * @returns {string} - Cache buster string
   */
  getCacheBuster() {
    return `_cb=${Date.now()}`;
  }

  /**
   * Get kommune data from API
   * @param {string} kommuneId - Kommune ID
   * @returns {Promise<Object>} - Kommune data
   */
  async getKommuneData(kommuneId = null) {
    const targetKommuneId = kommuneId || this.activeKommuneId;

    if (!targetKommuneId) {
      throw new Error("Ingen aktiv kommune valgt");
    }

    try {
      const url = `${
        this.apiBaseUrl
      }/results/${targetKommuneId}?${this.getCacheBuster()}`;
      log(`Henter data for kommune ${targetKommuneId}...`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Server returnerede ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Update cache
      this.cache.kommuneData[targetKommuneId] = data;
      this.lastUpdateTimestamp = new Date();

      // Dispatch local event with the new data
      dispatchCustomEvent("kommuneDataUpdated", {
        kommuneId: targetKommuneId,
        data: data,
      });

      // If control panel, trigger Pusher event
      if (this.isControlPanel) {
        this.sendPusherEvent("client-kommune-data-updated", {
          kommuneId: targetKommuneId,
          data: data,
        });
      }

      log(`Data for kommune ${targetKommuneId} hentet`);
      return data;
    } catch (error) {
      log(`Fejl ved hentning af kommunedata: ${error.message}`, "error");
      throw error;
    }
  }

  /**
   * Get valgsted data from API
   * @param {string} kommuneId - Kommune ID
   * @param {string} valgstedId - Valgsted ID
   * @returns {Promise<Object>} - Valgsted data
   */
  async getValgstedData(kommuneId = null, valgstedId = null) {
    const targetKommuneId = kommuneId || this.activeKommuneId;
    const targetValgstedId = valgstedId || this.activeValgstedId;

    if (!targetKommuneId || !targetValgstedId) {
      throw new Error("Både kommune og valgsted skal være specificeret");
    }

    try {
      const url = `${
        this.apiBaseUrl
      }/results/${targetKommuneId}/${targetValgstedId}?${this.getCacheBuster()}`;
      log(
        `Henter data for valgsted ${targetValgstedId} i kommune ${targetKommuneId}...`
      );

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Server returnerede ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Update cache
      if (!this.cache.valgstedData[targetKommuneId]) {
        this.cache.valgstedData[targetKommuneId] = {};
      }
      this.cache.valgstedData[targetKommuneId][targetValgstedId] = data;
      this.lastUpdateTimestamp = new Date();

      // Dispatch local event with the new data
      dispatchCustomEvent("valgstedDataUpdated", {
        kommuneId: targetKommuneId,
        valgstedId: targetValgstedId,
        data: data,
      });

      // If control panel, trigger Pusher event
      if (this.isControlPanel) {
        this.sendPusherEvent("client-valgsted-data-updated", {
          kommuneId: targetKommuneId,
          valgstedId: targetValgstedId,
          data: data,
        });
      }

      log(
        `Data for valgsted ${targetValgstedId} i kommune ${targetKommuneId} hentet`
      );
      return data;
    } catch (error) {
      log(`Fejl ved hentning af valgstedsdata: ${error.message}`, "error");
      throw error;
    }
  }

  /**
   * Get kandidat data from API
   * @param {string} kommuneId - Kommune ID
   * @returns {Promise<Object>} - Kandidat data
   */
  async getKandidatData(kommuneId = null) {
    const targetKommuneId = kommuneId || this.activeKommuneId;

    if (!targetKommuneId) {
      throw new Error("Ingen aktiv kommune valgt");
    }

    try {
      const url = `${
        this.apiBaseUrl
      }/areastatus/${targetKommuneId}?${this.getCacheBuster()}`;
      log(`Henter kandidatdata for kommune ${targetKommuneId}...`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Server returnerede ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Update cache
      this.cache.kandidatData[targetKommuneId] = data;
      this.lastUpdateTimestamp = new Date();

      // Dispatch local event with the new data
      dispatchCustomEvent("kandidatDataUpdated", {
        kommuneId: targetKommuneId,
        data: data,
      });

      // If control panel, trigger Pusher event
      if (this.isControlPanel) {
        this.sendPusherEvent("client-kandidat-data-updated", {
          kommuneId: targetKommuneId,
          data: data,
        });
      }

      log(`Kandidatdata for kommune ${targetKommuneId} hentet`);
      return data;
    } catch (error) {
      log(`Fejl ved hentning af kandidatdata: ${error.message}`, "error");
      throw error;
    }
  }

  /**
   * Send template change via Pusher
   * @param {string} templateName - Template name
   */
  sendTemplateChange(templateName) {
    if (!this.isControlPanel) return;

    this.sendPusherEvent("client-template-changed", {
      template: templateName,
    });

    log(`Template ændring til ${templateName} sendt via Pusher`);
  }

  /**
   * Send transition command via Pusher
   * @param {string} type - Transition type
   * @param {string} template - Template name
   * @param {Object} params - Parameters
   */
  sendTransitionCommand(type, template, params) {
    if (!this.isControlPanel) return;

    this.sendPusherEvent("client-transition-executed", {
      type: type,
      template: template,
      params: params,
    });

    log(`Transitions-kommando ${type} sendt via Pusher`);
  }

  /**
   * Get cached kommune data if available
   * @param {string} kommuneId - Kommune ID
   * @returns {Object|null} - Kommune data or null if not cached
   */
  getCachedKommuneData(kommuneId = null) {
    const targetKommuneId = kommuneId || this.activeKommuneId;
    return this.cache.kommuneData[targetKommuneId] || null;
  }

  /**
   * Get cached valgsted data if available
   * @param {string} kommuneId - Kommune ID
   * @param {string} valgstedId - Valgsted ID
   * @returns {Object|null} - Valgsted data or null if not cached
   */
  getCachedValgstedData(kommuneId = null, valgstedId = null) {
    const targetKommuneId = kommuneId || this.activeKommuneId;
    const targetValgstedId = valgstedId || this.activeValgstedId;

    if (!this.cache.valgstedData[targetKommuneId]) {
      return null;
    }

    return this.cache.valgstedData[targetKommuneId][targetValgstedId] || null;
  }

  /**
   * Get cached kandidat data if available
   * @param {string} kommuneId - Kommune ID
   * @returns {Object|null} - Kandidat data or null if not cached
   */
  getCachedKandidatData(kommuneId = null) {
    const targetKommuneId = kommuneId || this.activeKommuneId;
    return this.cache.kandidatData[targetKommuneId] || null;
  }

  /**
   * Get timestamp of last data update
   * @returns {Date|null} - Timestamp or null if no updates yet
   */
  getLastUpdateTimestamp() {
    return this.lastUpdateTimestamp;
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.cache = {
      kommuneData: {},
      valgstedData: {},
      kandidatData: {},
    };
    log("Cache ryddet");
  }
}
