#!/usr/bin/env python3
"""SEO Audit CLI - Scans a project directory for SEO issues.

Usage:
    python3 audit.py <project-dir> [--full|--technical|--content|--structured-data]

Examples:
    python3 audit.py /path/to/nextjs-app --full
    python3 audit.py . --technical
    python3 audit.py . --content
    python3 audit.py . --structured-data
"""

import argparse
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))
from analyzers import (
    analyze_meta_tags,
    analyze_headings,
    analyze_images,
    analyze_structured_data,
    analyze_sitemap,
    analyze_robots,
    analyze_links,
    format_report,
)


def main():
    parser = argparse.ArgumentParser(description="SEO Audit Tool")
    parser.add_argument("project_dir", help="Path to the project directory")
    parser.add_argument("--full", action="store_true", help="Run all analyzers")
    parser.add_argument("--technical", action="store_true", help="Technical SEO only")
    parser.add_argument("--content", action="store_true", help="Content SEO only")
    parser.add_argument(
        "--structured-data", action="store_true", help="Structured data only"
    )

    args = parser.parse_args()
    project_dir = Path(args.project_dir).resolve()

    if not project_dir.is_dir():
        print(f"Error: {project_dir} is not a valid directory")
        sys.exit(1)

    # Default to full if no specific flag
    if not any([args.full, args.technical, args.content, args.structured_data]):
        args.full = True

    all_issues = []
    analyzers_run = []

    if args.full or args.technical:
        print("Running technical SEO analysis...")
        all_issues.extend(analyze_robots(project_dir))
        all_issues.extend(analyze_sitemap(project_dir))
        all_issues.extend(analyze_links(project_dir))
        analyzers_run.append("technical")

    if args.full or args.content:
        print("Running content SEO analysis...")
        all_issues.extend(analyze_meta_tags(project_dir))
        all_issues.extend(analyze_headings(project_dir))
        all_issues.extend(analyze_images(project_dir))
        analyzers_run.append("content")

    if args.full or args.structured_data:
        print("Running structured data analysis...")
        all_issues.extend(analyze_structured_data(project_dir))
        analyzers_run.append("structured-data")

    report = format_report(all_issues, analyzers_run, project_dir)
    print(report)


if __name__ == "__main__":
    main()
