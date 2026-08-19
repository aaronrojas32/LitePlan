import { StackCalculation } from '../../types/material';
import { calculateStacks } from './storageCalculator';

export { calculateStacks };

/**
 * Backwards-compatible alias for calculateStacks
 */
export function getStacks(quantity: number, stackSize: number = 64): StackCalculation {
  return calculateStacks(quantity, stackSize);
}
