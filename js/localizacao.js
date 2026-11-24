const deliveryKey = "teroDeliveryInfo";
const deliveryDateInput = document.getElementById("deliveryDate");

function getLocalDateValue(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

deliveryDateInput.min = getLocalDateValue(new Date());

function loadDeliveryInfo() {
  try {
    return JSON.parse(localStorage.getItem(deliveryKey)) || {};
  } catch {
    return {};
  }
}

function populateSavedDelivery() {
  const saved = loadDeliveryInfo();
  const profileAddress = (() => {
    try {
      return JSON.parse(localStorage.getItem("teroDeliveryAddress")) || null;
    } catch {
      return null;
    }
  })();
  const personal = (() => {
    try {
      return JSON.parse(localStorage.getItem("teroPersonalInfo")) || null;
    } catch {
      return null;
    }
  })();

  document.getElementById("fullName").value = saved.fullName || personal?.name || localStorage.getItem("teroProfileName") || "";
  document.getElementById("phone").value = saved.phone || personal?.phone || "";
  document.getElementById("email").value = saved.email || personal?.email || localStorage.getItem("teroProfileEmail") || "";
  document.getElementById("street").value = saved.street || profileAddress?.street || "";
  document.getElementById("doorNumber").value = saved.doorNumber || "";
  document.getElementById("apartment").value = saved.apartment || "";
  document.getElementById("postalCode").value = saved.postalCode || profileAddress?.postal || "";
  document.getElementById("city").value = saved.city || profileAddress?.city || "";
  document.getElementById("district").value = saved.district || "";
  document.getElementById("notes").value = saved.notes || "";
  document.getElementById("saveAddress").checked = saved.saveAddress === true;
  deliveryDateInput.value = saved.deliveryDate || "";
}

function isPostalCodeInDeliveryArea(postalCode) {
  const prefix = Number(postalCode.split("-")[0]);
  return prefix >= 3800 && prefix <= 3835;
}

function isDeliveryAreaValid(city, district) {
  const normalizedCity = city.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const normalizedDistrict = district.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return ["aveiro", "ilhavo"].includes(normalizedCity)
    && ["aveiro", "ilhavo"].includes(normalizedDistrict)
    && normalizedCity === normalizedDistrict;
}

function validateDeliveryForm(form) {
  const error = document.getElementById("deliveryError");
  const postalCode = form.postalCode.value.trim();
  const email = form.email.value.trim();

  if (!form.deliveryDate.value) {
    error.textContent = "Indique a data pretendida para a entrega.";
    form.deliveryDate.focus();
    return false;
  }

  if (form.deliveryDate.value < deliveryDateInput.min) {
    error.textContent = "Escolha uma data de hoje ou posterior.";
    form.deliveryDate.focus();
    return false;
  }

  if (!form.fullName.value.trim()) {
    error.textContent = "Introduza o nome completo.";
    form.fullName.focus();
    return false;
  }

  if (!form.phone.value.trim()) {
    error.textContent = "Introduza o número de telemóvel.";
    form.phone.focus();
    return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    error.textContent = "Introduza um email válido.";
    form.email.focus();
    return false;
  }

  if (!form.street.value.trim() || !form.doorNumber.value.trim()) {
    error.textContent = "Introduza a rua/avenida e o número da porta.";
    form.street.focus();
    return false;
  }

  if (!/^[0-9]{4}-[0-9]{3}$/.test(postalCode)) {
    error.textContent = "Introduza um código postal válido no formato 0000-000.";
    form.postalCode.focus();
    return false;
  }

  if (!isPostalCodeInDeliveryArea(postalCode)) {
    error.textContent = "Esta morada parece estar fora da área de entrega de Aveiro e Ílhavo.";
    form.postalCode.focus();
    return false;
  }

  if (!form.city.value.trim() || !form.district.value) {
    error.textContent = "Selecione a localidade e o distrito.";
    form.city.focus();
    return false;
  }

  if (!isDeliveryAreaValid(form.city.value.trim(), form.district.value)) {
    error.textContent = "A localidade e o distrito devem corresponder à área de Aveiro ou Ílhavo.";
    form.city.focus();
    return false;
  }

  error.textContent = "";
  return true;
}

const deliveryForm = document.getElementById("deliveryForm");

deliveryForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateDeliveryForm(deliveryForm)) return;

  const deliveryInfo = {
    fullName: deliveryForm.fullName.value.trim(),
    phone: deliveryForm.phone.value.trim(),
    email: deliveryForm.email.value.trim(),
    street: deliveryForm.street.value.trim(),
    doorNumber: deliveryForm.doorNumber.value.trim(),
    apartment: deliveryForm.apartment.value.trim(),
    postalCode: deliveryForm.postalCode.value.trim(),
    city: deliveryForm.city.value.trim(),
    district: deliveryForm.district.value,
    notes: deliveryForm.notes.value.trim(),
    deliveryDate: deliveryForm.deliveryDate.value,
    saveAddress: deliveryForm.saveAddress.checked
  };

  localStorage.setItem(deliveryKey, JSON.stringify(deliveryInfo));

  if (deliveryInfo.saveAddress && localStorage.getItem("teroAuthenticated") === "true") {
    localStorage.setItem("teroDeliveryAddress", JSON.stringify({
      recipient: deliveryInfo.fullName,
      street: `${deliveryInfo.street}, ${deliveryInfo.doorNumber}${deliveryInfo.apartment ? `, ${deliveryInfo.apartment}` : ""}`,
      postal: deliveryInfo.postalCode,
      city: deliveryInfo.city,
      phone: deliveryInfo.phone
    }));
  }

  localStorage.setItem("teroCheckoutStep", "Pagamento");
  window.location.href = "pagamento.html";
});

const cart = window.loadTeroCart();
const cartQuantity = cart.reduce((total, item) => total + item.quantity, 0);

if (cartQuantity === 0) {
  window.location.replace("encomendar.html");
}

populateSavedDelivery();

document.getElementById("postalCode").addEventListener("input", () => {
  const postalCode = document.getElementById("postalCode").value.trim();
  const error = document.getElementById("deliveryError");
  if (/^[0-9]{4}-[0-9]{3}$/.test(postalCode) && !isPostalCodeInDeliveryArea(postalCode)) {
    error.textContent = "Esta morada parece estar fora da área de entrega de Aveiro e Ílhavo.";
  } else {
    error.textContent = "";
  }
});
