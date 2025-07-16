# Yu-Gi-Oh! SuperDB

> A comprehensive SQLite database of Yu-Gi-Oh! trading card data scraped from the official Yu-Gi-Oh! Database

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-blue.svg)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Automated Updates](https://img.shields.io/badge/Updates-Daily%20Automated-brightgreen.svg)](https://github.com/yourusername/yugioh-superdb/actions)

## 📋 Overview

Yu-Gi-Oh! SuperDB is an automated data scraping and database management system that creates and maintains a comprehensive SQLite database of Yu-Gi-Oh! trading card information. The system scrapes data from the official [Yu-Gi-Oh! Database](https://www.db.yugioh-card.com/yugiohdb) and provides incremental updates to ensure data stays current without requiring full re-scraping.

## 🌐 Web Interface

The project includes a GitHub Pages web interface that allows users to interact with the database using AI:

- **Live Site**: [Yu-Gi-Oh! SuperDB Web Interface](https://gillesdami.github.io/yugioh-superdb/)
- **Features**:
  - AI-powered querying of the database using natural language
  - Downloadable prompt for use with ChatGPT
  - Example questions to get started
  - Simple, user-friendly interface

The web interface leverages Large Language Models to interpret natural language questions about Yu-Gi-Oh! cards, sets, and banlists, providing precise answers without requiring SQL knowledge.

## ✨ Features

- 🎯 **Comprehensive Card Data**: Scrapes detailed information from the official Yu-Gi-Oh! Database
- 🔄 **Incremental Updates**: Efficiently adds new cards without re-scraping existing data
- 📊 **SQLite Database**: Lightweight, portable database format
- 🤖 **Automated Daily Sync**: GitHub Actions workflow runs daily at 2:00 AM UTC
- 📈 **Database Statistics**: Tracks changes and provides detailed logs
- 🔍 **Change Detection**: Smart hash-based comparison to avoid unnecessary updates

## 🚀 Quick Start

### Web Interface

For immediate use without installation:

1. Visit the [Yu-Gi-Oh! SuperDB Web Interface](https://gillesdami.github.io/yugioh-superdb/)
2. Follow the instructions to use the AI-powered database interface

### Local Development Prerequisites

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

## 📂 Project Structure

- `src/` - Source code for database scraping and management
  - `db/` - Database utilities and schema definitions
  - `scrapers/` - Specialized scrapers for different data types
  - `services/` - Business logic services
  - `utils/` - Utility functions
- `dist/` directory contains files for distribution and the GitHub Pages
  - `index.html` - The main web interface page
  - `assets/`
    - `yugioh-superdb.sqlite` - The complete SQLite database
    - `prompt.md` - The AI prompt template for ChatGPT integration
    - `translations.json` - Card translations for multiple languages
  - `result/` - Contains logs and results from scraping operations
  - `external/` - External resources for the web interface

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
2. **Incremental Sync**: Updates only new or changed card data
3. **Change Detection**: Uses SHA256 hashing to detect actual database changes
4. **Version bump**: Creates new version `vYYYY.MM.DD` with the fresh database

### Setup Automation

For detailed setup instructions including email configuration, see [`GITHUB_ACTIONS_SETUP.md`](GITHUB_ACTIONS_SETUP.md).

## 📖 Usage

### Local Development

```bash
# Run the scraper
npm start

# The resulting database will be saved as dist/assets/yugioh-superdb.sqlite
```

## 🔧 Configuration

The scraper behavior can be configured by modifying the main script. Key configuration options include:

- Scraping intervals and delays
- Database connection settings
- Error handling and retry logic

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
