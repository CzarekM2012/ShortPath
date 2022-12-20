import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

import {ElementRemovalNotification} from '../../utility/types';

@Injectable({providedIn: 'root'})
export class ChangeEmitterService {
  stageDescriptionChange: Subject<string> = new Subject();
  graphElementRemoved: Subject<ElementRemovalNotification> = new Subject()
  constructor() {}
}
