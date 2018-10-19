import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ie = false;

  ngOnInit() {
    if (!!navigator.userAgent.match(/Trident\/7\./)) {
      this.ie = true;
    }
  }

}
