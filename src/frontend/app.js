// Utility function to copy magnet link and show toast
async function copyMagnet(magnet, index) {
  try {
    await navigator.clipboard.writeText(magnet);
    
    // Update button text temporarily
    const copyText = document.getElementById(`copy-text-${index}`);
    const originalText = copyText.textContent;
    copyText.textContent = 'Copied!';
    
    // Create and show toast
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-y-0 opacity-100 z-50';
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Magnet link copied to clipboard!</span>
      </div>
    `;
    document.body.appendChild(toast);
    
    // Reset button text and remove toast after 2 seconds
    setTimeout(() => {
      copyText.textContent = originalText;
      toast.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
    // Show error toast
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-y-0 opacity-100 z-50';
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        <span>Failed to copy magnet link</span>
      </div>
    `;
    document.body.appendChild(toast);
    
    // Remove error toast after 2 seconds
    setTimeout(() => {
      toast.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
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
    this.addInputEffects();
    this.setupProviderToggle();
  }

  bindEvents() {
    document.getElementById('searchForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.search();
    });

    document.getElementById('prevBtn').addEventListener('click', () => {
      this.previousPage();
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
      this.nextPage();
    });

    document.getElementById('closeModal').addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('movieModal').addEventListener('click', (e) => {
      if (e.target.id === 'movieModal') {
        this.closeModal();
      }
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
          queryInput.placeholder = 'Search for torrents...';
        } else {
          tpbOptions.classList.add('hidden');
          queryInput.placeholder = 'Search for movies...';
        }
      });
    });
  }

  addInputEffects() {
    const input = document.getElementById('query');
    const glow = document.getElementById('searchGlow');
    
    input.addEventListener('focus', () => {
      glow.style.opacity = '1';
    });
    
    input.addEventListener('blur', () => {
      glow.style.opacity = '0';
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
      this.showError('Failed to search. Please try again.');
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
      `Found ${count} ${itemType}${count !== 1 ? 's' : ''} for "${this.currentQuery}"`;
    document.getElementById('resultsInfo').classList.remove('hidden');
  }

  renderPage() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const items = this.allResults.slice(startIndex, endIndex);

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    items.forEach((item, index) => {
      const card = this.currentProvider === 'yts' 
        ? this.createYTSCard(item, startIndex + index)
        : this.createTPBCard(item, startIndex + index);
      resultsDiv.appendChild(card);
    });

    // Animate cards
    setTimeout(() => {
      document.querySelectorAll('.movie-card').forEach((card, index) => {
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 100);
      });
    }, 50);
  }

  createYTSCard(movie, index) {
    const card = document.createElement('div');
    card.className = 'movie-card glass-effect rounded-xl overflow-hidden transform transition-all duration-500 hover:scale-105 cursor-pointer opacity-0 translate-y-8';

    const imageUrl = movie.cover_image || 'https://via.placeholder.com/300x450/374151/9CA3AF?text=No+Image';
    const year = movie.year || 'Unknown';
    const description = movie.description ? 
      (movie.description.length > 100 ? movie.description.substring(0, 100) + '...' : movie.description) : 
      'No description available';

    card.innerHTML = `
      <div class="aspect-[2/3] relative overflow-hidden">
        <img 
          src="${imageUrl}" 
          alt="${movie.name}" 
          class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        <div class="absolute bottom-4 left-4 right-4 transform translate-y-4 opacity-0 hover:translate-y-0 hover:opacity-100 transition-all duration-300">
          <div class="flex items-center gap-2 text-sm">
            <span class="bg-blue-600 px-2 py-1 rounded text-xs font-semibold">${year}</span>
            ${movie.language ? `<span class="bg-purple-600 px-2 py-1 rounded text-xs font-semibold">${movie.language}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="p-6">
        <h3 class="font-bold text-lg mb-2 line-clamp-2">${movie.name}</h3>
        <p class="text-gray-400 text-sm mb-4 line-clamp-3">${description}</p>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            ${movie.torrents && movie.torrents.length > 0 ? `
              <div class="flex gap-1">
                ${movie.torrents.slice(0, 3).map(torrent => `
                  <span class="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs font-medium">
                    ${torrent.quality}
                  </span>
                `).join('')}
              </div>
            ` : ''}
          </div>
          <button class="text-blue-400 hover:text-blue-300 text-sm font-medium">
            View Details →
          </button>
        </div>
      </div>
    `;

    card.addEventListener('click', () => this.showYTSDetails(movie));
    return card;
  }

  createTPBCard(torrent, index) {
    const card = document.createElement('div');
    card.className = 'movie-card glass-effect rounded-xl overflow-hidden transform transition-all duration-500 hover:scale-105 cursor-pointer opacity-0 translate-y-8';

    card.innerHTML = `
      <div class="p-6">
        <h3 class="font-bold text-lg mb-2 line-clamp-2">${torrent.title}</h3>
        <div class="space-y-2 mb-4">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-400">Size:</span>
            <span class="text-white">${torrent.size}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-400">Seeds:</span>
            <span class="text-green-400">${torrent.seeds}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-400">Peers:</span>
            <span class="text-blue-400">${torrent.peers}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-400">Files:</span>
            <span class="text-white">${torrent.numFiles}</span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="bg-purple-600/20 text-purple-400 px-2 py-1 rounded text-xs font-medium">
            ${torrent.category}
          </span>
          <button class="text-blue-400 hover:text-blue-300 text-sm font-medium">
            View Details →
          </button>
        </div>
      </div>
    `;

    card.addEventListener('click', () => this.showTPBDetails(torrent));
    return card;
  }

  showYTSDetails(movie) {
    const modal = document.getElementById('movieModal');
    const title = document.getElementById('modalTitle');
    const content = document.getElementById('modalContent');

    title.textContent = movie.name;

    const imageUrl = movie.cover_image || 'https://via.placeholder.com/300x450/374151/9CA3AF?text=No+Image';
    const torrents = movie.torrents || [];

    content.innerHTML = `
      <div class="grid md:grid-cols-3 gap-8">
        <div class="md:col-span-1">
          <img 
            src="${imageUrl}" 
            alt="${movie.name}" 
            class="w-full rounded-xl shadow-2xl"
          />
        </div>
        <div class="md:col-span-2">
          <div class="space-y-6">
            <div>
              <h4 class="text-xl font-semibold mb-2">Movie Information</h4>
              <div class="space-y-2">
                <p><span class="text-gray-400">Year:</span> <span class="text-white">${movie.year || 'Unknown'}</span></p>
                <p><span class="text-gray-400">Language:</span> <span class="text-white">${movie.language || 'Unknown'}</span></p>
                ${movie.imdb ? `<p><span class="text-gray-400">IMDB:</span> <a href="https://imdb.com/title/${movie.imdb}" target="_blank" class="text-blue-400 hover:text-blue-300">${movie.imdb}</a></p>` : ''}
              </div>
            </div>

            ${movie.description ? `
              <div>
                <h4 class="text-xl font-semibold mb-2">Synopsis</h4>
                <p class="text-gray-300 leading-relaxed">${movie.description}</p>
              </div>
            ` : ''}

            ${torrents.length > 0 ? `
              <div>
                <h4 class="text-xl font-semibold mb-4">Available Downloads</h4>
                <div class="space-y-3">
                  ${torrents.map((torrent, index) => `
                    <div class="glass-effect rounded-lg p-4">
                      <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-3">
                          <span class="bg-green-600 px-3 py-1 rounded-full text-sm font-semibold">${torrent.quality}</span>
                          <span class="text-gray-400 text-sm">${torrent.type || 'Movie'}</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <span class="text-gray-400 text-sm">${torrent.size || 'Unknown size'}</span>
                          ${torrent.magnet ? `
                            <button 
                              onclick="copyMagnet('${torrent.magnet.replace(/'/g, "\\'")}', ${index})" 
                              class="copy-magnet-btn flex items-center gap-2 px-3 py-1 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                              id="copy-btn-${index}"
                            >
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19C3 20.11 3.89 21 5 21H11V19H5V3H13V9H21ZM20.5 11.5L23 14L20.5 16.5L19 15L20 14L19 13L20.5 11.5ZM15.5 11.5L17 13L16 14L17 15L15.5 16.5L13 14L15.5 11.5Z"/>
                              </svg>
                              <span id="copy-text-${index}">Copy Magnet</span>
                            </button>
                          ` : ''}
                        </div>
                      </div>
                      <div class="flex items-center gap-4 text-sm">
                        <span class="text-green-400">🌱 ${torrent.seeds} seeds</span>
                        <span class="text-blue-400">👥 ${torrent.peers} peers</span>
                        ${torrent.upload_date ? `<span class="text-gray-400">📅 ${new Date(torrent.upload_date).toLocaleDateString()}</span>` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  showTPBDetails(torrent) {
    const modal = document.getElementById('movieModal');
    const title = document.getElementById('modalTitle');
    const content = document.getElementById('modalContent');

    title.textContent = torrent.title;

    content.innerHTML = `
      <div class="space-y-6">
        <div>
          <h4 class="text-xl font-semibold mb-4">Torrent Information</h4>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="space-y-3">
              <p><span class="text-gray-400">Size:</span> <span class="text-white">${torrent.size}</span></p>
              <p><span class="text-gray-400">Seeds:</span> <span class="text-green-400">${torrent.seeds}</span></p>
              <p><span class="text-gray-400">Peers:</span> <span class="text-blue-400">${torrent.peers}</span></p>
              <p><span class="text-gray-400">Files:</span> <span class="text-white">${torrent.numFiles}</span></p>
            </div>
            <div class="space-y-3">
              <p><span class="text-gray-400">Category:</span> <span class="text-white">${torrent.category}</span></p>
              <p><span class="text-gray-400">Status:</span> <span class="text-white">${torrent.status}</span></p>
              <p><span class="text-gray-400">Uploaded:</span> <span class="text-white">${torrent.time}</span></p>
              ${torrent.imdb ? `<p><span class="text-gray-400">IMDB:</span> <a href="https://imdb.com/title/${torrent.imdb}" target="_blank" class="text-blue-400 hover:text-blue-300">${torrent.imdb}</a></p>` : ''}
            </div>
          </div>
        </div>

        ${torrent.magnet ? `
          <div>
            <h4 class="text-xl font-semibold mb-4">Download</h4>
            <div class="glass-effect rounded-lg p-4">
              <div class="flex items-center justify-between">
                <span class="text-gray-300">Magnet Link</span>
                <button 
                  onclick="copyMagnet('${torrent.magnet.replace(/'/g, "\\'")}', 'modal')" 
                  class="copy-magnet-btn flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                  id="copy-btn-modal"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19C3 20.11 3.89 21 5 21H11V19H5V3H13V9H21ZM20.5 11.5L23 14L20.5 16.5L19 15L20 14L19 13L20.5 11.5ZM15.5 11.5L17 13L16 14L17 15L15.5 16.5L13 14L15.5 11.5Z"/>
                  </svg>
                  <span id="copy-text-modal">Copy Magnet Link</span>
                </button>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    document.getElementById('movieModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
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

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CineSearch();
});