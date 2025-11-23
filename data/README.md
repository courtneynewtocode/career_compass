# Data Storage Directory

This directory stores assessment results in JSON format.

## Structure

```
data/
  └── results/
      ├── 2025-01-18_103045_abc123_career-compass_John_Doe.json
      ├── 2025-01-18_104521_def456_career-readiness_Jane_Smith.json
      └── ...
```

## File Naming Convention

Files are named with the following format:
```
{DATE}_{TIME}_{UNIQUE_ID}_{TEST_ID}_{STUDENT_NAME}.json
```

Example: `2025-01-18_103045_abc123_career-compass_John_Doe.json`

## File Contents

Each JSON file contains:
- `id`: Unique identifier
- `testId`: Test type (career-compass, career-readiness, etc.)
- `testName`: Full name of the test
- `demographics`: Student details (name, age, grade, email, contact)
- `answers`: All question responses
- `scores`: Calculated scores
- `reportData`: Formatted report data
- `submittedAt`: ISO timestamp of submission
- `completionTime`: Time taken to complete (in seconds)

## Migration to Database

When migrating to a database, you can:
1. Create a table matching this JSON structure
2. Import all JSON files using a migration script
3. Archive the JSON files as backup

## Backup

Make sure to backup this directory regularly as it contains all assessment results.
