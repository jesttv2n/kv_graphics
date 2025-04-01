# KV Broadcast System

A comprehensive real-time election visualization system designed for TV broadcasts and digital displays. This project provides a flexible framework for displaying Danish municipal election results, candidate information, and polling station data with professional broadcast-quality visuals.

## Features

- **Real-time Data Visualization**: Display and update election results with smooth transitions and animations
- **Multiple Visualization Templates**:
  - **Election Results**: Display overall election results with party breakdowns
  - **Elected Candidates**: Show elected candidates with party affiliations and vote counts
  - **Polling Station Results**: Display detailed results for specific polling stations
- **Dual Display System**: Preview and Program (PGM) windows for professional broadcast workflow
- **Transition Effects**: Cut, Fade, Push, and Wipe transitions between templates
- **Remote Control**: Control multiple displays from a central control panel via Pusher
- **Auto-Update**: Configurable automatic data refresh from API endpoints
- **Responsive Design**: Works across different display sizes and resolutions

## System Architecture

The system is built with a modular architecture consisting of:

1. **Control Panel**: Web interface for operators to manage content and transitions
2. **Display Mode**: Full-screen output for broadcast or public display
3. **Templates**: Reusable visualization layouts for different data types
4. **Data Service**: Handles API communication and data management
5. **Transition Manager**: Controls transitions between templates

## Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (vanilla)
- **Real-time Communication**: Pusher
- **Visualization**: Custom SVG and CSS-based visualizations
- **API Integration**: Fetch API for data retrieval
- **Responsive Design**: CSS Grid and Flexbox

## Directory Structure

```
kv-broadcast/
├── index.html            # Main application entry point
├── display.html          # Standalone display viewer
├── scaled-display-viewer.html  # Internal viewer for scaled content
├── /css/
│   ├── main.css          # Global styles
│   ├── controls.css      # Control panel styles
│   └── visualizations.css # Template-specific styles
├── /js/
│   ├── main.js           # Main application logic
│   ├── data-service.js   # Data fetching and management
│   ├── preview-manager.js # Preview window management
│   ├── program-manager.js # Program window management
│   ├── transition-manager.js # Handles transition effects
│   ├── templates/        # Template controllers
│   │   ├── results.js    # Results visualization logic
│   │   ├── candidates.js # Candidates visualization logic
│   │   └── stations.js   # Polling stations visualization logic
│   └── utils/            # Helper functions
│       ├── common.js     # Common utility functions
│       ├── municipality-data.js # Municipality definitions
│       ├── polling-station-data.js # Polling station definitions
│       ├── party-colors.js # Party color mapping
│       └── timestamp-utils.js # Timestamp formatting utilities
├── /views/               # Template HTML files
│   ├── results.html      # Election results template
│   ├── candidates.html   # Candidates template
│   └── stations.html     # Polling stations template
└── /assets/              # Media resources (backgrounds, icons, etc.)
```

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge recommended)
- Web server (local or remote)
- Pusher account for multi-display setups (optional)

### Installation

1. Clone the repository to your web server:

   ```
   git clone https://github.com/yourusername/kv-broadcast.git
   ```

