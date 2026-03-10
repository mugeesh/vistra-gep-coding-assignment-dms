import '@testing-library/jest-dom';

declare global {
    namespace jest {
        interface Matchers<R> extends jest.Matchers<R>, TestingLibraryMatchers<any, R> {}
    }
}
