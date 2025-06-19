import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 60000,
    reporters: process.env.GITHUB_ACTIONS ? ['verbose', 'github-actions', 'junit', 'json'] : ['verbose'],
    outputFile: {
      junit: './junit-report.xml',
      json: './json-report.json',
    },
  },
});