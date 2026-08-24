# Contributing to SplitKaro

Thank you for contributing to SplitKaro! To maintain a clear and readable project history, we strictly follow the **Conventional Commits** specification for all commit messages.

## Commit Message Format

Each commit message consists of a **header**, a **body**, and a **footer**. The header has a special format that includes a `type`, a `scope`, and a `description`:

```
type(scope): description

[optional body]

[optional footer(s)]
```

### 1. Type (Required)

The `type` must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **chore**: Changes to the build process, auxiliary tools, or libraries (e.g. updating dependencies)
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)
- **test**: Adding missing tests or correcting existing tests
- **perf**: A code change that improves performance

### 2. Scope (Optional)

The `scope` should be the name of the npm package or module that is affected (e.g. `ui`, `api`, `db`, `auth`, `expenses`, `settlements`, `groups`). It is flexible but should accurately reflect the area of the codebase being modified.

### 3. Description (Required)

The `description` contains a succinct description of the change:

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (.) at the end

### Examples

- `feat(expenses): add support for percentage splits`
- `fix(auth): resolve token refresh issue on concurrent requests`
- `chore(setup): configure commitlint and husky`
- `docs: update API documentation for groups`

## Automatic Enforcement

This commit message format is automatically enforced on every commit using **Husky** and **Commitlint**. If you attempt to commit with a message that does not follow this format, your commit will be rejected. Simply re-run your `git commit` command with a valid message.
