Promote an idea from workflows/ideas/ to workflows/tasks/.

## Instructions

1. The argument is the idea filename: $ARGUMENTS
2. If no filename is provided:
   - List all files in `workflows/ideas/`
   - Ask the user which one to promote
3. Read the idea file from `workflows/ideas/[filename]`
4. If the file does not exist, show an error and list available ideas
5. Update the file content:
   - Change `status: idea` to `status: task`
   - Add `promoted: [today's date YYYY-MM-DD]` to frontmatter
   - Add `complexity: medium` to frontmatter (ask user if they want to adjust)
   - Ensure priority is set (ask user to confirm or change)
   - Ensure acceptance criteria are defined with checkboxes
   - If acceptance criteria are missing or placeholder, ask the user to define them
6. Move the file:
   - Write the updated content to `workflows/tasks/[filename]`
   - Delete the original from `workflows/ideas/[filename]`
7. Confirm the promotion with:
   - Filename and new location
   - Priority and complexity
   - Number of acceptance criteria
8. Suggest next steps: "This task is now ready for implementation. Use `/complete [filename]` when done."
