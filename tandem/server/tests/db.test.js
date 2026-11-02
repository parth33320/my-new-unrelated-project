import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateDatabaseUrl } from '../src/db.js';

describe('validateDatabaseUrl unit tests', () => {
  it('logs a warning when DATABASE_URL does not start with postgres:// or postgresql://', () => {
    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (...args) => warnings.push(args.join(' '));

    try {
      const isValid = validateDatabaseUrl('mysql://localhost:3306/tandem');
      assert.equal(isValid, false);
      assert.equal(warnings.length, 1);
      assert.equal(warnings[0], 'DATABASE_URL does not look like a PostgreSQL connection string');
    } finally {
      console.warn = originalWarn;
    }
  });

  it('does not log a warning when DATABASE_URL starts with postgres://', () => {
    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (...args) => warnings.push(args.join(' '));

    try {
      const isValid = validateDatabaseUrl('postgres://user:pass@localhost:5432/tandem');
      assert.equal(isValid, true);
      assert.equal(warnings.length, 0);
    } finally {
      console.warn = originalWarn;
    }
  });

  it('does not log a warning when DATABASE_URL starts with postgresql://', () => {
    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (...args) => warnings.push(args.join(' '));

    try {
      const isValid = validateDatabaseUrl('postgresql://user:pass@localhost:5432/tandem');
      assert.equal(isValid, true);
      assert.equal(warnings.length, 0);
    } finally {
      console.warn = originalWarn;
    }
  });

  it('does not log a warning when DATABASE_URL is not set (undefined or empty)', () => {
    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (...args) => warnings.push(args.join(' '));

    try {
      const isValidUndefined = validateDatabaseUrl(undefined);
      assert.equal(isValidUndefined, true);
      assert.equal(warnings.length, 0);

      const isValidEmpty = validateDatabaseUrl('');
      assert.equal(isValidEmpty, true);
      assert.equal(warnings.length, 0);
    } finally {
      console.warn = originalWarn;
    }
  });
});
