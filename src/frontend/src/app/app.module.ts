import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { StoreModule } from '@ngrx/store';
import { sidebarReducer } from 'src/store/sidebar/sidebar.reducer';
import { NotFoundComponent } from './not-found/not-found.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthModule } from '@auth0/auth0-angular';
import { LoginButtonComponent } from './login-button/login-button.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    HeaderComponent,
    NotFoundComponent,
    DashboardComponent,
    LoginButtonComponent,
  ],
  imports: [
    BrowserModule,
    AuthModule.forRoot({
      domain: 'dev-aifuku.jp.auth0.com',
      clientId: 'hUzhT4Bxfb1MHBjJSeuhvRWvAKIjw9hm',
      authorizationParams: {
        redirect_uri: `${window.location.origin}`
      }
    }),
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    StoreModule.forRoot({ sidebar: sidebarReducer }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
