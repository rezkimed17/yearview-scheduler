import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { EventDialogComponent } from '../event-dialog/event-dialog.component';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
}

interface CalendarMonth {
  name: string;
  year: number;
  month: number;
  days: CalendarDay[];
}

@Component({
  selector: 'app-year-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatToolbarModule,
    MatTooltipModule
  ],
  templateUrl: './year-calendar.component.html',
  styleUrls: ['./year-calendar.component.scss']
})
export class YearCalendarComponent implements OnInit {
  currentYear: number = 2025;
  months: CalendarMonth[] = [];
  events: Event[] = [];
  loading = false;

  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor(
    private eventService: EventService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getEventsForYear(this.currentYear).subscribe({
      next: (events) => {
        this.events = events;
        this.generateCalendar();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.generateCalendar();
        this.loading = false;
      }
    });
  }

  generateCalendar(): void {
    this.months = [];
    const today = new Date();

    for (let month = 0; month < 12; month++) {
      const monthData: CalendarMonth = {
        name: this.monthNames[month],
        year: this.currentYear,
        month: month + 1,
        days: []
      };

      const firstDay = new Date(this.currentYear, month, 1);
      const lastDay = new Date(this.currentYear, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());

      const endDate = new Date(lastDay);
      endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dayEvents = this.getEventsForDate(currentDate);
        
        monthData.days.push({
          date: new Date(currentDate),
          dayNumber: currentDate.getDate(),
          isCurrentMonth: currentDate.getMonth() === month,
          isToday: this.isSameDay(currentDate, today),
          events: dayEvents
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      this.months.push(monthData);
    }
  }

  getEventsForDate(date: Date): Event[] {
    // Parse date strings carefully to avoid timezone issues
    const parseDate = (dateStr: string): Date => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    };

    const filteredEvents = this.events.filter(event => {
      const startDate = parseDate(event.startDate);
      const endDate = parseDate(event.endDate || event.startDate);
      
      // Normalize dates to compare only the date part (not time)
      const normalizeDate = (d: Date): Date => {
        const normalized = new Date(d);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
      };
      
      const normalizedDate = normalizeDate(date);
      const normalizedStart = normalizeDate(startDate);
      const normalizedEnd = normalizeDate(endDate);
      
      return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
    });
    
    return filteredEvents;
  }

  onDayClick(day: CalendarDay): void {
    const dialogRef = this.dialog.open(EventDialogComponent, {
      data: {
        date: day.date,
        events: day.events,
        mode: 'view'
      },
      width: '650px',
      maxWidth: '95vw',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.refresh) {
        this.loadEvents();
      }
    });
  }

  onCreateEvent(): void {
    const dialogRef = this.dialog.open(EventDialogComponent, {
      data: {
        date: new Date(),
        events: [],
        mode: 'create'
      },
      width: '650px',
      maxWidth: '95vw',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.refresh) {
        this.loadEvents();
      }
    });
  }

  previousYear(): void {
    this.currentYear--;
    this.loadEvents();
  }

  nextYear(): void {
    this.currentYear++;
    this.loadEvents();
  }

  goToCurrentYear(): void {
    this.currentYear = new Date().getFullYear();
    this.loadEvents();
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  private formatDate(date: Date): string {
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0');
  }

  getEventDots(events: Event[]): string[] {
    return events.slice(0, 3).map(event => event.color);
  }

  hasMoreEvents(events: Event[]): boolean {
    return events.length > 3;
  }
} 