const profileKeys = {
  personal: "teroPersonalInfo",
  address: "teroDeliveryAddress"
};

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value || fallback;
  } catch {
    return fallback;
  }
}

function getProfileData() {
  if (localStorage.getItem("teroAuthenticated") !== "true") {
    return {
      name: "Utilizador não autenticado",
      email: "Inicie sessão para ver os seus dados",
      phone: "Não indicado"
    };
  }

  const storedPersonal = readJson(profileKeys.personal, {});
  return {
    name: storedPersonal.name || localStorage.getItem("teroProfileName") || "Nome do utilizador",
    email: storedPersonal.email || localStorage.getItem("teroProfileEmail") || "email@exemplo.pt",
    phone: storedPersonal.phone || "Não indicado"
  };
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || "TP";
}

function showProfileToast(message) {
  const toast = document.getElementById("profileToast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showProfileToast.timer);
  showProfileToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function renderProfile() {
  const profile = getProfileData();
  const authenticated = localStorage.getItem("teroAuthenticated") === "true";
  document.getElementById("profileName").textContent = profile.name;
  document.getElementById("profileEmail").textContent = profile.email;
  document.getElementById("profileAvatar").textContent = getInitials(profile.name);
  document.getElementById("personalName").textContent = profile.name;
  document.getElementById("personalEmail").textContent = profile.email;
  document.getElementById("personalPhone").textContent = profile.phone;
  document.getElementById("accountStatus").textContent = authenticated
    ? "Perfil demonstrativo"
    : "Sessão não iniciada";

  document.getElementById("editProfileTop").disabled = !authenticated;
  document.getElementById("editPersonal").disabled = !authenticated;
  document.getElementById("editAddress").disabled = !authenticated;
  document.querySelector(".account-action-list").classList.toggle("hidden", !authenticated);

  document.getElementById("fullName").value = profile.name === "Nome do utilizador" ? "" : profile.name;
  document.getElementById("email").value = profile.email === "email@exemplo.pt" ? "" : profile.email;
  document.getElementById("phone").value = profile.phone === "Não indicado" ? "" : profile.phone;

  renderAddress();
}

function renderAddress() {
  const address = readJson(profileKeys.address, null);
  const empty = document.getElementById("addressEmpty");
  const details = document.getElementById("addressDetails");
  const editButton = document.getElementById("editAddress");

  if (localStorage.getItem("teroAuthenticated") !== "true") {
    empty.textContent = "Inicie sessão para ver ou adicionar uma morada.";
    empty.classList.remove("hidden");
    details.classList.add("hidden");
    editButton.textContent = "Adicionar morada";
    return;
  }

  if (!address) {
    empty.classList.remove("hidden");
    details.classList.add("hidden");
    editButton.textContent = "Adicionar morada";
    return;
  }

  empty.classList.add("hidden");
  details.classList.remove("hidden");
  editButton.textContent = "Editar morada";
  document.getElementById("addressName").textContent = address.recipient;
  document.getElementById("addressStreet").textContent = address.street;
  document.getElementById("addressPostal").textContent = address.postal;
  document.getElementById("addressCity").textContent = address.city;
  document.getElementById("addressPhone").textContent = address.phone;

  document.getElementById("recipientName").value = address.recipient;
  document.getElementById("street").value = address.street;
  document.getElementById("postalCode").value = address.postal;
  document.getElementById("city").value = address.city;
  document.getElementById("addressTelephone").value = address.phone;
}

function showPersonalForm() {
  document.getElementById("personalView").classList.add("hidden");
  document.getElementById("personalForm").classList.remove("hidden");
  document.getElementById("fullName").focus();
}

function hidePersonalForm() {
  document.getElementById("personalView").classList.remove("hidden");
  document.getElementById("personalForm").classList.add("hidden");
  document.getElementById("personalError").textContent = "";
}

function showAddressForm() {
  document.getElementById("addressView").classList.add("hidden");
  document.getElementById("addressForm").classList.remove("hidden");
  document.getElementById("recipientName").focus();
}

function hideAddressForm() {
  document.getElementById("addressView").classList.remove("hidden");
  document.getElementById("addressForm").classList.add("hidden");
  document.getElementById("addressError").textContent = "";
  renderAddress();
}

document.getElementById("editProfileTop").addEventListener("click", showPersonalForm);
document.getElementById("editPersonal").addEventListener("click", showPersonalForm);
document.getElementById("cancelPersonal").addEventListener("click", hidePersonalForm);

document.getElementById("personalForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const error = document.getElementById("personalError");

  if (name.length < 2) {
    error.textContent = "Introduza o nome completo.";
    document.getElementById("fullName").focus();
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    error.textContent = "Introduza um email válido.";
    document.getElementById("email").focus();
    return;
  }

  const personal = { name, email, phone };
  localStorage.setItem(profileKeys.personal, JSON.stringify(personal));
  localStorage.setItem("teroProfileName", name);
  localStorage.setItem("teroProfileEmail", email);
  error.textContent = "";
  hidePersonalForm();
  renderProfile();
  showProfileToast("Informações pessoais guardadas");
});

document.getElementById("editAddress").addEventListener("click", showAddressForm);
document.getElementById("cancelAddress").addEventListener("click", hideAddressForm);

document.getElementById("addressForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const recipient = document.getElementById("recipientName").value.trim();
  const street = document.getElementById("street").value.trim();
  const postal = document.getElementById("postalCode").value.trim();
  const city = document.getElementById("city").value.trim();
  const phone = document.getElementById("addressTelephone").value.trim();
  const error = document.getElementById("addressError");

  if (!recipient || !street || !city || !phone) {
    error.textContent = "Preencha todos os campos da morada.";
    return;
  }

  if (!/^[0-9]{4}-[0-9]{3}$/.test(postal)) {
    error.textContent = "Introduza um código postal válido.";
    document.getElementById("postalCode").focus();
    return;
  }

  const address = { recipient, street, postal, city, phone };
  localStorage.setItem(profileKeys.address, JSON.stringify(address));
  error.textContent = "";
  hideAddressForm();
  showProfileToast("Morada de entrega guardada");
});

document.getElementById("changePassword").addEventListener("click", () => {
  showProfileToast("Alteração de password disponível após integração segura");
});

document.getElementById("logoutAccount").addEventListener("click", () => {
  localStorage.removeItem("teroAuthenticated");
  localStorage.removeItem("teroProfileName");
  localStorage.removeItem("teroProfileEmail");
  window.location.href = "index.html";
});

document.getElementById("deleteAccount").addEventListener("click", () => {
  const confirmed = window.confirm(
    "Tem a certeza de que pretende preparar a eliminação da sua conta? Esta ação não está ligada a um backend nesta demonstração."
  );
  if (!confirmed) return;

  localStorage.removeItem(profileKeys.personal);
  localStorage.removeItem(profileKeys.address);
  localStorage.removeItem("teroAuthenticated");
  localStorage.removeItem("teroProfileName");
  localStorage.removeItem("teroProfileEmail");
  showProfileToast("Pedido de eliminação preparado para integração backend");
  window.setTimeout(() => {
    window.location.href = "index.html";
  }, 1600);
});

renderProfile();
