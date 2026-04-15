import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AaaiService } from 'src/aaai/aaai.service';

@Component({
  selector: 'app-last-page-redirect',
  standalone: true,
  imports: [],
  templateUrl: './last-page-redirect.component.html',
  styleUrl: './last-page-redirect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LastPageRedirectComponent implements OnInit {
  constructor(private aaaiService: AaaiService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.aaaiService.initializeAuth();
      if (this.aaaiService.isAuthenticated()) {
        this.router.navigate(['/home']);
      } else {
        this.router.navigate(['/login']);
      }
    } catch {
      this.router.navigate(['/login']);
    }
  }
}
