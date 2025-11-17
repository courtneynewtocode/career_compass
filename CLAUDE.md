# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Career Compass is a student career assessment tool that helps students discover their interests, strengths, and growth areas through a questionnaire-based assessment. Currently, all code exists in a single `Index.html` file containing HTML, CSS, and JavaScript.

## Current Architecture

### Single-File Structure
The entire application is contained in `Index.html`:
- **Inline CSS** (lines 11-158): Custom properties, card layouts, progress bars, question styling
- **Assessment Data** (lines 176-331): Hardcoded questionnaire sections including:
  - Section A: Career Clusters (6 categories × 6 questions) - Holland's RIASEC model
  - Section B: Career Drivers (5 categories × 3 questions) - Growth, Security, Flexibility, Recognition, Innovation
  - Section C: Strengths & Skills (27 items split across 3 pages, grouped into 9 strength clusters)
  - Section D: Growth Areas (15 items split across 2 pages)
- **Application Logic** (lines 332-804): State management, page rendering, scoring, and PDF export

### Key Data Structures
- `sections[]`: Array of all question sections with metadata (key, title, questions, group)
- `answers{}`: Object mapping section keys to arrays of numeric responses (1-5 scale)
- `demographics{}`: Student information (name, age, grade, email, contact, date)
- `strengthClusters[]`: Maps 27 individual strengths to 9 named clusters via indices

### Page Flow
1. **Intro/Demographics page** (`currentPage = -1`): Welcome screen with student detail collection
2. **Question pages** (`currentPage = 0..n`): Sequential navigation through all sections
3. **Results page** (`currentPage = sections.length`): Report generation with PDF download

### Scoring Logic
- Section A: Sum and rank 6 career cluster categories (realistic, investigative, artistic, social, enterprising, conventional)
- Section B: Sum and rank 5 career drivers
- Section C: Aggregate 27 strengths into 9 clusters, rank clusters by total score
- Section D: Overall total of growth area scores

### Dependencies
- **html2pdf.js** (CDN): Converts report HTML to downloadable PDF

## Planned Refactoring (Not Yet Implemented)

The client intends to refactor for multi-test support:
- **Landing page**: `index.html` as website mock/home
- **Test selection**: Dedicated start page with test type selector or URL parameter
- **Modular code**: Separate CSS file(s), modular JavaScript
- **Test configuration**: JSON files defining sections, questions, weightings, result rules per test type
- **Email delivery**: Send results to admin via email API instead of showing to test-taker
- **Completion screen**: Thank-you message only for test-takers

## Development Notes

### File Naming
- Current file is `Index.html` (capitalized 'I')

### Validation
- Required fields: student name, age, grade
- Email format validation: basic regex pattern
- Contact number validation: South African format (+27 or 0 prefix, 9-12 digits)
- All questions must be answered before proceeding to next page

### Styling Conventions
- CSS custom properties for theming (--bg, --card, --accent, --muted, --radius, --glass)
- Teal/turquoise accent color (#0b8f8f)
- Card-based layout with subtle shadows
- Responsive breakpoint at 700px width
