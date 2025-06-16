import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, CreateEventRequest } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getEventsForYear(year: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.API_URL}/events/${year}`);
  }

  getEventsForDate(year: number, month: number, day: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.API_URL}/events/${year}/${month}/${day}`);
  }

  createEvent(event: CreateEventRequest): Observable<Event> {
    return this.http.post<Event>(`${this.API_URL}/events`, event);
  }

  updateEvent(id: string, event: Partial<Event>): Observable<Event> {
    return this.http.put<Event>(`${this.API_URL}/events/${id}`, event);
  }

  deleteEvent(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/events/${id}`);
  }

  checkApiHealth(): Observable<{ status: string; message: string }> {
    return this.http.get<{ status: string; message: string }>(`${this.API_URL}/health`);
  }
} 