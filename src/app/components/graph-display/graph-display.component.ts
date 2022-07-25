import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-graph-display',
  templateUrl: './graph-display.component.html',
  styleUrls: ['./graph-display.component.css']
})
export class GraphDisplayComponent implements OnInit {

  canvas: HTMLCanvasElement | null = null;
  context: CanvasRenderingContext2D | null = null;

  constructor() { }

  ngOnInit(): void {
    const canvas = document.getElementById("canvas");
    if (canvas == null) {
      throw Error("Canvas is none");
    }
    this.canvas = canvas as HTMLCanvasElement;
    const context = this.canvas.getContext("2d");
    if (context == null) {
      throw Error("Canvas context is none")
    }
    this.context = context as CanvasRenderingContext2D;
    this.context.fillStyle = "#FF0000";
    this.context.fillRect(0, 0, 80, 100);
  }

}
