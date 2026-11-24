const confirmationTitle = document.getElementById("confirmationTitle");
const confirmationMessage = document.getElementById("confirmationMessage");

try {
  const savedOrder = JSON.parse(localStorage.getItem("teroPendingOrder") || "null");

  if (savedOrder && savedOrder.status === "demo-not-submitted") {
    confirmationTitle.textContent = "Simulação concluída";
    confirmationMessage.textContent = "Nenhuma encomenda foi enviada e nenhum pagamento foi processado. Os dados usados nesta simulação permanecem apenas neste navegador.";
  } else {
    confirmationTitle.textContent = "Não existe uma simulação concluída";
    confirmationMessage.textContent = "Volte ao menu para iniciar uma nova demonstração de encomenda.";
  }
} catch (error) {
  console.error("Não foi possível ler o estado da simulação de encomenda.", error);
  confirmationTitle.textContent = "Não foi possível consultar a simulação";
  confirmationMessage.textContent = "Volte ao menu para iniciar uma nova demonstração de encomenda.";
}
