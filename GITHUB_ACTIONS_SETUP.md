# GitHub Actions Setup for Yu-Gi-Oh Database Automation

This document explains how to set up the automated daily database sync with email notifications.

## Overview

The GitHub Actions workflow will:

- ✅ Run automatically every day at 2:00 AM UTC
- ✅ Execute the database sync script (`node index.js`)
- ✅ Detect database changes by comparing file hashes
- ✅ Create releases when database changes are detected
- ✅ Send email notifications for releases, failures, and warnings
- ✅ Capture and include full logs in notifications
- ✅ Uses Yarn for dependency management (with `yarn.lock` support)

## Required GitHub Secrets

To enable email notifications, you need to configure the following secrets in your GitHub repository:

### Go to Settings → Secrets and variables → Actions → New repository secret

1. **SMTP_SERVER** - Your SMTP server address
   - Example: `smtp.gmail.com` (for Gmail)
   - Example: `smtp-mail.outlook.com` (for Outlook)

2. **SMTP_PORT** - SMTP server port
   - Example: `587` (for TLS)
   - Example: `465` (for SSL)

3. **SMTP_USERNAME** - Your email username
   - Example: `your-email@gmail.com`

4. **SMTP_PASSWORD** - Your email password or app password
   - For Gmail: Generate an App Password (recommended)
   - For Outlook: Use your account password or app password

5. **NOTIFICATION_EMAIL** - Email address to receive notifications
   - Example: `admin@yourdomain.com`

6. **SMTP_FROM** (Optional) - From email address
   - If not set, will use SMTP_USERNAME
   - Example: `yugioh-bot@yourdomain.com`

## Email Provider Configuration Examples

### Gmail Setup

```text
SMTP_SERVER: smtp.gmail.com
SMTP_PORT: 587
SMTP_USERNAME: your-email@gmail.com
SMTP_PASSWORD: your-app-password (16-character app password)
NOTIFICATION_EMAIL: your-email@gmail.com
```

**To get Gmail App Password:**

1. Enable 2-factor authentication on your Google account
2. Go to Google Account settings → Security → App passwords
3. Generate a new app password for "Mail"
4. Use this 16-character password in SMTP_PASSWORD

### Outlook/Hotmail Setup

```text
SMTP_SERVER: smtp-mail.outlook.com
SMTP_PORT: 587
SMTP_USERNAME: your-email@outlook.com
SMTP_PASSWORD: your-password
NOTIFICATION_EMAIL: your-email@outlook.com
```

### Custom SMTP Server

```text
SMTP_SERVER: mail.yourdomain.com
SMTP_PORT: 587
SMTP_USERNAME: bot@yourdomain.com
SMTP_PASSWORD: your-password
NOTIFICATION_EMAIL: admin@yourdomain.com
SMTP_FROM: yugioh-notifications@yourdomain.com
```

## What Triggers Email Notifications

### 🎉 **Success with Database Changes**

- Subject: "✅ Yu-Gi-Oh Database Updated - Release vYYYY.MM.DD"
- When: Sync successful + database changes detected
- Includes: Release link, database stats, full logs

### ⚠️ **Warnings**

- Subject: "⚠️ Yu-Gi-Oh Database Sync Completed with Warnings"
- When: Sync completed but warnings found in logs
- Includes: Warning details, full logs

### 🚨 **Errors/Failures**

- Subject: "🚨 Yu-Gi-Oh Database Sync Failed"
- When: Sync script fails or errors detected
- Includes: Error details, full logs, debugging info

### ℹ️ **No Changes (Optional)**

- Subject: "ℹ️ Yu-Gi-Oh Database Sync - No Changes"
- Only sent for scheduled runs (daily)
- Can be disabled by removing the step

## Workflow Features

### 🕐 **Scheduling**

- Runs daily at 2:00 AM UTC
- Can be manually triggered from GitHub Actions tab
- Automatically runs when workflow file is updated

### 📦 **Release Management**

- Creates releases only when database changes are detected
- Version format: `vYYYY.MM.DD` (e.g., `v2024.12.15`)
- If multiple releases same day: `vYYYY.MM.DD.1`, `vYYYY.MM.DD.2`, etc.
- Includes database file, logs, and statistics

### 📊 **Change Detection**

- Compares SHA256 hash of database file before/after sync
- No unnecessary releases for unchanged databases
- Backup creation for safety
- **Database Management**:
  - Downloads latest database from previous release before sync
  - Falls back to `yugioh-superdb-v0.sqlite` for bootstrapping
  - Creates fresh database if no previous versions exist

### 📋 **Comprehensive Logging**

- Captures both stdout and stderr
- Monitors for warnings and errors in output
- Includes database statistics in releases
- Full logs attached to email notifications

## Manual Testing

You can test the workflow manually:

1. Go to your repository on GitHub
2. Click "Actions" tab
3. Select "Daily Yu-Gi-Oh Database Sync"
4. Click "Run workflow" → "Run workflow"

This will trigger the workflow immediately for testing purposes.

## Troubleshooting

### No Email Notifications

1. Check that all required secrets are set correctly
2. Verify SMTP credentials work with your email provider
3. Check GitHub Actions logs for email sending errors
4. Some email providers require "less secure app access" to be enabled

### Workflow Failures

1. Check the Actions tab for detailed error logs
2. Common issues:
   - Node.js dependencies not installing
   - Package manager mismatch (workflow uses Yarn, ensure `yarn.lock` exists)
   - Database file permissions
   - Network connectivity issues
   - SMTP authentication failures

### Database Not Updating

1. Verify the sync script runs without errors locally
2. Check if the website structure has changed
3. Review scraping logs for blocked requests or rate limiting

### Database Download Issues

1. Verify that previous releases contain the database file
2. Check if the bootstrap file `yugioh-superdb-v0.sqlite` exists in the repository
3. Ensure the GitHub token has access to read releases
4. Check network connectivity for downloading from GitHub releases

## Security Notes

- Never commit SMTP passwords or secrets to the repository
- Use app passwords instead of main account passwords when possible
- The workflow only has access to repository contents and configured secrets
- Database files are publicly accessible through releases

## Customization

You can modify the workflow to:

- Change the schedule (edit the cron expression)
- Adjust email notification conditions
- Add Slack or Discord notifications
- Include additional database statistics
- Change release naming convention

Edit `.github/workflows/daily-sync.yml` to customize the behavior.
