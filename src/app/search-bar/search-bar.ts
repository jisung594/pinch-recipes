import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-search-bar',
  standalone: true,
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
  imports: [CommonModule,FormsModule]
})
export class SearchBar {
  @Input() searchTerm = '';
  @Output() searchTermChange = new EventEmitter<string>();
}
