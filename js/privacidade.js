const localDataKeys = [
  "teroAuthenticated",
  "teroProfileName",
  "teroProfileEmail",
  "teroPersonalInfo",
  "teroDeliveryAddress",
  "teroDeliveryInfo",
  "teroCart",
  "teroCheckoutStep",
  "teroPendingOrder"
];

document.getElementById("clearLocalData").addEventListener("click", () => {
  const confirmed = window.confirm("Apagar os dados de demonstração guardados neste navegador?");
  if (!confirmed) return;

  const feedback = document.getElementById("privacyFeedback");

  try {
    localDataKeys.forEach((key) => localStorage.removeItem(key));
    feedback.textContent = "Os dados de demonstração foram apagados deste navegador.";
  } catch (error) {
    console.error("Não foi possível apagar os dados locais da TERO.", error);
    feedback.textContent = "Não foi possível apagar os dados. Tente através das definições do navegador.";
  }
});
