// ==================== VARIÁVEIS ====================
const params = new URLSearchParams(window.location.search);
const marca = params.get("marca");
const categoria = params.get("categoria");

const titulo = document.getElementById("page-titulo");
const subtitulo = document.getElementById("page-subtitulo");
const lista = document.getElementById("lista-produtos");

const CACHE_KEY_PRODUTOS = "produtos_cache_lista";
const CACHE_TIME = 5 * 60 * 1000; // 5 minutos

// Capitalizar primeira letra
function capitalizar(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
}

// ==================== FUNÇÃO PRINCIPAL ====================
async function carregarProdutos() {
  let produtos;

  // Verifica cache
  const cache = localStorage.getItem(CACHE_KEY_PRODUTOS);
  if (cache) {
    const { data, timestamp } = JSON.parse(cache);
    if (Date.now() - timestamp < CACHE_TIME) {
      console.log("🔄 Usando cache de produtos");
      produtos = data;
    }
  }

  // Se não tiver cache válido, busca na API
  if (!produtos) {
    try {
      const res = await fetch("https://script.google.com/macros/s/AKfycbycFZtfiz0O49MlOzekcjduaFSeTRnrTd61k2edZJS--TEDKxkKDKOgkHbW7N0qbl6U/exec");
      produtos = await res.json();
      localStorage.setItem(
        CACHE_KEY_PRODUTOS,
        JSON.stringify({ data: produtos, timestamp: Date.now() })
      );
      console.log("🌐 Produtos carregados da API");
    } catch (err) {
      console.error("Erro ao carregar produtos: " + err);
      lista.innerHTML = "<p>Erro ao carregar produtos. Tente novamente mais tarde.</p>";
      return;
    }
  }

  renderizarProdutos(produtos);
}

// ==================== FUNÇÃO DE RENDER ====================
function renderizarProdutos(produtos) {
  let filtrados = produtos;

  if (marca) {
    filtrados = filtrados.filter(p => (p.marca || "").toLowerCase() === marca.toLowerCase());
    if (categoria) {
      filtrados = filtrados.filter(p => (p.categoria || "").toLowerCase() === categoria.toLowerCase());
    }
    titulo.innerText = `${capitalizar(categoria || "")} ${capitalizar(marca)}`;
    subtitulo.innerText = `Confira os modelos de ${capitalizar(categoria || "")} ${capitalizar(marca)}`;
  } else if (categoria) {
    filtrados = filtrados.filter(p => (p.categoria || "").toLowerCase() === categoria.toLowerCase());
    titulo.innerText = `${capitalizar(categoria)} e mais...`;
    subtitulo.innerText = `Confira os modelos da categoria ${capitalizar(categoria)}`;
  }

  lista.innerHTML = "";

  if (filtrados.length === 0) {
    lista.innerHTML = `<p>Nenhum produto encontrado para ${capitalizar(marca || categoria)}.</p>`;
    return;
  }

  filtrados.forEach(produto => {
    const produtoHTML = `
      <a data-id="${produto.id}" class="item-link product">
        <img src="${produto.imagem || 'images/default.png'}" alt="${produto.nome}">
        <p class="product-name">${produto.nome} ${produto.fabricante ? `(${produto.fabricante})` : ""}</p>
        <p class="rate">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
        <p class="product-price">
          ${produto.preco_promocional.toLocaleString("pt-BR",{ style: "currency", currency: "BRL" })}
        </p>
      </a>`;
    lista.insertAdjacentHTML("beforeend", produtoHTML);
  });

  // Clique para detalhes via query string
  document.querySelectorAll(".item-link").forEach(el => {
    el.addEventListener("click", e => {
      e.preventDefault();
      window.location.href = `detalhes.html?id=${el.dataset.id}`;
    });
  });
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener("DOMContentLoaded", carregarProdutos);
