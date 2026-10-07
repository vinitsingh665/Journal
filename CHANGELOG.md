# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-10-07

### Added
- **Performance:** Implemented `nextjs-toploader` (wrapped in Suspense) to show a loading bar during client-side navigation.
- **Performance:** Added `PresenceTracker` to keep the database awake by pinging it every 4 minutes while a user has the tab open. Automatically pauses when switching tabs and refreshes data instantly on tab focus.
- **Performance:** Added React `cache()`, dynamic imports, and prefetching on sidebar links to improve application speed.

### Changed
- **Dashboard:** Restructured the dashboard to stream instantly (using `DashboardShell`), preventing black screens during cold starts.
- **Background Tasks:** Reverted the cron ping schedule to daily to stay within Vercel Hobby plan limitations.

### Fixed
- **Charts:** Fixed an issue where the bar chart would overflow its Y-axis into the middle of the card.
- **Charts:** Centered single data points on charts.
- **Charts:** Stopped the performance chart from artificially padding empty days all the way up to the current day.
- **Trading Engine:** Added safeguards to prevent false Stop-Loss triggers caused by API glitches or when prices temporarily returned as zero.
- **Finance API:** Fixed symbol mappings (e.g., `AAVEU`) and INR conversions in the finance utilities.
