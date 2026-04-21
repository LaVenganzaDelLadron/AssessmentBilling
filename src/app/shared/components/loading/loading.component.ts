import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingComponent {
  protected readonly loadingService = inject(LoadingService);
}
