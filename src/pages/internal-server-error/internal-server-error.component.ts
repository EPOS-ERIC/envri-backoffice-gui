import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-internal-server-error',
  standalone: true,
  imports: [CommonModule, AngularMaterialModule],
  templateUrl: './internal-server-error.component.html',
  styleUrl: './internal-server-error.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InternalServerErrorComponent {
  public readonly environment = environment;

  constructor(private router: Router) {}

  public handleReturnHome(): void {
    this.router.navigate(['/home']);
  }
}
