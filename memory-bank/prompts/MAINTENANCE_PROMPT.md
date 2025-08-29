# Memory Bank Maintenance Prompt

## Purpose
This prompt guides AI assistants through regular maintenance tasks to keep the memory bank healthy, accurate, and useful.

---

## PROMPT TO USE:

Please perform scheduled maintenance on the memory bank system. Review the maintenance schedule in MAINTENANCE_GUIDE.md and execute the appropriate tasks based on the maintenance type requested.

### Maintenance Type: [DAILY|WEEKLY|MONTHLY|QUARTERLY|ANNUAL]

## DAILY MAINTENANCE (5 minutes)

If daily maintenance is requested, perform these tasks:

1. **Update Active Context**
   - Review `active/activeContext-todo.md`
     - Mark completed tasks with ✅ and date
     - Add any new tasks discovered
     - Reprioritize if needed
   - Update `active/activeContext-recent-changes.md`
     - Add today's significant changes
     - Keep entries concise but informative
   - Check `active/activeContext.md`
     - Update if major state changes occurred
     - Ensure it reflects current reality

2. **Quick Health Check**
   - Verify no broken links in active directory
   - Ensure dates are current
   - Check for any urgent updates needed

## WEEKLY MAINTENANCE (15 minutes)

If weekly maintenance is requested, perform these tasks:

1. **Consolidate Recent Changes**
   - Review `active/activeContext-recent-changes.md`
   - Group related changes together
   - Archive entries older than 2 weeks
   - Identify patterns in recent work

2. **Update Current Status**
   - Revise `active/activeContext-current-status.md`
   - Ensure it accurately reflects project state
   - Update active feature list
   - Note any blockers or issues

3. **Verify Roadmap Alignment**
   - Check `active/roadmap.md` against actual progress
   - Update timelines if needed
   - Flag any deviations from plan
   - Add newly discovered work

4. **Cross-Reference Check**
   - Scan for broken internal links
   - Verify file references are correct
   - Update dependency lists
   - Fix any orphaned references

## MONTHLY MAINTENANCE (45 minutes)

If monthly maintenance is requested, perform comprehensive tasks:

1. **Full Active Directory Review**
   ```
   For each file in active/:
   - Verify content is current
   - Update last_verified date
   - Check if ready for archive
   - Consolidate redundant information
   ```

2. **Core Documentation Verification**
   ```
   For each file in core/:
   - Confirm technical accuracy
   - Update version if changed
   - Verify dependencies
   - Flag any outdated sections
   ```

3. **Pattern Library Audit**
   ```
   For each pattern in patterns/:
   - Verify pattern still in use
   - Update examples to current code
   - Check for new patterns to document
   - Archive deprecated patterns
   ```

4. **Feature Documentation Review**
   ```
   For each feature in features/:
   - Ensure documentation matches implementation
   - Update configuration examples
   - Verify security considerations
   - Add any missing features
   ```

5. **Technical Documentation Update**
   ```
   For technical/:
   - Review learnings for continued relevance
   - Archive solved problems
   - Consolidate related documents
   - Update solution approaches
   ```

6. **Archive Management**
   ```
   For archive/:
   - Review items 6+ months old
   - Consider deletion of no-value items
   - Ensure archive metadata is complete
   - Update archive index if needed
   ```

7. **Generate Maintenance Report**
   Create `archive/MAINTENANCE_REPORT_[YYYY-MM].md`:
   ```markdown
   # Memory Bank Maintenance Report - [Month Year]
   
   ## Summary
   - Total Files: [count] ([+/-] from last month)
   - Files Updated: [count]
   - Files Archived: [count]
   - Files Created: [count]
   - Health Score: [X]/100
   
   ## File Statistics
   | Category  | Count | Updated | Outdated | Archived |
   |-----------|-------|---------|----------|----------|
   | Core      | X     | X       | X        | X        |
   | Active    | X     | X       | X        | X        |
   | Patterns  | X     | X       | X        | X        |
   | Features  | X     | X       | X        | X        |
   | Technical | X     | X       | X        | X        |
   
   ## Key Actions Taken
   1. [Major update or change]
   2. [Significant archival]
   3. [New documentation added]
   
   ## Issues Identified
   - [ ] [Issue needing attention]
   - [ ] [Technical debt in docs]
   - [ ] [Missing documentation]
   
   ## Recommendations
   1. [Improvement suggestion]
   2. [Process enhancement]
   3. [Structure optimization]
   
   ## Next Month Focus
   - [Priority area 1]
   - [Priority area 2]
   ```

