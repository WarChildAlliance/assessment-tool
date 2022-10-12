import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { User } from "../core/models/user.model";
import { UserService } from "../core/services/user.service";

@Component({
  selector: "app-intro",
  templateUrl: "./intro.component.html",
  styleUrls: ["./intro.component.scss"],
})
export class IntroComponent implements OnInit, OnDestroy {
  public onEnterAnimation = false;
  public onSecondBallon = false;
  public onBeeLeave = false;
  public userData: User;
  private userSubscription: Subscription = new Subscription();
  
  constructor(private userService: UserService, private router: Router) {
  }

  ngOnInit(): void {
    this.userSubscription = this.userService.getUser().subscribe(async (data) => {
      this.userData = data;
      await this.runEnterAnimation();
      await this.runSecondSpeech();
      await this.runBeeLeaves(); 
      this.userService.updateUserNoCache({ id: this.userData.id,see_intro: false}).subscribe(() => {
        this.router.navigate(['/']);
      });
    });
    
  }
  
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  timeout(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async runEnterAnimation() {
    this.onEnterAnimation = true;
    await this.timeout(4500);
    this.onEnterAnimation = false;
  }
  
  async runSecondSpeech() {
    this.onSecondBallon = true;
    await this.timeout(4500);
    this.onSecondBallon = false;
  }

  async runBeeLeaves() {
    this.onBeeLeave = true;
  }
}
