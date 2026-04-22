# TODO: Make Pages Responsive & Scrollable

**Status:** In progress

**Issues found:**
- src/app/features/admin/pages/assessment-breakdown/assessment-breakdown.html: Multiple div closing tag errors (NG5002)
- Other pages may have similar issues

**Status:** Fixed assessment-breakdown.html\n\n**Pattern discovered:** Most pages use `min-h-screen` outer div + content containers. To make content scrollable:\n\n1. Add `max-h-[calc(100vh-200px)] overflow-y-auto` to main content containers\n2. Keep layout header fixed\n3. Apply to all ~25 admin page .html files\n\n**Next:** Create pattern for common responsive layout, test on dashboard first.

**Next:** Read assessment-breakdown.html fully and recreate clean version.

