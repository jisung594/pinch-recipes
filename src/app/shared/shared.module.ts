import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    MatIconModule
  ]
})
export class SharedModule { }
