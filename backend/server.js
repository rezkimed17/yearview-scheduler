const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'events.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure data directory and file exist
async function initializeData() {
  try {
    await fs.ensureDir(path.dirname(DATA_FILE));
    const exists = await fs.pathExists(DATA_FILE);
    if (!exists) {
      await fs.writeJson(DATA_FILE, { events: [] }, { spaces: 2 });
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

// Helper functions
async function readEvents() {
  try {
    const data = await fs.readJson(DATA_FILE);
    return data.events || [];
  } catch (error) {
    console.error('Error reading events:', error);
    return [];
  }
}

async function writeEvents(events) {
  try {
    await fs.writeJson(DATA_FILE, { events }, { spaces: 2 });
  } catch (error) {
    console.error('Error writing events:', error);
    throw error;
  }
}

// Generate recurring event instances
function generateRecurringInstances(event, year) {
  const instances = [];
  const startDate = moment(event.startDate);
  const endDate = event.endDate ? moment(event.endDate) : startDate.clone();
  
  if (!event.recurring || !event.recurring.enabled) {
    return [event];
  }

  const yearStart = moment(`${year}-01-01`);
  const yearEnd = moment(`${year}-12-31`);
  
  let currentDate = startDate.clone();
  let instanceCount = 0;
  const maxInstances = 366; // Safety limit

  while (currentDate.isSameOrBefore(yearEnd) && instanceCount < maxInstances) {
    if (currentDate.isSameOrAfter(yearStart)) {
      const duration = endDate.diff(startDate, 'days');
      const instanceStart = currentDate.clone();
      const instanceEnd = instanceStart.clone().add(duration, 'days');
      
      instances.push({
        ...event,
        id: `${event.id}_${currentDate.format('YYYY-MM-DD')}`,
        startDate: instanceStart.format('YYYY-MM-DD'),
        endDate: instanceEnd.format('YYYY-MM-DD'),
        isRecurringInstance: true,
        parentId: event.id
      });
    }

    // Move to next occurrence
    switch (event.recurring.type) {
      case 'daily':
        currentDate.add(event.recurring.interval || 1, 'days');
        break;
      case 'weekly':
        currentDate.add(event.recurring.interval || 1, 'weeks');
        break;
      case 'monthly':
        currentDate.add(event.recurring.interval || 1, 'months');
        break;
      case 'yearly':
        currentDate.add(event.recurring.interval || 1, 'years');
        break;
      default:
        break;
    }
    
    instanceCount++;
  }

  return instances;
}

// Routes

// Get all events for a specific year
app.get('/api/events/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const events = await readEvents();
    
    // Generate all instances including recurring events
    let allInstances = [];
    
    for (const event of events) {
      const instances = generateRecurringInstances(event, year);
      allInstances = allInstances.concat(instances);
    }
    
    // Filter events that fall within the requested year
    const yearEvents = allInstances.filter(event => {
      const eventStart = moment(event.startDate);
      const eventEnd = moment(event.endDate || event.startDate);
      const yearStart = moment(`${year}-01-01`);
      const yearEnd = moment(`${year}-12-31`);
      
      return eventStart.isSameOrBefore(yearEnd) && eventEnd.isSameOrAfter(yearStart);
    });
    
    res.json(yearEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get events for a specific date
app.get('/api/events/:year/:month/:day', async (req, res) => {
  try {
    const { year, month, day } = req.params;
    const targetDate = moment(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    const events = await readEvents();
    
    // Generate all instances including recurring events
    let allInstances = [];
    
    for (const event of events) {
      const instances = generateRecurringInstances(event, parseInt(year));
      allInstances = allInstances.concat(instances);
    }
    
    // Filter events that include the target date
    const dayEvents = allInstances.filter(event => {
      const eventStart = moment(event.startDate);
      const eventEnd = moment(event.endDate || event.startDate);
      
      return targetDate.isBetween(eventStart, eventEnd, 'day', '[]');
    });
    
    res.json(dayEvents);
  } catch (error) {
    console.error('Error fetching day events:', error);
    res.status(500).json({ error: 'Failed to fetch day events' });
  }
});

// Create a new event
app.post('/api/events', async (req, res) => {
  try {
    const eventData = req.body;
    const newEvent = {
      id: uuidv4(),
      title: eventData.title,
      description: eventData.description || '',
      startDate: eventData.startDate,
      endDate: eventData.endDate || eventData.startDate,
      color: eventData.color || '#1976d2',
      recurring: eventData.recurring || { enabled: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const events = await readEvents();
    events.push(newEvent);
    await writeEvents(events);
    
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update an event
app.put('/api/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const updateData = req.body;
    const events = await readEvents();
    
    const eventIndex = events.findIndex(event => event.id === eventId);
    if (eventIndex === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const updatedEvent = {
      ...events[eventIndex],
      ...updateData,
      id: eventId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    events[eventIndex] = updatedEvent;
    await writeEvents(events);
    
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete an event
app.delete('/api/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const events = await readEvents();
    
    const eventIndex = events.findIndex(event => event.id === eventId);
    if (eventIndex === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    events.splice(eventIndex, 1);
    await writeEvents(events);
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Year Planner API is running' });
});

// Initialize data and start server
initializeData().then(() => {
  app.listen(PORT, () => {
    console.log(`Year Planner API server running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to initialize server:', error);
  process.exit(1);
}); 