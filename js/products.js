window.teroProducts = [
  {
    id: "refeicao-individual-a",
    category: "Refeições individuais",
    name: "Refeição individual (exemplo A)",
    description: "Prato de inspiração mediterrânica. Receita e descrição finais a definir.",
    ingredients: "A confirmar antes da publicação.",
    allergens: "A confirmar antes da publicação.",
    storage: "A confirmar antes da publicação.",
    preparation: "A confirmar antes da publicação.",
    price: 9,
    icon: "🥘"
  },
  {
    id: "refeicao-individual-b",
    category: "Refeições individuais",
    name: "Refeição individual (exemplo B)",
    description: "Exemplo provisório de uma refeição preparada para o quotidiano.",
    ingredients: "A confirmar antes da publicação.",
    allergens: "A confirmar antes da publicação.",
    storage: "A confirmar antes da publicação.",
    preparation: "A confirmar antes da publicação.",
    price: 14,
    icon: "🍲"
  },
  {
    id: "caixa-refeicoes-a",
    category: "Caixas de refeições",
    name: "Caixa com várias refeições (exemplo A)",
    description: "Formato e composição da caixa ainda por definir.",
    ingredients: "Depende do menu; a confirmar antes da publicação.",
    allergens: "Depende do menu; a confirmar antes da publicação.",
    storage: "A confirmar antes da publicação.",
    preparation: "A confirmar antes da publicação.",
    price: 42,
    icon: "📦"
  },
  {
    id: "caixa-refeicoes-b",
    category: "Caixas de refeições",
    name: "Caixa com várias refeições (exemplo B)",
    description: "Exemplo provisório de uma caixa com várias unidades.",
    ingredients: "Depende do menu; a confirmar antes da publicação.",
    allergens: "Depende do menu; a confirmar antes da publicação.",
    storage: "A confirmar antes da publicação.",
    preparation: "A confirmar antes da publicação.",
    price: 68,
    icon: "📦"
  }
];

window.formatTeroPrice = (value) => `${value.toFixed(2).replace(".", ",")} €`;

window.loadTeroCart = () => {
  try {
    const savedCart = JSON.parse(localStorage.getItem("teroCart"));
    if (!Array.isArray(savedCart)) return [];

    return savedCart.filter((item) => (
      item
      && window.teroProducts.some((product) => product.id === item.id)
      && Number.isInteger(item.quantity)
      && item.quantity > 0
    ));
  } catch {
    return [];
  }
};
