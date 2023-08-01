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
  private API_URL = '/api/auth/signin';
  public loginForm!: ClassValidatorFormGroup;
  public showError = {
    email: false,
    password: false,
  }
  public errorResponse!: string;

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
    return await this.http.post(
      this.API_URL,
      body,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      }
    ).subscribe({
      next: (res) => {
        // ログイン成功時の処理
        console.log(res);
      },
      error: (err) => {
        // ログイン失敗時の処理
        this.errorResponse = err.error.message;
      },
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
