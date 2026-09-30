# InspireQuotes • 100 Famous Quotes Web Application

A clean, responsive web application built with **Python Flask** on the backend and **plain vanilla JavaScript, HTML5, and CSS3** on the frontend. The application features a curated collection of **100 well-known quotes** from famous scientists, philosophers, leaders, writers, and artists.

## Features

- **Random Quote Generator**: Displays an inspiring quote on page load or on demand with the "New Random Quote" button.
- **Search**: Real-time debounced search matching quote text, themes, or author names.
- **Category Filter**: Filter quotes by topic (Wisdom, Science, Inspiration, Leadership, Philosophy, Courage, Art, Humor, Success, Life) using either the dropdown or quick-select pills.
- **Author Filter**: Filter quotes by specific thinkers (e.g., Albert Einstein, Maya Angelou, Steve Jobs, Confucius, Oscar Wilde, etc.).
- **Copy to Clipboard**: One-click copy for the featured quote or any quote card with instant visual feedback.
- **XSS & Injection Safe**: Safe DOM manipulation using standard browser DOM methods without unsanitized `innerHTML`.
- **Zero Heavy Frontend Frameworks**: 100% plain vanilla JS and modern CSS.

## Project Structure

```
famous-quotes/
├── app.py                # Flask application & API routes
├── data/
│   └── quotes.json       # Exactly 100 curated quotes with author & category metadata
├── static/
│   ├── css/
│   │   └── style.css     # Responsive, modern styling with dark mode aesthetics
│   └── js/
│       └── app.js        # Plain vanilla JavaScript for DOM, search, & APIs
├── templates/
│   └── index.html        # Semantic HTML5 template
├── tests/
│   └── test_app.py       # Automated test suite (12 tests)
└── requirements.txt      # Python dependencies (Flask)
```

## Getting Started

### 1. Prerequisites
- Python 3.10+
- Virtual environment (`.venv`) already created.

### 2. Run the Web Application
```bash
.venv/bin/python app.py
```
Then open your browser and navigate to:
```
http://127.0.0.1:5000
```

### 3. Run Automated Tests
```bash
.venv/bin/python -m unittest discover -s tests -p "test_*.py" -v
```

## API Reference

- `GET /api/quotes/random`: Returns a random quote.
  - Optional Query Params: `?category=Science&author=Albert%20Einstein`
- `GET /api/quotes/search`: Searches quotes by keywords and filters.
  - Optional Query Params: `?query=electricity&category=Science&author=Andrew%20Ng`
- `GET /api/categories`: Returns a sorted list of unique categories.
- `GET /api/authors`: Returns a sorted list of unique authors.
