import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToastService } from '../../../services/toast.service';
import { environment } from '../../../../environments/environment';

export interface UIStatus {
  status: 'idle' | 'success' | 'error';
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UIFacadeService {
  private statusSubject = new BehaviorSubject<UIStatus>({ status: 'idle' });
  public status$ = this.statusSubject.asObservable();

  // Granular state observables for template consumption
  public isSuccess$ = this.statusSubject.pipe(
    map((status: UIStatus) => status.status === 'success')
  );
  
  public hasError$ = this.statusSubject.pipe(
    map((status: UIStatus) => status.status === 'error')
  );
  
  public isIdle$ = this.statusSubject.pipe(
    map((status: UIStatus) => status.status === 'idle')
  );

  constructor(
    private toastService: ToastService,
  ) {}

  /**
   * Show success notification
   * @param message - Success message to display
   */
  showSuccess(message: string): void {
    this.statusSubject.next({ status: 'success', message });
    this.toastService.notify(message);
  }

  /**
   * Show error notification
   * @param message - Error message to display
   */
  showError(message: string): void {
    this.statusSubject.next({ status: 'error', message });
    this.toastService.notify(message);
  }

  /**
   * Show undoable notification
   * @param message - Message to display
   * @param onUndo - Callback function for undo action
   */
  showUndoable(message: string, onUndo: () => void): void {
    this.statusSubject.next({ status: 'idle' });
    this.toastService.notifyUndoable(message, onUndo);
  }

  /**
   * Clear status
   */
  clearStatus(): void {
    this.statusSubject.next({ status: 'idle' });
  }
}
