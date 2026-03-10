// test/setup.ts (already good)
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {}); // silence
  jest.spyOn(console, 'log').mockImplementation(() => {}); // optional: silence logs too
});

afterEach(() => {
  jest.restoreAllMocks();
});
