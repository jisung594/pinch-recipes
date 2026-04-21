import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoggerService } from '../../../services/logger.service';

export interface AppStatus {
  status: 'idle' | 'tracking' | 'error';
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppFacadeService {
  // Keep the status only if you plan to show an app-wide "Error" banner
  private statusSubject = new BehaviorSubject<AppStatus>({ status: 'idle' });
  public status$ = this.statusSubject.asObservable();

  constructor(private logger: LoggerService) {}

  // Simple pass-throughs
  log(msg: string, data?: any) { this.logger.log(msg, data); }
  
  // Use this for infrastructure errors
  logError(error: string, details?: any) {
    this.statusSubject.next({ status: 'error', message: error });
    this.logger.error(error, details);
  }

  // Future-proofing for Analytics
  logEvent(event: string, data?: any) {
    this.logger.log(`[Event]: ${event}`, data);
  }

  clearStatus() { this.statusSubject.next({ status: 'idle' }); }
}