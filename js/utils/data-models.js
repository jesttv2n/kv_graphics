/**
 * Konsoliderede data modeller til KV Broadcast System
 *
 * Denne fil erstatter og konsoliderer følgende datafiler:
 * - js/utils/municipality-data.js
 * - js/utils/polling-station-data.js
 * - js/utils/party-colors.js
 */

/**************************************
 * Kommune data
 **************************************/

/**
 * Municipality definitions
 * Mapping between municipality IDs and names
 */
const kommuner = [
  { id: "810", navn: "Brønderslev" },
  { id: "813", navn: "Frederikshavn" },
  { id: "820", navn: "Vesthimmerlands" },
  { id: "825", navn: "Læsø" },
  { id: "840", navn: "Rebild" },
  { id: "846", navn: "Mariagerfjord" },
  { id: "849", navn: "Jammerbugt" },
  { id: "851", navn: "Aalborg" },
  { id: "860", navn: "Hjørring" },
];

/**
 * Get municipality name by ID
 * @param {string} id - Municipality ID
 * @returns {string} - Municipality name
 */
function getKommuneNavn(id) {
  const kommune = kommuner.find((k) => k.id === id);
  return kommune ? kommune.navn : "Ukendt kommune";
}

/**
 * Get municipality by ID
 * @param {string} id - Municipality ID
 * @returns {object|null} - Municipality object or null if not found
 */
function getKommune(id) {
  return kommuner.find((k) => k.id === id) || null;
}

/**************************************
 * Valgsted data
 **************************************/

/**
 * Polling station definitions
 * Mapping between municipality IDs, polling station IDs and names
 */
