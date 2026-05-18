import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-appointments-history',
  templateUrl: './appointments-history.page.html',
  styleUrls: ['./appointments-history.page.scss'],
  standalone: false,
})
export class AppointmentsHistoryPage implements OnInit {

  appointments: { title: string; date: string; time: string }[] = [];

  ngOnInit() {
    // Por ahora cargamos datos de ejemplo (mock).
    // En el futuro se conectará a la API: GET /api/appointments
    this.appointments = [
      { title: 'Cita', date: '01 / 02 / 2026', time: '17:30' },
    ];
  }
}
