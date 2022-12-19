import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({providedIn: 'root'})
export class ChangeEmitterService {
  graphicRefresh: Subject < any >= new Subject()
  stageDescriptionChange: Subject<string> = new Subject();
  constructor() {}

  graphRefresh() {
    this.graphicRefresh.next(undefined);
  }

  stageChange(description: string) {
    this.graphRefresh();
    this.stageDescriptionChange.next(description);
  }
}
