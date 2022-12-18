import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class GlobalSettingsService {
  maxGraphNodes: number = 10;
  constructor() {}
}
