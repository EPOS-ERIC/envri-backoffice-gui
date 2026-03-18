import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { RouteService } from 'src/services/route.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
})
export class ErrorComponent implements OnInit {
  public readonly environment = environment;

  constructor(private routeService: RouteService, private router: Router) {
    this.router.routerState.root.queryParams.subscribe((params) => {
      this.type = params['type'];
    });
  }

  private previousRoute!: string;

  public type: string = '';

  public ngOnInit(): void {
    this.routeService.previousRouteObs.subscribe((previousRoute: string) => {
      this.previousRoute = previousRoute;
    });
  }

  public handleRetry(): void {
    if (this.previousRoute && this.previousRoute !== '') {
      this.router.navigate([this.previousRoute]);
    }
  }

  public handleReturnHome(): void {
    this.router.navigate(['/home']);
  }

  public handleReturnToLogin(): void {
    // this.router.navigate(['/login']);
  }
}
