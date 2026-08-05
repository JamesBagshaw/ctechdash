(function () {
  const searchInput = document.getElementById("search-input");
  const clearBtn = document.getElementById("clear-search");
  const chipsWrap = document.getElementById("category-chips");
  const resultsWrap = document.getElementById("results");
  const resultCount = document.getElementById("result-count");
  const emptyState = document.getElementById("empty-state");

  let allItems = [];
  let allCategories = [];
  let activeCategory = "All";

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function highlight(text, query) {
    const safe = escapeHtml(text);
    if (!query) return safe;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return safe.replace(new RegExp(`(${escapedQuery})`, "ig"), "<mark>$1</mark>");
  }

  function renderChips() {
    const cats = ["All", ...allCategories];
    chipsWrap.innerHTML = cats
      .map(
        (cat) =>
          `<button type="button" class="chip${cat === activeCategory ? " active" : ""}" data-category="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`
      )
      .join("");
  }

  function matches(item, query) {
    if (!query) return true;
    const haystack = `${item.name} ${item.category} ${item.tags.join(" ")}`.toLowerCase();
    return haystack.includes(query);
  }

  function renderResults() {
    const rawQuery = searchInput.value.trim();
    const query = rawQuery.toLowerCase();

    clearBtn.hidden = rawQuery.length === 0;

    const filtered = allItems.filter((item) => {
      const categoryOk = activeCategory === "All" || item.category === activeCategory;
      return categoryOk && matches(item, query);
    });

    resultCount.textContent = `${filtered.length} item${filtered.length === 1 ? "" : "s"} found`;

    if (filtered.length === 0) {
      resultsWrap.innerHTML = "";
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;

    resultsWrap.innerHTML = filtered
      .map((item) => {
        const metaParts = [];
        if (item.quantity) metaParts.push(`<span><strong>${escapeHtml(item.quantity)}</strong> in stock</span>`);
        if (item.location) metaParts.push(`<span>${escapeHtml(item.location)}</span>`);

        return `
          <article class="item-card">
            <div class="item-card-top">
              <h2 class="item-name">${highlight(item.name, rawQuery)}</h2>
              <span class="item-category">${highlight(item.category, rawQuery)}</span>
            </div>
            ${item.description ? `<p class="item-description">${escapeHtml(item.description)}</p>` : ""}
            <div class="item-meta">${metaParts.join("")}</div>
          </article>
        `;
      })
      .join("");
  }

  function init(data) {
    allItems = data.items || [];
    allCategories = data.categories || [];
    renderChips();
    renderResults();

    searchInput.addEventListener("input", renderResults);

    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      searchInput.focus();
      renderResults();
    });

    chipsWrap.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      activeCategory = btn.dataset.category;
      renderChips();
      renderResults();
    });
  }

  fetch("data/equipment.json")
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load equipment data (${res.status})`);
      return res.json();
    })
    .then(init)
    .catch((err) => {
      resultsWrap.innerHTML = `<p class="empty-state">Could not load equipment data. ${escapeHtml(err.message)}</p>`;
      console.error(err);
    });
})();
