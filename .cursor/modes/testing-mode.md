# Playwright Testing Mode

**Trigger**: `test mode` | `playwright mode` | `run tests`

## Critical Rules

### Before Every Push
```bash
npm run build              # MUST pass
npm run test:ui            # Run affected tests
npx playwright test --headed  # Debug if needed
```

### Test Coverage Requirements
- New features → New tests
- Bug fixes → Regression tests
- UI changes → Interaction tests

### Quick Commands
```bash
# All UI tests
npm run test:ui

# Specific file
npx playwright test tests/feature.spec.ts

# Debug mode
npx playwright test --debug

# With browser visible
npx playwright test --headed
```

## Playwright = Cypress (but better)

| Feature | Playwright | Cypress |
|---------|------------|---------|
| Multi-browser | ✅ Chrome, Firefox, Safari | ⚠️ Limited |
| Speed | ✅ Parallel | ⚠️ Sequential |
| Mobile | ✅ Native | ⚠️ Viewport only |

### Command Equivalents:
```javascript
// Cypress → Playwright
cy.get('[data-testid="x"]') → page.locator('[data-testid="x"]')
cy.visit('/page')          → page.goto('/page')
cy.contains('text')        → page.locator('text=text')
```

## Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/page');
    await expect(page.locator('[data-testid="element"]')).toBeVisible();
  });
});
```

## Never Push Without:
- ✅ Build passing
- ✅ Tests passing
- ✅ Linting clean

_Testing is not optional. Tests protect users._
