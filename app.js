/* ============================================================
   LIBROTRACK — app.js
   ============================================================ */

'use strict';

/* ===== DATA LAYER ===== */
const STORAGE_KEY = 'librotrack_books_v1';

function loadBooks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveBooks(books) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ===== STATE ===== */
let state = {
  books: loadBooks(),
  filter: 'all',
  search: '',
  sort: 'dateAdded',
  viewMode: 'grid',        // 'grid' | 'list'
  editingId: null,
  deletingId: null,
  rating: 0,
};

/* ===== DOM REFERENCES ===== */
const booksGrid     = document.getElementById('booksGrid');
const emptyState    = document.getElementById('emptyState');
const searchInput   = document.getElementById('searchInput');
const clearSearch   = document.getElementById('clearSearch');
const filterChips   = document.getElementById('filterChips');
const sortSelect    = document.getElementById('sortSelect');
const statTotalNum  = document.getElementById('statTotalNum');
const statReadNum   = document.getElementById('statReadNum');
const statReadingNum= document.getElementById('statReadingNum');
const statUnreadNum = document.getElementById('statUnreadNum');
const navbar        = document.getElementById('navbar');

// Add/Edit modal
const modalOverlay  = document.getElementById('modalOverlay');
const modalTitle    = document.getElementById('modalTitle');
const bookForm      = document.getElementById('bookForm');
const bookId        = document.getElementById('bookId');
const bookTitle     = document.getElementById('bookTitle');
const bookAuthor    = document.getElementById('bookAuthor');
const bookGenre     = document.getElementById('bookGenre');
const bookYear      = document.getElementById('bookYear');
const bookStatus    = document.getElementById('bookStatus');
const bookRating    = document.getElementById('bookRating');
const bookCover     = document.getElementById('bookCover');
const bookNotes     = document.getElementById('bookNotes');
const stars         = document.querySelectorAll('.star');
const titleError    = document.getElementById('titleError');
const authorError   = document.getElementById('authorError');

// Delete modal
const deleteOverlay    = document.getElementById('deleteOverlay');
const deleteMsg        = document.getElementById('deleteMsg');
const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');

// Toast
const toastContainer = document.getElementById('toastContainer');

/* ===== PLACEHOLDER IMAGE ===== */
const PLACEHOLDER_IMG = 'assets/book_placeholder.jpg';

/* ===== RENDER ===== */
function getFilteredSorted() {
  let books = [...state.books];

  // Filter by status
  if (state.filter !== 'all') {
    books = books.filter(b => b.status === state.filter);
  }

  // Search
  const q = state.search.toLowerCase().trim();
  if (q) {
    books = books.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q)
    );
  }

  // Sort
  books.sort((a, b) => {
    switch (state.sort) {
      case 'title':     return a.title.localeCompare(b.title);
      case 'author':    return a.author.localeCompare(b.author);
      case 'rating':    return (b.rating || 0) - (a.rating || 0);
      case 'dateAdded':
      default:          return b.dateAdded - a.dateAdded;
    }
  });

  return books;
}

function renderStars(rating, max = 5) {
  let html = '';
  for (let i = 1; i <= max; i++) {
    html += i <= rating
      ? `<span class="star-sym">★</span>`
      : `<span class="star-sym empty">★</span>`;
  }
  return html;
}

function statusLabel(status) {
  const map = { read: 'Read', reading: 'Reading', unread: 'To Read' };
  return map[status] || status;
}

function renderBookCard(book) {
  const cover = book.cover || PLACEHOLDER_IMG;
  const starsHtml = book.rating ? renderStars(book.rating) : '';

  return `
    <article class="book-card" data-id="${book.id}" tabindex="0" aria-label="${book.title} by ${book.author}">
      <div class="book-cover">
        <img src="${cover}" alt="Cover of ${book.title}" loading="lazy"
             onerror="this.src='${PLACEHOLDER_IMG}'" />
        <div class="cover-overlay">
          <button class="cover-action edit-btn" data-id="${book.id}" title="Edit book" aria-label="Edit ${book.title}">
            ✏️
          </button>
          <button class="cover-action delete delete-btn" data-id="${book.id}" title="Delete book" aria-label="Delete ${book.title}">
            🗑️
          </button>
        </div>
        <span class="status-badge ${book.status}">${statusLabel(book.status)}</span>
      </div>
      <div class="book-info">
        <div class="book-title">${escapeHtml(book.title)}</div>
        <div class="book-author">${escapeHtml(book.author)}</div>
        <div class="book-meta">
          ${book.genre ? `<span class="book-genre-tag">${escapeHtml(book.genre)}</span>` : '<span></span>'}
          ${starsHtml ? `<div class="book-stars">${starsHtml}</div>` : ''}
        </div>
      </div>
    </article>
  `;
}

