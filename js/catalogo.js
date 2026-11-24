const products = window.teroProducts;
let selectedCategory = "Todos";

function renderProducts() {
  const grid = document.getElementById("catalogueGrid");
  const filtered = selectedCategory === "Todos"
    ? products
    : products.filter((product) => product.category === selectedCategory);

  grid.innerHTML = filtered.map((product) => {
    return `
      <article class="dish-card">
        <div class="dish-image dish-image-placeholder" role="img" aria-label="Imagem provisória de ${product.name}">
          <span aria-hidden="true">${product.icon}</span>
        </div>
        <div class="dish-details">
          <p class="dish-category">${product.category}</p>
          <h2>${product.name}</h2>
          <p class="dish-description">${product.description}</p>
          <details class="dish-info">
            <summary>Informação provisória</summary>
            <dl>
              <div><dt>Ingredientes</dt><dd>${product.ingredients}</dd></div>
              <div><dt>Alergénios</dt><dd>${product.allergens}</dd></div>
              <div><dt>Conservação</dt><dd>${product.storage}</dd></div>
              <div><dt>Preparação</dt><dd>${product.preparation}</dd></div>
            </dl>
          </details>
          <div class="dish-card-footer">
            <strong>${window.formatTeroPrice(product.price)}</strong>
          </div>
        </div>
      </article>
    `;
  }).join("");

}

document.querySelectorAll(".category-button").forEach((button) => {
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.category;
    document.querySelectorAll(".category-button").forEach((entry) => {
      const active = entry === button;
      entry.classList.toggle("active", active);
      entry.setAttribute("aria-pressed", String(active));
    });
    renderProducts();
  });
});

renderProducts();
