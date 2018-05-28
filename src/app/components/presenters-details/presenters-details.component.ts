import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { PresenterService } from '../../services/presenter.service';
import { Presenter } from '../../models/presenter';
import { WorkshopsService } from '../../services/workshops.service';
import { Workshop } from '../../models/Workshops';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-presenters-details',
  templateUrl: './presenters-details.component.html',
  styleUrls: ['./presenters-details.component.css']
})
export class PresentersDetailsComponent implements OnInit {

  id: string;
  presenter: Presenter = {
    name: '',
    occupation: '',
    bio: '',
    education: '',
    email: '',
    currentEmployer: '',
    imageURL: ''
  };

  workshops: Workshop[];
  workshop: Workshop;

  constructor(
    private presenterService: PresenterService,
    private router: Router,
    private route: ActivatedRoute,
    private wss: WorkshopsService
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.presenterService.getPresenter(this.id).subscribe(presenter => this.presenter = presenter);
    this.wss.getWorkshops().subscribe(workshops => {
      this.workshops = workshops;
    });
  }

}
