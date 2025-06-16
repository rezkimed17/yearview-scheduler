import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Event } from '../../models/event.model';
import { EventService } from '../../services/event.service';
import { EventDialogComponent } from '../event-dialog/event-dialog.component';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.scss']
})
export class EventsListComponent implements OnInit, OnChanges {
  @Input() events: Event[] = [];
  @Output() eventUpdated = new EventEmitter<void>();
  @Output() editEventEmitter = new EventEmitter<Event>();

  filteredEvents: Event[] = [];
  sortOrder: 'asc' | 'desc' = 'asc';
  
  // Statistics
  totalEvents = 0;
  upcomingEvents = 0;
  thisWeekEvents = 0;
  
  currentFilter: 'all' | 'upcoming' | 'week' = 'all';

  constructor(
    private eventService: EventService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  private loadEvents(): void {
    const currentYear = new Date().getFullYear();
    this.eventService.getEventsForYear(currentYear).subscribe({
      next: (events: Event[]) => {
        this.events = events;
        this.updateStatistics();
        this.filterEvents(this.currentFilter);
      },
      error: (error: any) => {
        console.error('Error loading events:', error);
        this.snackBar.open('Error loading events. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events']) {
      this.updateStatistics();
      this.filterEvents(this.currentFilter);
    }
  }

  private refreshEvents(): void {
    this.loadEvents();
  }

  private updateStatistics(): void {
    this.totalEvents = this.events.length;
    
    const today = new Date();
    const todayStr = this.formatDateForComparison(today);
    
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const weekFromNowStr = this.formatDateForComparison(weekFromNow);
    
    this.upcomingEvents = this.events.filter(event => event.startDate >= todayStr).length;
    this.thisWeekEvents = this.events.filter(event => 
      event.startDate >= todayStr && event.startDate <= weekFromNowStr
    ).length;
  }

  filterEvents(type: 'all' | 'upcoming' | 'week'): void {
    this.currentFilter = type;
    
    const today = new Date();
    const todayStr = this.formatDateForComparison(today);
    
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const weekFromNowStr = this.formatDateForComparison(weekFromNow);
    
    let filtered: Event[] = [];
    
    switch (type) {
      case 'all':
        filtered = [...this.events];
        break;
      case 'upcoming':
        filtered = this.events.filter(event => event.startDate >= todayStr);
        break;
      case 'week':
        filtered = this.events.filter(event => 
          event.startDate >= todayStr && event.startDate <= weekFromNowStr
        );
        break;
    }
    
    this.filteredEvents = this.sortEvents(filtered);
  }

  toggleSort(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.filteredEvents = this.sortEvents(this.filteredEvents);
  }

  private sortEvents(events: Event[]): Event[] {
    return events.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }

  viewEvent(event: Event): void {
    this.editEventEmitter.emit(event);
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
        this.refreshEvents();
        this.eventUpdated.emit();
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
        this.refreshEvents();
        this.eventUpdated.emit();
      }
    });
  }

  deleteEvent(event: Event): void {
    const confirmed = confirm('Are you sure you want to delete this event?');
    if (!confirmed) {
      return;
    }

    this.eventService.deleteEvent(event.id).subscribe({
      next: () => {
        this.snackBar.open('Event deleted successfully!', 'Close', { duration: 3000 });
        this.refreshEvents();
        this.eventUpdated.emit();
      },
      error: (error) => {
        console.error('Error deleting event:', error);
        this.snackBar.open('Error deleting event. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  private formatDateForComparison(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return year + '-' + 
           String(month).padStart(2, '0') + '-' + 
           String(day).padStart(2, '0');
  }

  formatEventDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  formatEventDateTime(event: Event): string {
    const startDate = new Date(event.startDate + 'T00:00:00');
    const endDate = new Date((event.endDate || event.startDate) + 'T00:00:00');
    
    const startStr = startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    if (event.endDate && event.endDate !== event.startDate) {
      const endStr = endDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      return `${startStr} - ${endStr}`;
    }
    
    return startStr;
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

  get sortButtonText(): string {
    return this.sortOrder === 'asc' ? 'Earliest First ↑' : 'Latest First ↓';
  }
}
