#!/bin/bash

mkdir -p reports

TEST_FILES=(
  "home"
  "alert_history"
  "danger"
  "five-day"
  "rainfall"
  "temperature"
  "weather_province"
)

OVERALL_EXIT_CODE=0

for TEST_NAME in "${TEST_FILES[@]}"; do
  echo "===== Running tests/${TEST_NAME}.spec.ts ====="

  set +e
  npx playwright test "tests/${TEST_NAME}.spec.ts" | tee "reports/${TEST_NAME}-report.txt"
  TEST_EXIT_CODE=${PIPESTATUS[0]}
  set -e

  echo "$TEST_EXIT_CODE" > "reports/${TEST_NAME}-status.txt"

  if [ "$TEST_EXIT_CODE" -ne 0 ]; then
    OVERALL_EXIT_CODE=1
  fi
done

pip install openpyxl

RUN_DATE=$(TZ='Asia/Bangkok' date '+%d/%m/%Y')
export RUN_DATE

python scripts/create-performance-excel.py
python scripts/send-teams-summary.py

exit $OVERALL_EXIT_CODE