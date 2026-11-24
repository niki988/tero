const selectors = {
  menuToggle: document.getElementById("menuToggle"),
  mobileMenu: document.getElementById("mobileMenu"),
  authControls: document.getElementById("authControls"),
  authModal: document.getElementById("authModal"),
  closeModal: document.getElementById("closeModal"),
  loginBtn: document.getElementById("loginBtn"),
  registerBtn: document.getElementById("registerBtn"),
  loginTab: document.getElementById("loginTab"),
  registerTab: document.getElementById("registerTab"),
  loginForm: document.getElementById("loginForm"),
  registerForm: document.getElementById("registerForm"),
  authFeedback: document.getElementById("authFeedback"),
  newsletterConsent: document.getElementById("newsletterConsent"),
  newsletterLoadForm: document.getElementById("loadNewsletterForm"),
  newsletterEmbed: document.getElementById("newsletterEmbed"),
  newsletterFrame: document.getElementById("newsletterFrame"),
  newsletterFeedback: document.getElementById("newsletterFeedback"),
  year: document.getElementById("year")
};

const state = {
  authenticated: localStorage.getItem("teroAuthenticated") === "true",
  profileName: localStorage.getItem("teroProfileName") || ""
};

function init() {
  bindMenu();
  bindAuth();
  bindNewsletter();
  bindNavigationLinks();
  bindCheckoutProgress();
  renderAuthControls();

  if (selectors.year) {
    selectors.year.textContent = new Date().getFullYear().toString();
  }
}

function bindMenu() {
  selectors.menuToggle.addEventListener("click", () => {
    const isOpen = selectors.mobileMenu.classList.toggle("open");
    selectors.menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function openModal(tab = "login") {
  selectors.authModal.classList.add("open");
  selectors.authModal.setAttribute("aria-hidden", "false");
  switchAuthTab(tab);
}

function closeModal() {
  selectors.authModal.classList.remove("open");
  selectors.authModal.setAttribute("aria-hidden", "true");
  selectors.authFeedback.textContent = "";
}

function switchAuthTab(tab) {
  const showLogin = tab === "login";

  selectors.loginTab.classList.toggle("active", showLogin);
  selectors.registerTab.classList.toggle("active", !showLogin);
  selectors.loginTab.setAttribute("aria-selected", String(showLogin));
  selectors.registerTab.setAttribute("aria-selected", String(!showLogin));

  selectors.loginForm.classList.toggle("hidden", !showLogin);
  selectors.registerForm.classList.toggle("hidden", showLogin);
}

function getInitials(nameOrEmail) {
  const value = (nameOrEmail || "").trim();
  if (!value) {
    return "TP";
  }

  const nameParts = value.split(" ").filter(Boolean);
  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  }

  return value.slice(0, 2).toUpperCase();
}

function renderAuthControls() {
  if (!state.authenticated) {
    selectors.authControls.innerHTML = `
      <button class="text-link" id="loginBtn" type="button">Login</button>
      <button class="btn btn-outline" id="registerBtn" type="button">Registar</button>
    `;

    selectors.authControls.querySelector("#loginBtn").addEventListener("click", () => openModal("login"));
    selectors.authControls.querySelector("#registerBtn").addEventListener("click", () => openModal("register"));
    return;
  }

  const initials = getInitials(state.profileName || "Perfil");

  selectors.authControls.innerHTML = `
    <button class="text-link" id="logoutBtn" type="button" aria-label="Terminar sessão">Sair</button>
    <span class="profile-bubble" title="Perfil">${initials}</span>
  `;

  selectors.authControls.querySelector("#logoutBtn").addEventListener("click", () => {
    state.authenticated = false;
    state.profileName = "";
    localStorage.removeItem("teroAuthenticated");
    localStorage.removeItem("teroProfileName");
    renderAuthControls();
  });
}

function bindAuth() {
  if (selectors.loginBtn) {
    selectors.loginBtn.addEventListener("click", () => openModal("login"));
  }
  if (selectors.registerBtn) {
    selectors.registerBtn.addEventListener("click", () => openModal("register"));
  }

  selectors.closeModal.addEventListener("click", closeModal);
  selectors.authModal.addEventListener("click", (event) => {
    if (event.target.dataset.close === "true") {
      closeModal();
    }
  });

  selectors.loginTab.addEventListener("click", () => switchAuthTab("login"));
  selectors.registerTab.addEventListener("click", () => switchAuthTab("register"));

  selectors.loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!selectors.loginForm.checkValidity()) {
      selectors.authFeedback.textContent = "Preencha os campos de login corretamente.";
      return;
    }

    const email = document.getElementById("loginEmail").value;
    state.authenticated = true;
    state.profileName = email.split("@")[0];

    localStorage.setItem("teroAuthenticated", "true");
    localStorage.setItem("teroProfileName", state.profileName);
    localStorage.setItem("teroProfileEmail", email);

    renderAuthControls();
    closeModal();
  });

  selectors.registerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!selectors.registerForm.checkValidity()) {
      selectors.authFeedback.textContent = "Preencha os campos de registo corretamente.";
      return;
    }

    const name = document.getElementById("registerName").value.trim();

    state.authenticated = true;
    state.profileName = name;

    localStorage.setItem("teroAuthenticated", "true");
    localStorage.setItem("teroProfileName", state.profileName);
    localStorage.setItem("teroProfileEmail", document.getElementById("registerEmail").value);

    renderAuthControls();
    closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && selectors.authModal.classList.contains("open")) {
      closeModal();
    }
  });
}

