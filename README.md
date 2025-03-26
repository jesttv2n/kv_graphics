# KV Graphics - Election Visualization System

A comprehensive real-time election graphics and visualization system designed for TV broadcasts and digital displays. This project provides a flexible framework for displaying election results, candidate information, and polling station data with professional broadcast-quality visuals.

## Features

- **Real-time Data Visualization**: Display and update election results with smooth transitions and animations
- **Multiple Visualization Templates**:
  - Election Results: Display overall election results with party breakdowns
  - Elected Candidates: Show elected candidates with party affiliations and vote counts
  - Polling Station Results: Display detailed results for specific polling stations
- **Dual Display System**: Preview and Program (PGM) windows for professional broadcast workflow
- **Transition Effects**: Cut, Fade, Push, and Wipe transitions between templates
- **Remote Control**: Control multiple displays from a central control panel via Pusher
- **Auto-Update**: Configurable automatic data refresh from API endpoints
- **CasparCG Integration**: Optional integration with the CasparCG broadcast graphics system
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

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge recommended)
- Web server (local or remote)
- Pusher account for multi-display setups (optional)

### Installation

1. Clone the repository to your web server:

   ```
   git clone https://github.com/your-org/kv-graphics.git
   ```

2. Configure Pusher (optional):

   - Create a Pusher account at [pusher.com](https://pusher.com)
   - Create a new app in the Pusher dashboard
   - Copy your app key and cluster

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

## Data Configuration

The system is pre-configured to work with the Danish municipal election API, but can be adapted for other data sources:

- The base API URL can be configured in `js/data-service.js`
- Data mappings can be adjusted in the template JavaScript files

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

## Directory Structure

```
kv-graphics/
├── css/                   # Stylesheets
│   ├── main.css           # Global styles
│   ├── controls.css       # Control panel styles
│   └── visualizations.css # Template styles
├── js/                    # JavaScript files
│   ├── data-service.js    # Data management and API communication
│   ├── main.js            # Main application logic
│   ├── preview-manager.js # Preview window management
│   ├── program-manager.js # Program window management
│   ├── transition-manager.js # Transition effects
│   ├── templates/         # Template controllers
│   └── utils/             # Utility functions
├── views/                 # Template HTML files
│   ├── results.html       # Election results template
│   ├── candidates.html    # Candidates template
│   └── stations.html      # Polling stations template
└── index.html             # Main application entry point
```

## Usage Examples

### Basic Operation

1. Select a municipality from the dropdown
2. Choose the desired template (Results, Candidates, or Stations)
3. For station template, select a specific polling station
4. Click "Refresh Data" to load the latest information
5. Preview the content in the Preview window
6. Use transition buttons (CUT, FADE, etc.) to send content to Program

### CasparCG Integration

For integration with CasparCG:

1. Configure CasparCG server settings in the control panel
2. Select the desired template and data
3. Click "Send to CasparCG" to send the template to the CasparCG server

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Uses election data from TV2's election API
- Icons and design elements inspired by modern broadcast graphics
- Special thanks to all contributors and testers

---

## Troubleshooting

### Common Issues

- **Display not receiving updates**: Verify Pusher connection status and credentials
- **Templates not loading**: Check browser console for JavaScript errors
- **Data not updating**: Verify API endpoints and network connectivity
- **Slow performance**: Reduce animation complexity or increase update interval

### Support

For support, please open an issue on the GitHub repository or contact the project maintainers.
