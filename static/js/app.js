// State management
let currentFeaturedQuote = null;
let debounceTimeout = null;

// DOM Elements
const featuredCard = document.getElementById('featured-card');
const featuredText = document.getElementById('featured-text');
const featuredAuthor = document.getElementById('featured-author');
const featuredCategory = document.getElementById('featured-category');
const newQuoteBtn = document.getElementById('new-quote-btn');
const copyFeaturedBtn = document.getElementById('copy-featured-btn');
const copyText = document.getElementById('copy-text');
const copyIcon = document.getElementById('copy-icon');

const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const categorySelect = document.getElementById('category-select');
const authorSelect = document.getElementById('author-select');
const resetFiltersBtn = document.getElementById('reset-filters-btn');
const categoryPillsContainer = document.getElementById('category-pills');

const quotesGrid = document.getElementById('quotes-grid');
const resultsCount = document.getElementById('results-count');
const emptyState = document.getElementById('empty-state');
const emptyResetBtn = document.getElementById('empty-reset-btn');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  fetchFeaturedQuote();
  loadFilterMetadata();
  searchQuotes();
  setupEventListeners();
});

// Event Listeners Setup
function setupEventListeners() {
  // New random quote
  newQuoteBtn.addEventListener('click', () => {
    fetchFeaturedQuote();
  });

  // Copy featured quote
  copyFeaturedBtn.addEventListener('click', () => {
    if (currentFeaturedQuote) {
      copyToClipboard(
        `"${currentFeaturedQuote.quote}" — ${currentFeaturedQuote.author}`,
        copyText,
        copyIcon
      );
    }
  });

  // Search input with debounce
  searchInput.addEventListener('input', () => {
    const val = searchInput.value.trim();
    clearSearchBtn.style.display = val ? 'block' : 'none';

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      searchQuotes();
    }, 250);
  });

  // Clear search input
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    searchQuotes();
  });

  // Category select change
  categorySelect.addEventListener('change', () => {
    syncActivePill(categorySelect.value);
    searchQuotes();
  });

  // Author select change
  authorSelect.addEventListener('change', () => {
    searchQuotes();
  });

  // Reset filters
  resetFiltersBtn.addEventListener('click', resetAllFilters);
  emptyResetBtn.addEventListener('click', resetAllFilters);
}

// Fetch Random Quote for the Featured Hero
async function fetchFeaturedQuote() {
  try {
    featuredCard.style.opacity = '0.6';
    const response = await fetch('/api/quotes/random');
    if (!response.ok) throw new Error('Failed to load random quote');
    
    const quote = await response.json();
    currentFeaturedQuote = quote;

    // Secure DOM text assignment
    featuredText.textContent = `“${quote.quote}”`;
    featuredAuthor.textContent = `— ${quote.author}`;
    featuredCategory.textContent = quote.category;
  } catch (err) {
    console.error('Error fetching random quote:', err);
    featuredText.textContent = '“The only way to do great work is to love what you do.”';
    featuredAuthor.textContent = '— Steve Jobs';
    featuredCategory.textContent = 'Success';
  } finally {
    featuredCard.style.opacity = '1';
  }
}

// Load Categories & Authors into Dropdowns and Pills
async function loadFilterMetadata() {
  try {
    // Categories
    const catRes = await fetch('/api/categories');
    if (catRes.ok) {
      const data = await catRes.json();
      populateCategories(data.categories || []);
    }

    // Authors
    const authRes = await fetch('/api/authors');
    if (authRes.ok) {
      const data = await authRes.json();
      populateAuthors(data.authors || []);
    }
  } catch (err) {
    console.error('Error loading filter metadata:', err);
  }
}

function populateCategories(categories) {
  // Dropdown
  categories.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });

  // Quick Pills
  categories.forEach((cat) => {
    const pill = document.createElement('button');
    pill.className = 'pill';
    pill.dataset.category = cat;
    pill.textContent = cat;
    pill.addEventListener('click', () => {
      categorySelect.value = cat;
      syncActivePill(cat);
      searchQuotes();
    });
    categoryPillsContainer.appendChild(pill);
  });

  // Handle "All" pill click
  const allPill = categoryPillsContainer.querySelector('.pill[data-category=""]');
  if (allPill) {
    allPill.addEventListener('click', () => {
      categorySelect.value = '';
      syncActivePill('');
      searchQuotes();
    });
  }
}

