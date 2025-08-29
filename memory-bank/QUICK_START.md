# Memory Bank Quick Start Guide

## 1-Minute Setup

### Step 1: Copy Template
```bash
# From your project root
cp -r path/to/Memory-Bank-Template memory-bank
```

### Step 2: Initialize with AI
Tell Claude Code:
```
Please initialize the memory bank for this project by:
1. Reading memory-bank/prompts/PROJECT_ANALYSIS_PROMPT.md
2. Analyzing the codebase following its instructions
3. Creating initial documentation in the appropriate directories
```

### Step 3: Start Using
After each work session:
```
Please update the memory bank using memory-bank/prompts/UPDATE_PROMPT.md
```

## 5-Minute Customization

### Adapt Categories
1. Review directory structure
2. Add domain-specific categories if needed
3. Update templates for your tech stack

### Set Up Maintenance
1. Add to your calendar: Weekly memory bank review
2. Set up git hooks for reminder (optional)
3. Configure your IDE with memory bank shortcuts

### Team Onboarding
Share this with your team:
```
We use a memory bank system for documentation.
- Read: memory-bank/README.md for overview
- Before starting: Check memory-bank/active/activeContext.md
- After working: Update using the UPDATE_PROMPT
```

## Quick Reference Card

### Daily Commands
```bash
# View current context
cat memory-bank/active/activeContext.md

# Check todos
cat memory-bank/active/activeContext-todo.md

# See recent changes
cat memory-bank/active/activeContext-recent-changes.md
```

### AI Prompts
```
# Start of session
"What's the current development context from the memory bank?"

# During work
"Based on the memory bank patterns, how should I implement [feature]?"

# End of session
"Please update the memory bank with today's work"

# Weekly
"Please perform weekly memory bank maintenance"
```

### File Locations
- **Current work**: `memory-bank/active/`
- **How-to guides**: `memory-bank/patterns/`
- **Feature docs**: `memory-bank/features/`
- **Problem solutions**: `memory-bank/technical/`
- **Project info**: `memory-bank/core/`

## Troubleshooting

### "Too Many Files"
- Start with just `active/` directory
- Add other sections gradually
- Focus on documenting what helps most

### "Not Sure What to Document"
- Run the PROJECT_ANALYSIS_PROMPT first
- Document anything you'd want to remember in 3 months
- Focus on decisions and patterns, not obvious code

### "Maintenance Feels Like a Chore"
- Use the automated prompts
- Set a timer (5 min daily, 15 min weekly)
- Remember: Small updates > perfect documentation

## Success Metrics

You'll know it's working when:
- ✅ AI gives more contextual responses
- ✅ Onboarding new team members is faster
- ✅ You spend less time explaining context
- ✅ Pattern consistency improves
- ✅ Fewer "why did we do it this way?" moments

---

Ready to start? Run the initialization prompt and begin building your project's memory!