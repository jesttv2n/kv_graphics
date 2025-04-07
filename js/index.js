/**
 * Central eksport module for KV Broadcast System
 * Dette modul samler alle de vigtigste komponenter og utilities
 * til nemmere import i andre filer
 */

// Importér alle utilities
import * as Utils from "./utils/utils.js";
import * as DataModels from "./utils/data-models.js";
import * as MockData from "./utils/mock-data.js";

// Importér base klasser
import TemplateManager from "./core/template-manager.js";

// Importér template managers
import ResultsTemplate from "./templates/results-template.js";
import CandidatesTemplate from "./templates/candidates-template.js";
import StationsTemplate from "./templates/stations-template.js";

// Importér manager klasser
import DataService from "./data-service.js";
import PreviewManager from "./preview-manager.js";
import ProgramManager from "./program-manager.js";
import TransitionManager from "./transition-manager.js";

// Re-export alle utilities og modeller
export {
  // Managers
  DataService,
  PreviewManager,
  ProgramManager,
  TransitionManager,

  // Utilities
  Utils,
  DataModels,
  MockData,

  // Base klasser
  TemplateManager,

  // Template Managers
  ResultsTemplate,
  CandidatesTemplate,
  StationsTemplate,
};

// Også eksportér individuelle utilities for direkte import
export * from "./utils/utils.js";
export * from "./utils/data-models.js";
export * from "./utils/mock-data.js";
