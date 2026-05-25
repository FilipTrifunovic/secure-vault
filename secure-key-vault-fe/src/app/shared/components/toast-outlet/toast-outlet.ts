import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-outlet',
  standalone: true,
  templateUrl: './toast-outlet.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastOutlet {
  toast = inject(ToastService);
}
