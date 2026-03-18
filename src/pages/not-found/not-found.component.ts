import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  standalone: true,
  imports: [CommonModule, AngularMaterialModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {
  public readonly environment = environment;

  constructor(private router: Router) {}

  public handleReturnHome(): void {
    this.router.navigate(['/home']);
  }
}
