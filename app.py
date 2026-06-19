from flask import Flask, render_template, jsonify
import requests
import feedparser
from datetime import datetime
import html
import re

app = Flask(__name__)

BQ_FEED_URL = "https://cloud.google.com/feeds/bigquery-release-notes.xml"


def clean_html(raw_html):
    """Strip HTML tags and decode entities for plain text summaries."""
    text = re.sub(r"<[^>]+>", " ", raw_html)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def fetch_release_notes():
    """Fetch and parse the BigQuery release notes XML feed."""
    try:
        resp = requests.get(BQ_FEED_URL, timeout=15)
        resp.raise_for_status()
        feed = feedparser.parse(resp.content)

        notes = []
        for entry in feed.entries:
            # Parse the published date
            published = ""
            if hasattr(entry, "published_parsed") and entry.published_parsed:
                published = datetime(*entry.published_parsed[:6]).strftime(
                    "%B %d, %Y"
                )
            elif hasattr(entry, "updated_parsed") and entry.updated_parsed:
                published = datetime(*entry.updated_parsed[:6]).strftime(
                    "%B %d, %Y"
                )

            # Get content
            content_html = ""
            if hasattr(entry, "content") and entry.content:
                content_html = entry.content[0].get("value", "")
            elif hasattr(entry, "summary"):
                content_html = entry.summary

            plain_text = clean_html(content_html)

            # Extract categories from H3 tags
            categories = re.findall(r"<h3[^>]*>(.*?)</h3>", content_html)
            # Clean categories (strip tags, whitespace)
            categories = [re.sub(r"<[^>]+>", "", cat).strip() for cat in categories]
            # De-duplicate while preserving order
            seen = set()
            unique_categories = [c for c in categories if not (c in seen or seen.add(c))]

            notes.append(
                {
                    "title": entry.get("title", "Untitled"),
                    "link": entry.get("link", ""),
                    "published": published,
                    "content_html": content_html,
                    "plain_text": plain_text[:280],  # For tweet preview
                    "categories": unique_categories,
                }
            )

        return {"success": True, "notes": notes, "count": len(notes)}

    except requests.RequestException as e:
        return {"success": False, "error": str(e), "notes": [], "count": 0}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/releases")
def api_releases():
    data = fetch_release_notes()
    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
