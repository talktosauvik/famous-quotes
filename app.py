import json
import os
import random
from flask import Flask, jsonify, render_template, request, abort

app = Flask(__name__)

# Load quotes from JSON file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data", "quotes.json")

def load_quotes():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

QUOTES = load_quotes()

@app.after_request
def add_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/quotes/random")
def get_random_quote():
    category = request.args.get("category", "").strip()
    author = request.args.get("author", "").strip()

    filtered = QUOTES
    if category:
        filtered = [q for q in filtered if q["category"].lower() == category.lower()]
    if author:
        filtered = [q for q in filtered if q["author"].lower() == author.lower()]

    if not filtered:
        return jsonify({"error": "No quotes match the specified criteria"}), 404

    return jsonify(random.choice(filtered))

@app.route("/api/quotes/search")
def search_quotes():
    query = request.args.get("query", "", type=str).strip()[:100]
    category = request.args.get("category", "", type=str).strip()[:50]
    author = request.args.get("author", "", type=str).strip()[:100]

    results = QUOTES

    if category:
        results = [q for q in results if q["category"].lower() == category.lower()]

    if author:
        results = [q for q in results if q["author"].lower() == author.lower()]

    if query:
        q_lower = query.lower()
        results = [
            q for q in results
            if q_lower in q["quote"].lower() or q_lower in q["author"].lower()
        ]

    return jsonify({
        "total": len(results),
        "quotes": results
    })

@app.route("/api/categories")
def get_categories():
    categories = sorted(list(set(q["category"] for q in QUOTES)))
    return jsonify({"categories": categories})

@app.route("/api/authors")
def get_authors():
    authors = sorted(list(set(q["author"] for q in QUOTES)))
    return jsonify({"authors": authors})

@app.errorhandler(404)
def not_found(e):
    if request.path.startswith("/api/"):
        return jsonify({"error": "Resource not found"}), 404
    return ("Page not found", 404)

@app.errorhandler(500)
def server_error(e):
    if request.path.startswith("/api/"):
        return jsonify({"error": "Internal server error"}), 500
    return ("Internal server error", 500)

if __name__ == "__main__":
    # In compliance with security guidelines, bind to localhost/127.0.0.1
    app.run(host="127.0.0.1", port=5000, debug=True)
