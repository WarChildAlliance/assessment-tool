import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from '../core/models/user.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  user: User;

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const userSubscription = this.route.data.subscribe(
      (data: { user: User }) => this.user = data.user
    );

    this.subscriptions.push(userSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
