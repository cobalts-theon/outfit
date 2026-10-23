import { jest } from '@jest/globals';

// Node tests use the storage mocks supplied by each suite, not native SQLite.
jest.mock('expo-sqlite/localStorage/install', () => ({}));

// Icon mapping tests import the shared weather UI without a native WebView host.
jest.mock('react-native-webview', () => ({ WebView: () => null }));
