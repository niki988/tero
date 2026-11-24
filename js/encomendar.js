const products = window.teroProducts;
const cartKey = "teroCart";
let cart = window.loadTeroCart();
let selectedCategory = "Todos";

function saveCart() {
  localStorage.setItem(cartKey, JSON.stringify(cart));
}

function getCartQuantity() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function getCartTotal() {
  return cart.reduce((total, item) => {
    const product = products.find((entry) => entry.id === item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

function addProduct(productId) {
  const item = cart.find((entry) => entry.id === productId);
  if (item) item.quantity += 1;
  else cart.push({ id: productId, quantity: 1 });
  saveCart();
  renderCart();
  renderProducts();
}

function changeQuantity(productId, difference) {
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;
  item.quantity += difference;
  if (item.quantity <= 0) cart = cart.filter((entry) => entry.id !== productId);
  saveCart();
  renderCart();
  renderProducts();
}

function removeProduct(productId) {
  cart = cart.filter((entry) => entry.id !== productId);
  saveCart();
  renderCart();
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById("catalogueGrid");
  const filteredProducts = selectedCategory === "Todos"
    ? products
    : products.filter((product) => product.category === selectedCategory);

  grid.innerHTML = filteredProducts.map((product) => {
    const quantity = cart.find((item) => item.id === product.id)?.quantity || 0;
    return `
      <article class="product-card">
        <div class="product-image"><span>${product.icon}</span></div>
        <div class="product-details">
          <h2>${product.name}</h2>
          <p>${product.description}</p>
          <div class="product-card-footer">
            <strong>${window.formatTeroPrice(product.price)}</strong>
            <button type="button" class="btn btn-primary add-product" data-product-id="${product.id}">
              ${quantity ? `Adicionar · ${quantity}` : "Adicionar à encomenda"}
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  grid.querySelectorAll(".add-product").forEach((button) => {
    button.addEventListener("click", () => addProduct(button.dataset.productId));
  });
}

function renderCart() {
  const quantity = getCartQuantity();
  const total = getCartTotal();
  document.getElementById("cartBadge").textContent = quantity;
  document.getElementById("orderTotal").textContent = window.formatTeroPrice(total);
  document.getElementById("cartDrawerTotal").textContent = window.formatTeroPrice(total);

  const cartItems = document.getElementById("cartItems");
  if (!cart.length) {
    cartItems.innerHTML = '<p class="empty-cart">O carrinho está vazio.</p>';
    return;
  }

  cartItems.innerHTML = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    if (!product) return "";
    return `
      <article class="cart-item">
        <div class="cart-item-icon">${product.icon}</div>
        <div class="cart-item-info"><strong>${product.name}</strong><span>${window.formatTeroPrice(product.price * item.quantity)}</span></div>
        <div class="cart-item-controls">
          <button type="button" data-action="decrease" data-product-id="${product.id}" aria-label="Diminuir ${product.name}">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-action="increase" data-product-id="${product.id}" aria-label="Aumentar ${product.name}">+</button>
        </div>
        <button type="button" class="remove-item" data-action="remove" data-product-id="${product.id}" aria-label="Remover ${product.name}">×</button>
      </article>
    `;
  }).join("");

  cartItems.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.dataset.productId;
      if (button.dataset.action === "remove") removeProduct(productId);
      if (button.dataset.action === "increase") changeQuantity(productId, 1);
      if (button.dataset.action === "decrease") changeQuantity(productId, -1);
    });
  });
}

function openCart() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("cartDrawer").setAttribute("aria-hidden", "false");
  document.getElementById("cartBackdrop").hidden = false;
}

function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("cartDrawer").setAttribute("aria-hidden", "true");
  document.getElementById("cartBackdrop").hidden = true;
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

document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
document.getElementById("cartBackdrop").addEventListener("click", closeCart);
document.getElementById("checkoutButton").addEventListener("click", () => {
  if (!cart.length) {
    document.getElementById("toast").textContent = "Adicione pelo menos um produto";
    document.getElementById("toast").classList.add("show");
    setTimeout(() => document.getElementById("toast").classList.remove("show"), 1800);
    return;
  }
  window.location.href = "localizacao.html";
});
document.getElementById("drawerCheckout").addEventListener("click", () => {
  closeCart();
  document.getElementById("checkoutButton").click();
});

renderProducts();
renderCart();
