"""SEO analysis modules for scanning Next.js and web project codebases."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import TypedDict


class Issue(TypedDict):
    severity: str  # "critical", "high", "medium", "low"
    category: str  # "technical", "content", "structured-data"
    message: str
    file: str
    line: int | None
    fix: str


# File extensions to scan
PAGE_EXTENSIONS = {".tsx", ".jsx", ".ts", ".js", ".html", ".vue", ".svelte", ".astro"}
IGNORE_DIRS = {"node_modules", ".next", ".git", "dist", "build", ".turbo", "__pycache__"}


def _find_page_files(project_dir: Path) -> list[Path]:
    """Find all page/component files in the project."""
    files = []
    for ext in PAGE_EXTENSIONS:
        for f in project_dir.rglob(f"*{ext}"):
            if not any(part in IGNORE_DIRS for part in f.parts):
                files.append(f)
    return sorted(files)


def _find_app_dir(project_dir: Path) -> Path | None:
    """Find the Next.js app directory."""
    candidates = [
        project_dir / "app",
        project_dir / "src" / "app",
    ]
    for c in candidates:
        if c.is_dir():
            return c
    return None


def _relative(file: Path, project_dir: Path) -> str:
    """Get relative path string."""
    try:
        return str(file.relative_to(project_dir))
    except ValueError:
        return str(file)


def analyze_meta_tags(project_dir: Path) -> list[Issue]:
    """Analyze meta tag implementation across pages."""
    issues: list[Issue] = []
    app_dir = _find_app_dir(project_dir)

    if not app_dir:
        # Check for pages directory (Pages Router)
        pages_dir = project_dir / "pages"
        if not pages_dir.exists():
            pages_dir = project_dir / "src" / "pages"
        if not pages_dir.exists():
            issues.append({
                "severity": "high",
                "category": "content",
                "message": "No app/ or pages/ directory found. Cannot analyze page metadata.",
                "file": str(project_dir),
                "line": None,
                "fix": "Ensure project has an app/ directory (App Router) or pages/ directory (Pages Router).",
            })
            return issues

    # Find page files
    page_files = []
    search_dir = app_dir or project_dir
    for f in search_dir.rglob("page.*"):
        if f.suffix in PAGE_EXTENSIONS and not any(p in IGNORE_DIRS for p in f.parts):
            page_files.append(f)

    # Also check layout files for root metadata
    layout_files = []
    for f in search_dir.rglob("layout.*"):
        if f.suffix in PAGE_EXTENSIONS and not any(p in IGNORE_DIRS for p in f.parts):
            layout_files.append(f)

    if not page_files and not layout_files:
        issues.append({
            "severity": "medium",
            "category": "content",
            "message": "No page.tsx or layout.tsx files found.",
            "file": str(search_dir),
            "line": None,
            "fix": "Create page.tsx files for your routes.",
        })
        return issues

    # Check root layout for base metadata
    root_layout = None
    for lf in layout_files:
        rel = _relative(lf, search_dir)
        if rel.startswith("layout."):
            root_layout = lf
            break

    if root_layout:
        content = root_layout.read_text(errors="ignore")
        if "metadata" not in content and "generateMetadata" not in content:
            issues.append({
                "severity": "critical",
                "category": "content",
                "message": "Root layout has no metadata export.",
                "file": _relative(root_layout, project_dir),
                "line": None,
                "fix": "Add 'export const metadata: Metadata = { ... }' to root layout.",
            })
        if "metadataBase" not in content:
            issues.append({
                "severity": "high",
                "category": "content",
                "message": "Root layout missing metadataBase. Relative URLs in metadata will not resolve correctly.",
                "file": _relative(root_layout, project_dir),
                "line": None,
                "fix": "Add metadataBase: new URL('https://yourdomain.com') to root layout metadata.",
            })
        if "title" in content and "template" not in content:
            issues.append({
                "severity": "medium",
                "category": "content",
                "message": "Root layout title without template. Child pages cannot append to the brand name.",
                "file": _relative(root_layout, project_dir),
                "line": None,
                "fix": "Use title: { default: 'Brand', template: '%s | Brand' } for consistent titles.",
            })

    # Check each page for metadata
    pages_without_metadata = []
    for pf in page_files:
        content = pf.read_text(errors="ignore")
        has_metadata = "metadata" in content or "generateMetadata" in content
        if not has_metadata:
            pages_without_metadata.append(pf)

    if pages_without_metadata:
        for pf in pages_without_metadata[:10]:  # Limit to 10 to avoid noise
            issues.append({
                "severity": "high",
                "category": "content",
                "message": "Page has no metadata export (title, description).",
                "file": _relative(pf, project_dir),
                "line": None,
                "fix": "Add metadata or generateMetadata export with title and description.",
            })
        if len(pages_without_metadata) > 10:
            issues.append({
                "severity": "high",
                "category": "content",
                "message": f"...and {len(pages_without_metadata) - 10} more pages without metadata.",
                "file": "",
                "line": None,
                "fix": "Add metadata exports to all page files.",
            })

    return issues


def analyze_headings(project_dir: Path) -> list[Issue]:
    """Analyze heading hierarchy in page files."""
    issues: list[Issue] = []
    files = _find_page_files(project_dir)

    h1_pattern = re.compile(r"<h1[\s>]|<H1[\s>]")
    heading_pattern = re.compile(r"<(h[1-6])[\s>]", re.IGNORECASE)

    for f in files:
        content = f.read_text(errors="ignore")
        lines = content.split("\n")

        h1_count = 0
        headings_found = []

        for i, line in enumerate(lines, 1):
            for match in heading_pattern.finditer(line):
                level = int(match.group(1)[1])
                headings_found.append((level, i))
                if level == 1:
                    h1_count += 1

        # Check for multiple H1s
        if h1_count > 1:
            issues.append({
                "severity": "high",
                "category": "content",
                "message": f"Multiple H1 headings found ({h1_count}). Should have exactly one per page.",
                "file": _relative(f, project_dir),
                "line": None,
                "fix": "Keep one H1 for the main page title, use H2+ for sections.",
            })

        # Check for heading hierarchy gaps
        for idx in range(1, len(headings_found)):
            prev_level = headings_found[idx - 1][0]
            curr_level = headings_found[idx][0]
            if curr_level > prev_level + 1:
                issues.append({
                    "severity": "medium",
                    "category": "content",
                    "message": f"Heading hierarchy gap: H{prev_level} jumps to H{curr_level} (skipped H{prev_level + 1}).",
                    "file": _relative(f, project_dir),
                    "line": headings_found[idx][1],
                    "fix": f"Use H{prev_level + 1} instead of H{curr_level}, or add intermediate headings.",
                })

    return issues


def analyze_images(project_dir: Path) -> list[Issue]:
    """Analyze image alt text and optimization."""
    issues: list[Issue] = []
    files = _find_page_files(project_dir)

    img_pattern = re.compile(r"<(?:img|Image)\s[^>]*?>", re.DOTALL | re.IGNORECASE)
    alt_pattern = re.compile(r'alt\s*=\s*["\']([^"\']*)["\']|alt\s*=\s*\{([^}]*)\}')

    for f in files:
        content = f.read_text(errors="ignore")
        lines = content.split("\n")

        for i, line in enumerate(lines, 1):
            for match in img_pattern.finditer(line):
                img_tag = match.group(0)
                alt_match = alt_pattern.search(img_tag)

                if not alt_match:
                    issues.append({
                        "severity": "high",
                        "category": "content",
                        "message": "Image missing alt attribute.",
                        "file": _relative(f, project_dir),
                        "line": i,
                        "fix": 'Add alt="descriptive text" for meaningful images or alt="" for decorative.',
                    })

        # Check for next/image usage in Next.js projects
        if "next/image" not in content and "<img" in content.lower():
            app_dir = _find_app_dir(project_dir)
            if app_dir:
                issues.append({
                    "severity": "low",
                    "category": "content",
                    "message": "Using <img> instead of next/image. Missing automatic optimization.",
                    "file": _relative(f, project_dir),
                    "line": None,
                    "fix": "Import Image from 'next/image' for automatic optimization, responsive images, and lazy loading.",
                })

    return issues


def analyze_structured_data(project_dir: Path) -> list[Issue]:
    """Analyze JSON-LD structured data implementation."""
    issues: list[Issue] = []
    files = _find_page_files(project_dir)

    jsonld_pattern = re.compile(
        r'type\s*=\s*["\']application/ld\+json["\']', re.IGNORECASE
    )
    schema_type_pattern = re.compile(r'"@type"\s*:\s*"([^"]+)"')

    pages_with_jsonld = set()
    schema_types_found: dict[str, list[str]] = {}

    for f in files:
        content = f.read_text(errors="ignore")

        if jsonld_pattern.search(content):
            pages_with_jsonld.add(str(f))
            for match in schema_type_pattern.finditer(content):
                schema_type = match.group(1)
                rel_path = _relative(f, project_dir)
                if schema_type not in schema_types_found:
                    schema_types_found[schema_type] = []
                schema_types_found[schema_type].append(rel_path)

    if not pages_with_jsonld:
        issues.append({
            "severity": "high",
            "category": "structured-data",
            "message": "No JSON-LD structured data found in any page.",
            "file": str(project_dir),
            "line": None,
            "fix": "Add JSON-LD for at least Organization (site-wide) and BreadcrumbList (navigation).",
        })
    else:
        # Check for recommended schema types
        if "Organization" not in schema_types_found:
            issues.append({
                "severity": "medium",
                "category": "structured-data",
                "message": "Missing Organization schema. Recommended for site-wide identity.",
                "file": str(project_dir),
                "line": None,
                "fix": "Add Organization JSON-LD in root layout or about page.",
            })

        if "BreadcrumbList" not in schema_types_found:
            issues.append({
                "severity": "medium",
                "category": "structured-data",
                "message": "Missing BreadcrumbList schema. Helps search engines understand site structure.",
                "file": str(project_dir),
                "line": None,
                "fix": "Add BreadcrumbList JSON-LD to pages with breadcrumb navigation.",
            })

    return issues


def analyze_sitemap(project_dir: Path) -> list[Issue]:
    """Check for sitemap implementation."""
    issues: list[Issue] = []
    app_dir = _find_app_dir(project_dir)

    sitemap_found = False

    # Check for sitemap.ts/sitemap.xml in app directory
    if app_dir:
        for ext in [".ts", ".tsx", ".js", ".jsx"]:
            if (app_dir / f"sitemap{ext}").exists():
                sitemap_found = True
                break

    # Check for static sitemap.xml in public
    public_dir = project_dir / "public"
    if public_dir.exists():
        if (public_dir / "sitemap.xml").exists():
            sitemap_found = True

    if not sitemap_found:
        issues.append({
            "severity": "critical",
            "category": "technical",
            "message": "No sitemap found (app/sitemap.ts or public/sitemap.xml).",
            "file": str(project_dir),
            "line": None,
            "fix": "Create app/sitemap.ts to generate a dynamic sitemap.",
        })

    return issues


def analyze_robots(project_dir: Path) -> list[Issue]:
    """Check for robots.txt implementation."""
    issues: list[Issue] = []
    app_dir = _find_app_dir(project_dir)

    robots_found = False

    # Check for robots.ts in app directory
    if app_dir:
        for ext in [".ts", ".tsx", ".js", ".jsx"]:
            if (app_dir / f"robots{ext}").exists():
                robots_found = True
                break

    # Check for static robots.txt in public
    public_dir = project_dir / "public"
    if public_dir.exists():
        robots_path = public_dir / "robots.txt"
        if robots_path.exists():
            robots_found = True
            content = robots_path.read_text(errors="ignore")
            if "Sitemap:" not in content and "sitemap:" not in content:
                issues.append({
                    "severity": "medium",
                    "category": "technical",
                    "message": "robots.txt does not reference a sitemap.",
                    "file": _relative(robots_path, project_dir),
                    "line": None,
                    "fix": "Add 'Sitemap: https://yourdomain.com/sitemap.xml' to robots.txt.",
                })
            if "Disallow: /" in content and "Disallow: /\n" not in content:
                # Check if it's blocking everything
                pass  # Simplified check

    if not robots_found:
        issues.append({
            "severity": "high",
            "category": "technical",
            "message": "No robots.txt found (app/robots.ts or public/robots.txt).",
            "file": str(project_dir),
            "line": None,
            "fix": "Create app/robots.ts to configure crawler access rules.",
        })

    return issues


def analyze_links(project_dir: Path) -> list[Issue]:
    """Analyze internal linking patterns."""
    issues: list[Issue] = []
    app_dir = _find_app_dir(project_dir)

    if not app_dir:
        return issues

    # Check for not-found page
    not_found_exists = False
    for ext in PAGE_EXTENSIONS:
        if (app_dir / f"not-found{ext}").exists():
            not_found_exists = True
            break

    if not not_found_exists:
        issues.append({
            "severity": "medium",
            "category": "technical",
            "message": "No custom not-found.tsx page. Users hitting 404 see default error.",
            "file": _relative(app_dir, project_dir),
            "line": None,
            "fix": "Create app/not-found.tsx with helpful navigation links.",
        })

    # Check for error boundaries
    error_files = list(app_dir.rglob("error.*"))
    error_files = [f for f in error_files if f.suffix in PAGE_EXTENSIONS]
    if not error_files:
        issues.append({
            "severity": "low",
            "category": "technical",
            "message": "No error.tsx boundaries found. Server errors show default Next.js error page.",
            "file": _relative(app_dir, project_dir),
            "line": None,
            "fix": "Create app/error.tsx for graceful error handling.",
        })

    return issues


def format_report(
    issues: list[Issue], analyzers_run: list[str], project_dir: Path
) -> str:
    """Format issues into a readable report."""
    lines = []
    lines.append("")
    lines.append("=" * 60)
    lines.append("  SEO AUDIT REPORT")
    lines.append("=" * 60)
    lines.append(f"  Project: {project_dir}")
    lines.append(f"  Analyzers: {', '.join(analyzers_run)}")
    lines.append("")

    if not issues:
        lines.append("  No issues found. SEO implementation looks good!")
        lines.append("")
        return "\n".join(lines)

    # Calculate score
    severity_weights = {"critical": 10, "high": 5, "medium": 2, "low": 1}
    total_weight = sum(severity_weights[i["severity"]] for i in issues)
    max_possible = 100
    score = max(0, max_possible - total_weight)

    lines.append(f"  SEO Health Score: {score}/100")
    lines.append(f"  Total Issues: {len(issues)}")
    lines.append("")

    # Group by severity
    for severity in ["critical", "high", "medium", "low"]:
        severity_issues = [i for i in issues if i["severity"] == severity]
        if not severity_issues:
            continue

        label = severity.upper()
        lines.append(f"  [{label}] ({len(severity_issues)} issues)")
        lines.append("-" * 60)

        for issue in severity_issues:
            file_ref = issue["file"]
            if issue["line"]:
                file_ref += f":{issue['line']}"
            lines.append(f"  {issue['message']}")
            if file_ref:
                lines.append(f"    File: {file_ref}")
            lines.append(f"    Fix:  {issue['fix']}")
            lines.append("")

    lines.append("=" * 60)
    return "\n".join(lines)
