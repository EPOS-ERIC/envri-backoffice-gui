import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, filter, lastValueFrom, of, Subscription, take, timeout } from 'rxjs';
import { AaaiService } from 'src/aaai/aaai.service';

@Component({
  selector: 'app-last-page-redirect',
  standalone: true,
  imports: [],
  templateUrl: './last-page-redirect.component.html',
  styleUrl: './last-page-redirect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LastPageRedirectComponent implements OnInit, OnDestroy {
  private authSubscription!: Subscription;
  private readonly authTimeoutms = 15000;

  constructor(private aaaiService: AaaiService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    try {
      const user = await lastValueFrom(
        this.aaaiService.watchUser().pipe(
          filter((item) => item != null),
          take(1), // Take only the first non-null user
          timeout(this.authTimeoutms), // Fail if it takes longer than 15s
          catchError(() => of(null)),
        ),
      );
      if (user) {
        this.router.navigate(['/home']);
      } else {
        this.router.navigate(['/login']);
      }
    } catch (err) {
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
