// ==================== DETALHES DO PRODUTO ====================

// Pegar ID do produto da URL
const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id")); // Converter para número

// Variáveis globais
let item;

// Cache
const CACHE_KEY_PRODUTOS = "produtos_cache_detalhes";
const CACHE_TIME = 5 * 60 * 1000; // 5 minutos

// Função de capitalização
function capitalizar(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
}

// ==================== FUNÇÃO PRINCIPAL ====================
async function carregarProdutoDetalhes() {
  let produtos;

  // Verifica cache
  const cache = localStorage.getItem(CACHE_KEY_PRODUTOS);
  if (cache) {
    const { data, timestamp } = JSON.parse(cache);
    if (Date.now() - timestamp < CACHE_TIME) {
      produtos = data;
      console.log("🔄 Usando cache de produtos");
    }
  }

  // Se não tiver cache válido, busca na API
  if (!produtos) {
    try {
      const res = await fetch(
        "https://script.google.com/macros/s/AKfycbycFZtfiz0O49MlOzekcjduaFSeTRnrTd61k2edZJS--TEDKxkKDKOgkHbW7N0qbl6U/exec"
      );
      produtos = await res.json();
      localStorage.setItem(
        CACHE_KEY_PRODUTOS,
        JSON.stringify({ data: produtos, timestamp: Date.now() })
      );
      console.log("🌐 Produtos carregados da API");
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
      document.body.innerHTML =
        "<p>Erro ao carregar produtos. Tente novamente mais tarde.</p>";
      return;
    }
  }

  // Procurar o produto selecionado
  item = produtos.find((p) => String(p.id) === String(id));
  if (!item) {
    document.body.innerHTML = "<p>Produto não encontrado!</p>";
    console.warn("Produto não encontrado");
    return;
  }

  preencherDetalhes(item, produtos);
}

// ==================== FUNÇÃO DE PREENCHIMENTO ====================
function preencherDetalhes(item, produtos) {
  const setTexto = (id, valor) => {
    const el = document.getElementById(id);
    if (el) el.textContent = valor;
  };

  const setImg = (id, src) => {
    const el = document.getElementById(id);
    if (el) el.src = src;
  };

  setImg("img-detalhe", item.imagem || "images/default.png");
  setTexto("nome-detalhe", item.nome || "Sem nome");
  setTexto("rating-detalhe", item.rating || "");
  setTexto("like-detalhe", item.likes || 0);
  setTexto("review-detalhe", (item.reviews || 0) + " avaliações");
  setTexto("descricao-detalhe", item.descricao || "");
  setTexto(
    "preco-detalhe",
    (item.preco || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  );
  setTexto(
    "precopromo-detalhe",
    (item.preco_promocional || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  );
  const setHTML = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };

  setHTML("add-wpp", `Solicitar Reserva&nbsp;<i class="ri-whatsapp-line"></i>`);

  // Preencher tabela de detalhes
  const tabelaDetalhes = document.getElementById("tabdetalhes");
  if (tabelaDetalhes && item.qualidade) {
    tabelaDetalhes.insertAdjacentHTML(
      "beforeend",
      `<tr><td>Qualidade</td><td>${item.qualidade}</td></tr>`
    );
  }

  // Configurar botão de adicionar ao carrinho
  document.querySelectorAll(".add-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      adicionarAoCarrinho(item, 1);
      atualizarContadorCarrinho();
      animarParaCarrinho(item.imagem || "images/default.png");
      mostrarToast(`${item.nome} adicionado ao carrinho!`);
    });
  });

  // Inicializar busca de produtos relacionados
  carregarBusca(produtos);
}

// ==================== FUNÇÕES DE CARRINHO ====================
function adicionarAoCarrinho(item, quantidade) {
  const cart = JSON.parse(localStorage.getItem("carrinho")) || [];
  const existente = cart.find((c) => c.item.id === item.id);

  if (existente) {
    existente.quantidade += quantidade;
    existente.total_item = existente.quantidade * (item.preco_promocional || 0);
  } else {
    cart.push({
      item,
      quantidade,
      total_item: quantidade * (item.preco_promocional || 0),
    });
  }

  localStorage.setItem("carrinho", JSON.stringify(cart));
}

function mostrarToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

function atualizarContadorCarrinho() {
  const cart = JSON.parse(localStorage.getItem("carrinho")) || [];
  document
    .querySelectorAll(".btn-cart")
    .forEach((btn) => btn.setAttribute("data-count", cart.length));
}
setTimeout(atualizarContadorCarrinho, 300);

// ==================== ANIMAÇÃO PARA CARRINHO ====================
function animarParaCarrinho(imgSrc) {
  const cartBtn = document.querySelector(".btn-cart");
  if (!cartBtn) return;

  const img = document.createElement("img");
  img.src = imgSrc;
  img.classList.add("fly-img");
  document.body.appendChild(img);

  const startX = window.innerWidth / 2;
  const startY = window.innerHeight / 5;
  img.style.left = startX + "px";
  img.style.top = startY + "px";

  const cartRect = cartBtn.getBoundingClientRect();
  const endX = cartRect.left + cartRect.width / 2;
  const endY = cartRect.top + cartRect.height / 2;

  img.animate(
    [
      { transform: `translate(0,0) scale(1)`, opacity: 1 },
      {
        transform: `translate(${endX - startX}px, ${
          endY - startY
        }px) scale(0.3)`,
        opacity: 0.5,
      },
    ],
    { duration: 800, easing: "ease-in-out" }
  ).onfinish = () => img.remove();
}

// ==================== BUSCA / AUTOCOMPLETE ====================
function carregarBusca(produtos) {
  const ul = document.querySelector(".listaProdutos2");
  const input = document.querySelector(".input-busca2");
  if (!ul || !input) return;

  // Preencher lista inicial
  produtos.forEach((p) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <a href="detalhes.html?id=${p.id}">
        <img width="50" src="${p.imagem}">
        <span class="item-name">${p.nome}</span>
      </a>`;
    ul.appendChild(li);
  });

  ul.style.display = "none";

  input.addEventListener("keyup", () => {
    const filter = input.value.trim().toUpperCase();
    const li = ul.getElementsByTagName("li");
    let count = 0;

    for (let i = 0; i < li.length; i++) {
      const a = li[i].getElementsByTagName("a")[0];
      const txtValue = a.textContent || a.innerText;

      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
        count++;
        const span = li[i].querySelector(".item-name");
        if (span) {
          span.innerHTML = txtValue.replace(
            new RegExp(filter, "gi"),
            (m) => `<strong>${m}</strong>`
          );
        }
      } else {
        li[i].style.display = "none";
      }
    }

    ul.style.display = count === 0 || filter === "" ? "none" : "block";
  });
}

// ==================== RESERVA VIA WHATSAPP ====================
const btnWhatsApp = document.querySelector("#toolbarCheckout .add-wpp");
if (btnWhatsApp) {
  btnWhatsApp.addEventListener("click", () => {
    if (!item) {
      alert("Produto não carregado!");
      return;
    }

    const precoUnit = (
      item.preco_promocional ||
      item.preco ||
      0
    ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    let mensagem = `*RESERVA DE PRODUTO*\n\n`;
    mensagem += `*${item.nome}* (${item.fabricante || "N/A"})\n`;
    mensagem += `Qualidade: ${item.qualidade || "N/A"}\n`;
    mensagem += `Preço: *${precoUnit}*\n\n`;
    mensagem += "Por favor, confirme disponibilidade e forma de pagamento.";

    const numero = "5522999348043"; // seu número
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
  });
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener("DOMContentLoaded", carregarProdutoDetalhes);
