import type { FC } from "hono/jsx"
import { Layout } from "./Layout"

export const TorrentSearchPage: FC = () => {
  return (
    <Layout>
      <div class="min-h-screen flex items-center justify-center px-4">
        <div class="w-full max-w-2xl">
          {/* Header */}
          <div class="text-center mb-12">
            <h1 class="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4 tracking-tight">
              T-Search
            </h1>
            <p class="text-gray-300 text-lg md:text-xl mb-2">
              Search torrents across multiple providers
            </p>
            <div class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          {/* Search Form */}
          <div class="backdrop-blur-lg bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10">
            <form id="search-form" class="space-y-6">
              {/* Search Input */}
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  id="search-input"
                  placeholder="Search for torrents..."
                  class="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-lg"
                  autocomplete="off"
                />
              </div>

              {/* Provider and Category Selection */}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Provider Select */}
                <div>
                  <label for="provider" class="block text-sm font-medium text-gray-300 mb-2">
                    Provider
                  </label>
                  <select
                    id="provider"
                    class="w-full px-4 py-3 bg-white/5 backdrop-blur border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  >
                    <option value="">Loading providers...</option>
                  </select>
                </div>

                {/* Category Select */}
                <div>
                  <label for="category" class="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    class="w-full px-4 py-3 bg-white/5 backdrop-blur border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  >
                    <option value="All">All</option>
                  </select>
                </div>
              </div>

              {/* Results Limit */}
              <div class="flex items-center space-x-4">
                <label for="limit" class="text-sm font-medium text-gray-300 whitespace-nowrap">
                  Results limit:
                </label>
                <select
                  id="limit"
                  class="px-4 py-2 bg-white/5 backdrop-blur border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                >
                  <option value="10">10</option>
                  <option value="20" selected>20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 active:scale-[0.98] text-lg"
              >
                <span class="flex items-center justify-center space-x-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  <span>Search Torrents</span>
                </span>
              </button>
            </form>
          </div>

          {/* Footer */}
          <div class="text-center mt-8">
            <p class="text-gray-400 text-sm">
              Built with ❤️ using Hono and Cloudflare Workers
            </p>
          </div>
        </div>
      </div>

      {/* JavaScript */}
      <script dangerouslySetInnerHTML={{ __html: `
        let providersData = [];

        // Fetch providers on page load
        async function loadProviders() {
          try {
            const response = await fetch('/api/providers');
            const data = await response.json();
            
            if (data.success) {
              providersData = data.providers;
              populateProviders();
            } else {
              console.error('Failed to load providers:', data.error);
              showFallbackProviders();
            }
          } catch (error) {
            console.error('Error loading providers:', error);
            showFallbackProviders();
          }
        }

        function populateProviders() {
          const providerSelect = document.getElementById('provider');
          providerSelect.innerHTML = '';
          
          providersData.forEach(provider => {
            const option = document.createElement('option');
            option.value = provider.name;
            option.textContent = provider.name;
            
            // Set ThePirateBay as default
            if (provider.name === 'ThePirateBay') {
              option.selected = true;
            }
            
            providerSelect.appendChild(option);
          });
          
          updateCategories();
        }

        function showFallbackProviders() {
          const providerSelect = document.getElementById('provider');
          providerSelect.innerHTML = \`
            <option value="ThePirateBay" selected>The Pirate Bay</option>
            <option value="1337x">1337x</option>
            <option value="Torrent9">Torrent9</option>
          \`;
          
          // Set fallback categories
          const categorySelect = document.getElementById('category');
          categorySelect.innerHTML = \`
            <option value="All" selected>All</option>
            <option value="Movies">Movies</option>
            <option value="TV">TV</option>
            <option value="Music">Music</option>
          \`;
        }

        function updateCategories() {
          const providerSelect = document.getElementById('provider');
          const categorySelect = document.getElementById('category');
          const selectedProviderName = providerSelect.value;
          
          const selectedProvider = providersData.find(p => p.name === selectedProviderName);
          
          if (selectedProvider && selectedProvider.categories) {
            categorySelect.innerHTML = '';
            selectedProvider.categories.forEach(category => {
              const option = document.createElement('option');
              option.value = category;
              option.textContent = category;
              
              if (category === 'All') {
                option.selected = true;
              }
              
              categorySelect.appendChild(option);
            });
          }
        }

        function handleSearch(event) {
          event.preventDefault();
          
          const query = document.getElementById('search-input').value.trim();
          const provider = document.getElementById('provider').value;
          const category = document.getElementById('category').value;
          const limit = document.getElementById('limit').value;
          
          if (!query) {
            alert('Please enter a search query');
            return;
          }
          
          // For now, just show what would be searched
          console.log('Search params:', { query, provider, category, limit });
          alert(\`Would search for: "\${query}" in \${category} on \${provider} (limit: \${limit})\`);
          
          // TODO: Make API call to /api/search
        }

        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', function() {
          loadProviders();
          
          // Add event listeners
          document.getElementById('provider').addEventListener('change', updateCategories);
          document.getElementById('search-form').addEventListener('submit', handleSearch);
        });
      `}} />
    </Layout>
  )
}