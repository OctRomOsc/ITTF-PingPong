import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 120000,
    reporters: process.env.GITHUB_ACTIONS ? ['verbose', 'github-actions', 'junit', 'json'] : ['verbose', 'json', 'html'],
    coverage : {
      reporter : ['json-summary', 'json', 'html', 'text']
    },
    outputFile: {
      junit: './coverage/test-reporters/junit-report.xml',
      json: './coverage/test-reporters/json-report.json',
    },
    include: ['src/**/*.test.ts'],
  },
});