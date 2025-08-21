# 🤝 Contributing to Smart Dropzone

Thank you for your interest in contributing to Smart Dropzone! We welcome contributions from developers of all skill levels.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Contributions](#making-contributions)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## 📜 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please be respectful and constructive in all interactions.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (preferred) or npm/yarn
- Git

### Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/YOUR_USERNAME/smart-dropzone.git
   cd smart-dropzone
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Start Development**

   ```bash
   cd packages/smart-dropzone
   pnpm dev
   ```

4. **Run Tests**
   ```bash
   pnpm test
   pnpm test:coverage
   ```

## 🛠️ Making Contributions

### Types of Contributions

- 🐛 **Bug Fixes** - Fix existing issues
- ✨ **New Features** - Add new functionality
- 📚 **Documentation** - Improve docs and examples
- 🧪 **Tests** - Add or improve test coverage
- 🎨 **UI/UX** - Enhance user interface and experience
- 🚀 **Performance** - Optimize performance and bundle size

### Before You Start

1. **Check existing issues** to see if your contribution is already being worked on
2. **Create an issue** if one doesn't exist for your contribution
3. **Discuss your approach** in the issue to get feedback before starting

## 🔄 Pull Request Process

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number-description
```

### 2. Make Your Changes

- Write clear, concise commit messages
- Follow the coding standards
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run all tests
pnpm test:all

# Check test coverage
pnpm test:coverage

# Type checking
pnpm type-check

# Linting
pnpm lint
```

### 4. Update Documentation

- Update README.md if you've added new features
- Add/update JSDoc comments
- Update CHANGELOG.md following the format

### 5. Submit Pull Request

- Push your branch to your fork
- Create a pull request against the `main` branch
- Fill out the pull request template completely
- Link any related issues

## 🎯 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Provide proper type definitions
- Avoid `any` types - use proper typing
- Use strict TypeScript configuration

```typescript
// ✅ Good
interface UploadOptions {
  maxFileSize: number;
  allowedTypes: string[];
}

// ❌ Avoid
const options: any = { ... };
```

### Code Style

- Use Prettier for formatting (automatic)
- Follow ESLint rules
- Use meaningful variable and function names
- Write self-documenting code with clear comments

```typescript
// ✅ Good
const validateFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

// ❌ Avoid
const vfs = (f: any, ms: any) => f.size <= ms;
```

### Component Structure

```typescript
// ✅ Recommended component structure
interface ComponentProps {
  // Props interface first
}

export const Component: React.FC<ComponentProps> = ({
  prop1,
  prop2,
  ...props
}) => {
  // Hooks at the top
  const [state, setState] = useState();
  const ref = useRef();

  // Event handlers
  const handleEvent = useCallback(() => {
    // Handler logic
  }, [dependencies]);

  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // Early returns
  if (loading) return <Spinner />;

  // Main render
  return (
    <div {...props}>
      {/* JSX */}
    </div>
  );
};
```

## 🧪 Testing

### Testing Requirements

- **New features** must include tests
- **Bug fixes** should include regression tests
- Maintain **80%+ test coverage**
- Tests should be **fast and reliable**

### Testing Guidelines

```typescript
// Test file structure
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  describe('Feature Group', () => {
    it('should behave correctly in specific scenario', () => {
      // Arrange
      const props = { ... };

      // Act
      render(<Component {...props} />);

      // Assert
      expect(screen.getByText('Expected')).toBeInTheDocument();
    });
  });
});
```

### Test Types

- **Unit Tests** - Test individual functions/components
- **Integration Tests** - Test component interactions
- **E2E Tests** - Test complete user flows
- **Performance Tests** - Test performance benchmarks

## 📚 Documentation

### JSDoc Comments

````typescript
/**
 * Validates a file against the provided criteria
 * @param file - The file to validate
 * @param options - Validation options
 * @returns Promise that resolves to validation result
 * @example
 * ```typescript
 * const result = await validateFile(file, { maxSize: 1024 });
 * if (result.isValid) {
 *   // File is valid
 * }
 * ```
 */
export async function validateFile(
  file: File,
  options: ValidationOptions
): Promise<ValidationResult> {
  // Implementation
}
````

### README Updates

When adding new features:

1. Add to the feature list
2. Include usage examples
3. Update API reference if needed
4. Add to the appropriate preset documentation

## 🏷️ Commit Message Format

Use conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting, missing semicolons, etc.
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `test` - Adding missing tests
- `chore` - Maintenance tasks

**Examples:**

```
feat(upload): add chunked upload support
fix(validation): handle edge case in file validation
docs(readme): add new usage examples
test(core): add tests for file processor
```

## 🔍 Review Process

### What We Look For

- **Functionality** - Does it work as expected?
- **Code Quality** - Is it readable and maintainable?
- **Tests** - Are there adequate tests?
- **Documentation** - Is it properly documented?
- **Performance** - Does it impact bundle size or runtime performance?
- **Compatibility** - Does it work across supported environments?

### Review Timeline

- Initial review within 2-3 business days
- Follow-up reviews within 1-2 business days
- We aim to merge approved PRs quickly

## 🎉 Recognition

Contributors are recognized in:

- CHANGELOG.md for their contributions
- README.md sponsors/contributors section
- GitHub contributors page
- Release notes for significant contributions

## 🆘 Getting Help

- **Questions?** Open a discussion
- **Issues?** Check existing issues or create a new one
- **Chat?** Join our community discussions
- **Email?** Reach out to the maintainers

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for making Smart Dropzone better! 🚀
