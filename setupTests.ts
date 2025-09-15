import '@testing-library/jest-dom';

// Mock Web Audio API
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    createOscillator: jest.fn().mockReturnValue({
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      frequency: {
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
      },
      type: 'sine',
    }),
    createGain: jest.fn().mockReturnValue({
      connect: jest.fn(),
      gain: {
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
      },
    }),
    createBufferSource: jest.fn().mockReturnValue({
      connect: jest.fn(),
      start: jest.fn(),
      buffer: null,
    }),
    createBuffer: jest.fn().mockReturnValue({
      getChannelData: jest.fn().mockReturnValue(new Float32Array(1000)),
    }),
    destination: {},
    currentTime: 0,
    sampleRate: 44100,
    state: 'running',
    resume: jest.fn().mockResolvedValue(undefined),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

