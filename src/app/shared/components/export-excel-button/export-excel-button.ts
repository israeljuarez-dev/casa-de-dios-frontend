import { 
  ChangeDetectionStrategy,
  Component,
  input,
  output 
} from '@angular/core';

@Component({
  selector: 'app-export-excel-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './export-excel-button.html',
  styleUrl: './export-excel-button.css',
})
export class ExportExcelButton {
  readonly isLoading = input<boolean>(false);
  
  readonly clicked = output<void>();
}