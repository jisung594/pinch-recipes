import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RecipeIndexService } from '../../../services/recipe-index.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css',
  imports: [CommonModule, FormsModule, MatIconModule],
})
export class SearchBar {
  @Input() searchTerm = '';
  @Output() searchTermChange = new EventEmitter<string>();
  searchSuggestions: string[] = [];
  showSearchSuggestions = false;
  selectedSuggestionIndex = -1;

  constructor(private recipeIndexService: RecipeIndexService) {}

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.searchTermChange.emit(searchTerm);
    
    if (searchTerm.length >= 2) {
      this.searchSuggestions = this.recipeIndexService.getSuggestions(searchTerm, 8);
      this.showSearchSuggestions = true;
    } else {
      this.searchSuggestions = [];
      this.showSearchSuggestions = false;
    }
  }

  selectSuggestion(suggestion: string): void {
    this.searchTerm = suggestion;
    this.searchTermChange.emit(suggestion);
    this.showSearchSuggestions = false;
    this.selectedSuggestionIndex = -1;
  }

  onSuggestionKeydown(event: KeyboardEvent): void {
    if (!this.showSearchSuggestions || this.searchSuggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedSuggestionIndex = Math.min(
          this.selectedSuggestionIndex + 1,
          this.searchSuggestions.length - 1
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedSuggestionIndex = Math.max(
          this.selectedSuggestionIndex - 1,
          -1
        );
        break;
      case 'Enter':
      case 'Tab':
        event.preventDefault();
        if (this.selectedSuggestionIndex >= 0) {
          this.selectSuggestion(
            this.searchSuggestions[this.selectedSuggestionIndex]
          );
        }
        break;
      case 'Escape':
        this.showSearchSuggestions = false;
        this.selectedSuggestionIndex = -1;
        break;
    }
  }

  onClickOutside(): void {
    this.showSearchSuggestions = false;
  }
}
