import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/core/models/user.model';

@Component({
  selector: 'app-student-points',
  templateUrl: './student-points.component.html',
  styleUrls: ['./student-points.component.scss']
})
export class StudentPointsComponent implements OnInit {

  user: User;

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.data.subscribe(
      (data: { user: User }) => this.user = data.user
    );
  }
}
