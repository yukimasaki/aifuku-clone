import { Component, OnInit } from '@angular/core';
import { ClassValidatorFormBuilderService, ClassValidatorFormControl, ClassValidatorFormGroup } from 'ngx-reactive-form-class-validator';
import { LoginFormValidator } from './login-form.validator';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: []
})
export class LoginFormComponent implements OnInit {
  public loginForm!: ClassValidatorFormGroup;
  public showError = {
    email: false,
    password: false,
  }

  public constructor(
    private readonly fb: ClassValidatorFormBuilderService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group(LoginFormValidator, {
      email: new ClassValidatorFormControl(''),
      password: new ClassValidatorFormControl(''),
    });
  }

  onSubmit(): void {
    console.log(this.loginForm.value);
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
