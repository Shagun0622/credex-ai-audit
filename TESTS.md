
# Tests - AI Spend Audit

## Test Framework
- **Vitest** for unit testing
- **Testing Library** for React components (planned)

## Audit Engine Tests (10 tests)

All tests are in `tests/audit-engine.test.ts`

### Test 1: GitHub Copilot Business → Individual
**File:** `tests/audit-engine.test.ts`
**What it covers:** Single user on Business plan should be downgraded to Individual
**How to run:** `npm test`

### Test 2: Cursor Business → Pro
**File:** `tests/audit-engine.test.ts`
**What it covers:** Single user on Business plan should switch to Pro
**How to run:** `npm test`

### Test 3: ChatGPT Team → Plus
**File:** `tests/audit-engine.test.ts`
**What it covers:** Single user on Team plan should switch to Plus
**How to run:** `npm test`

### Test 4: Multi-seat Pro plan (optimal)
**File:** `tests/audit-engine.test.ts`
**What it covers:** 2 seats on Pro plan should show $0 savings
**How to run:** `npm test`

### Test 5: Over-reported spend correction
**File:** `tests/audit-engine.test.ts`
**What it covers:** User reporting $50 for $10 plan should be corrected
**How to run:** `npm test`

### Test 6: Multi-seat Business plan (optimal)
**File:** `tests/audit-engine.test.ts`
**What it covers:** 2 seats on Business plan is correct for teams
**How to run:** `npm test`

### Test 7: Multiple tools combined audit
**File:** `tests/audit-engine.test.ts`
**What it covers:** Full audit across 3 tools calculates total savings correctly
**How to run:** `npm test`

### Test 8: Savings percentage calculation
**File:** `tests/audit-engine.test.ts`
**What it covers:** getSavingsPercentage() returns correct percentages
**How to run:** `npm test`

### Test 9: Unknown tool handling
**File:** `tests/audit-engine.test.ts`
**What it covers:** Unknown tool returns manual review message, $0 savings
**How to run:** `npm test`

### Test 10: High savings detection (>$500)
**File:** `tests/audit-engine.test.ts`
**What it covers:** Large team on Business plan should trigger high-savings flag
**How to run:** `npm test`

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-re-run on changes)
npm run test:watch

# Run tests with UI
npm run test:ui

# Run with coverage report
npm run test:coverage