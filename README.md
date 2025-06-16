# Year Planner - Full-Year Calendar Application

A comprehensive year planner web application built with Angular frontend and Node.js backend, featuring a complete calendar view, event management, and recurring events support.

## Features

### Core Functionality
- **Full-Year Calendar View**: Display all 12 months on a single page
- **Professional UI**: Built with Angular Material for a clean, modern design
- **Visual Event Indicators**: Colored dots show events on calendar days
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Event Management
- **Complete CRUD Operations**: Create, read, update, and delete events
- **Rich Event Details**: Title, description, dates, and custom colors
- **Multi-Day Events**: Events can span multiple days with visual indicators
- **Recurring Events**: Support for daily, weekly, monthly, and yearly recurrence
- **Interactive Dialogs**: Material UI popups for seamless event management

### Technical Features
- **File-Based Storage**: Simple JSON storage system (no database required)
- **RESTful API**: Clean Node.js backend with Express
- **Real-Time Updates**: Calendar refreshes automatically after changes
- **Error Handling**: Comprehensive error handling and user feedback
- **Type Safety**: Full TypeScript implementation

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

### Viewing the Calendar
- The main page displays a full-year calendar with all 12 months
- Days with events show colored dots (up to 3 visible, with a "+" indicator for more)
- Use the navigation arrows to move between years
- Click "Today" to jump to the current year

### Managing Events

#### Creating Events
1. Click the **"New Event"** button in the toolbar, or
2. Click on any day in the calendar
3. Fill in the event details:
   - **Title** (required)
   - **Description** (optional)
   - **Start Date** and **End Date**
   - **Color** (choose from predefined options)
   - **Recurring Options** (if needed)

#### Viewing Events
1. Click on any day that has events (indicated by colored dots)
2. A dialog will show all events for that day
3. Click on any event to see full details

#### Editing Events
1. Click on a day with events
2. Select the event you want to edit
3. Click the **"Edit"** button
4. Make your changes and save

#### Deleting Events
1. Click on a day with events
2. Select the event you want to delete
3. Click the **"Delete"** button
4. Confirm the deletion

### Recurring Events
Set up events that repeat automatically:
- **Daily**: Every day or every N days
- **Weekly**: Every week or every N weeks
- **Monthly**: Every month or every N months
- **Yearly**: Every year or every N years

Note: Recurring event instances cannot be edited individually - you must edit the original event.

## Architecture

### Frontend (Angular)
```
frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── year-calendar/       # Main calendar component
│   │   │   └── event-dialog/        # Event management dialog
│   │   ├── models/
│   │   │   └── event.model.ts       # Event type definitions
│   │   ├── services/
│   │   │   └── event.service.ts     # API communication service
│   │   ├── app.component.*          # Root component
│   │   └── app.config.ts            # App configuration
│   ├── styles.scss                  # Global styles
│   └── index.html                   # Main HTML file
```

### Backend (Node.js)
```
backend/
├── server.js                       # Main server file
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  // Adjust minmax values for different layouts
}
```

### Changing the API URL
Update the API URL in `event.service.ts`:
```typescript
private readonly API_URL = 'http://your-api-url:port/api';
```

## 🛠️ Development

### Building for Production
```bash
npm run build
```
This creates a `dist/` folder with production-ready files.

### Project Structure
- **Root**: Project configuration and scripts
- **Frontend**: Angular application with Material UI
- **Backend**: Express.js API server with file-based storage

### Key Technologies Used
- **Frontend**: Angular 18, Angular Material, TypeScript, SCSS
- **Backend**: Node.js, Express.js, Moment.js for date handling
- **Storage**: JSON file-based system (easily replaceable with database)
- **Styling**: Material Design principles with custom SCSS

## Data Storage

Events are stored in `backend/data/events.json` with the following structure:
```json
{
  "events": [
    {
      "id": "unique-uuid",
      "title": "Event Title",
      "description": "Event Description",
      "startDate": "2024-12-25",
      "endDate": "2024-12-25",
      "color": "#1976d2",
      "recurring": {
        "enabled": false,
        "type": "weekly",
        "interval": 1
      },
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

##  Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Change the port in `backend/server.js` (default: 3000)
   - Update the API URL in frontend if needed

2. **Events Not Loading**
   - Check if the backend server is running
   - Verify the API URL in `event.service.ts`
   - Check browser console for errors

3. **Build Errors**
   - Ensure all dependencies are installed: `npm run setup`
   - Clear node_modules and reinstall if needed

### Development Tips
- Use browser dev tools to inspect API calls
- Check the backend console for server logs
- The `events.json` file is created automatically on first use

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


---

**Enjoy planning your year!** 