// Utility function to copy magnet link and show toast
async function copyMagnet(magnet, index) {
  try {
    await navigator.clipboard.writeText(magnet);

    const copyText = document.getElementById(`copy-text-${index}`);
    if (copyText) {
      const originalText = copyText.textContent;
      copyText.textContent = 'Copied!';
      setTimeout(() => { copyText.textContent = originalText; }, 2000);
    }

    showToast('Magnet link copied!', 'success');
  } catch (err) {
    console.error('Failed to copy:', err);
    showToast('Failed to copy magnet link', 'error');
  }
}

function showToast(message, type = 'success') {
  const existing = document.querySelectorAll('.cine-toast');
  existing.forEach(t => t.remove());

  const toast = document.createElement('div');
  const bg = type === 'success' ? '#22c55e' : '#ef4444';
  const icon = type === 'success'
    ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`
    : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>`;

  toast.className = 'cine-toast';
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    display: flex; align-items: center; gap: 8px;
    background: ${bg}; color: white;
    padding: 12px 18px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    opacity: 0; transform: translateY(8px);
    transition: opacity 0.2s ease, transform 0.2s ease;
  `;
  toast.innerHTML = `
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">${icon}</svg>
    ${message}
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 200);
  }, 2200);
}

class CineSearch {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 8;
    this.allResults = [];
    this.currentQuery = '';
    this.currentProvider = 'yts';
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupProviderToggle();
  }

  bindEvents() {
    document.getElementById('searchForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.search();
    });

    document.getElementById('prevBtn').addEventListener('click', () => this.previousPage());
    document.getElementById('nextBtn').addEventListener('click', () => this.nextPage());
    document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
    document.getElementById('movieModal').addEventListener('click', (e) => {
      if (e.target.id === 'movieModal') this.closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }

  setupProviderToggle() {
    const providerRadios = document.querySelectorAll('input[name="provider"]');
    const tpbOptions = document.getElementById('tpbOptions');
    const queryInput = document.getElementById('query');

    providerRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.currentProvider = e.target.value;
        if (e.target.value === 'tpb') {
          tpbOptions.classList.remove('hidden');
          queryInput.placeholder = 'Search for torrents…';
        } else {
          tpbOptions.classList.add('hidden');
          queryInput.placeholder = 'Search for a movie…';
        }
      });
    });
  }

  async search() {
    const query = document.getElementById('query').value.trim();
    if (!query) return;

    this.currentQuery = query;
    this.currentPage = 1;
    this.showLoading();

    try {
      let response;
      if (this.currentProvider === 'yts') {
        response = await fetch(`/api/search/yts?query=${encodeURIComponent(query)}`);
      } else {
        const category = document.getElementById('category').value;
        const sortBy = document.getElementById('sortBy').value;
        const order = document.getElementById('order').value;

        let url = `/api/search/tpb?query=${encodeURIComponent(query)}`;
        if (category !== 'All') url += `&category=${category}`;
        if (sortBy) url += `&sort=${sortBy}`;
        if (order) url += `&order=${order}`;

        response = await fetch(url);
      }

      const data = await response.json();
      this.hideLoading();
      this.handleResults(data);
    } catch (error) {
      this.hideLoading();
      this.showError('Failed to connect. Please try again.');
    }
  }

  showLoading() {
    document.getElementById('loadingBar').classList.remove('hidden');
    document.getElementById('searchSpinner').classList.remove('hidden');
    document.getElementById('searchText').classList.add('hidden');
    document.getElementById('searchBtn').disabled = true;
  }

  hideLoading() {
    document.getElementById('loadingBar').classList.add('hidden');
    document.getElementById('searchSpinner').classList.add('hidden');
    document.getElementById('searchText').classList.remove('hidden');
    document.getElementById('searchBtn').disabled = false;
  }

  handleResults(data) {
    this.hideAllSections();

    if (data.status !== 'ok') {
      this.showError(data.error || 'Search failed');
      return;
    }

    const resultCount = this.currentProvider === 'yts' ? data.movie_count : data.data.length;

    if (resultCount === 0) {
      this.showNoResults();
      return;
    }

    this.allResults = data.data;
    this.showResultsInfo(resultCount);
    this.renderPage();
    this.updatePagination();
  }

  hideAllSections() {
    document.getElementById('results').innerHTML = '';
    document.getElementById('noResults').classList.add('hidden');
    document.getElementById('errorMessage').classList.add('hidden');
    document.getElementById('resultsInfo').classList.add('hidden');
    document.getElementById('pagination').classList.add('hidden');
  }

  showError(message) {
    document.getElementById('errorText').textContent = message;
    document.getElementById('errorMessage').classList.remove('hidden');
  }

  showNoResults() {
    document.getElementById('noResults').classList.remove('hidden');
  }

  showResultsInfo(count) {
    const itemType = this.currentProvider === 'yts' ? 'movie' : 'result';
    document.getElementById('resultCount').textContent =
      `${count} ${itemType}${count !== 1 ? 's' : ''} for "${this.currentQuery}"`;
    document.getElementById('resultsInfo').classList.remove('hidden');
  }

  renderPage() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const items = this.allResults.slice(startIndex, startIndex + this.itemsPerPage);
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    items.forEach((item, index) => {
      const card = this.currentProvider === 'yts'
        ? this.createYTSCard(item, startIndex + index)
        : this.createTPBCard(item, startIndex + index);

      card.style.opacity = '0';
      card.style.transform = 'translateY(16px)';
      resultsDiv.appendChild(card);

      // Staggered entrance
      requestAnimationFrame(() => {
        setTimeout(() => {
          card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 60);
      });
    });
  }

  createYTSCard(movie, index) {
    const card = document.createElement('div');
    card.className = 'movie-card cursor-pointer';
    card.style.cssText = `
      background: #18181c;
      border: 1px solid #2a2a30;
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;

    const imageUrl = movie.cover_image || '';
    const year = movie.year ? ` (${movie.year})` : '';
    const desc = movie.description
      ? (movie.description.length > 90 ? movie.description.substring(0, 90) + '…' : movie.description)
      : 'No description available.';

    const qualities = (movie.torrents || []).slice(0, 4).map(t =>
      `<span style="
        background: rgba(232,197,109,0.12);
        color: #e8c56d;
        border: 1px solid rgba(232,197,109,0.25);
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 500;
        white-space: nowrap;
      ">${t.quality}</span>`
    ).join('');

    card.innerHTML = `
      <!-- Poster -->
      <div style="aspect-ratio: 2/3; overflow: hidden; position: relative; background: #111114; flex-shrink: 0;">
        ${imageUrl
          ? `<img src="${imageUrl}" alt="${movie.name}" loading="lazy"
               style="width:100%; height:100%; object-fit:cover; display:block; transition: transform 0.4s ease;"
               onmouseover="this.style.transform='scale(1.04)'"
               onmouseout="this.style.transform='scale(1)'"
             />`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#6b6b78;font-size:13px;">No Image</div>`
        }
      </div>

      <!-- Info -->
      <div style="padding: 14px 14px 12px; display: flex; flex-direction: column; flex: 1; gap: 8px;">
        <!-- Title -->
        <h3 style="
          font-family: 'DM Serif Display', serif;
          font-size: 15px;
          line-height: 1.3;
          color: #e8e8ee;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        ">${movie.name}${year}</h3>

        <!-- Description -->
        <p style="
          font-size: 12px;
          line-height: 1.5;
          color: #6b6b78;
          margin: 0;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        ">${desc}</p>

        <!-- Footer: qualities + link -->
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-top: 4px; flex-wrap: wrap;">
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">
            ${qualities}
          </div>
          <span style="
            font-size: 12px;
            color: #e8c56d;
            white-space: nowrap;
            flex-shrink: 0;
            opacity: 0.85;
          ">Details →</span>
        </div>
      </div>
    `;

    card.addEventListener('click', () => this.showYTSDetails(movie));
    return card;
  }

  createTPBCard(torrent, index) {
    const card = document.createElement('div');
    card.className = 'movie-card cursor-pointer';
    card.style.cssText = `
      background: #18181c;
      border: 1px solid #2a2a30;
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;

    const seedColor = torrent.seeds > 10 ? '#4ade80' : torrent.seeds > 0 ? '#facc15' : '#f87171';

    card.innerHTML = `
      <div style="padding: 16px; display: flex; flex-direction: column; flex: 1; gap: 10px;">
        <!-- Category badge -->
        <div>
          <span style="
            background: rgba(232,197,109,0.1);
            color: #e8c56d;
            border: 1px solid rgba(232,197,109,0.2);
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 500;
          ">${torrent.category}</span>
        </div>

        <!-- Title -->
        <h3 style="
          font-family: 'DM Serif Display', serif;
          font-size: 15px;
          line-height: 1.35;
          color: #e8e8ee;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        ">${torrent.title}</h3>

        <!-- Stats -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 12px;">
          <div style="color: #6b6b78;">Size: <span style="color: #e8e8ee;">${torrent.size}</span></div>
          <div style="color: #6b6b78;">Files: <span style="color: #e8e8ee;">${torrent.numFiles}</span></div>
          <div style="color: #6b6b78;">Seeds: <span style="color: ${seedColor}; font-weight: 600;">${torrent.seeds}</span></div>
          <div style="color: #6b6b78;">Peers: <span style="color: #93c5fd;">${torrent.peers}</span></div>
        </div>

        <!-- Footer -->
        <div style="display: flex; justify-content: flex-end; padding-top: 4px; border-top: 1px solid #2a2a30;">
          <span style="font-size: 12px; color: #e8c56d; opacity: 0.85;">Details →</span>
        </div>
      </div>
    `;

    card.addEventListener('click', () => this.showTPBDetails(torrent));
    return card;
  }

  // ── Modals ───────────────────────────────────────────────

  modalRow(label, value) {
    if (!value) return '';
    return `
      <div style="display:flex; gap:12px; font-size:14px;">
        <span style="color:#6b6b78; min-width:80px; flex-shrink:0;">${label}</span>
        <span style="color:#e8e8ee;">${value}</span>
      </div>
    `;
  }

  showYTSDetails(movie) {
    const modal = document.getElementById('movieModal');
    document.getElementById('modalTitle').textContent = movie.name;

    const imageUrl = movie.cover_image || '';
    const torrents = movie.torrents || [];

    const torrentRows = torrents.map((t, i) => `
      <div style="
        background: #111114;
        border: 1px solid #2a2a30;
        border-radius: 10px;
        padding: 12px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
      ">
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <span style="
            background: rgba(232,197,109,0.12);
            color: #e8c56d;
            border: 1px solid rgba(232,197,109,0.25);
            padding: 3px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
          ">${t.quality}</span>
          <span style="font-size:13px; color:#6b6b78;">${t.type || 'Movie'}</span>
          <span style="font-size:13px; color:#6b6b78;">${t.size || ''}</span>
        </div>
        <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
          <span style="font-size:12px; color:#4ade80;">▲ ${t.seeds} seeds</span>
          <span style="font-size:12px; color:#93c5fd;">● ${t.peers} peers</span>
          ${t.upload_date ? `<span style="font-size:12px; color:#6b6b78;">${new Date(t.upload_date).toLocaleDateString()}</span>` : ''}
          ${t.magnet ? `
            <button
              onclick="copyMagnet('${t.magnet.replace(/'/g, "\\'")}', ${i})"
              id="copy-btn-${i}"
              style="
                display: flex; align-items: center; gap: 6px;
                background: #e8c56d; color: #0d0d0f;
                border: none; border-radius: 7px;
                padding: 5px 12px; font-size: 12px; font-weight: 600;
                cursor: pointer; transition: opacity 0.15s;
              "
              onmouseover="this.style.opacity='0.85'"
              onmouseout="this.style.opacity='1'"
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              <span id="copy-text-${i}">Copy Magnet</span>
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');

    document.getElementById('modalContent').innerHTML = `
      <div style="display:grid; grid-template-columns: 1fr; gap: 24px;">
        <!-- Top: poster + info -->
        <div style="display:flex; gap:20px; flex-wrap:wrap;">
          ${imageUrl ? `
            <img src="${imageUrl}" alt="${movie.name}" style="
              width: 130px; flex-shrink:0;
              border-radius: 10px;
              object-fit: cover;
              aspect-ratio: 2/3;
              box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            "/>
          ` : ''}
          <div style="flex:1; min-width:160px; display:flex; flex-direction:column; gap:10px;">
            ${this.modalRow('Year', movie.year)}
            ${this.modalRow('Language', movie.language)}
            ${movie.imdb ? `
              <div style="display:flex; gap:12px; font-size:14px;">
                <span style="color:#6b6b78; min-width:80px; flex-shrink:0;">IMDb</span>
                <a href="https://imdb.com/title/${movie.imdb}" target="_blank"
                   style="color:#e8c56d; text-decoration:none;">${movie.imdb}</a>
              </div>
            ` : ''}
            ${movie.description ? `
              <p style="font-size:13px; color:#9ca3af; line-height:1.6; margin:0; margin-top:4px;">${movie.description}</p>
            ` : ''}
          </div>
        </div>

        <!-- Torrents -->
        ${torrents.length > 0 ? `
          <div>
            <h4 style="font-family:'DM Serif Display',serif; font-size:18px; color:#e8e8ee; margin:0 0 12px;">Downloads</h4>
            <div style="display:flex; flex-direction:column; gap:8px;">${torrentRows}</div>
          </div>
        ` : ''}
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  showTPBDetails(torrent) {
    const modal = document.getElementById('movieModal');
    document.getElementById('modalTitle').textContent = torrent.title;

    const seedColor = torrent.seeds > 10 ? '#4ade80' : torrent.seeds > 0 ? '#facc15' : '#f87171';

    document.getElementById('modalContent').innerHTML = `
      <div style="display:flex; flex-direction:column; gap:20px;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          ${this.modalRow('Size', torrent.size)}
          ${this.modalRow('Category', torrent.category)}
          <div style="display:flex; gap:12px; font-size:14px;">
            <span style="color:#6b6b78; min-width:80px; flex-shrink:0;">Seeds</span>
            <span style="color:${seedColor}; font-weight:600;">${torrent.seeds}</span>
          </div>
          <div style="display:flex; gap:12px; font-size:14px;">
            <span style="color:#6b6b78; min-width:80px; flex-shrink:0;">Peers</span>
            <span style="color:#93c5fd;">${torrent.peers}</span>
          </div>
          ${this.modalRow('Files', torrent.numFiles)}
          ${this.modalRow('Status', torrent.status)}
          ${this.modalRow('Uploaded', torrent.time)}
          ${torrent.imdb ? `
            <div style="display:flex; gap:12px; font-size:14px;">
              <span style="color:#6b6b78; min-width:80px;">IMDb</span>
              <a href="https://imdb.com/title/${torrent.imdb}" target="_blank"
                 style="color:#e8c56d; text-decoration:none;">${torrent.imdb}</a>
            </div>
          ` : ''}
        </div>

        ${torrent.magnet ? `
          <div style="
            background: #111114;
            border: 1px solid #2a2a30;
            border-radius: 10px;
            padding: 14px;
            display: flex; align-items: center; justify-content: space-between; gap:12px;
            flex-wrap: wrap;
          ">
            <span style="font-size:14px; color:#6b6b78;">Magnet Link</span>
            <button
              onclick="copyMagnet('${torrent.magnet.replace(/'/g, "\\'")}', 'modal')"
              id="copy-btn-modal"
              style="
                display: flex; align-items: center; gap: 6px;
                background: #e8c56d; color: #0d0d0f;
                border: none; border-radius: 7px;
                padding: 7px 14px; font-size: 13px; font-weight: 600;
                cursor: pointer; transition: opacity 0.15s;
              "
              onmouseover="this.style.opacity='0.85'"
              onmouseout="this.style.opacity='1'"
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              <span id="copy-text-modal">Copy Magnet</span>
            </button>
          </div>
        ` : ''}
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    document.getElementById('movieModal').classList.add('hidden');
    document.body.style.overflow = '';
  }

  updatePagination() {
    const totalPages = Math.ceil(this.allResults.length / this.itemsPerPage);

    if (totalPages <= 1) {
      document.getElementById('pagination').classList.add('hidden');
      return;
    }

    document.getElementById('pagination').classList.remove('hidden');
    document.getElementById('pageInfo').textContent = `Page ${this.currentPage} of ${totalPages}`;
    document.getElementById('prevBtn').disabled = this.currentPage === 1;
    document.getElementById('nextBtn').disabled = this.currentPage === totalPages;
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.renderPage();
      this.updatePagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage() {
    const totalPages = Math.ceil(this.allResults.length / this.itemsPerPage);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.renderPage();
      this.updatePagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new CineSearch();
});
