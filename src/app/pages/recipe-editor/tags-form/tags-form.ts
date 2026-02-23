import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-tags-form',
  imports: [],
  templateUrl: './tags-form.html',
  styleUrl: './tags-form.css',
})
export class TagsForm {
  @Input() initialTags: string[] = [];

  tagsList: string[] = [];

  ngOnInit() {
    this.tagsList = [...this.initialTags];
  }

}
