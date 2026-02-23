import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tags-form',
  imports: [ CommonModule, MatIconModule ],
  templateUrl: './tags-form.html',
  styleUrl: './tags-form.css',
})
export class TagsForm {
  @Input() initialTags: string[] = [];

  tagsList: string[] = [];

  ngOnInit() {
    this.tagsList = [...this.initialTags];
  }

  addTag() {

  }
}