function render() {
  const books = getFilteredSorted();

  // Stats (always use full list)
  const all     = state.books;
  const readCnt    = all.filter(b => b.status === 'read').length;
  const readingCnt = all.filter(b => b.status === 'reading').length;
  const unreadCnt  = all.filter(b => b.status === 'unread').length;
  animateNum(statTotalNum,   all.length);
  animateNum(statReadNum,    readCnt);
  animateNum(statReadingNum, readingCnt);
  animateNum(statUnreadNum,  unreadCnt);

  // Grid
  if (books.length === 0) {
    booksGrid.innerHTML = '';
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
    booksGrid.innerHTML = books.map((b, i) => {
      const card = renderBookCard(b);
      // stagger delay via style injection
      return card.replace('class="book-card"',
        `class="book-card" style="animation-delay:${i * 40}ms"`);
    }).join('');
    attachCardListeners();
  }
}

/* Animated number counter */
const numCache = {};
function animateNum(el, target) {
  const current = numCache[el.id] || 0;
  if (current === target) return;
  numCache[el.id] = target;

  const start = parseInt(el.textContent) || 0;
  const diff = target - start;
  const dur = 500;
  const startTime = performance.now();

  function step(now) {
    const pct = Math.min((now - startTime) / dur, 1);
    const ease = 1 - Math.pow(1 - pct, 3);
    el.textContent = Math.round(start + diff * ease);
    if (pct < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function attachCardListeners() {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openEditModal(btn.dataset.id);
    });
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openDeleteModal(btn.dataset.id);
    });
  });
  // Keyboard a11y: Enter/Space opens edit
  document.querySelectorAll('.book-card').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openEditModal(card.dataset.id);
      }
    });
  });
}

/* ===== MODAL — Add / Edit ===== */
function openAddModal() {
  state.editingId = null;
  state.rating = 0;
  bookForm.reset();
  bookId.value = '';
  titleError.textContent = '';
  authorError.textContent = '';
  modalTitle.textContent = 'Add New Book';
  updateStars(0);
  modalOverlay.classList.add('open');
  setTimeout(() => bookTitle.focus(), 200);
}

function openEditModal(id) {
  const book = state.books.find(b => b.id === id);
  if (!book) return;

  state.editingId = id;
  state.rating = book.rating || 0;
  bookId.value = book.id;
  bookTitle.value = book.title;
  bookAuthor.value = book.author;
  bookGenre.value = book.genre || '';
  bookYear.value = book.year || '';
  bookStatus.value = book.status;
  bookCover.value = book.cover || '';
  bookNotes.value = book.notes || '';
  bookRating.value = book.rating || 0;
  updateStars(book.rating || 0);
  titleError.textContent = '';
  authorError.textContent = '';
  modalTitle.textContent = 'Edit Book';
  modalOverlay.classList.add('open');
  setTimeout(() => bookTitle.focus(), 200);
}

function closeModal() {
  modalOverlay.classList.remove('open');
  state.editingId = null;
}

function validateForm() {
  let valid = true;

  if (!bookTitle.value.trim()) {
    titleError.textContent = 'Title is required.';
    bookTitle.classList.add('invalid');
    valid = false;
  } else {
    titleError.textContent = '';
    bookTitle.classList.remove('invalid');
  }

  if (!bookAuthor.value.trim()) {
    authorError.textContent = 'Author is required.';
    bookAuthor.classList.add('invalid');
    valid = false;
  } else {
    authorError.textContent = '';
    bookAuthor.classList.remove('invalid');
  }

  return valid;
}

bookForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!validateForm()) return;

  const isEdit = !!state.editingId;
  const book = {
    id:        isEdit ? state.editingId : generateId(),
    title:     bookTitle.value.trim(),
    author:    bookAuthor.value.trim(),
    genre:     bookGenre.value,
    year:      bookYear.value ? parseInt(bookYear.value) : null,
    status:    bookStatus.value,
    rating:    state.rating,
    cover:     bookCover.value.trim(),
    notes:     bookNotes.value.trim(),
    dateAdded: isEdit
      ? (state.books.find(b => b.id === state.editingId)?.dateAdded || Date.now())
      : Date.now(),
  };

  if (isEdit) {
    const idx = state.books.findIndex(b => b.id === state.editingId);
    state.books[idx] = book;
    showToast('Book updated!', 'success');
  } else {
    state.books.unshift(book);
    showToast('Book added to your library!', 'success');
  }

  saveBooks(state.books);
  closeModal();
  render();
});

/* ===== MODAL — Delete ===== */
function openDeleteModal(id) {
  state.deletingId = id;
  const book = state.books.find(b => b.id === id);
  deleteMsg.textContent = book
    ? `Remove "${book.title}" by ${book.author}? This cannot be undone.`
    : 'This action cannot be undone.';
  deleteOverlay.classList.add('open');
}

function closeDeleteModal() {
  deleteOverlay.classList.remove('open');
  state.deletingId = null;
}

deleteConfirmBtn.addEventListener('click', () => {
  if (!state.deletingId) return;
  const book = state.books.find(b => b.id === state.deletingId);
  state.books = state.books.filter(b => b.id !== state.deletingId);
  saveBooks(state.books);
  closeDeleteModal();
  render();
  if (book) showToast(`"${book.title}" removed.`, 'info');
});

