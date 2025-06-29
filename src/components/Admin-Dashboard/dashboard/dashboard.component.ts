import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AuthServiceService } from '../../../Service/auth-service.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  activeRoute: string = '';

  constructor(
    private authService: AuthServiceService,
    private router: Router
  ) {}

  ngOnInit() {
    this.detectActiveRoute();
   
  }

  detectActiveRoute() {
    this.activeRoute = this.router.url;
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.activeRoute = event.url;
      });
  }

  logout() {
    this.authService.logout();
  }

  isActive(route: string): boolean {
    return this.activeRoute.includes(route);
  }
}
