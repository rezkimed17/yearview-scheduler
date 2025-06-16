# Year Planner - Full-Year Calendar Application

A comprehensive year planner web application built with Angular frontend and Node.js backend, featuring a complete calendar view, detailed events list, and advanced event management with recurring events support.

## Features

### Core Functionality
- **Full-Year Calendar View**: Display all 12 months on a single page with responsive grid layout
- **Events List Page**: Comprehensive list view of all events with statistics and filtering
- **Professional UI**: Built with Angular Material for a clean, modern design
- **Visual Event Indicators**: Colored dots show events on calendar days
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Navigation System**: Easy switching between Calendar and Events List views

### Event Management
- **Complete CRUD Operations**: Create, read, update, and delete events from both views
- **Rich Event Details**: Title, description, dates, duration, and custom colors
- **Multi-Day Events**: Events can span multiple days with visual indicators
- **Recurring Events**: Support for daily, weekly, monthly, and yearly recurrence with custom intervals
- **Interactive Dialogs**: Material UI popups for seamless event management
- **Smart Deletion**: Proper handling of recurring event series vs individual instances

### Events List Features
- **Statistics Dashboard**: Total events count, recurring vs single events breakdown
- **Advanced Filtering**: Filter by all events, recurring only, or single events only
- **Year Navigation**: Browse events across different years
- **Event Cards**: Detailed card-based layout with event information
- **Bulk Management**: Easy access to edit/delete multiple events
- **Search and Sort**: Visual organization of events with color coding

### Technical Features
- **File-Based Storage**: Simple JSON storage system (no database required)
- **RESTful API**: Clean Node.js backend with Express
- **Real-Time Updates**: Both views refresh automatically after changes
- **Error Handling**: Comprehensive error handling and user feedback
- **Type Safety**: Full TypeScript implementation
- **Routing System**: Angular routing for seamless navigation

## Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone or download the project**
   ```bash
   cd yearview-scheduler
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install frontend and backend dependencies**
   ```bash
   npm run setup
   ```

### Running the Application

1. **Start both frontend and backend simultaneously**
   ```bash
   npm start
   ```
   This will start:
   - Backend API server on `http://localhost:3000`
   - Frontend development server on `http://localhost:4200`

2. **Or run them separately**
   ```bash
   # Terminal 1 - Backend
   npm run start:backend
   
   # Terminal 2 - Frontend
   npm run start:frontend
   ```

3. **Open your browser**
   Navigate to `http://localhost:4200` to use the application.

## How to Use

### Navigation
The application has two main views accessible via the top navigation bar:
- **Calendar**: Full-year calendar grid view
- **Events List**: Comprehensive list view with statistics and filtering

### Calendar View

#### Viewing the Calendar
- The main page displays a full-year calendar with all 12 months
- Days with events show colored dots (up to 3 visible, with a "+" indicator for more)
- Use the navigation arrows to move between years
- Click "Today" to jump to the current year

#### Managing Events from Calendar
1. **Creating Events**: Click the "New Event" button or click on any day
2. **Viewing Events**: Click on any day that has events (colored dots)
3. **Editing Events**: Click on a day with events, select event, then click "Edit"
4. **Deleting Events**: Click on a day with events, select event, then click "Delete"

### Events List View

#### Statistics Dashboard
- **Total Events**: Shows the complete count of events for the selected year
- **Recurring Events**: Count of recurring event series
- **Single Events**: Count of one-time events
- Color-coded statistics cards with hover effects

#### Filtering Events
- **All Events**: View complete list (default)
- **Recurring Only**: Show only recurring events
- **Single Only**: Show only one-time events
- Interactive filter chips with visual feedback

#### Managing Events from List
1. **Year Navigation**: Use arrow buttons or "Today" to change years
2. **Creating Events**: Click "New Event" button in toolbar
3. **Editing Events**: Click "Edit" button on event card or use menu
4. **Deleting Events**: Click "Delete" button on event card or use menu
5. **Event Details**: Each card shows title, dates, description, duration, and recurring info

### Event Creation and Editing

#### Basic Event Information
- **Title** (required): Name of the event
- **Description** (optional): Additional details
- **Start Date**: When the event begins
- **End Date**: When the event ends (can be same day)
- **Color**: Choose from predefined color options

#### Recurring Events
Set up events that repeat automatically:
- **Daily**: Every day or every N days
- **Weekly**: Every week or every N weeks  
- **Monthly**: Every month or every N months
- **Yearly**: Every year or every N years
- **Custom Intervals**: Set specific repeat intervals (e.g., every 3 weeks)

