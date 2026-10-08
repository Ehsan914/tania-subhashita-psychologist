import type { CSSProperties } from 'react';

// Legend swatches read their colour from the --c custom property.
export const colorVar = (c: string) => ({ '--c': c }) as CSSProperties;
