import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ToggleSlider } from '@/components/common/ToggleSlider';

const defaultProps = {
  isActive: false,
  onToggle: vi.fn(),
  leftLabel: 'Left',
  rightLabel: 'Right',
  leftIcon: <span data-testid="left-icon">📄</span>,
  rightIcon: <span data-testid="right-icon">∞</span>
};

describe('ToggleSlider', () => {
  it('renders in inactive state by default', () => {
    render(<ToggleSlider {...defaultProps} />);
    
    const slider = screen.getByRole('button');
    expect(slider).toHaveAttribute('aria-pressed', 'false');
    expect(slider).toHaveClass('bg-gray-200');
  });

  it('renders in active state when isActive is true', () => {
    render(<ToggleSlider {...defaultProps} isActive={true} />);
    
    const slider = screen.getByRole('button');
    expect(slider).toHaveAttribute('aria-pressed', 'true');
    expect(slider).toHaveClass('bg-blue-600');
  });

  it('calls onToggle when clicked', () => {
    const mockOnToggle = vi.fn();
    render(<ToggleSlider {...defaultProps} onToggle={mockOnToggle} />);
    
    const slider = screen.getByRole('button');
    fireEvent.click(slider);
    
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility attributes', () => {
    render(<ToggleSlider {...defaultProps} ariaLabel="Toggle mode" />);
    
    const slider = screen.getByRole('button');
    expect(slider).toHaveAttribute('aria-label', 'Toggle mode');
    expect(slider).toHaveAttribute('aria-pressed', 'false');
  });

  it('updates aria-pressed when state changes', () => {
    const { rerender } = render(<ToggleSlider {...defaultProps} isActive={false} />);
    
    let slider = screen.getByRole('button');
    expect(slider).toHaveAttribute('aria-pressed', 'false');
    
    rerender(<ToggleSlider {...defaultProps} isActive={true} />);
    
    slider = screen.getByRole('button');
    expect(slider).toHaveAttribute('aria-pressed', 'true');
  });

  it('displays labels correctly', () => {
    render(<ToggleSlider {...defaultProps} leftLabel="Pagination" rightLabel="Infinite" />);
    
    expect(screen.getByText('Pagination')).toBeInTheDocument();
    expect(screen.getByText('Infinite')).toBeInTheDocument();
  });

  it('displays icons correctly', () => {
    render(<ToggleSlider {...defaultProps} />);
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
  });

  it('has correct visual styling for inactive state', () => {
    render(<ToggleSlider {...defaultProps} isActive={false} />);
    
    const slider = screen.getByRole('button');
    
    expect(slider).toHaveClass('bg-gray-200');
  });

  it('has correct visual styling for active state', () => {
    render(<ToggleSlider {...defaultProps} isActive={true} />);
    
    const slider = screen.getByRole('button');
    
    expect(slider).toHaveClass('bg-blue-600');
  });

  it('is focusable', () => {
    render(<ToggleSlider {...defaultProps} />);
    
    const slider = screen.getByRole('button');
    slider.focus();
    
    expect(slider).toHaveFocus();
  });

  it('maintains consistent styling during interaction', () => {
    render(<ToggleSlider {...defaultProps} />);
    
    const slider = screen.getByRole('button');
    expect(slider).toHaveClass('transition-all');
    expect(slider).toHaveClass('focus:outline-none');
    expect(slider).toHaveClass('focus:ring-2');
  });
}); 