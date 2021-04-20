import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  authForm = new FormGroup({
    code: new FormControl(null, [Validators.required, Validators.pattern(/\d{6+}/)])
  });

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {
  }

  onSubmit(): void {
    const code = this.authForm.get('code').value;
    this.authService.login(code);
  }

}
