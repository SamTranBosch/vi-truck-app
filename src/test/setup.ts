import '@testing-library/jest-dom/vitest';

// jsdom has no canvas: make getContext quietly return null so the Trace activity uses its no-canvas fallback.
HTMLCanvasElement.prototype.getContext = (() => null) as unknown as typeof HTMLCanvasElement.prototype.getContext;
