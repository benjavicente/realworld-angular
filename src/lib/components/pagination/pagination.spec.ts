import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Pagination } from './pagination';

describe('Pagination', () => {
  async function renderPagination(inputs = { currentPage: 1, totalPages: 1 }) {
    return render(Pagination, { inputs });
  }

  it('should not render when totalPages is 1', async () => {
    await renderPagination();

    expect(screen.queryByRole('navigation', { name: 'Pagination' })).toBeNull();
  });

  it('should render navigation when totalPages > 1', async () => {
    await renderPagination({ currentPage: 3, totalPages: 5 });

    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeTruthy();
  });

  it('should render page number buttons', async () => {
    await renderPagination({ currentPage: 2, totalPages: 3 });

    expect(screen.getByRole('button', { name: 'Page 1' }).textContent).toContain('1');
    expect(screen.getByRole('button', { name: 'Page 2' }).textContent).toContain('2');
    expect(screen.getByRole('button', { name: 'Page 3' }).textContent).toContain('3');
  });

  it('should highlight current page', async () => {
    await renderPagination({ currentPage: 4, totalPages: 5 });

    const activeBtn = screen.getByRole('button', { name: 'Page 4' });
    expect(activeBtn.getAttribute('aria-current')).toBe('page');
  });

  it('should disable prev button on first page', async () => {
    await renderPagination({ currentPage: 1, totalPages: 5 });

    expect(
      (screen.getByRole('button', { name: 'Previous page' }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it('should disable next button on last page', async () => {
    await renderPagination({ currentPage: 5, totalPages: 5 });

    expect((screen.getByRole('button', { name: 'Next page' }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it('should emit pageChange on page click', async () => {
    const user = userEvent.setup();
    const { fixture } = await renderPagination({ currentPage: 1, totalPages: 5 });
    const emitted: number[] = [];
    fixture.componentRef.instance.pageChange.subscribe((page) => emitted.push(page));

    await user.click(screen.getByRole('button', { name: 'Page 2' }));

    expect(emitted).toContain(2);
  });

  it('should emit pageChange - 1 on prev click', async () => {
    const user = userEvent.setup();
    const { fixture } = await renderPagination({ currentPage: 3, totalPages: 5 });
    const emitted: number[] = [];
    fixture.componentRef.instance.pageChange.subscribe((page) => emitted.push(page));

    await user.click(screen.getByRole('button', { name: 'Previous page' }));

    expect(emitted).toContain(2);
  });

  it('should emit pageChange + 1 on next click', async () => {
    const user = userEvent.setup();
    const { fixture } = await renderPagination({ currentPage: 3, totalPages: 5 });
    const emitted: number[] = [];
    fixture.componentRef.instance.pageChange.subscribe((page) => emitted.push(page));

    await user.click(screen.getByRole('button', { name: 'Next page' }));

    expect(emitted).toContain(4);
  });
});
