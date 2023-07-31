import { Component, OnInit } from '@angular/core';
import { ClassValidatorFormBuilderService, ClassValidatorFormControl, ClassValidatorFormGroup } from 'ngx-reactive-form-class-validator';
import { LoginFormValidator } from './login-form.validator';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: []
})
export class LoginFormComponent implements OnInit {
  private API_URL = 'https://aifuku.local:3001/api/auth/signin';
  public loginForm!: ClassValidatorFormGroup;
  public showError = {
    email: false,
    password: false,
  }

  public constructor(
    private readonly fb: ClassValidatorFormBuilderService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group(LoginFormValidator, {
      email: new ClassValidatorFormControl(''),
      password: new ClassValidatorFormControl(''),
    });
  }

  async onSubmit(body: LoginFormValidator) {
    console.log(body);
    return await this.http.post(
      this.API_URL,
      body,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      }
    ).subscribe(res => {
      console.log(res);
    });
  }

  getErrors(property: string) {
    const validationErrors = this.loginForm.get(property)?.errors;
    const errors = validationErrors && Object.values(validationErrors);
    return errors;
  }

  onInputBlur(property: keyof typeof this.showError): void {
    this.showError[property] = true;
  }
}
