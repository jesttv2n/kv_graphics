# KV25 API Implementeringsplan

## Overordnet analyse

Det nye API har en struktur, der ligner den ældre KV21-API, men der er flere forskelle i endpoint-formatet. Primært:

1. Basisurl er ændret til: `https://kv25.tv2reg.digital/api/`
2. API-versionering er nu mere konsekvent (`v1` og `v2`)
3. Endepunkterne bruger nu `valg-key` som parameter fremfor `valg-id` i mange tilfælde
4. Flere endepunkter tillader extension parameter for forskellige output-formater (fx JSON, XML)

## Prioriterede opgaver

### Fase 1: Grundlæggende konfiguration

1. **Opret ny dataservice konfiguration**

   - Opret en ny `kv25-data-service.js` baseret på den eksisterende `data-service.js`
   - Opdater `apiBaseUrl` til `https://kv25.tv2reg.digital/api/`
   - Implementer versionshåndtering (`v1` eller `v2` afhængigt af endpoint)

2. **Opret konstanter for valg-nøgle**

   - Definér `VALG_KEY = "kv2021"` (bruger 2021-data indtil 2025-data er tilgængelige)
   - Denne vil erstatte de nuværende numeriske valg-id'er

3. **Implementer fejlhåndtering for nye API-respons typer**
   - Sikr at API-fejl håndteres korrekt
   - Implementer fejl-logging specifikt for det nye API

### Fase 2: Implementer kerneendpoints

4. **Kommunedata**

   - Opdater `getKommuneData`-metoden til at bruge det nye endepunkt:
     - `v2/valg/{valg-key}/resultat/kommune/{kommune-id}`
   - Test med eksisterende kommuneidsystem

5. **Valgsteddata**

   - Opdater `getValgstedData`-metoden:
     - `v2/valg/{valg-key}/resultat/valgsted/{valgsted-id}`
   - Sikr at henvisningerne mellem kommuner og valgsteder fortsat fungerer

6. **Kandidatdata**
   - Opdater `getKandidatData`-metoden:
     - `v2/valg/{valg-key}/elected` for generelle resultater
     - Brug `area` og `areaId` parametre for specifikke områder

### Fase 3: Implementer understøttende endpoints

7. **Kommuneliste**

   - Opdater listKommuner:
     - `v2/valg/{valg-key}/kommune`

8. **Valgstedliste**

   - Opdater for at hente valgsteder for en kommune:
     - `v2/valg/{valg-key}/kommune/{kommune-key}/valgsted`

9. **Partiliste**
   - Opdater for at hente partier:
     - `v2/valg/{valg-key}/parti`

### Fase 4: Integration med eksisterende komponenter

10. **Opdater visualiseringsmanagere**

    - Justér ResultsTemplate, CandidatesTemplate og StationsTemplate
    - Sikr at de korrekt håndterer det nye dataformat

11. **Test integrationspunkter**

    - Verificer at dataflowet fungerer korrekt gennem hele applikationen
    - Sikr at Pusher-integration fungerer med det nye API-format

12. **Implementer caching-strategi**
    - Justér caching-struktur hvis der er ændringer i API-responsformatet

### Fase 5: Udvidede funktioner

13. **Implementer yderligere endpoints efter behov**

    - Borgmesterdata: `v2/valg/{valg-key}/borgmester`
    - Prognoser: `v2/valg/{valg-key}/prognose/land/{land-id}/parti`
    - Blokdata: `v2/valg/{valg-key}/resultat/blok`

14. **Implementer mockdata for det nye API**

    - Opdater `mock-data.js` til at have samme format som det nye API

15. **Tilføj eventuel ny funktionalitet**
    - Undersøg om nye endpoints tilbyder funktionalitet, som vi bør udnytte

## Testplan

1. **Enhedstest**

   - Test hver API-metode isoleret for at sikre korrekt dataoverførsel

2. **Integrationstest**

   - Test sammenhængen mellem forskellige endpoints
   - Sikr at komplekse datahentningsflows fungerer korrekt

3. **End-to-end test**

   - Kør systemet med alle templates
   - Verificer at data vises korrekt gennem hele flowet
   - Test med realistiske scenarier

4. **Fallback-test**
   - Test at systemet kan falde tilbage til mock-data hvis API er utilgængeligt

## Implementeringsrækkefølge

Jeg anbefaler at implementere i følgende rækkefølge:

1. Grundlæggende konfiguration (Fase 1)
2. Implementer kerneendpoints (Fase 2) - Start med resultat-endpointet
3. Implementer understøttende endpoints (Fase 3) - Kommuner og valgsteder først
4. Integrer med eksisterende komponenter (Fase 4)
5. Tilføj udvidede funktioner (Fase 5)

Efter hver fase bør der udføres tests for at sikre, at den implementerede funktionalitet fungerer korrekt.

## Tekniske overvejelser

- Overvej at implementere en adapter-klasse, der kan konvertere mellem det gamle og nye API-format for at minimere ændringer i den eksisterende kodebase
- Implementer feature flags, der tillader at skifte mellem gammelt og nyt API under implementeringen
- Dokumentér alle API-ændringer grundigt for at lette fremtidig vedligeholdelse

## Tidsestimat

- Fase 1: 1-2 dage
- Fase 2: 2-3 dage
- Fase 3: 1-2 dage
- Fase 4: 2-3 dage
- Fase 5: 2-3 dage
- Test: Løbende, men 2-3 dage dedikeret til omfattende test

Samlet estimat: ~10-16 arbejdsdage afhængig af kompleksiteten af de nødvendige tilpasninger i den eksisterende kodebase.

## Vigtige endepunkter til kv25-api

Baseret på WADL-dokumentationen er her de vigtigste endepunkter, vi skal implementere:

### Kommunedata

- `v2/valg/{valg-key}/resultat/kommune/{kommune-id}`
- `v2/valg/{valg-key}/kommune`

### Valgsteddata

- `v2/valg/{valg-key}/resultat/valgsted/{valgsted-id}`
- `v2/valg/{valg-key}/kommune/{kommune-key}/valgsted`

### Kandidatdata

- `v2/valg/{valg-key}/elected`
- `v2/valg/{valg-key}/resultat/kommune/{kommune-id}/kandidat`

### Partidata

- `v2/valg/{valg-key}/parti`
- `v2/valg/{valg-key}/resultat/kommune/{kommune-id}/parti`

## Status

- [ ] Fase 1: Grundlæggende konfiguration
  - [x] Opret ny dataservice konfiguration
  - [x] Opret konstanter for valg-nøgle
  - [ ] Implementer fejlhåndtering for nye API-respons typer
- [ ] Fase 2: Implementer kerneendpoints
  - [ ] Opdater getKommuneData
  - [ ] Opdater getValgstedData
  - [ ] Opdater getKandidatData
- [ ] Fase 3: Implementer understøttende endpoints
  - [ ] Opdater listKommuner
  - [ ] Opdater valgstedliste
  - [ ] Opdater partiliste
- [ ] Fase 4: Integration med eksisterende komponenter
  - [ ] Opdater ResultsTemplate
  - [ ] Opdater CandidatesTemplate
  - [ ] Opdater StationsTemplate
  - [ ] Test integrationspunkter
  - [ ] Opdater caching
- [ ] Fase 5: Udvidede funktioner
  - [ ] Implementer yderligere endpoints efter behov
  - [ ] Opdater mockdata
  - [ ] Tilføj eventuel ny funktionalitet
