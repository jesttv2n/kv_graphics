/**
 * Mock Data Generator for KV Broadcast System
 * Creates realistic mock data when API endpoints are unavailable
 *
 * This script should be included in all three template HTML files
 */

/**
 * Mock data generator with configurable parameters
 */
class MockDataGenerator {
  constructor() {
    // Danish party letters and names
    this.parties = [
      { letter: "A", name: "Socialdemokratiet", color: "#e4002b" },
      { letter: "B", name: "Radikale Venstre", color: "#0085c7" },
      { letter: "C", name: "Det Konservative Folkeparti", color: "#00a95c" },
      { letter: "F", name: "SF - Socialistisk Folkeparti", color: "#d71440" },
      { letter: "I", name: "Liberal Alliance", color: "#ffc20e" },
      { letter: "K", name: "Kristendemokraterne", color: "#004b87" },
      { letter: "O", name: "Dansk Folkeparti", color: "#e3006e" },
      { letter: "V", name: "Venstre", color: "#1e1e1e" },
      { letter: "Ø", name: "Enhedslisten", color: "#c00" },
      { letter: "Å", name: "Alternativet", color: "#6a0dad" },
      { letter: "D", name: "Nye Borgerlige", color: "#f58220" },
      { letter: "M", name: "Moderaterne", color: "#522d80" },
      { letter: "L", name: "Lokalliste", color: "#2cac2a" },
    ];

    // Common Danish names for candidates
    this.firstNames = [
      "Anders",
      "Lars",
      "Peter",
      "Søren",
      "Jens",
      "Mette",
      "Helle",
      "Pia",
      "Lise",
      "Karen",
      "Thomas",
      "Henrik",
      "Jesper",
      "Morten",
      "Michael",
      "Christina",
      "Line",
      "Maria",
      "Louise",
      "Tina",
      "Nikolaj",
      "Jakob",
      "Pernille",
      "Laura",
      "Emma",
      "Frederik",
      "Mikkel",
      "Rasmus",
      "Sofie",
      "Camilla",
    ];

    this.lastNames = [
      "Nielsen",
      "Jensen",
      "Hansen",
      "Pedersen",
      "Andersen",
      "Christensen",
      "Larsen",
      "Sørensen",
      "Rasmussen",
      "Jørgensen",
      "Petersen",
      "Madsen",
      "Kristensen",
      "Olsen",
      "Thomsen",
      "Poulsen",
      "Johansen",
      "Knudsen",
      "Mortensen",
      "Møller",
      "Jacobsen",
      "Kjær",
      "Holm",
      "Schmidt",
      "Lund",
    ];

    this.kommuneNames = {
      810: "Brønderslev",
      813: "Frederikshavn",
      820: "Vesthimmerlands",
      825: "Læsø",
      840: "Rebild",
      846: "Mariagerfjord",
      849: "Jammerbugt",
      851: "Aalborg",
      860: "Hjørring",
    };
  }

  /**
   * Generate a random number between min and max (inclusive)
   */
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate a random float between min and max with specified decimal places
   */
  randomFloat(min, max, decimals = 1) {
    const value = Math.random() * (max - min) + min;
    return parseFloat(value.toFixed(decimals));
  }

  /**
   * Generate a random Danish name
   */
  generateName() {
    const firstName =
      this.firstNames[this.randomInt(0, this.firstNames.length - 1)];
    const lastName =
      this.lastNames[this.randomInt(0, this.lastNames.length - 1)];
    return `${firstName} ${lastName}`;
  }