## QUARTERLY MAINTENANCE (2 hours)

If quarterly maintenance is requested:

1. **Comprehensive Audit**
   - Run full link checker
   - Analyze content redundancy
   - Review category assignments
   - Assess overall structure

2. **Pattern Evolution**
   - Document pattern changes over quarter
   - Identify emerging patterns
   - Deprecate unused patterns
   - Create pattern migration guides

3. **Documentation Metrics**
   ```
   Calculate and document:
   - Documentation coverage %
   - Update frequency by category
   - Most/least referenced files
   - Average file age
   - Maintenance compliance rate
   ```

4. **Structure Optimization**
   - Consider category reorganization
   - Merge similar documents
   - Split overly large files
   - Improve navigation paths

5. **Quality Improvement**
   - Update all code examples
   - Refresh architecture diagrams
   - Modernize outdated language
   - Enhance cross-referencing

## ANNUAL MAINTENANCE (4 hours)

If annual maintenance is requested:

1. **Complete Overhaul**
   - Full content review and refresh
   - Major structure reorganization if needed
   - Archive historical information
   - Update all metadata to new versions

2. **Strategic Planning**
   - Assess memory bank effectiveness
   - Plan structural improvements
   - Set maintenance goals for next year
   - Document lessons learned

3. **Tool Integration**
   - Review automation opportunities
   - Implement new maintenance tools
   - Update maintenance procedures
   - Optimize for AI assistant usage

### Maintenance Checklist

After completing maintenance tasks:

- [ ] All dates are current
- [ ] No broken internal links
- [ ] Metadata headers complete
- [ ] Version numbers updated appropriately
- [ ] Dependencies bidirectional
- [ ] Archive properly dated
- [ ] Maintenance report generated
- [ ] README.md navigation updated
- [ ] No sensitive information exposed
- [ ] All changes committed to version control

### Common Issues and Solutions

#### Issue: Outdated Information
**Solution**: 
- Mark with "NEEDS UPDATE" tag
- Create task in activeContext-todo.md
- Set deadline for update

#### Issue: Redundant Documentation
**Solution**:
- Identify primary source of truth
- Merge redundant content
- Create redirects in old locations
- Update all references

#### Issue: Missing Dependencies
**Solution**:
- Scan for implicit dependencies
- Add to metadata headers
- Ensure bidirectional linking
- Document relationship type

#### Issue: Inconsistent Formatting
**Solution**:
- Apply standard templates
- Use consistent heading levels
- Standardize code block languages
- Align metadata format

### Quality Metrics

Track these metrics during maintenance:

1. **Health Score Calculation**
   ```
   - Files with current metadata: +25 points
   - No broken links: +25 points
   - All patterns documented: +25 points
   - Regular updates maintained: +25 points
   ```

2. **Update Frequency**
   - Green: Updated within 30 days
   - Yellow: Updated within 90 days
   - Red: Not updated in 90+ days

3. **Documentation Coverage**
   - Features documented: X%
   - Patterns documented: X%
   - Technical decisions: X%

### Post-Maintenance Actions

1. **Commit Changes**
   ```bash
   git add memory-bank/
   git commit -m "Memory bank maintenance - [Type] - [Date]"
   ```

2. **Update Maintenance Log**
   Add entry to `MAINTENANCE_LOG.md` (if exists)

3. **Plan Next Session**
   - Note any deferred tasks
   - Schedule follow-up if needed
   - Set reminders for next maintenance

---

## Usage Instructions

1. Determine maintenance type needed (daily, weekly, monthly, etc.)
2. Copy this entire prompt
3. Replace [DAILY|WEEKLY|MONTHLY|QUARTERLY|ANNUAL] with your choice
4. Provide to AI assistant with access to memory bank
5. Review and verify all changes made
6. Commit maintenance updates to version control

## Tips for Effective Maintenance

- **Consistency**: Regular small updates > sporadic large updates
- **Automation**: Use scripts for repetitive checks where possible
- **Verification**: Always verify AI-suggested changes
- **Documentation**: Document why changes were made
- **Backup**: Keep version control current

Remember: A well-maintained memory bank accelerates development and improves AI assistance quality. The time invested in maintenance pays dividends in development efficiency.