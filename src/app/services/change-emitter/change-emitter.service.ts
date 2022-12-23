import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

import {ElementNotification} from '../../utility/types';

@Injectable({providedIn: 'root'})
export class ChangeEmitterService {
  stageDescriptionChange: Subject<string> = new Subject();
  graphElementRemoved: Subject<ElementNotification> = new Subject();
  graphElementAdded: Subject<ElementNotification> = new Subject();
  graphNodesLabelChange: Subject < string[] >= new Subject;
  constructor() {}
}