  /**
   * Generate a specific number of parties with votes and percentages
   * Returns a balanced set of data that adds up to 100%
   */
  generateParties(count = 10, totalVotes = 10000, includePrevious = true) {
    // Ensure we don't exceed available parties
    count = Math.min(count, this.parties.length);

    // Select random subset of parties if not using all
    const selectedParties = [...this.parties]
      .sort(() => 0.5 - Math.random())
      .slice(0, count);

    // Generate random percentage allocations that add up to 100
    let percentages = [];

    // Generate initial random values
    for (let i = 0; i < count; i++) {
      percentages.push(this.randomInt(1, 30));
    }

    // Normalize to sum to 100%
    const sum = percentages.reduce((a, b) => a + b, 0);
    percentages = percentages.map((p) => (p / sum) * 100);

    // Calculate votes based on percentages
    const parties = selectedParties.map((party, index) => {
      const percentage = percentages[index];
      const votes = Math.round((percentage / 100) * totalVotes);

      // Generate data for previous election if includePrevious is true
      let votesPercentageChange = 0;
      let seatsChange = 0;

      if (includePrevious) {
        votesPercentageChange = this.randomFloat(-5.0, 5.0, 1);
        seatsChange = this.randomInt(-2, 2);
      }

      // Calculate seats based on percentage (rough approximation)
      const seats = Math.max(0, Math.round(percentage / 3));

      return {
        letter: party.letter,
        abbreviation: party.letter,
        name: party.name,
        votes: votes,
        votesPercentage: parseFloat(percentage.toFixed(1)),
        votesPercentageChange: votesPercentageChange,
        seats: seats,
        seatsChange: seatsChange,
      };
    });

    return parties;
  }

  /**
   * Generate candidates for each party
   */
  generateCandidates(parties, totalCandidates = 31) {
    // Distribute candidates proportionally to party percentages
    let remaining = totalCandidates;
    const electedParties = [];

    for (let i = 0; i < parties.length && remaining > 0; i++) {
      const party = parties[i];
      // Calculate candidates based on vote percentage
      let candidateCount = Math.max(
        1,
        Math.round((party.votesPercentage / 100) * totalCandidates)
      );

      // Ensure we don't exceed remaining candidates
      candidateCount = Math.min(candidateCount, remaining);
      remaining -= candidateCount;

      // Generate candidate list
      const candidates = [];
      for (let j = 0; j < candidateCount; j++) {
        const name = this.generateName();
        const isMayor = i === 0 && j === 0; // Make the first candidate of first party the mayor

        candidates.push({
          name: name,
          votes: this.randomInt(
            party.votes / (candidateCount * 2),
            party.votes / candidateCount
          ),
          partyLetter: party.letter,
          partyName: party.name,
          age: this.randomInt(28, 68),
          isMayor: isMayor,
          externalId: `${party.letter}-${j + 1}`,
        });
      }

      // Sort candidates by votes
      candidates.sort((a, b) => b.votes - a.votes);

      electedParties.push({
        letter: party.letter,
        name: party.name,
        candidates: candidates,
      });
    }

    // Make sure the first party has the mayor
    if (electedParties.length > 0 && electedParties[0].candidates.length > 0) {
      electedParties[0].candidates[0].isMayor = true;
    }

    return electedParties;
  }

  /**
   * Generate mock commune (kommune) data
   */
  generateKommuneData(kommuneId = "860") {
    const totalVotes = this.randomInt(25000, 45000);
    const eligibleVoters = this.randomInt(totalVotes, totalVotes * 1.5);
    const votesPercentage = (totalVotes / eligibleVoters) * 100;
    const electionProgress = this.randomInt(80, 100);

    const parties = this.generateParties(this.randomInt(8, 13), totalVotes);
    const totalSeats = parties.reduce((sum, party) => sum + party.seats, 0);

    return {
      lastUpdated: new Date().toISOString(),
      result: {
        name: this.kommuneNames[kommuneId] || `Kommune ${kommuneId}`,
        electionProgress: electionProgress,
        votesGiven: totalVotes,
        eligibleVoters: eligibleVoters,
        votesPercentage: parseFloat(votesPercentage.toFixed(1)),
        totalSeats: totalSeats,
      },
      parties: parties,
    };
  }

