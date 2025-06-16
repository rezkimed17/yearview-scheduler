import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { EventService } from '../../services/event.service';
import { Event, CreateEventRequest } from '../../models/event.model';

interface DialogData {
  date: Date;
  events: Event[];
  mode: 'view' | 'create' | 'edit';
  event?: Event;
}

@Component({
  selector: 'app-event-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.scss']
})
export class EventDialogComponent implements OnInit {
  eventForm: FormGroup;
  mode: 'view' | 'create' | 'edit' = 'view';
  selectedEvent: Event | null = null;
  events: Event[] = [];
  loading = false;

  colorOptions = [
    { name: 'Blue', value: '#1976d2' },
    { name: 'Green', value: '#388e3c' },
    { name: 'Red', value: '#d32f2f' },
    { name: 'Orange', value: '#f57c00' },
    { name: 'Purple', value: '#7b1fa2' },
    { name: 'Teal', value: '#00796b' },
    { name: 'Pink', value: '#c2185b' },
    { name: 'Indigo', value: '#303f9f' }
  ];

  constructor(
    private dialogRef: MatDialogRef<EventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder,
    private eventService: EventService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.mode = data.mode;
    this.events = data.events || [];
    this.selectedEvent = data.event || null;

    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      startDate: [data.date || new Date(), Validators.required],
      endDate: [data.date || new Date()],
      color: ['#1976d2', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.selectedEvent) {
      this.populateForm(this.selectedEvent);
    }

    if (this.mode === 'create') {
      this.switchToEditMode();
    }
  }

  populateForm(event: Event): void {
    // Parse dates carefully to avoid timezone issues
    const parseDate = (dateStr: string): Date => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    };

    this.eventForm.patchValue({
      title: event.title,
      description: event.description || '',
      startDate: parseDate(event.startDate),
      endDate: parseDate(event.endDate || event.startDate),
      color: event.color
    });
  }

  switchToEditMode(): void {
    this.mode = 'edit';
  }

  switchToViewMode(): void {
    this.mode = 'view';
    if (this.selectedEvent) {
      this.populateForm(this.selectedEvent);
    }
  }

  selectEvent(event: Event): void {
    this.selectedEvent = event;
    this.populateForm(event);
    this.mode = 'view';
  }

  createNewEvent(): void {
    this.selectedEvent = null;
    this.eventForm.reset({
      title: '',
      description: '',
      startDate: this.data.date || new Date(),
      endDate: this.data.date || new Date(),
      color: '#1976d2'
    });
    this.mode = 'edit';
  }

  saveEvent(): void {
    if (this.eventForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    const formValue = this.eventForm.value;
    
    const eventData: CreateEventRequest = {
      title: formValue.title,
      description: formValue.description,
      startDate: this.formatDate(formValue.startDate),
      endDate: this.formatDate(formValue.endDate),
      color: formValue.color
    };

    const saveOperation = this.selectedEvent
      ? this.eventService.updateEvent(this.selectedEvent.id, eventData)
      : this.eventService.createEvent(eventData);

    saveOperation.subscribe({
      next: (event) => {
        this.loading = false;
        this.snackBar.open(
          this.selectedEvent ? 'Event updated successfully!' : 'Event created successfully!',
          'Close',
          { duration: 3000 }
        );
        this.dialogRef.close({ refresh: true });
      },
      error: (error) => {
        this.loading = false;
        console.error('Error saving event:', error);
        this.snackBar.open('Error saving event. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  deleteEvent(): void {
    if (!this.selectedEvent) {
      return;
    }

    const confirmed = confirm('Are you sure you want to delete this event?');
    if (!confirmed) {
      return;
    }

    this.loading = true;
    this.eventService.deleteEvent(this.selectedEvent.id).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Event deleted successfully!', 'Close', { duration: 3000 });
        this.dialogRef.close({ refresh: true });
      },
      error: (error) => {
        this.loading = false;
        console.error('Error deleting event:', error);
        this.snackBar.open('Error deleting event. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.eventForm.controls).forEach(key => {
      const control = this.eventForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  private formatDate(date: Date): string {
    // Use the original date's local values to avoid timezone issues
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return year + '-' + 
           String(month).padStart(2, '0') + '-' + 
           String(day).padStart(2, '0');
  }

  get isViewMode(): boolean {
    return this.mode === 'view';
  }

  get isEditMode(): boolean {
    return this.mode === 'edit';
  }

  get hasEvents(): boolean {
    return this.events.length > 0;
  }

  get formattedDate(): string {
    if (this.data.date) {
      return this.data.date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    return '';
  }
} 