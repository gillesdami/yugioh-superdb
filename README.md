# Yu-Gi-Oh! SuperDB

> A comprehensive SQLite database of Yu-Gi-Oh! trading card data scraped from the official Yu-Gi-Oh! Database

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-blue.svg)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Automated Updates](https://img.shields.io/badge/Updates-Daily%20Automated-brightgreen.svg)](https://github.com/yourusername/yugioh-superdb/actions)

## 📋 Overview

Yu-Gi-Oh! SuperDB is an automated data scraping and database management system that creates and maintains a comprehensive SQLite database of Yu-Gi-Oh! trading card information. The system scrapes data from the official [Yu-Gi-Oh! Database](https://www.db.yugioh-card.com/yugiohdb) and provides incremental updates to ensure data stays current without requiring full re-scraping.

## ✨ Features

- 🎯 **Comprehensive Card Data**: Scrapes detailed information from the official Yu-Gi-Oh! Database
- 🔄 **Incremental Updates**: Efficiently adds new cards without re-scraping existing data
- 📊 **SQLite Database**: Lightweight, portable database format
- 🤖 **Automated Daily Sync**: GitHub Actions workflow runs daily at 2:00 AM UTC
- 📦 **Automatic Releases**: Creates versioned releases when database changes are detected
- 📧 **Email Notifications**: Alerts for updates, failures, and warnings
- 📈 **Database Statistics**: Tracks changes and provides detailed logs
- 🔍 **Change Detection**: Smart hash-based comparison to avoid unnecessary updates

## 🚀 Quick Start

### Prerequisites

- Node.js 16 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/yugioh-superdb.git
    cd yugioh-superdb
    ```

2. Install dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```

3. Run the database sync:

    ```bash
    npm start
    ```

## 💾 Database Schema

The database structure is defined in `db/genTables.sql`.

The schema includes tables for:

- Card information and metadata
- Card types and attributes
- Set information and rarities
- Release dates and regions

But does not include:

- Artwork information (non consolidated on the source)
- Information that are not TCG/OCG related like MD banlist
- The translations the types, attributes, etc... You may find them in `translation.json`

## 🤖 Automated Updates

This repository includes a sophisticated automation system powered by GitHub Actions:

### How It Works

1. **Daily Execution**: Workflow runs automatically at 2:00 AM UTC
2. **Smart Downloads**: Fetches the latest database from previous releases
3. **Incremental Sync**: Updates only new or changed card data
4. **Change Detection**: Uses SHA256 hashing to detect actual database changes
5. **Release Management**: Creates new releases only when changes are detected
6. **Notifications**: Sends detailed email reports for all scenarios

### Release Versioning

- Format: `vYYYY.MM.DD` (e.g., `v2024.12.15`)
- Multiple same-day releases: `vYYYY.MM.DD.1`, `vYYYY.MM.DD.2`
- Each release includes the updated database file and detailed logs

### Setup Automation

For detailed setup instructions including email configuration, see [`GITHUB_ACTIONS_SETUP.md`](GITHUB_ACTIONS_SETUP.md).

## 📖 Usage

### Local Development

```bash
# Run the scraper
npm start

# The resulting database will be saved as yugioh-superdb.sqlite
```

## 🔧 Configuration

The scraper behavior can be configured by modifying the main script. Key configuration options include:

- Scraping intervals and delays
- Database connection settings
- Error handling and retry logic

## 📊 Monitoring

The system provides comprehensive monitoring through:

- **GitHub Actions Logs**: Detailed execution logs for each run
- **Email Notifications**: Automated alerts for different scenarios
- **Release Notes**: Database statistics and change summaries
- **Error Tracking**: Detailed error logs for troubleshooting

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. Follow existing code style and conventions (no just joking convention is AI slop so far)
2. Test your changes thoroughly
3. Update documentation as needed
4. Ensure the database schema remains backward compatible

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support the Project

If you find this project helpful, consider supporting its development:

[![PayPal](https://img.shields.io/badge/PayPal-Donate-blue.svg)](https://paypal.me/gillesdami)
