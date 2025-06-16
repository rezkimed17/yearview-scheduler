import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { YearCalendarComponent } from './components/year-calendar/year-calendar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, YearCalendarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Year Planner';
}