2. Configure Pusher (optional):

   - Create a Pusher account at [pusher.com](https://pusher.com)
   - Create a new app in the Pusher dashboard
   - Copy your app key and cluster
   - Update the Pusher configuration in `js/data-service.js`

3. Open `index.html` in your browser to start the control panel

### Running the System

#### Control Panel Mode

- Access `index.html` to open the control panel
- Configure data sources and template settings
- Use transition buttons to send content to program output

#### Display Mode

- Access `index.html?mode=display` to open the display mode
- For dedicated displays, you can also use `display.html`
- Enter the Pusher key and cluster if prompted (or add as URL parameters)

### Multi-Display Setup

For a complete broadcast setup:

1. Run the control panel on the operator's machine
2. Run display windows on each output device (preview monitors, program feed)
3. Configure all displays with the same Pusher credentials

## Data Model

### Municipality and Polling Station Data

The system includes predefined data for Danish municipalities and polling stations:

- Municipalities are defined in `js/utils/municipality-data.js`
- Polling stations are defined in `js/utils/polling-station-data.js`
- Party colors are defined in `js/utils/party-colors.js`

### API Integration

The system is configured to work with the Danish municipal election API:

- Base API URL: `https://election-api.services.tv2.dk/kv/kv21`
- API endpoints:
  - `/results/{kommuneId}` - Municipality results
  - `/results/{kommuneId}/{valgstedId}` - Polling station results
  - `/areastatus/{kommuneId}` - Candidate election status

## Key Components

### Data Service

The `DataService` class in `js/data-service.js` handles all API communication and data management:

- Fetches data from the election API
- Manages caching of results
- Integrates with Pusher for real-time updates
- Provides methods for setting active municipality and polling station

### Template Managers

Template managers handle the visualization logic for each template type:

- `ResultsTemplate`: Displays overall election results with party breakdowns
- `CandidatesTemplate`: Shows elected candidates with party affiliations
- `StationsTemplate`: Displays detailed results for specific polling stations

### Preview and Program Managers

These managers handle the preview and program windows:

- `PreviewManager`: Handles the preview display
- `ProgramManager`: Handles the program (on-air) display
- Both use the `scaled-display-viewer.html` for consistent rendering

### Transition Manager

The `TransitionManager` handles transitions between preview and program:

- Supports Cut, Fade, Push, and Wipe transitions
- Sends transition commands via Pusher for remote control

## Customization

### Styling

- Edit `css/main.css` for global styles
- Edit `css/controls.css` for control panel styles
- Edit `css/visualizations.css` for template styles

### Templates

Customize existing templates or create new ones:

1. Create a new HTML file in the `views/` directory
2. Create a corresponding JavaScript controller in `js/templates/`
3. Register the template in `js/main.js`

### Party Colors

Update party colors in `js/utils/party-colors.js`:

```javascript
const partiFarver = {
  A: "#e4002b", // Socialdemokratiet
  B: "#0085c7", // Radikale Venstre
  C: "#00a95c", // Konservative
  // Add or update parties as needed
};
```

## Usage Examples

### Basic Operation

1. Select a municipality from the dropdown
2. Choose the desired template (Results, Candidates, or Stations)
3. For station template, select a specific polling station
4. Click "Refresh Data" to load the latest information
5. Preview the content in the Preview window
6. Use transition buttons (CUT, FADE, etc.) to send content to Program

## Troubleshooting

### Common Issues

- **Display not receiving updates**: Verify Pusher connection status and credentials
- **Templates not loading**: Check browser console for JavaScript errors
- **Data not updating**: Verify API endpoints and network connectivity
- **Slow performance**: Reduce animation complexity or increase update interval

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Uses election data from TV2's election API
- Icons and design elements inspired by modern broadcast graphics

---

## For AI Understanding

### Key Concepts

- **Templates**: The system uses three main visualization templates (Results, Candidates, Stations)
- **Dual Display Model**: The system follows a broadcast workflow with preview and program outputs
- **Real-time Updates**: Uses Pusher for real-time communication between control and display instances
- **Responsive Scaling**: Uses the scaled-display-viewer to maintain 16:9 aspect ratio at any size

### Code Structure

- **Event-Driven Architecture**: The system uses custom events to communicate between components
- **Service-Based Design**: Functionality is separated into services (data, preview, program, transition)
- **Template Pattern**: Each visualization type has its own template manager and HTML file

### Data Flow

1. User selects a municipality and template in the control panel
2. DataService fetches data from the API
3. Preview window displays the visualization
4. User triggers a transition to send content to program
5. Transition events are sent via Pusher to all connected displays

### Customization Points

- Template HTML and CSS in `/views` and `css/visualizations.css`
- Party colors in `js/utils/party-colors.js`
- API endpoints in `js/data-service.js`
- Transition effects in `js/transition-manager.js`
