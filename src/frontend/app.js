document.getElementById("searchForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = document.getElementById("query").value.trim();
  if (!query) return;

  const res = await fetch(`/api/search/yts?query=${encodeURIComponent(query)}`);
  const data = await res.json();

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (data.status !== "ok" || data.movie_count === 0) {
    resultsDiv.innerHTML = `<p class="text-gray-400">No results found.</p>`;
    return;
  }

  data.data.forEach((movie) => {
    const card = document.createElement("div");
    card.className =
      "bg-gray-800 p-4 rounded shadow flex gap-4 items-start";

    card.innerHTML = `
      <img src="${movie.cover_image}" alt="${movie.name}" class="w-24 rounded" />
      <div>
        <h2 class="text-xl font-semibold">${movie.name}</h2>
        <p class="text-sm text-gray-400">${movie.year} • ${movie.language}</p>
        <p class="mt-2 text-gray-300">${movie.description || ""}</p>
      </div>
    `;
    resultsDiv.appendChild(card);
  });
});