function bindNewsletter() {
  if (
    !selectors.newsletterConsent
    || !selectors.newsletterLoadForm
    || !selectors.newsletterEmbed
    || !selectors.newsletterFrame
    || !selectors.newsletterFeedback
  ) {
    return;
  }

  selectors.newsletterConsent.addEventListener("change", () => {
    const hasConsent = selectors.newsletterConsent.checked;
    selectors.newsletterLoadForm.disabled = !hasConsent;
    selectors.newsletterConsent.setAttribute("aria-invalid", "false");

    if (!hasConsent && selectors.newsletterFrame.hasAttribute("src")) {
      selectors.newsletterFrame.removeAttribute("src");
      selectors.newsletterEmbed.hidden = true;
      selectors.newsletterFeedback.textContent = "O formulário foi fechado. Se já concluiu a inscrição, cancele-a através da ligação incluída no email.";
      return;
    }

    selectors.newsletterFeedback.textContent = "";
  });

  selectors.newsletterLoadForm.addEventListener("click", () => {
    if (!selectors.newsletterConsent.checked) {
      selectors.newsletterConsent.setAttribute("aria-invalid", "true");
      selectors.newsletterConsent.focus();
      selectors.newsletterFeedback.textContent = "Autorize o carregamento do formulário antes de continuar.";
      return;
    }

    const formUrl = selectors.newsletterFrame.dataset.src;
    if (!formUrl) {
      selectors.newsletterFeedback.textContent = "O formulário externo não está configurado.";
      return;
    }

    selectors.newsletterFrame.src = formUrl;
    selectors.newsletterEmbed.hidden = false;
    selectors.newsletterLoadForm.disabled = true;
    selectors.newsletterFeedback.textContent = "O formulário foi solicitado à Brevo. A inscrição só fica concluída depois de submeter o email no formulário.";
  });
}

function bindNavigationLinks() {
  const links = document.querySelectorAll('a[href="#contactos"], a[data-target="contactos"]');

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const contactSection = document.getElementById("contactos");
      if (!contactSection) return;

      event.preventDefault();

      if (selectors.mobileMenu) {
        selectors.mobileMenu.classList.remove("open");
      }
      if (selectors.menuToggle) {
        selectors.menuToggle.setAttribute("aria-expanded", "false");
      }

      contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
      if (window.location.hash !== "#contactos") {
        window.history.replaceState(null, "", "#contactos");
      }
    });
  });
}

function bindCheckoutProgress() {
  document.querySelectorAll("[data-checkout-step]").forEach((step) => {
    step.setAttribute("role", "button");
    step.setAttribute("tabindex", "0");

    if (step.dataset.checkoutStep === "3") {
      step.setAttribute("aria-disabled", "true");
      step.classList.add("disabled-step");
    }

    const navigate = () => {
      const stepIndex = Number(step.dataset.checkoutStep);
      const currentFile = window.location.pathname.split("/").pop();

      if (stepIndex === 0) {
        if (currentFile === "encomendar.html" && typeof openCart === "function") {
          if (typeof setProgressStep === "function") setProgressStep(0);
          openCart();
        } else {
          window.location.href = "encomendar.html";
        }
      } else if (stepIndex === 1) {
        if (currentFile === "catalogo.html" && typeof setProgressStep === "function") setProgressStep(1);
        if (currentFile !== "localizacao.html") {
          window.location.href = "localizacao.html";
        }
      } else if (stepIndex === 2) {
        if (currentFile === "catalogo.html") {
          if (typeof setProgressStep === "function") setProgressStep(2);
          window.location.href = localStorage.getItem("teroDeliveryInfo") ? "pagamento.html" : "localizacao.html";
        } else if (currentFile === "localizacao.html") {
          const deliveryForm = document.getElementById("deliveryForm");
          if (deliveryForm) deliveryForm.requestSubmit();
        } else if (currentFile !== "pagamento.html") {
          window.location.href = "pagamento.html";
        }
      } else if (stepIndex === 3) {
        return;
      }
    };

    step.addEventListener("click", navigate);
    step.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        navigate();
      }
    });
  });
}

init();
