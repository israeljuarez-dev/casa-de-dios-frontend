import { 
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output 
} from '@angular/core';

@Component({
  selector: 'app-paginator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './paginator.html',
  styleUrl: './paginator.css',
})
export class Paginator {
  totalPages = input.required<number>();
  totalElements = input.required<number>();
  currentPage = input.required<number>();
  pageSize = input.required<number>();
  entityLabel = input<string>('registros');

  pageChange = output<number>();

  readonly pageNumbers = computed<(number | 'ellipsis')[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const neighbors = 1;

    const shown: number[] = [];
    for (let i = 1; i <= total; i++) {
      const isFirst = i === 1;
      const isLast = i === total;
      const isNearCurrent =
        i >= Math.max(1, current - neighbors) &&
        i <= Math.min(total, current + neighbors);
      if (isFirst || isLast || isNearCurrent) shown.push(i);
    }

    const result: (number | 'ellipsis')[] = [];
    let previous: number | null = null;
    for (const pageIndex of shown) {
      if (previous !== null && pageIndex - previous > 1) result.push('ellipsis');
      result.push(pageIndex);
      previous = pageIndex;
    }
    return result;
  });
  readonly showingStart = computed(() =>
    (this.currentPage() - 1) * this.pageSize() + 1
  );
  readonly showingEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.totalElements())
  );
}