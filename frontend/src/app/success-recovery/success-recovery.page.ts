import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success-recovery',
  templateUrl: './success-recovery.page.html',
  styleUrls: ['./success-recovery.page.scss'],
  standalone: false,
})
export class SuccessRecoveryPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
