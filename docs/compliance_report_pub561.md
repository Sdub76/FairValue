# FairValue Compliance Assessment (IRS Pub 561)

## Executive Summary
The **FairValue** application generally aligns with the compliance requirements laid out in IRS Publication 561 ("Determining the Value of Donated Property"), particularly for donations of **clothing and household items**. The application implements several safeguards (like blocking "Low" quality items) that directly address strict IRS rules.

The "Custom Item" valuation method relies on a conservative heuristic (30% of purchase price), which has been mitigated by clear UI disclosures advising user verification.

## 1. Compliance Strengths

### ✅ Condition of Items (Good Usage Condition)
*   **IRS Rule**: "You cannot claim a deduction for clothing or household items you donate unless the clothing or household items are in **good used condition or better**."
*   **App Implementation**: The app strictly enforces this by **disabling the "Low" quality option** in the UI with a tooltip explaining the IRS guideline.
*   **Verdict**: **Highly Compliant**. This prevents users from claiming deductions for ineligible items.

### ✅ Valuation Method (Market Comparison)
*   **IRS Rule**: "Sales of comparable properties... are usually the best evidence of fair market value." / "Thrift shop value."
*   **App Implementation**: The app uses a database of baseline values (`baseline_items`) for 2024 and adjusts them for inflation using CPI (`taxYearCpi / 313.689`).
*   **Verdict**: **Compliant Approach**. Using a database of reference values (presumably checking thrift/consignment prices) adjusted for inflation is a standard industry practice for donation valuation software (similar to tools like *ItsDeductible*).

### ✅ Documentation for Variations
*   **IRS Rule**: If you determine a value different from standard guides, you need to document why.
*   **App Implementation**: When a user manually edits a value in `ItemsTable.tsx`, the app mandates a `value_note` ("Required for IRS").
*   **Verdict**: **Compliant**. Enforcing a reason for value overrides helps the user meet record-keeping requirements.

## 2. Areas for Attention

### ⚠️ "30% of Purchase Price" Heuristic
*   **Context**: For "Custom Items," the app calculates value as `0.30 * purchase_price`.
*   **Analysis**: IRS Pub 561 reports that "Cost" is a factor but not a direct formula for used goods.
*   **Current State**: The UI now includes a warning: *"Valuation is estimated at 30% of Purchase Price. Please verify this against resale outlets (e.g. thrift stores) to ensure accuracy."*
*   **Verdict**: **Acceptable with Disclosure**. The added disclaimer ensures users are aware this is an estimate and encourages them to verify (compliant with the "due diligence" aspect).

### ℹ️ Inflation Adjustment
*   **Context**: `Baseline * (TaxYearCPI / 313.689)`
*   **Analysis**: This assumes that the price of used household goods tracks perfectly with the general CPI. Used goods prices can fluctuate differently from the general economy.
*   **Verdict**: **Acceptable for Estimates**. For the purpose of estimating deduction values for standard household items, this is a reasonable engineering approximation.

## 3. Summary of Findings
| Feature | Implementation | Compliance Check |
| :--- | :--- | :--- |
| **Minimum Quality** | "Low" quality disabled | ✅ **Pass** (Strict adherence) |
| **Database Valuation** | Baseline + CPI adjustment | ✅ **Pass** (Standard method) |
| **Custom Valuation** | 30% Custom with Warning | ✅ **Pass** (User warned to verify) |
| **Record Keeping** | Mandatory notes for overrides | ✅ **Pass** |

The application is built with compliance in mind and offers significant protection against common user errors.
