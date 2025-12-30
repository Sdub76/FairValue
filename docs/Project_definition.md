# Project Description: FairValue Donation Tracker

## 1. The Vision
FairValue is a private, "Pro-sumer" grade web application for tracking tax-deductible donations. It must look **modern, beautiful, and premium** (think Shadcn/UI, sleek dark/light mode, and smooth transitions). It is designed to be used for 10+ years, relying on a 2024 baseline and CPI inflation adjustments.

## 2. Information Architecture (The Drill-Down)
The UI should be organized into three top-level areas: **Charities**, **Donations**, and **Settings**.

### A. Charities
- A directory of organizations with Add/Edit/Delete capabilities.
- Fields: Name, Description, Address, and EIN.

### B. Donations (The Core Workflow)
This section must follow a strict hierarchy to keep tax years organized:
1. **Tax Years (List View):** Users start here. Each Tax Year entry has a `Year` and a `Target CPI` (manually entered by the user with a link provided to the BLS table).
2. **Donation Events (Year View):** Clicking a Tax Year opens a list of donation events for that year (e.g., "Goodwill Drop-off, March 12").
3. **Donation Details (Event View):**
    - **Attachments:** A high-quality photo gallery for that event. Users must be able to upload multiple photos (receipts + photos of the actual goods).
    - **Itemization:** A table of goods donated in this specific event.
    - **Bulk Actions:** Support multi-select for deleting items or assigning categories in bulk.

### C. Settings
- Manage the **2024 Valuation Baseline** data.
- **Security:** Provide a simple mechanism to manage access (e.g., password reset functionality). For this one-shot, use a local configuration approach.

## 3. Valuation Engine Logic
- **Baseline Year:** 2024 (CPI: 313.689).
- **Inflation Formula:** `Adjusted Value = Baseline Value * (TaxYear.CPI / 313.689)`.
- **Item Lookup:** Use a fuzzy-search "Command" menu. When a user picks an item from the baseline JSON, the app should automatically calculate the inflation-adjusted value based on the selected Tax Year's CPI.
- **The 30% Rule:** If an item isn't in the database, the "Custom Item" wizard must prompt for "Original Purchase Price" and default the valuation to 30% of that price.
- **Override:** Users must always be able to manually override the suggested value.

## 4. Technical Specs
- **Frontend:** Next.js (React), Tailwind CSS, Shadcn/UI, Lucide Icons.
- **Backend:** Pocketbase (File-based SQLite).
- **Photos:** Use Pocketbase's built-in file storage with automatic thumbnails for the gallery.
- **Exports:** 1. **Excel:** A flat list of every line item for the year.
    2. **PDF Report:** A beautiful, professional summary for the tax year that includes the data summary AND the attached photos as evidence.

## 5. UI Requirements
- Use a "Command + K" style search for adding items to a donation.
- Ensure the itemized list feels like a spreadsheet: easy to edit quantities and conditions (Medium/High) on the fly.