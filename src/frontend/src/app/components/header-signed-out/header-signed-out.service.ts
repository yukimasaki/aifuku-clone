import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeaderSignedOutService {
  render: boolean = false;

  constructor() {}

  hide() {
    this.render = false;
  }

  show() {
    this.render = true;
  }
}
