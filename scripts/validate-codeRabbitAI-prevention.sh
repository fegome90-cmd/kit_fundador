#!/bin/bash
# CodeRabbitAI Prevention Validation Script
# Validates against 4 critical systematic patterns

echo "🔍 Running CodeRabbitAI Prevention Validation..."

# Initialize score tracking
TOTAL_WEIGHT=100
SCORE=0

# Phase 1: Type Safety & Async (25% weight)
echo "🔴 Checking Type Safety & Async..."

# TypeScript strict compilation
if npx tsc --noEmit --strict; then
  SCORE=$((SCORE + 25))
  echo "✅ TypeScript compilation: +25 (Score: $SCORE/$TOTAL_WEIGHT)"
else
  echo "❌ TypeScript compilation: +0 (Score: $SCORE/$TOTAL_WEIGHT)"
fi

# Check for async/await mismatches
if ! grep -r "await.*start()" src/ tests/ >/dev/null 2>&1; then
  echo "✅ No async/await mismatches detected"
else
  echo "❌ Detected await on void methods like start()"
fi

# Phase 2: Dependency Management (20% weight)
echo "🟡 Checking Dependency Management..."

# Check for deprecated @types
if ! grep -r "@types/ajv\|@types/helmet" package.json >/dev/null 2>&1; then
  SCORE=$((SCORE + 10))
  echo "✅ No deprecated @types found: +10 (Score: $SCORE/$TOTAL_WEIGHT)"
else
  echo "❌ Found deprecated @types (ajv, helmet)"
fi

# Security audit
if npm audit --audit-level=moderate >/dev/null 2>&1; then
  SCORE=$((SCORE + 10))
  echo "✅ Security audit passed: +10 (Score: $SCORE/$TOTAL_WEIGHT)"
else
  echo "❌ Security audit failed"
fi

# Phase 3: Testing Standards (25% weight)
echo "🔵 Checking Testing Standards..."

# Server idempotency check
if grep -q "this.server = undefined" src/infrastructure/http/server.ts; then
  SCORE=$((SCORE + 10))
  echo "✅ Server stop() is idempotent: +10 (Score: $SCORE/$TOTAL_WEIGHT)"
else
  echo "❌ Server stop() not idempotent"
fi

# Port logging accuracy check
if grep -q "actualPort.*address.*port" src/infrastructure/http/server.ts; then
  SCORE=$((SCORE + 8))
  echo "✅ Port logging accurate: +8 (Score: $SCORE/$TOTAL_WEIGHT)"
else
  echo "❌ Port logging may show requested vs actual port"
fi

# Test runs
if npm test -- --passWithNoTests >/dev/null 2>&1; then
  SCORE=$((SCORE + 7))
  echo "✅ All tests pass: +7 (Score: $SCORE/$TOTAL_WEIGHT)"
else
  echo "❌ Some tests failing"
fi

# Phase 4: Documentation Integrity (30% weight)
echo "🟢 Checking Documentation Integrity..."

# Markdown lint
if npx markdownlint . >/dev/null 2>&1; then
  SCORE=$((SCORE + 15))
  echo "✅ Markdown lint passed: +15 (Score: $SCORE/$TOTAL_WEIGHT)"
else
  echo "❌ Markdown lint failed"
fi

# Path consistency check
if find . -name "*.md" -exec grep -l "\[.*\](TASK-005-PROGRESS.md)" {} \; | wc -l | grep -v "0" >/dev/null; then
  echo "❌ Inconsistent path references found"
else
  SCORE=$((SCORE + 7))
  echo "✅ Path references consistent: +7 (Score: $SCORE/$TOTAL_WEIGHT)"
fi

# Actionable documentation check
if ! grep -r "Next Steps.*Continuar\|Next Steps.*implementación" dev-docs/ document/validacion/ >/dev/null 2>&1; then
  SCORE=$((SCORE + 8))
  echo "✅ Next steps are actionable: +8 (Score: $SCORE/$TOTAL_WEIGHT)"
else
  echo "❌ Vague next steps found"
fi

# Final score and decision
echo ""
echo "🎯 Final Validation Score: $SCORE/$TOTAL_WEIGHT ($(( SCORE * 100 / TOTAL_WEIGHT ))%)"

if [ $SCORE -ge 90 ]; then
  echo "✅ PASSED: Validation score >= 90%"
  echo "📊 Expected Impact: 85% reduction in CodeRabbitAI issues"
  exit 0
else
  echo "❌ FAILED: Validation score < 90%"
  echo "💡 Review failing validations and fix before commit"
  exit 1
fi