/* ===== STAR RATING ===== */
function updateStars(val) {
  stars.forEach(s => {
    const v = parseInt(s.dataset.val);
    s.classList.toggle('lit', v <= val);
  });
  bookRating.value = val;
  state.rating = val;
}

stars.forEach(star => {
  star.addEventListener('click', () => {
    const val = parseInt(star.dataset.val);
    // clicking same star again clears
    updateStars(state.rating === val ? 0 : val);
  });
  star.addEventListener('mouseenter', () => {
    const val = parseInt(star.dataset.val);
    stars.forEach(s => s.classList.toggle('lit', parseInt(s.dataset.val) <= val));
  });
  star.addEventListener('mouseleave', () => updateStars(state.rating));
});

/* ===== FILTER / SEARCH / SORT ===== */
filterChips.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    filterChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.filter = chip.dataset.filter;
    render();
  });
});

searchInput.addEventListener('input', () => {
  state.search = searchInput.value;
  clearSearch.style.display = state.search ? 'flex' : 'none';
  render();
});
clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  state.search = '';
  clearSearch.style.display = 'none';
  render();
  searchInput.focus();
});

sortSelect.addEventListener('change', () => {
  state.sort = sortSelect.value;
  render();
});

/* ===== VIEW TOGGLE ===== */
const toggleViewBtn = document.getElementById('toggleViewBtn');
const gridIcon      = document.getElementById('gridIcon');
const listIcon      = document.getElementById('listIcon');

toggleViewBtn.addEventListener('click', () => {
  state.viewMode = state.viewMode === 'grid' ? 'list' : 'grid';
  booksGrid.classList.toggle('list-view', state.viewMode === 'list');
  gridIcon.style.display = state.viewMode === 'grid' ? 'block' : 'none';
  listIcon.style.display = state.viewMode === 'list' ? 'block' : 'none';
  render();
});

/* ===== NAVBAR SCROLL ===== */
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

/* ===== OPEN MODAL TRIGGERS ===== */
document.getElementById('openAddModal').addEventListener('click', openAddModal);
document.getElementById('emptyAddBtn').addEventListener('click', openAddModal);
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);
document.getElementById('deleteClose').addEventListener('click', closeDeleteModal);
document.getElementById('deleteCancelBtn').addEventListener('click', closeDeleteModal);

// Close on overlay click
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
deleteOverlay.addEventListener('click', e => { if (e.target === deleteOverlay) closeDeleteModal(); });

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (modalOverlay.classList.contains('open')) closeModal();
    if (deleteOverlay.classList.contains('open')) closeDeleteModal();
  }
});

/* ===== TOAST ===== */
function showToast(message, type = 'info', duration = 3000) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || '💬'}</span><span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}

/* ===== UTILITY ===== */
function escapeHtml(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str || ''));
  return d.innerHTML;
}

/* ===== SEED DEMO DATA ===== */
function seedDemoData() {
  if (state.books.length > 0) return; // already has data
  const demo = [
    {
      id: generateId(), title: 'The Midnight Library',
      author: 'Matt Haig', genre: 'Fiction', year: 2020,
      status: 'read', rating: 5, cover: '',
      notes: 'A beautiful meditation on regret and infinite possibility.',
      dateAdded: Date.now() - 86400000 * 5,
    },
    {
      id: generateId(), title: 'Atomic Habits',
      author: 'James Clear', genre: 'Self-Help', year: 2018,
      status: 'read', rating: 5, cover: '',
      notes: 'Changed the way I think about building routines.',
      dateAdded: Date.now() - 86400000 * 10,
    },
    {
      id: generateId(), title: 'Project Hail Mary',
      author: 'Andy Weir', genre: 'Science Fiction', year: 2021,
      status: 'reading', rating: 4, cover: '',
      notes: 'Gripping from page one.',
      dateAdded: Date.now() - 86400000 * 2,
    },
    {
      id: generateId(), title: 'Dune',
      author: 'Frank Herbert', genre: 'Science Fiction', year: 1965,
      status: 'unread', rating: 0, cover: '',
      notes: '',
      dateAdded: Date.now() - 86400000 * 1,
    },
    {
      id: generateId(), title: 'The Name of the Wind',
      author: 'Patrick Rothfuss', genre: 'Fantasy', year: 2007,
      status: 'read', rating: 4, cover: '',
      notes: 'Kvothe is one of the best characters in fantasy literature.',
      dateAdded: Date.now() - 86400000 * 15,
    },
    {
      id: generateId(), title: 'Sapiens',
      author: 'Yuval Noah Harari', genre: 'Non-Fiction', year: 2011,
      status: 'read', rating: 5, cover: '',
      notes: '',
      dateAdded: Date.now() - 86400000 * 20,
    },
  ];
  state.books = demo;
  saveBooks(state.books);
}

/* ===== INIT ===== */
seedDemoData();
render();
