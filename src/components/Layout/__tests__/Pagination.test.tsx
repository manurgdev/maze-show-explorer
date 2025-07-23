import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Pagination } from '@/components/Layout/Pagination';

vi.mock('@/components/Icons/CaretLeftIcon', () => ({
  CaretLeftIcon: () => <div data-testid="caret-left">←</div>
}));

vi.mock('@/components/Icons/CaretRightIcon', () => ({
  CaretRightIcon: () => <div data-testid="caret-right">→</div>
}));

const defaultProps = {
  currentPage: 0,
  totalPages: 5,
  onPreviousPage: vi.fn(),
  onNextPage: vi.fn(),
  onGoToPage: vi.fn(),
  hasMoreFromApi: true,
  isLoadingMore: false,
  totalItems: 100
};

describe('Pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders current page and total pages', () => {
    render(<Pagination {...defaultProps} currentPage={2} totalPages={10} />);
    
    expect(screen.getAllByText('Página 3 de 10')[0]).toBeInTheDocument();
  });

  it('displays total items count', () => {
    render(<Pagination {...defaultProps} totalItems={150} />);
    
    expect(screen.getByText('150', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('series+', { exact: false })).toBeInTheDocument();
  });

  it('shows loading state when isLoadingMore is true', () => {
    render(<Pagination {...defaultProps} isLoadingMore={true} />);
    
    expect(screen.getByText('Anterior')).toBeInTheDocument();
  });

  it('shows "no more content" message when hasMoreFromApi is false', () => {
    render(<Pagination {...defaultProps} hasMoreFromApi={false} />);
    
    expect(screen.getByText('Siguiente')).toBeInTheDocument();
  });

  it('enables previous button when not on first page', () => {
    render(<Pagination {...defaultProps} currentPage={2} />);
    
    const prevButton = screen.getByText('Anterior');
    expect(prevButton).not.toHaveClass('opacity-50');
    expect(prevButton).not.toHaveAttribute('disabled');
  });

  it('disables previous button when on first page', () => {
    render(<Pagination {...defaultProps} currentPage={0} />);
    
    const prevButton = screen.getByText('Anterior').closest('button');
    expect(prevButton).toHaveAttribute('disabled');
  });

  it('enables next button when not on last page', () => {
    render(<Pagination {...defaultProps} currentPage={2} totalPages={5} />);
    
    const nextButton = screen.getByText('Siguiente').closest('button');
    expect(nextButton).not.toHaveAttribute('disabled');
  });

  it('disables next button when on last page', () => {
    render(<Pagination {...defaultProps} currentPage={4} totalPages={5} />);
    
    const nextButton = screen.getByText('Siguiente').closest('button');
    expect(nextButton).toHaveAttribute('disabled');
  });

  it('calls onPreviousPage when previous button is clicked', () => {
    const mockPrevious = vi.fn();
    render(<Pagination {...defaultProps} currentPage={2} onPreviousPage={mockPrevious} />);
    
    const prevButton = screen.getByText('Anterior');
    fireEvent.click(prevButton);
    
    expect(mockPrevious).toHaveBeenCalledTimes(1);
  });

  it('calls onNextPage when next button is clicked', () => {
    const mockNext = vi.fn();
    render(<Pagination {...defaultProps} currentPage={2} onNextPage={mockNext} />);
    
    const nextButton = screen.getByText('Siguiente');
    fireEvent.click(nextButton);
    
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('does not call onPreviousPage when on first page', () => {
    const mockPrevious = vi.fn();
    render(<Pagination {...defaultProps} currentPage={0} onPreviousPage={mockPrevious} />);
    
    const prevButton = screen.getByText('Anterior');
    fireEvent.click(prevButton);
    
    expect(mockPrevious).not.toHaveBeenCalled();
  });

  it('does not call onNextPage when on last page', () => {
    const mockNext = vi.fn();
    render(<Pagination {...defaultProps} currentPage={4} totalPages={5} onNextPage={mockNext} />);
    
    const nextButton = screen.getByText('Siguiente');
    fireEvent.click(nextButton);
    
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('displays page numbers for small pagination', () => {
    render(<Pagination {...defaultProps} currentPage={1} totalPages={3} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('highlights current page number', () => {
    render(<Pagination {...defaultProps} currentPage={1} totalPages={5} />);
    
    const currentPageButton = screen.getByText('2');
    expect(currentPageButton).toHaveClass('bg-blue-600');
    expect(currentPageButton).toHaveClass('text-white');
  });

  it('calls onGoToPage when page number is clicked', () => {
    const mockGoToPage = vi.fn();
    render(<Pagination {...defaultProps} currentPage={0} totalPages={5} onGoToPage={mockGoToPage} />);
    
    const pageButton = screen.getByText('3');
    fireEvent.click(pageButton);
    
    expect(mockGoToPage).toHaveBeenCalledWith(2);
  });
}); 