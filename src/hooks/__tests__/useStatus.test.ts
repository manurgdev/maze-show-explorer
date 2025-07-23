import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useStatus } from '../useStatus';

describe('useStatus', () => {
  it('returns correct status and color for "Running"', () => {
    const { result } = renderHook(() => useStatus('Running'));
    
    expect(result.current.status).toEqual({
      status: 'En emisión',
      color: 'bg-green-500 shadow-lg shadow-green-500/50'
    });
  });

  it('returns correct status and color for "Ended"', () => {
    const { result } = renderHook(() => useStatus('Ended'));
    
    expect(result.current.status).toEqual({
      status: 'Finalizada',
      color: 'bg-gray-400'
    });
  });

  it('returns correct status and color for "In Development"', () => {
    const { result } = renderHook(() => useStatus('In Development'));
    
    expect(result.current.status).toEqual({
      status: 'Producción',
      color: 'bg-yellow-500 shadow-lg shadow-yellow-500/50'
    });
  });

  it('returns correct status and color for "To Be Determined"', () => {
    const { result } = renderHook(() => useStatus('To Be Determined'));
    
    expect(result.current.status).toEqual({
      status: 'TBD',
      color: 'bg-blue-500 shadow-lg shadow-blue-500/50'
    });
  });

  it('returns default status and color for unknown status', () => {
    const { result } = renderHook(() => useStatus('Unknown Status'));
    
    expect(result.current.status).toEqual({
      status: 'N/A',
      color: 'bg-gray-400'
    });
  });

  it('returns default status and color for empty string', () => {
    const { result } = renderHook(() => useStatus(''));
    
    expect(result.current.status).toEqual({
      status: 'N/A',
      color: 'bg-gray-400'
    });
  });

  it('handles case sensitivity correctly', () => {
    const { result } = renderHook(() => useStatus('running'));
    
    expect(result.current.status).toEqual({
      status: 'N/A',
      color: 'bg-gray-400'
    });
  });

  it('memoizes result correctly when statusType does not change', () => {
    const { result, rerender } = renderHook(
      ({ statusType }) => useStatus(statusType),
      { initialProps: { statusType: 'Running' } }
    );
    
    const firstResult = result.current.status;
    
    rerender({ statusType: 'Running' });
    
    expect(result.current.status).toBe(firstResult);
  });

  it('updates result when statusType changes', () => {
    const { result, rerender } = renderHook(
      ({ statusType }) => useStatus(statusType),
      { initialProps: { statusType: 'Running' } }
    );
    
    expect(result.current.status.status).toBe('En emisión');
    
    rerender({ statusType: 'Ended' });
    
    expect(result.current.status.status).toBe('Finalizada');
  });

  it('handles null or undefined gracefully', () => {
    const { result: nullResult } = renderHook(() => useStatus(null as unknown as string));
    const { result: undefinedResult } = renderHook(() => useStatus(undefined as unknown as string));
    
    expect(nullResult.current.status).toEqual({
      status: 'N/A',
      color: 'bg-gray-400'
    });
    
    expect(undefinedResult.current.status).toEqual({
      status: 'N/A',
      color: 'bg-gray-400'
    });
  });
}); 