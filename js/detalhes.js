let item;
const CACHE_KEY_PRODUTOS = "produtos_cache_detalhes";
const CACHE_TIME = 5 * 60 * 1000; // 5 minutos

async function carregarProdutoDetalhes() {
  // Verifica cache
  const cache = localStorage.getItem(CACHE_KEY_PRODUTOS);
  let produtos;
  if (cache) {
    const { data, timestamp } = JSON.parse(cache);
    if (Date.now() - timestamp < CACHE_TIME) {
      console.log("🔄 Usando cache de produtos para detalhes");
      produtos = data;
    }
  }

  if (!produtos) {
    // Busca na API
    try {
      const res = await fetch("https://script.google.com/macros/s/SEU_ID_DO_APPS_SCRIPT/exec");
      produtos = await res.json();

      // Salva no cache
      localStorage.setItem(
        CACHE_KEY_PRODUTOS,
        JSON.stringify({ data: produtos, timestamp: Date.now() })
      );
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
      return;
    }
  }

  // Pega o produto pelo ID da URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  item = produtos.find(p => p.id == id);

  if (!item) {
    document.body.innerHTML = "<p>Produto não encontrado!</p>";
    console.warn("Produto não encontrado");
    return;
  }

  preencherDetalhes(item);
  carregarBusca(produtos);
}

// Função para preencher detalhes do produto
function preencherDetalhes(item) {
  document.getElementById("img-detalhe").src = item.imagem || "images/default.png";
  document.getElementById("nome-detalhe").textContent = item.nome || "Sem nome";
  document.getElementById("rating-detalhe").textContent = item.rating || "";
  document.getElementById("like-detalhe").textContent = item.likes || 0;
  document.getElementById("review-detalhe").textContent = (item.reviews || 0) + " avaliações";
  document.getElementById("descricao-detalhe").textContent = item.descricao || "";
  document.getElementById("preco-detalhe").textContent = (item.preco || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  document.getElementById("precopromo-detalhe").textContent = (item.preco_promocional || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const tabelaDetalhes = document.getElementById("tabdetalhes");
  if (item.qualidade) {
    tabelaDetalhes.insertAdjacentHTML("beforeend", `<tr><td>Qualidade</td><td>${item.qualidade}</td></tr>`);
  }

  document.querySelectorAll(".add-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      adicionarAoCarrinho(item, 1);
      atualizarContadorCarrinho();
      animarParaCarrinho(item.imagem || "images/default.png");
      mostrarToast(`${item.nome} adicionado ao carrinho!`);
    });
  });
}

// Inicializar quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", carregarProdutoDetalhes);
