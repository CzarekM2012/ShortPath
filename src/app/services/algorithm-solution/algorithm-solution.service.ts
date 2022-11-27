import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class AlgorithmSolutionService {
  executionStack: any[] = [];
  currentIndex: number = 0;

  constructor() {}

  step(step: number) {
    this.currentIndex += step;
    if (this.currentIndex < 0)
      this.currentIndex = 0;
    else if (this.currentIndex >= this.executionStack.length)
      this.currentIndex =
          this.executionStack.length > 0 ? this.executionStack.length - 1 : 0;
  }

  executeAlgorithm(algorithm: string) {}
}