const valgsteder = {
  810: [
    { id: "81001", navn: "Agersted" },
    { id: "81002", navn: "Asaa" },
    { id: "81003", navn: "Dronninglund" },
    { id: "81004", navn: "Flauenskjold" },
    { id: "81005", navn: "Hjallerup" },
    { id: "81006", navn: "Klokkerholm" },
    { id: "81007", navn: "Brønderslev" },
  ],
  813: [
    { id: "81301", navn: "Skagen" },
    { id: "81302", navn: "Hulsig" },
    { id: "81303", navn: "Ålbæk" },
    { id: "81304", navn: "Jerup" },
    { id: "81305", navn: "Elling" },
    { id: "81306", navn: "Strandby" },
    { id: "81307", navn: "Frederikshavn Nord" },
    { id: "81308", navn: "Frederikshavn Midt" },
    { id: "81309", navn: "Frederikshavn Syd" },
    { id: "81310", navn: "Ravnshøj" },
    { id: "81311", navn: "Gærum" },
    { id: "81312", navn: "Sæby" },
    { id: "81313", navn: "Brønden" },
    { id: "81314", navn: "Dybvad" },
    { id: "81315", navn: "Hørby" },
    { id: "81316", navn: "Præstbro" },
    { id: "81317", navn: "Thorshøj" },
    { id: "81318", navn: "Understed" },
    { id: "81319", navn: "Voerså" },
    { id: "81320", navn: "Volstrup" },
    { id: "81321", navn: "Østervrå" },
    { id: "81322", navn: "Lyngså" },
  ],
  820: [
    { id: "82001", navn: "Aalestrup" },
    { id: "82002", navn: "Farsø" },
    { id: "82003", navn: "Strandby" },
    { id: "82004", navn: "Aars" },
    { id: "82005", navn: "Hvalpsund" },
    { id: "82006", navn: "Gislum-Vognsild" },
    { id: "82007", navn: "Gedsted" },
    { id: "82008", navn: "Hornum-Ulstrup" },
    { id: "82009", navn: "Vester Hornum" },
    { id: "82010", navn: "Løgstør" },
    { id: "82011", navn: "Ranum" },
    { id: "82012", navn: "Salling" },
    { id: "82013", navn: "Overlade" },
    { id: "82014", navn: "Skivum-Giver" },
  ],
  825: [],
  840: [
    { id: "84001", navn: "Støvring" },
    { id: "84002", navn: "Skørping" },
    { id: "84003", navn: "Terndrup" },
    { id: "84004", navn: "Suldrup" },
    { id: "84005", navn: "Nørager" },
    { id: "84006", navn: "Haverslev" },
    { id: "84007", navn: "Øster Hornum" },
    { id: "84008", navn: "Bælum" },
    { id: "84009", navn: "Ravnkilde" },
    { id: "84010", navn: "Blenstrup" },
    { id: "84011", navn: "Veggerby" },
  ],
  846: [
    { id: "84601", navn: "Assens" },
    { id: "84602", navn: "Mariager" },
    { id: "84603", navn: "Arden" },
    { id: "84604", navn: "Valsgård" },
    { id: "84605", navn: "Vebbestrup" },
    { id: "84606", navn: "Hadsund" },
    { id: "84607", navn: "Veddum-Skelund" },
    { id: "84608", navn: "Als" },
    { id: "84609", navn: "Hørby" },
    { id: "84610", navn: "Onsild" },
  ],
  849: [
    { id: "84901", navn: "Aabybro" },
    { id: "84902", navn: "Biersted" },
    { id: "84903", navn: "Nørhalne" },
    { id: "84904", navn: "Vedsted" },
    { id: "84905", navn: "Gjøl" },
    { id: "84906", navn: "Ingstrup" },
    { id: "84907", navn: "V. Hjermitslev" },
    { id: "84908", navn: "Brovst" },
    { id: "84909", navn: "Halvrimmen" },
    { id: "84910", navn: "Arentsminde" },
    { id: "84911", navn: "Tranum" },
    { id: "84912", navn: "Skovsgård" },
    { id: "84913", navn: "Fjerritslev" },
    { id: "84914", navn: "Thorup" },
    { id: "84915", navn: "Ørebro" },
    { id: "84916", navn: "Trekroner" },
    { id: "84917", navn: "Pandrup" },
    { id: "84918", navn: "Kaas" },
    { id: "84919", navn: "Hune" },
    { id: "84920", navn: "Saltum" },
  ],
  851: [
    { id: "85101", navn: "Gl. Lindholm Skole" },
    { id: "85102", navn: "Kulturhus PFA Kollegiet i Nørresundby" },
    { id: "85103", navn: "Løvvanghallen" },
    { id: "85104", navn: "Multihallen" },
    { id: "85105", navn: "Ved Vadumhallen" },
    { id: "85106", navn: "Sulsted Skolehal" },
    { id: "85107", navn: "Vodskov Kultur & Idrætscenter" },
    { id: "85108", navn: "HF&VUC Nord, Godsbanen" },
    { id: "85109", navn: "Vesterkærets Skole" },
    { id: "85110", navn: "Haraldslund" },
    { id: "85111", navn: "Aalborghallen" },
    { id: "85112", navn: "Skipperens Idrætshus" },
    { id: "85113", navn: "Hallen Ved Skalborggård" },
    { id: "85114", navn: "Kfum - Hallen" },
    { id: "85115", navn: "Hasseris Gymnasium" },
    { id: "85116", navn: "Frejlev Skoles Idrætshal" },
    { id: "85117", navn: "Svenstruphallen" },
    { id: "85118", navn: "Idrætshallen Østre Alle" },
    { id: "85119", navn: "Nordkraft" },
    { id: "85120", navn: "Gigantium" },
    { id: "85121", navn: "Vejgaardhallen" },
    { id: "85122", navn: "Vejgaard Østre Skole" },
    { id: "85123", navn: "Mellervangskolens Idrætshal" },
    { id: "85124", navn: "Klaruphallen" },
    { id: "85125", navn: "Gug Skole" },
    { id: "85126", navn: "Gistrup Skoles Idrætshal" },
    { id: "85127", navn: "Aalborghus Gymnasium" },
    { id: "85128", navn: "Ferslev Skolehal" },
    { id: "85129", navn: "Tornhøjskolen, Hallen" },
    { id: "85130", navn: "Vester Hassing Hallen" },
    { id: "85131", navn: "Hals Skole" },
    { id: "85132", navn: "Ulstedhallen" },
    { id: "85133", navn: "Nibe Hallen" },
    { id: "85134", navn: "Farstruphallen" },
    { id: "85135", navn: "Idrætscentret Kongerslev" },
    { id: "85136", navn: "Mou Hotel" },
    { id: "85137", navn: "Båndby - Hallen" },
  ],
  860: [
    { id: "86001", navn: "Horne" },
    { id: "86002", navn: "Hirtshals" },
    { id: "86003", navn: "Hjørring - Centrum" },
    { id: "86004", navn: "Tornby" },
    { id: "86005", navn: "Bindslev" },
    { id: "86006", navn: "Tversted" },
    { id: "86007", navn: "Taars" },
    { id: "86008", navn: "Vrejlev-Hæstrup" },
    { id: "86009", navn: "Bjergby-Mygdal" },
    { id: "86010", navn: "Skallerup" },
    { id: "86011", navn: "Hjørring - Nord" },
    { id: "86012", navn: "Hjørring - Syd" },
    { id: "86013", navn: "Hjørring - Vest" },
    { id: "86014", navn: "Vrå" },
    { id: "86015", navn: "Hundelev" },
    { id: "86016", navn: "Løkken" },
    { id: "86017", navn: "Sindal" },
    { id: "86018", navn: "Astrup" },
    { id: "86019", navn: "Tolne" },
    { id: "86020", navn: "Ugilt" },
    { id: "86021", navn: "Lendum" },
  ],
};

/**
 * Get polling station name by ID
 * @param {string} kommuneId - Municipality ID
 * @param {string} valgstedId - Polling station ID
 * @returns {string} - Polling station name
 */
function getValgstedNavn(kommuneId, valgstedId) {
  const kommuneValgsteder = valgsteder[kommuneId] || [];
  const valgsted = kommuneValgsteder.find((v) => v.id === valgstedId);
  return valgsted ? valgsted.navn : "Ukendt valgsted";
}

/**
 * Get polling station by ID
 * @param {string} kommuneId - Municipality ID
 * @param {string} valgstedId - Polling station ID
 * @returns {object|null} - Polling station object or null if not found
 */
