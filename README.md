# BigQuery Release Notes Viewer

A sleek, dark-themed web application that aggregates the latest **Google BigQuery release notes** into a beautiful live feed. Built with Python Flask, it parses the official BigQuery RSS/XML feed and presents each update as a card you can read, expand, and share directly to X (Twitter) — all from a single page.

---

## ✨ Features

- **Live Release Notes Feed** — Automatically fetches and displays the latest BigQuery updates from Google Cloud's official XML feed.
- **One-Click Refresh** — Refresh the feed at any time with an animated refresh button.
- **Share to X (Twitter)** — Compose and post a tweet about any release note using the built-in tweet modal with character counter.
- **Dark Glassmorphism Theme** — Premium dark UI with ambient gradient blobs, frosted-glass cards, and smooth micro-animations.
- **Responsive Design** — Fully responsive grid layout that works on desktop, tablet, and mobile.
- **Loading & Error States** — Graceful loading spinners and user-friendly error handling with retry support.
- **Staggered Card Animations** — Cards animate in with staggered delays for a polished first-load experience.

---

## 🛠 Tech Stack

| Layer     | Technology                                                        |
| --------- | ----------------------------------------------------------------- |
| Backend   | [Python 3.12+](https://www.python.org/) · [Flask 3.1](https://flask.palletsprojects.com/) |
| Feed Parser | [feedparser 6.0](https://github.com/kurtmckee/feedparser)      |
| HTTP Client | [Requests 2.32](https://docs.python-requests.org/)             |
| Frontend  | Vanilla HTML5 · CSS3 · JavaScript (ES6+)                         |
| Typography | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |

---

## 📁 Project Structure

```
bq-releases-notes/
├── app.py                  # Flask application — routes & feed parsing
├── requirements.txt        # Python dependencies
├── .gitignore              # Git ignore rules
├── README.md               # This file
├── templates/
│   └── index.html          # Main HTML template (Jinja2)
└── static/
    ├── css/
    │   └── style.css       # Dark theme styles, animations, glassmorphism
    └── js/
        └── app.js          # Client-side fetch, rendering, tweet modal
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.12+** installed ([download](https://www.python.org/downloads/))
- **pip** (bundled with Python)
- **Git** (optional, for cloning)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/<your-username>/bq-releases-notes.git
   cd bq-releases-notes
   ```

2. **Create a virtual environment**

   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**

   - **Windows (PowerShell)**
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

5. **Run the application**

   ```bash
   python app.py
   ```

   The server starts on **http://127.0.0.1:5000** with debug mode enabled.

---

## 📖 Usage

1. Open your browser and navigate to **http://127.0.0.1:5000**.
2. The app automatically fetches the latest BigQuery release notes on page load.
3. Click the **Refresh** button in the header to fetch the latest updates.
4. Click **Post on X** on any release card to open a tweet composer modal with a pre-filled draft.
5. Edit the tweet text (280-character limit with live counter), then click **Post on X** to open the X/Twitter Web Intent in a new window.
6. Click **Read more →** on any card to view the full release note on Google Cloud.

---

## 📡 API Endpoint

### `GET /api/releases`

Returns the latest BigQuery release notes as JSON.

#### Success Response

```json
{
  "success": true,
  "count": 25,
  "notes": [
    {
      "title": "BigQuery release notes — June 18, 2026",
      "link": "https://cloud.google.com/bigquery/docs/release-notes#June_18_2026",
      "published": "June 18, 2026",
      "content_html": "<p>New feature: ...</p>",
      "plain_text": "New feature: ..."
    }
  ]
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Connection timeout",
  "notes": [],
  "count": 0
}
```

| Field          | Type     | Description                                     |
| -------------- | -------- | ----------------------------------------------- |
| `success`      | boolean  | Whether the feed was fetched successfully        |
| `count`        | integer  | Number of release notes returned                 |
| `notes`        | array    | List of release note objects                     |
| `notes[].title` | string  | Title of the release note entry                  |
| `notes[].link` | string   | URL to the full release note on Google Cloud     |
| `notes[].published` | string | Human-readable publication date             |
| `notes[].content_html` | string | Full HTML content of the release note     |
| `notes[].plain_text` | string | Plain-text summary, truncated to 280 chars |
| `error`        | string   | Error message (only present on failure)          |

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