function syncActivePill(category) {
  const pills = categoryPillsContainer.querySelectorAll('.pill');
  pills.forEach((p) => {
    if (p.dataset.category === category) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });
}

function populateAuthors(authors) {
  authors.forEach((author) => {
    const opt = document.createElement('option');
    opt.value = author;
    opt.textContent = author;
    authorSelect.appendChild(opt);
  });
}

// Search & Filter Quotes
async function searchQuotes() {
  const query = searchInput.value.trim();
  const category = categorySelect.value;
  const author = authorSelect.value;

  const params = new URLSearchParams();
  if (query) params.append('query', query);
  if (category) params.append('category', category);
  if (author) params.append('author', author);

  try {
    const response = await fetch(`/api/quotes/search?${params.toString()}`);
    if (!response.ok) throw new Error('Search failed');

    const data = await response.json();
    renderQuotesGrid(data.quotes || []);
  } catch (err) {
    console.error('Error searching quotes:', err);
  }
}

// Render Quotes into the Grid securely
function renderQuotesGrid(quotes) {
  // Clear existing items
  quotesGrid.textContent = '';

  const count = quotes.length;
  resultsCount.textContent = count === 1 ? '1 quote' : `${count} quotes`;

  if (count === 0) {
    emptyState.style.display = 'block';
    quotesGrid.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  quotesGrid.style.display = 'grid';

  quotes.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'quote-card grid-card';

    // Card Top (category & copy button)
    const cardTop = document.createElement('div');
    cardTop.className = 'card-top';

    const catBadge = document.createElement('span');
    catBadge.className = 'category-badge';
    catBadge.textContent = item.category;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-icon btn-sm';
    copyBtn.title = 'Copy quote';

    const copyIconSpan = document.createElement('span');
    copyIconSpan.textContent = '📋';
    const copyLabelSpan = document.createElement('span');
    copyLabelSpan.textContent = 'Copy';

    copyBtn.appendChild(copyIconSpan);
    copyBtn.appendChild(copyLabelSpan);

    copyBtn.addEventListener('click', () => {
      copyToClipboard(`"${item.quote}" — ${item.author}`, copyLabelSpan, copyIconSpan);
    });

    cardTop.appendChild(catBadge);
    cardTop.appendChild(copyBtn);

    // Quote Content
    const blockquote = document.createElement('blockquote');
    blockquote.className = 'quote-content';

    const p = document.createElement('p');
    p.textContent = `“${item.quote}”`;
    blockquote.appendChild(p);

    // Card Footer (Author)
    const cardFooter = document.createElement('div');
    cardFooter.className = 'card-footer';

    const cite = document.createElement('cite');
    cite.className = 'author-name';
    cite.textContent = `— ${item.author}`;

    cardFooter.appendChild(cite);

    // Assemble Card
    card.appendChild(cardTop);
    card.appendChild(blockquote);
    card.appendChild(cardFooter);

    quotesGrid.appendChild(card);
  });
}

// Reset all filters
function resetAllFilters() {
  searchInput.value = '';
  clearSearchBtn.style.display = 'none';
  categorySelect.value = '';
  authorSelect.value = '';
  syncActivePill('');
  searchQuotes();
}

// Clipboard helper with visual feedback
function copyToClipboard(text, labelElement, iconElement) {
  navigator.clipboard.writeText(text).then(
    () => {
      const origText = labelElement.textContent;
      const origIcon = iconElement ? iconElement.textContent : '';
      
      labelElement.textContent = 'Copied!';
      if (iconElement) iconElement.textContent = '✓';

      setTimeout(() => {
        labelElement.textContent = origText;
        if (iconElement) iconElement.textContent = origIcon;
      }, 1800);
    },
    (err) => {
      console.error('Clipboard copy failed:', err);
    }
  );
}
