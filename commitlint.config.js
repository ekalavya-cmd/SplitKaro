/**
 * Commitlint configuration
 * 
 * This enforces a Conventional Commits format for all commit messages.
 * Format: type(scope): description
 * Example: fix(ui): change button color from red to blue
 * 
 * The 'scope' is flexible (e.g., ui, api, db, auth, expenses, settlements, groups)
 * but should accurately reflect the area of the codebase being modified.
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'chore', 'docs', 'style', 'test', 'perf']
    ]
  }
};
