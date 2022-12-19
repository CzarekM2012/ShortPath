import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({providedIn: 'root'})
export class ChangeEmitterService {
  stageDescriptionChange: Subject<string> = new Subject();
  constructor() {}
}
