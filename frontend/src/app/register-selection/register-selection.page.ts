import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-selection',
  templateUrl: './register-selection.page.html',
  styleUrls: ['./register-selection.page.scss'],
  standalone: false,
})
export class RegisterSelectionPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goToRegister(role: string) {
    if (role === 'cliente') {
      this.router.navigate(['/register-client']);
    } else {
      this.router.navigate(['/register-worker']);
    }
  }
}
