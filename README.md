
# FairValue

**Fair Market Value Interface for Donated Items**
*Intended to build on the sunset capabilities of "It's Deductible"*

A robust, containerized application for generating itemized donation receipts with fair market item valuations. Built with **Next.js** and **PocketBase**.

## 🚀 Quick Start (Production)

This application is designed to be "Zero-Config" for deployment.

### 1. Build the Image
The image contains the application code. Run this on your development machine:
```bash
docker build -t fairvalue:latest .
```

### 2. Deploy
Use the deployment compose file. It relies on the image you just built and maps the configuration to your host.

```bash
docker compose -f docker-compose.deploy.yml up -d
```

### 3. Initialize
On the first run, the container will automatically:
1.  Create a default configuration file at `./config/config.yaml` (if mapped).
2.  Initialize the PocketBase database at `./pb_data` (if mapped).
3.  Seed the database with baseline valuation data.

**Login credentials for the app are found in `/config/config.yaml`.**

---

## 🛠️ Development

To develop locally with hot-reloading:

```bash
# This maps the local source code into the container
docker compose up -d
```
Access the app at `http://localhost:3000`.
Access PocketBase Admin at `http://localhost:8090/_/`.

## 📂 Project Structure

-   **`/src`**: Next.js application source code.
-   **`/config`**: Configuration files (persistent).
-   **`/pb_data`**: Database files (persistent).
-   **`/scripts`**: Initialization and utility scripts.
    -   `entrypoint.sh`: Main container startup script.
    -   `init_db.mjs`: Database seeding logic.

## 🔑 Configuration

The application uses a centralized config file:
`config/config.yaml`

```yaml
app:
  password: "changeme" # Application-level password
```

## 🐳 Architecture

-   **Next.js 15**: Frontend and Server Actions.
-   **PocketBase**: Backend, Auth, and Database (SQLite).
-   **Proxy**: Internal rewrite `/pb` -> `127.0.0.1:8090` ensures the app is network-agnostic.
-   **Container**: Self-contained image with automated initialization.

## 📄 Exporting Records

FairValue includes a robust **Audit Report** generation feature.

1.  Navigate to a specific **Tax Year**.
2.  Click the **Export PDF** button.
3.  A printer-friendly version of the report will open in a new tab.
4.  Your browser's **Print Dialog** will open automatically.
    *   Select **Save as PDF** as the destination.
    *   Ensure \ Background Graphics\ is checked if you want to see image borders and shading.

### Improving Print Aesthetics
The current print layout is optimized for high-contrast, black-and-white printing to ensure rigorous audit compliance and ink efficiency. However, the print output can be further customized:

*   **Typography:** The print stylesheet (\@media print\) currently uses the system font stack. To create a more formal \Statement\ look, you can import a serif font like *Merriweather* or *Playfair Display* specifically for the print view.
*   **Watermarks:** A subtle \SUBSTANTIATED\ or \DRAFT\ watermark can be added using fixed-position CSS backgrounds that only appear in print mode.
*   **Cover Page:** The current cover is functional. A dedicated, full-page cover with a simplified layout (just the total value and year) would add a premium feel.
*   **Photo Grid:** Currently photos are listed simply. A masonry layout for the photo evidence section would make better use of page space and look more professional.