  /**
   * Generate mock polling station (valgsted) data
   */
  generateValgstedData(
    kommuneId = "860",
    valgstedId = "86001",
    kommuneData = null
  ) {
    // If kommuneData is not provided, generate it
    const baseKommuneData = kommuneData || this.generateKommuneData(kommuneId);

    // Calculate votes as a subset of kommune votes
    const totalVotes = this.randomInt(1000, 5000);
    const eligibleVoters = this.randomInt(totalVotes, totalVotes * 1.4);
    const votesPercentage = (totalVotes / eligibleVoters) * 100;

    // Get valgsted name using the polling station data from your system
    let valgstedName = "Valgsted";
    if (typeof getValgstedNavn === "function") {
      valgstedName = getValgstedNavn(kommuneId, valgstedId);
    }

    // Generate parties with some variation from kommune level
    const parties = baseKommuneData.parties.map((kommuneParty) => {
      // Create a variation from the kommune-level data
      const variation = this.randomFloat(-5.0, 5.0, 1);
      let percentage = kommuneParty.votesPercentage + variation;

      // Ensure percentage is positive and adjust if needed
      percentage = Math.max(0.1, percentage);

      // Calculate votes for this station based on percentage
      const votes = Math.round((percentage / 100) * totalVotes);

      return {
        letter: kommuneParty.letter,
        abbreviation: kommuneParty.letter,
        name: kommuneParty.name,
        votes: votes,
        votesGiven: votes,
        votesPercentage: parseFloat(percentage.toFixed(1)),
      };
    });

    // Normalize percentages to sum to 100%
    const sum = parties.reduce(
      (total, party) => total + party.votesPercentage,
      0
    );
    parties.forEach((party) => {
      party.votesPercentage = parseFloat(
        ((party.votesPercentage / sum) * 100).toFixed(1)
      );
    });

    return {
      lastUpdated: new Date().toISOString(),
      result: {
        name: valgstedName,
        electionProgress: baseKommuneData.result.electionProgress,
        votesGiven: totalVotes,
        eligibleVoters: eligibleVoters,
        votesPercentage: parseFloat(votesPercentage.toFixed(1)),
        electionPoints: [{ id: valgstedId, name: valgstedName }],
      },
      parties: parties,
    };
  }

  /**
   * Generate mock candidate data
   */
  generateKandidatData(kommuneId = "860", kommuneData = null) {
    // If kommuneData is not provided, generate it
    const baseKommuneData = kommuneData || this.generateKommuneData(kommuneId);

    // Generate candidates
    const elected = this.generateCandidates(baseKommuneData.parties);

    // Find mayor
    let mayor = null;
    for (const party of elected) {
      for (const candidate of party.candidates) {
        if (candidate.isMayor) {
          mayor = candidate;
          break;
        }
      }
      if (mayor) break;
    }

    return {
      lastUpdated: new Date().toISOString(),
      name: baseKommuneData.result.name,
      councilSeats: baseKommuneData.result.totalSeats,
      mayor: mayor,
      elected: elected,
    };
  }
}

/**
 * Mock fetch function that returns mock data when real API fails
 * This function wraps the original fetch function and falls back to mock data
 *
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise} - Promise that resolves to Response object
 */
function createMockFetch() {
  const originalFetch = window.fetch;
  const mockGenerator = new MockDataGenerator();

  window.fetch = async function (url, options) {
    // Try the original fetch first
    try {
      const response = await originalFetch(url, options);
      if (response.ok) {
        return response;
      }
      throw new Error(`Server responded with ${response.status}`);
    } catch (error) {
      console.warn(`API fetch failed: ${error.message}. Using mock data.`);

      // Generate appropriate mock data based on URL
      let mockData;

      // Extract kommuneId and valgstedId from URL
      const kommuneMatch = url.match(/results\/(\d+)(?:\/(\d+))?/);
      const kandidatMatch = url.match(/areastatus\/(\d+)/);

      if (kommuneMatch) {
        const kommuneId = kommuneMatch[1];
        const valgstedId = kommuneMatch[2];

        if (valgstedId) {
          // This is a valgsted request
          mockData = mockGenerator.generateValgstedData(kommuneId, valgstedId);
        } else {
          // This is a kommune request
          mockData = mockGenerator.generateKommuneData(kommuneId);
        }
      } else if (kandidatMatch) {
        // This is a kandidat request
        const kommuneId = kandidatMatch[1];
        mockData = mockGenerator.generateKandidatData(kommuneId);
      } else {
        // Default mock data
        mockData = mockGenerator.generateKommuneData();
      }

      // Create a mock Response object
      return new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}

// Initialize mock fetch when the script loads
createMockFetch();

/**
 * Check if we're in an iframe and notify parent that we're using mock data
 */
function notifyParentAboutMockData() {
  if (window.parent !== window) {
    try {
      window.parent.postMessage(
        {
          action: "mockDataStatus",
          status: "active",
          timestamp: new Date().toISOString(),
        },
        "*"
      );
    } catch (e) {
      console.warn("Failed to notify parent frame about mock data", e);
    }
  }
}

// Send notification after a short delay
setTimeout(notifyParentAboutMockData, 500);
