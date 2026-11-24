const products = window.teroProducts;

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

const cart = window.loadTeroCart();
const delivery = readJson("teroDeliveryInfo", null);

const cartQuantity = cart.reduce((total, item) => total + item.quantity, 0);
const deliveryPostalPrefix = delivery?.postalCode ? Number(delivery.postalCode.split("-")[0]) : 0;
const normalizeArea = (value) => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase();
const deliveryAreaValid = delivery
  && Boolean(delivery.deliveryDate)
  && deliveryPostalPrefix >= 3800
  && deliveryPostalPrefix <= 3835
  && ["aveiro", "ilhavo"].includes(normalizeArea(delivery.district))
  && ["aveiro", "ilhavo"].includes(normalizeArea(delivery.city))
  && normalizeArea(delivery.district) === normalizeArea(delivery.city);

if (cartQuantity === 0) {
  window.location.replace("encomendar.html");
} else if (!delivery || !deliveryAreaValid) {
  window.location.replace("localizacao.html");
}

function getSubtotal() {
  return cart.reduce((total, item) => {
    const product = products.find((entry) => entry.id === item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

function renderOrderSummary() {
  const container = document.getElementById("paymentCartItems");
  if (!cart.length) {
    container.innerHTML = '<p class="empty-payment-cart">O carrinho está vazio.</p>';
  } else {
    container.innerHTML = cart.map((item) => {
      const product = products.find((entry) => entry.id === item.id);
      if (!product) return "";
      return `
        <article class="payment-cart-item">
          <div class="payment-cart-image" aria-hidden="true">${product.icon}</div>
          <div class="payment-cart-info">
            <strong>${product.name}</strong>
            <span>${window.formatTeroPrice(product.price)} × ${item.quantity}</span>
          </div>
          <strong class="payment-cart-subtotal">${window.formatTeroPrice(product.price * item.quantity)}</strong>
        </article>
      `;
    }).join("");
  }

  const subtotal = getSubtotal();
  document.getElementById("subtotalTotal").textContent = window.formatTeroPrice(subtotal);
  document.getElementById("paymentTotal").textContent = window.formatTeroPrice(subtotal);
  document.getElementById("paymentActionTotal").textContent = window.formatTeroPrice(subtotal);
}

function renderDeliverySummary() {
  const container = document.getElementById("deliverySummary");

  if (!delivery) {
    container.innerHTML = '<p class="empty-delivery">Não existem dados de entrega disponíveis.</p>';
    return;
  }

  const address = [
    delivery.street,
    delivery.doorNumber,
    delivery.apartment,
  ].filter(Boolean).join(", ");
  const deliveryDate = delivery.deliveryDate
    ? new Date(`${delivery.deliveryDate}T00:00:00`).toLocaleDateString("pt-PT")
    : "A indicar";

  container.innerHTML = `
    <div><dt>Nome</dt><dd>${delivery.fullName}</dd></div>
    <div><dt>Telemóvel</dt><dd>${delivery.phone}</dd></div>
    <div><dt>Email</dt><dd>${delivery.email}</dd></div>
    <div><dt>Morada</dt><dd>${address}</dd></div>
    <div><dt>Código postal</dt><dd>${delivery.postalCode}</dd></div>
    <div><dt>Localidade</dt><dd>${delivery.city}</dd></div>
    <div><dt>Data pretendida</dt><dd>${deliveryDate}</dd></div>
    ${delivery.notes ? `<div><dt>Observações</dt><dd>${delivery.notes}</dd></div>` : ""}
  `;
}

document.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    document.querySelectorAll(".payment-option").forEach((option) => option.classList.remove("selected"));
    radio.closest(".payment-option").classList.add("selected");

    const mbwayFields = document.getElementById("mbwayFields");
    mbwayFields.classList.toggle("hidden", radio.value !== "mbway");
  });
});

document.getElementById("confirmPayment").addEventListener("click", () => {
  const error = document.getElementById("paymentError");
  const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
  const termsAccepted = document.getElementById("acceptTerms").checked;

  if (!cart.length) {
    error.textContent = "O carrinho está vazio.";
    return;
  }

  if (!delivery) {
    error.textContent = "Indique os dados de entrega antes de continuar.";
    return;
  }

  if (!selectedMethod) {
    error.textContent = "Selecione um método de pagamento.";
    return;
  }

  if (selectedMethod.value === "mbway") {
    const mbwayPhone = document.getElementById("mbwayPhone").value.trim();
    if (!/^(\+351)?9[1236][0-9]{7}$/.test(mbwayPhone)) {
      error.textContent = "Introduza um número português válido para MB WAY.";
      document.getElementById("mbwayPhone").focus();
      return;
    }
  }

  if (!termsAccepted) {
    error.textContent = "Aceite os termos e a política de privacidade para continuar.";
    return;
  }

  error.textContent = "";

  const pendingOrder = {
    products: cart,
    delivery,
    paymentMethod: selectedMethod.value,
    subtotal: getSubtotal(),
    status: "demo-not-submitted",
    createdAt: new Date().toISOString()
  };
  localStorage.setItem("teroPendingOrder", JSON.stringify(pendingOrder));
  window.location.href = "confirmacao.html";
});


renderOrderSummary();
renderDeliverySummary();
