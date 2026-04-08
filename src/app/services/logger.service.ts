import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  
  constructor() {}

  log(message: string, data?: any) {
    if (!environment.production) {
      console.log(message, data);
    }
  }

  error(message: string, error?: any) {
    if (!environment.production) {
      console.error(message, error);
    }
  }
}
