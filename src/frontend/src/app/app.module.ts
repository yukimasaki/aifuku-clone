import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { ClassValidatorFormBuilderModule } from 'ngx-reactive-form-class-validator';

import { AppRoutingModule } from '~/app-routing.module';
import { AppComponent } from '~/app.component';
import { SidebarComponent } from '~/components/sidebar/sidebar.component';
import { HeaderComponent } from '~/components/header/header.component';
import { HeaderSignedOutComponent } from '~/components/header-signed-out/header-signed-out.component';
import { LoginFormComponent } from '~/components/forms/login-form/login-form.component';
import { NotFoundComponent } from '~/pages/not-found/not-found.component';
import { DashboardComponent } from '~/pages/dashboard/dashboard.component';
import { WelcomeComponent } from '~/pages/welcome/welcome.component';
import { LoginComponent } from '~/pages/login/login.component';
import { sidebarReducer } from '~/store/sidebar/sidebar.reducer';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    HeaderComponent,
    NotFoundComponent,
    DashboardComponent,
    WelcomeComponent,
    LoginComponent,
    HeaderSignedOutComponent,
    LoginFormComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    StoreModule.forRoot({ sidebar: sidebarReducer }),
    FormsModule,
    ReactiveFormsModule,
    ClassValidatorFormBuilderModule.forRoot(),
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
