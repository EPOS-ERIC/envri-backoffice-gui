import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { BarController, BarElement, Chart, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { Router, NavigationEnd, Event as NavigationEvent, ActivationStart, RouterOutlet } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators';
import { ActionsService } from 'src/services/actions.service';
import { RouteService } from 'src/services/route.service';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoadingService } from 'src/services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  @ViewChild(RouterOutlet) outlet!: RouterOutlet;

  private subscriptions = new Subscription();
  public showLoadingSpinner = false;

  constructor(
    private router: Router,
    private actionsService: ActionsService,
    private routeService: RouteService,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef,
  ) {
    this.router.events.subscribe((e) => {
      if (e instanceof ActivationStart) {
        // this.outlet.deactivate();
      }
    });

    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        pairwise(),
      )
      .subscribe(([prev, curr]: [NavigationEvent, NavigationEvent]) => {
        if (prev instanceof NavigationEnd && curr instanceof NavigationEnd) {
          /** The code block is checking the value of `prev.urlAfterRedirects` and based on that, it calls the
`distributionAllVisited()` method of the `routeService` with either `false` or `true` as an
argument. This triggers the @BackButtonComponent to return a user to either @BrowseDataProductsComponent or @BrowseDistributionsComponent **/

          if (prev.urlAfterRedirects === `/browse/${EntityEndpointValue.DATA_PRODUCT}`) {
            this.routeService.distributionAllVisited(false);
          } else if (prev.urlAfterRedirects === `/browse/${EntityEndpointValue.DISTRIBUTION}`) {
            this.routeService.distributionAllVisited(true);
          }

          this.routeService.setPreviousRoute(prev.urlAfterRedirects);
          if (prev.urlAfterRedirects !== curr.urlAfterRedirects) {
            this.actionsService.clearFilters();
          }
        }
      });
  }

  ngOnInit() {
    this.updateBranding();
    Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);
    this.subscriptions.add(
      this.loadingService.showSpinnerObs.subscribe((show: boolean) => {
        this.showLoadingSpinner = show;
        /* 
`this.cdr.detectChanges();` prevents the `ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked.` error 
by manually triggering change detection.
 */
        this.cdr.detectChanges();
      }),
    );
  }

  private updateBranding(): void {
    document.title = environment.browserTitle;

    const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (favicon !== null) {
      favicon.href = environment.faviconPath;
    }
  }
}
