Create a new idea in the workflow pipeline.

## Instructions

1. Take the user's input as the idea title: $ARGUMENTS
2. If no title is provided, ask the user for one
3. Generate a filename using today's date and a slugified version of the title:
   - Format: `YYYY-MM-DD-short-slug.md`
   - Lowercase, hyphens instead of spaces, remove special characters
4. Create the file in `workflows/ideas/` with this template:

```markdown
---
title: [The title]
created: [today's date YYYY-MM-DD]
status: idea
author: user
tags: []
priority: medium
---

# [The title]

## Description

[Ask the user to describe the idea, or use any description they provided]

## Notes

- Created via /idea command

## Possible Acceptance Criteria

- [ ] [To be defined when promoted to task]
```

5. Confirm creation with the filename and a brief summary
6. Suggest next steps: "Use `/promote [filename]` when ready to turn this into a task."
