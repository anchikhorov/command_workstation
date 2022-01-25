import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JobsComponent } from './jobs/jobs.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from './theme/angular-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { JobPreviewComponent } from './jobs/job-preview/job-preview.component';
import { JobPropertiesComponent } from './jobs/job-properties/job-properties.component';
import { ReactiveFormsModule } from "@angular/forms";
//import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    JobsComponent,
    JobPreviewComponent,
    JobPropertiesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
