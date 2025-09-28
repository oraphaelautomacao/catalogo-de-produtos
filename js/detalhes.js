// ==================== DETALHES DO PRODUTO ====================

// Pegar ID do produto da URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// Variáveis globais
let item;

// Função de capitalização (opcional)
function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Carregar produtos do JSON
fetch("js/produtos.json")
  .then((res) => res.json())
  .then((produtos) => {
    item = produtos.find((p) => p.id == id);

    if (!item) {
      document.body.innerHTML = "<p>Produto não encontrado!</p>";
      console.warn("Produto não encontrado");
      return;
    }

    // Preencher detalhes
    document.getElementById("img-detalhe").src =
      item.imagem || "/images/default.png";
    document.getElementById("nome-detalhe").textContent =
      item.nome || "Sem nome";
    document.getElementById("rating-detalhe").textContent = item.rating || "";
    document.getElementById("like-detalhe").textContent = item.likes || 0;
    document.getElementById("review-detalhe").textContent =
      (item.reviews || 0) + " avaliações";
    document.getElementById("descricao-detalhe").textContent =
      item.descricao || "";
    document.getElementById("preco-detalhe").textContent = (
      item.preco || 0
    ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    document.getElementById("precopromo-detalhe").textContent = (
      item.preco_promocional || 0
    ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    // Preencher tabela de detalhes
    const tabelaDetalhes = document.getElementById("tabdetalhes");
    if (item.qualidade) {
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
        animarParaCarrinho(item.imagem || "/images/default.png");
        mostrarToast(`${item.nome} adicionado ao carrinho!`);
      });
    });

    // Inicializar busca de produtos relacionados
    carregarBusca(produtos);
  })
  .catch((err) => console.error("Erro ao carregar produtos:", err));

// ==================== CARRINHO ====================

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

  // Preencher lista inicial
  produtos.forEach((p) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <a href="detalhes.html?id=${p.id}">
        <img width="50" src="${p.imagem}">
        <span class="item-name">${p.nome}</span>
      </a>
    `;
    ul.appendChild(li);
  });

  ul.style.display = "none";

  // Filtrar a lista conforme o input
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

// Selecionar o botão de reserva na página de detalhes
const btnWhatsApp = document.querySelector("#toolbarCheckout .add-wpp");

if (btnWhatsApp) {
  btnWhatsApp.addEventListener("click", () => {
    if (!item) {
      alert("Produto não carregado!");
      return;
    }

    // Cabeçalho
    let mensagem = "*RESERVA DE PRODUTO*\n\n";

    // Informações do produto atual
    const precoUnit = (
      item.preco_promocional ||
      item.preco ||
      0
    ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    mensagem += `*${item.nome}* (${item.fabricante || "N/A"})\n`;
    mensagem += `Qualidade: ${item.qualidade || "N/A"}\n`;
    mensagem += `Preço: *${precoUnit}*\n\n`;

    mensagem += "Por favor, confirme disponibilidade e forma de pagamento.";

    // Abrir WhatsApp
    const numero = "5522999348043"; // substitua pelo seu número
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
  });
}
