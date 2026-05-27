import { ChangeDetectionStrategy, Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'rw-pagination',
  imports: [],
  template: `
    @if (totalPages() > 1) {
      <nav class="flex items-center justify-center gap-1" aria-label="Pagination">
        <button
          type="button"
          class="flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-md border-[1.5px] border-border bg-surface px-2 text-sm font-medium text-text transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary px-0"
          [disabled]="currentPage() <= 1"
          [attr.aria-label]="'Previous page'"
          (click)="pageChange.emit(currentPage() - 1)"
        >
          <img
            src="/icons/chevron-left.svg"
            alt=""
            width="24"
            height="24"
            aria-hidden="true"
            class="block shrink-0"
          />
        </button>

        @for (page of visiblePages(); track page) {
          @if (page === -1) {
            <span class="px-2 text-sm text-text-muted" aria-hidden="true">…</span>
          } @else {
            <button
              type="button"
              [class]="pageButtonClasses(page)"
              [attr.aria-label]="'Page ' + page"
              [attr.aria-current]="page === currentPage() ? 'page' : null"
              (click)="pageChange.emit(page)"
            >
              {{ page }}
            </button>
          }
        }

        <button
          type="button"
          class="flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-md border-[1.5px] border-border bg-surface px-2 text-sm font-medium text-text transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary px-0"
          [disabled]="currentPage() >= totalPages()"
          [attr.aria-label]="'Next page'"
          (click)="pageChange.emit(currentPage() + 1)"
        >
          <img
            src="/icons/chevron-right.svg"
            alt=""
            width="24"
            height="24"
            aria-hidden="true"
            class="block shrink-0"
          />
        </button>
      </nav>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
  public readonly currentPage = input.required<number>();
  public readonly totalPages = input.required<number>();
  public readonly pageChange = output<number>();

  protected readonly visiblePages = computed<number[]>(() => {
    const pages: number[] = [];
    const delta = 2;

    for (let pageIndex = 1; pageIndex <= this.totalPages(); pageIndex++) {
      if (
        pageIndex === 1 ||
        pageIndex === this.totalPages() ||
        (pageIndex >= this.currentPage() - delta && pageIndex <= this.currentPage() + delta)
      ) {
        pages.push(pageIndex);
      } else if (pages[pages.length - 1] !== -1) {
        pages.push(-1); // ellipsis marker
      }
    }

    return pages;
  });

  protected pageButtonClasses(page: number): string {
    const base =
      'flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-md border-[1.5px] px-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
    if (page === this.currentPage()) {
      return `${base} border-primary bg-primary text-text-on-primary hover:border-primary-dark hover:bg-primary-dark hover:text-text-on-primary`;
    }
    return `${base} border-border bg-surface text-text hover:border-primary hover:text-primary`;
  }
}
