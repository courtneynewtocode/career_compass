# User Guide: Adding & Editing Tests

A simple, non-technical guide for managing assessment tests.

---

## What is a Test?

A **test** is a questionnaire that students complete. Each test is defined by a single JSON file in the `tests/` folder.

**Current tests:**
- `career-compass.json` - Career interests and strengths assessment
- `career-readiness.json` - Career readiness assessment

---

## Adding a New Test

### Step 1: Create the Test File

1. Go to the `tests/` folder
2. Create a new file called `my-test-name.json` (use lowercase, no spaces)
3. Copy the contents from `career-compass.json` as a template
4. Edit the file (see "Editing a Test" below)

### Step 2: Link to the Test

Add a button on `index.html` that links to your new test:

```html
<a href="test.html?test=my-test-name" class="btn">
  Start My Test
</a>
```

**Important:** The `?test=my-test-name` part must match your filename (without `.json`)

### Step 3: Test It

1. Open `index.html` in your browser
2. Click your new button
3. Verify the test loads correctly
4. Use **Ctrl+Shift+Z** (debug mode) to quickly test

---

## Editing a Test

Open the test JSON file (e.g., `tests/career-compass.json`) in any text editor.

### Basic Information (Top Section)

```json
{
  "testId": "career-compass",
  "testName": "Career Compass Assessment",
  "description": "Discover your interests...",
  "estimatedTime": "15-20 minutes"
}
```

**What to change:**
- `testName` - The title shown to students
- `description` - Brief description of the test
- `estimatedTime` - How long it takes

**Don't change:** `testId` (must match filename)

---

### Student Information Fields

```json
"demographics": {
  "fields": [
    {
      "key": "studentName",
      "label": "Student name",
      "type": "text",
      "required": true
    }
  ]
}
```

**Adding a new field:**
1. Copy an existing field
2. Change `key` (unique name, no spaces)
3. Change `label` (what students see)
4. Set `type`: `text`, `number`, `email`, `tel`, or `select`
5. Set `required`: `true` or `false`

**For dropdown fields (`select`):**
```json
{
  "key": "grade",
  "label": "Grade",
  "type": "select",
  "required": true,
  "options": [
    { "value": "9", "label": "Grade 9" },
    { "value": "10", "label": "Grade 10" }
  ]
}
```

---

### Questions & Sections

Each test has **sections** containing **categories** with **questions**.

```json
"sections": [
  {
    "sectionId": "section-a",
    "title": "Career Clusters",
    "description": "Section A: Career Clusters",
    "categories": [
      {
        "key": "realistic",
        "title": "Realistic (Doers)",
        "questions": [
          "I like working with my hands",
          "I enjoy being outdoors"
        ]
      }
    ]
  }
]
```

**Adding questions:**
1. Find the category you want to edit
2. Add new questions to the `questions` array
3. Each question is just a text string in quotes

**Adding a new category:**
1. Copy an existing category `{ }` block
2. Change the `key` (unique name)
3. Change the `title`
4. Add your questions

---

### Important JSON Rules

1. **Commas:** Every line needs a comma at the end, EXCEPT the last item in a list
2. **Quotes:** All text must be in "double quotes"
3. **No trailing commas:** Don't put a comma after the last item
4. **Validate:** Use a JSON validator (jsonlint.com) to check for errors

**Example - Correct:**
```json
{
  "name": "John",
  "age": 25,
  "grade": "10"    ← No comma on last item
}
```

**Example - Wrong:**
```json
{
  "name": "John",
  "age": 25,
  "grade": "10",   ← Extra comma causes error!
}
```

---

## Testing Your Changes

### Quick Test (30 seconds)

1. Open `test.html?test=your-test-name` in browser
2. Press **Ctrl+Shift+Z** (debug mode)
3. Click "Skip to Results"
4. Check if everything looks correct

### Full Test (5 minutes)

1. Open `test.html?test=your-test-name`
2. Fill in student details
3. Answer a few questions manually
4. Submit and check email

---

## Common Issues

### "Failed to load test"

**Problem:** JSON syntax error or file not found

**Fix:**
1. Check filename matches exactly (case-sensitive)
2. Validate JSON at jsonlint.com
3. Check browser console (F12) for specific error

### Questions not showing

**Problem:** Missing or incorrect structure

**Fix:**
1. Ensure `questions` is an array: `"questions": [ ... ]`
2. Each question must be in quotes
3. Check commas between questions

### Email not sending

**Problem:** Configuration issue

**Fix:**
1. Check `js/config.js` has correct API settings
2. Verify internet connection
3. Check browser console (F12) for errors

---

## Configuration Settings

Edit `js/config.js` to change behavior:

### Show Results to Students

```javascript
showResultsToUser: true   // Students see their results
showResultsToUser: false  // Skip directly to "thank you"
```

### PDF Attachment

```javascript
attachPdfReport: true   // Email includes PDF report
attachPdfReport: false  // Simple email only
```

### Store Results Locally

```javascript
storeResults: true   // Save to dashboard
storeResults: false  // Email only (no dashboard)
```

**Note:** You must upload the changed file to your server after editing.

---

## Best Practices

1. **Always backup** before making changes
2. **Test after every change** using debug mode
3. **Use a JSON validator** to check syntax
4. **Keep questions clear** and concise
5. **Avoid special characters** in `key` values (use letters, numbers, hyphens only)
6. **Start small** - add one question at a time

---

## Getting Help

1. **Validate JSON:** https://jsonlint.com
2. **Browser Console:** Press F12 to see errors
3. **Documentation:**
   - [QUICKSTART.md](QUICKSTART.md) - Quick start
   - [CONFIGURATION.md](CONFIGURATION.md) - All settings
   - [README.md](README.md) - Full documentation

---

## Quick Reference

### File Locations

- Test definitions: `tests/*.json`
- Landing page: `index.html`
- Test interface: `test.html`
- Settings: `js/config.js`
- Results dashboard: `dashboard.html`

### Useful Shortcuts

- **Ctrl+Shift+Z** - Debug mode (on test page)
- **F12** - Browser developer tools
- **Ctrl+S** - Save file

### JSON Basics

- `{ }` - Object (container for properties)
- `[ ]` - Array (list of items)
- `"text"` - String (must use double quotes)
- `true/false` - Boolean (no quotes)
- `123` - Number (no quotes)

---

**That's it!** You now know how to add and edit assessment tests.

For more advanced features, see [CONFIGURATION.md](CONFIGURATION.md) and [README.md](README.md).
