import { Component, OnInit } from '@angular/core';
import { Workshop } from '../../models/Workshops';
import { WorkshopsService } from '../../services/workshops.service';
@Component({
  selector: 'app-workshops-home',
  templateUrl: './workshops-home.component.html',
  styleUrls: ['./workshops-home.component.css']
})
export class WorkshopsHomeComponent implements OnInit {

  workshops: Workshop[];
  workshop: Workshop;
  admin: boolean;

  constructor(
    private wss: WorkshopsService,
  ) { }

  ngOnInit() {
    this.wss.getWorkshops().subscribe(workshops => {
      this.workshops = workshops;
    });
  }
}