#### Important Notes
- Recurring event instances cannot be edited individually
- To modify a recurring event, edit the original parent event
- Deleting a recurring event removes the entire series
- Multi-day events show duration information in the events list

## Architecture

### Frontend (Angular)
```
frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── year-calendar/       # Main calendar component
│   │   │   ├── events-list/         # Events list page component
│   │   │   └── event-dialog/        # Event management dialog
│   │   ├── models/
│   │   │   └── event.model.ts       # Event type definitions
│   │   ├── services/
│   │   │   └── event.service.ts     # API communication service
│   │   ├── app.component.*          # Root component with navigation
│   │   ├── app.routes.ts            # Routing configuration
│   │   └── app.config.ts            # App configuration
│   ├── styles.scss                  # Global styles
│   └── index.html                   # Main HTML file
```

### Backend (Node.js)
```
backend/
├── server.js                       # Main server file with API endpoints
├── package.json                     # Dependencies and scripts
└── data/
    └── events.json                  # Event storage file (auto-created)
```

### API Endpoints
- `GET /api/events/:year` - Get all events for a specific year
- `GET /api/events/:year/:month/:day` - Get events for a specific date
- `POST /api/events` - Create a new event
- `PUT /api/events/:id` - Update an existing event
- `DELETE /api/events/:id` - Delete an event
- `GET /api/health` - Health check endpoint

## Customization

### Adding New Colors
Edit the `colorOptions` array in `event-dialog.component.ts`:
```typescript
colorOptions = [
  { name: 'Your Color', value: '#hexcode' },
  // ... existing colors
];
```

### Modifying the Calendar Layout
Adjust the CSS grid in `year-calendar.component.scss`:
```scss
.calendar-grid {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, 1fr);
  // Modify for different layouts
}
```

### Customizing Events List
Modify the grid layout in `events-list.component.scss`:
```scss
.events-grid {
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  // Adjust minmax values for different card sizes
}
```

### Changing the API URL
Update the API URL in `event.service.ts`:
```typescript
private readonly API_URL = 'http://your-api-url:port/api';
```

## Development

### Building for Production
```bash
npm run build
```
This creates a `dist/` folder with production-ready files.

### Project Structure
- **Root**: Project configuration and scripts for managing both frontend and backend
- **Frontend**: Angular application with Material UI and routing
- **Backend**: Express.js API server with file-based storage

### Key Technologies Used
- **Frontend**: Angular 18, Angular Material, TypeScript, SCSS, Angular Router
- **Backend**: Node.js, Express.js, Moment.js for date handling
- **Storage**: JSON file-based system (easily replaceable with database)
- **Styling**: Material Design principles with custom SCSS
- **Build Tools**: Angular CLI, Concurrently for running multiple servers

## Data Storage

Events are stored in a JSON file (`backend/data/events.json`) with the following structure:
```json
{
  "events": [
    {
      "id": "unique-id",
      "title": "Event Title",
      "description": "Event Description",
      "startDate": "2025-01-15",
      "endDate": "2025-01-15",
      "color": "#1976d2",
      "recurring": {
        "enabled": true,
        "type": "weekly",
        "interval": 1,
        "endDate": "2025-12-31"
      },
      "isRecurringInstance": false,
      "parentId": null
    }
  ]
}
```

### Recurring Events Logic
- Parent events have `recurring.enabled: true`
- Generated instances have `isRecurringInstance: true` and reference `parentId`
- The backend automatically generates recurring instances when fetching events
- Editing a recurring event modifies the parent, regenerating all instances
- Deleting a recurring event removes the parent and all instances

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance
- Optimized for displaying full year (365+ days) without performance issues
- Efficient event filtering and rendering
- Responsive design that adapts to different screen sizes
- Lazy loading and efficient change detection

## Troubleshooting

### Common Issues
1. **Port already in use**: Change ports in package.json scripts
2. **Events not displaying**: Check browser console for API errors
3. **Styling issues**: Clear browser cache and restart development server
4. **Date offset problems**: Ensure consistent timezone handling

### Development Tips
- Use browser developer tools to inspect API calls
- Check the `backend/data/events.json` file for data persistence
- Monitor console logs for debugging information
- Use the network tab to verify API communication

## Contributing
This is a complete, production-ready application. To extend functionality:
1. Add new event properties in the Event model
2. Update the API endpoints to handle new data
3. Modify the UI components to display new information
4. Update the storage format if needed

## License
This project is provided as-is for educational and personal use. 