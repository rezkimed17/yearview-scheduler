import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { EventDialogComponent } from '../event-dialog/event-dialog.component';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatToolbarModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
    MatMenuModule,
    MatBadgeModule
  ],
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.scss']
})
export class EventsListComponent implements OnInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  loading = false;
  currentYear = new Date().getFullYear();
  totalEvents = 0;
  recurringEvents = 0;
  singleEvents = 0;

  constructor(
    private eventService: EventService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getEventsForYear(this.currentYear).subscribe({
      next: (events) => {
        this.events = events;
        this.filteredEvents = [...events];
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.loading = false;
        this.snackBar.open('Error loading events', 'Close', { duration: 3000 });
      }
    });
  }

  calculateStats(): void {
    this.totalEvents = this.events.length;
    this.recurringEvents = this.events.filter(event => event.recurring?.enabled).length;
    this.singleEvents = this.totalEvents - this.recurringEvents;
  }

  filterEvents(type: 'all' | 'recurring' | 'single'): void {
    switch (type) {
      case 'all':
        this.filteredEvents = [...this.events];
        break;
      case 'recurring':
        this.filteredEvents = this.events.filter(event => event.recurring?.enabled);
        break;
      case 'single':
        this.filteredEvents = this.events.filter(event => !event.recurring?.enabled);
        break;
    }
  }

  editEvent(event: Event): void {
    const dialogRef = this.dialog.open(EventDialogComponent, {
      data: {
        date: new Date(event.startDate),
        events: [event],
        mode: 'edit',
        event: event
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

  deleteEvent(event: Event): void {
    let deleteId = event.id;
    let confirmMessage = 'Are you sure you want to delete this event?';
    
    if (event.isRecurringInstance && event.parentId) {
      deleteId = event.parentId;
      confirmMessage = 'This will delete the entire recurring event series. Are you sure?';
    } else if (event.recurring?.enabled) {
      confirmMessage = 'This will delete the entire recurring event series. Are you sure?';
    }

    if (!confirm(confirmMessage)) {
      return;
    }

    this.eventService.deleteEvent(deleteId).subscribe({
      next: () => {
        const message = event.recurring?.enabled || event.isRecurringInstance
          ? 'Recurring event series deleted successfully!'
          : 'Event deleted successfully!';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.loadEvents();
      },
      error: (error) => {
        console.error('Error deleting event:', error);
        this.snackBar.open('Error deleting event. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  createNewEvent(): void {
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

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getEventDuration(event: Event): string {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate || event.startDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Single day';
    } else {
      return `${diffDays} days`;
    }
  }

  getRecurringText(event: Event): string {
    if (!event.recurring?.enabled) return '';
    
    const interval = event.recurring.interval > 1 ? `every ${event.recurring.interval} ` : '';
    const type = event.recurring.type + (event.recurring.interval > 1 ? 's' : '');
    return `Repeats ${interval}${type}`;
  }
}
