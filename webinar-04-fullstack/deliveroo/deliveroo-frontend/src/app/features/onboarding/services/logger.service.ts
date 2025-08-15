import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private isProduction = environment.production;

  debug(...args: any[]) {
    if (!this.isProduction) {
      console.debug(...args);
    }
  }
  info(...args: any[]) {
    if (!this.isProduction) {
      console.info(...args);
    }
  }
  warn(...args: any[]) {
    console.warn(...args);
  }
  error(...args: any[]) {
    console.error(...args);
  }
}
