import unittest
import json
from app import app, QUOTES

class FamousQuotesAppTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()

    def test_total_quotes_count(self):
        """Verify exactly 100 quotes exist in the dataset."""
        self.assertEqual(len(QUOTES), 100)
        # Check required fields
        for q in QUOTES:
            self.assertIn("id", q)
            self.assertIn("quote", q)
            self.assertIn("author", q)
            self.assertIn("category", q)
            self.assertTrue(len(q["quote"]) > 0)
            self.assertTrue(len(q["author"]) > 0)
            self.assertTrue(len(q["category"]) > 0)

    def test_index_page(self):
        """Verify home page loads properly."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"InspireQuotes", response.data)
        self.assertIn(b"100 Famous Quotes", response.data)

    def test_random_quote(self):
        """Verify random quote endpoint returns a valid quote."""
        response = self.client.get("/api/quotes/random")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("quote", data)
        self.assertIn("author", data)
        self.assertIn("category", data)

    def test_random_quote_filtered_by_category(self):
        """Verify random quote filtered by category."""
        response = self.client.get("/api/quotes/random?category=Science")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["category"].lower(), "science")

    def test_random_quote_not_found(self):
        """Verify 404 when filter criteria matches nothing."""
        response = self.client.get("/api/quotes/random?category=NonExistentCategory123")
        self.assertEqual(response.status_code, 404)
        data = response.get_json()
        self.assertIn("error", data)

    def test_search_all_quotes(self):
        """Verify empty search returns all 100 quotes."""
        response = self.client.get("/api/quotes/search")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["total"], 100)
        self.assertEqual(len(data["quotes"]), 100)

    def test_search_by_query_keyword(self):
        """Verify search query across quote text."""
        response = self.client.get("/api/quotes/search?query=electricity")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertGreaterEqual(data["total"], 1)
        self.assertIn("electricity", data["quotes"][0]["quote"].lower())

    def test_search_by_author(self):
        """Verify search by author."""
        response = self.client.get("/api/quotes/search?author=Albert%20Einstein")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertGreater(data["total"], 0)
        for q in data["quotes"]:
            self.assertEqual(q["author"], "Albert Einstein")

    def test_search_by_category(self):
        """Verify search by category."""
        response = self.client.get("/api/quotes/search?category=Philosophy")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertGreater(data["total"], 0)
        for q in data["quotes"]:
            self.assertEqual(q["category"], "Philosophy")

    def test_categories_endpoint(self):
        """Verify categories endpoint returns unique sorted categories."""
        response = self.client.get("/api/categories")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("categories", data)
        self.assertIn("Wisdom", data["categories"])
        self.assertIn("Science", data["categories"])
        self.assertIn("Philosophy", data["categories"])

    def test_authors_endpoint(self):
        """Verify authors endpoint returns unique sorted authors."""
        response = self.client.get("/api/authors")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("authors", data)
        self.assertIn("Albert Einstein", data["authors"])
        self.assertIn("Steve Jobs", data["authors"])

    def test_security_headers(self):
        """Verify security headers are applied to responses."""
        response = self.client.get("/")
        self.assertEqual(response.headers.get("X-Content-Type-Options"), "nosniff")
        self.assertEqual(response.headers.get("X-Frame-Options"), "DENY")

if __name__ == "__main__":
    unittest.main()
