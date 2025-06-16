import { Routes } from '@angular/router';
import { YearCalendarComponent } from './components/year-calendar/year-calendar.component';
import { EventsListComponent } from './components/events-list/events-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/calendar', pathMatch: 'full' },
  { path: 'calendar', component: YearCalendarComponent },
  { path: 'events', component: EventsListComponent },
  { path: '**', redirectTo: '/calendar' }
];