function getValgsted(kommuneId, valgstedId) {
  const kommuneValgsteder = valgsteder[kommuneId] || [];
  return kommuneValgsteder.find((v) => v.id === valgstedId) || null;
}

/**
 * Get all polling stations for a municipality
 * @param {string} kommuneId - Municipality ID
 * @returns {Array} - List of polling stations
 */
function getValgstederForKommune(kommuneId) {
  return valgsteder[kommuneId] || [];
}

/**************************************
 * Parti farver
 **************************************/

/**
 * Party color mapping
 * Maps party letter/abbreviation to color hex codes
 */
const partiFarver = {
  A: "#e4002b", // Socialdemokratiet
  B: "#0085c7", // Radikale Venstre
  C: "#00a95c", // Konservative
  D: "#f58220", // Nye Borgerlige
  E: "#0085ca", // Klaus Riskær
  F: "#d71440", // SF
  G: "#005221", // Veganerpartiet
  I: "#ffc20e", // Liberal Alliance
  K: "#004b87", // Kristendemokraterne
  L: "#2cac2a", // Lokallisterne (generisk)
  M: "#522d80", // Moderaterne
  O: "#e3006e", // Dansk Folkeparti
  P: "#099d84", // Stram Kurs
  Q: "#7bc143", // Frie Grønne
  V: "#1e1e1e", // Venstre
  Ø: "#c00", // Enhedslisten
  Å: "#6a0dad", // Alternativet
};

// Tilføj lowercase-varianter til partiFarver
Object.keys(partiFarver).forEach(
  (k) => (partiFarver[k.toLowerCase()] = partiFarver[k])
);

/**
 * Get color for party letter
 * @param {string} bogstav - Party letter/abbreviation
 * @returns {string} - Hex color code
 */
function farve(bogstav) {
  return partiFarver[bogstav] || "#888";
}

/**************************************
 * Data transformation og utility-funktioner
 **************************************/

/**
 * Finder det parti, der har borgmesterposten
 * @param {Array} parties - Liste af partier med kandidater
 * @returns {Object|null} - Borgmesterparti eller null
 */
function findMayorParty(parties) {
  if (!parties || !Array.isArray(parties)) return null;

  for (const party of parties) {
    if (party.candidates && Array.isArray(party.candidates)) {
      const mayorCandidate = party.candidates.find((c) => c.isMayor);
      if (mayorCandidate) {
        return {
          party: party,
          mayor: mayorCandidate,
        };
      }
    }
  }

  return null;
}

/**
 * Sorterer partier efter forskellige kriterier
 * @param {Array} parties - Liste af partier
 * @param {string} sortBy - "votes" | "letter" | "seats"
 * @param {boolean} ascending - true for ascending, false for descending
 * @returns {Array} - Sorteret liste af partier
 */
function sortParties(parties, sortBy = "votes", ascending = false) {
  if (!parties || !Array.isArray(parties)) return [];

  const sortedParties = [...parties];

  // Filtrer partier uden stemmer/andel hvis påkrævet
  const filteredParties = sortedParties.filter(
    (p) => p.votesPercentage > 0 || p.votes > 0 || sortBy === "letter"
  );

  // Sortér efter specifikt kriterium
  switch (sortBy) {
    case "votes":
      filteredParties.sort((a, b) => {
        const aValue = a.votesPercentage || 0;
        const bValue = b.votesPercentage || 0;
        return ascending ? aValue - bValue : bValue - aValue;
      });
      break;
    case "seats":
      filteredParties.sort((a, b) => {
        const aValue = a.seats || 0;
        const bValue = b.seats || 0;
        return ascending ? aValue - bValue : bValue - aValue;
      });
      break;
    case "letter":
      filteredParties.sort((a, b) => {
        const aLetter = (a.letter || a.abbreviation || "").toUpperCase();
        const bLetter = (b.letter || b.abbreviation || "").toUpperCase();
        return ascending
          ? aLetter.localeCompare(bLetter)
          : bLetter.localeCompare(aLetter);
      });
      break;
  }

  return filteredParties;
}

/**
 * Find en passende tæthedskategori baseret på antal elementer
 * @param {number} count - Antal elementer
 * @param {Object} thresholds - Grænseværdier for forskellige tæthedskategorier
 * @returns {string} - Tæthedsklasse ("normal", "medium", "compact", "very-compact")
 */
function getDensityClass(
  count,
  thresholds = {
    medium: 10,
    compact: 14,
    veryCompact: 18,
  }
) {
  if (count > thresholds.veryCompact) {
    return "density-very-compact";
  } else if (count > thresholds.compact) {
    return "density-compact";
  } else if (count > thresholds.medium) {
    return "density-medium";
  }
  return "density-normal";
}

// Eksportér alle funktioner og konstanter
export {
  // Kommune data
  kommuner,
  getKommuneNavn,
  getKommune,

  // Valgsted data
  valgsteder,
  getValgstedNavn,
  getValgsted,
  getValgstederForKommune,

  // Parti farver
  partiFarver,
  farve,

  // Data transformation
  findMayorParty,
  sortParties,
  getDensityClass,
};
