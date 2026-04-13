# 🚀 Haki Outreach Engine

A portable, modular email outreach automation system. This engine allows you to generate personalized pitches and send them in bulk via Gmail SMTP.

## 📦 Setup

1.  **Clone or Copy** this directory to your new project.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Credentials**:
    *   Rename `.env.example` to `.env`.
    *   Fill in your SMTP details and App Password.
4.  **Prepare Templates**:
    *   Edit `pitch_templates.json` to customize your outreach messages.

## 🛠️ Usage

### 1. Bulk Outreach
Send emails to a list of leads from a CSV file.
```bash
node outreach_engine.js bulk path/to/leads.csv [template_name] [delay_seconds]
```
*   **Format**: The CSV should have columns: `Shop, URL, Region, Contact, Email`

### 2. Single Pitch Test
Preview or send a single email.
```bash
node outreach_engine.js single "Shop Name" "target@email.com" [template_name] [contact_name] --send
```

## 🔒 Security Note
This project uses `.env` to keep your credentials safe. **Never commit your `.env` file** to version control (GitHub).
