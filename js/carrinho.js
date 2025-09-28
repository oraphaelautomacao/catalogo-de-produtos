const toggleBtn = document.querySelector(".popover-toggle");
const popover = document.querySelector(".popover");
const icon = toggleBtn?.querySelector("i");

// Função de abrir/fechar
function togglePopover(e) {
  e.preventDefault();
  const isOpen = popover.style.display === "block";

  if (isOpen) {
    popover.style.display = "none";
    icon.classList.remove("ri-close-large-line");
    icon.classList.add("ri-more-fill");
  } else {
    popover.style.display = "block";
    icon.classList.remove("ri-more-fill");
    icon.classList.add("ri-close-large-line");
  }
}

// Evento no botão
if (toggleBtn) {
  toggleBtn.addEventListener("click", togglePopover);
}

// Fechar ao clicar fora
document.addEventListener("click", (e) => {
  if (
    !popover.contains(e.target) &&
    !toggleBtn.contains(e.target) &&
    popover.style.display === "block"
  ) {
    popover.style.display = "none";
    icon.classList.remove("ri-close-large-line");
    icon.classList.add("ri-more-fill");
  }
});

// Fechar ao clicar nos links internos
document.querySelectorAll(".popover-close").forEach((link) => {
  link.addEventListener("click", () => {
    popover.style.display = "none";
    icon.classList.remove("ri-close-large-line");
    icon.classList.add("ri-more-fill");
  });
});

// ------

const localCarrinho = localStorage.getItem("carrinho");

if (localCarrinho) {
  const cart = JSON.parse(localCarrinho);
  if (cart.length > 0) {
    //TEM ITENS NO CARRINHO, RENDERIZAR E SOMAR TOTAIS
    renderizarCarrinho();
  } else {
    carrinhoVazio();
  }
} else {
  carrinhoVazio();
}

function carrinhoVazio() {
  console.log("Carrinho está vazio");

  // ESVAZIAR LISTA DO CARRINHO
  document.getElementById("listaCarrinho").replaceChildren();

  // APAGAR OS ITENS DE BAIXO, BOTÃO E TOTAIS
  document.getElementById("toolbarTotais").classList.add("display-none");
  document.getElementById("toolbarCheckout").classList.add("display-none");

  // MOSTRAR SACOLA VAZIA
  document.getElementById("listaCarrinho").innerHTML = `
  <div class="text-align-center">
    <img src="images/empty.gif" alt="Carrinho vazio">
    <br>
    <span class="color-gray">Nada por enquanto...</span>
  </div>
`;
}

const btnEsvaziar = document.getElementById("esvaziar");
const modal = document.getElementById("confirmModal");
const btnCancelar = document.getElementById("cancelar");
const btnConfirmar = document.getElementById("confirmar");

// abrir modal
if (btnEsvaziar && modal) {
  btnEsvaziar.addEventListener("click", () => {
    modal.style.display = "flex";
  });
}

// cancelar -> fecha modal
if (btnCancelar && modal) {
  btnCancelar.addEventListener("click", () => {
    modal.style.display = "none";
  });
}

// confirmar -> apaga carrinho e recarrega página
if (btnConfirmar && modal) {
  btnConfirmar.addEventListener("click", () => {
    localStorage.removeItem("carrinho");
    modal.style.display = "none";
    location.reload();
  });
}

// fechar clicando fora da caixa
if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
}

// função que atualiza o contador (usa data-count nos botões .btn-cart)
function atualizarContadorCarrinho() {
  const cart = JSON.parse(localStorage.getItem("carrinho")) || [];
  document.querySelectorAll(".btn-cart").forEach((btn) => {
    btn.setAttribute("data-count", cart.length);
  });
}

function renderizarCarrinho() {
  const listaCarrinho = document.getElementById("listaCarrinho");
  const toolbarTotais = document.getElementById("toolbarTotais");
  const toolbarCheckout = document.getElementById("toolbarCheckout");

  if (!listaCarrinho) {
    console.error("Elemento #listaCarrinho não encontrado no DOM");
    return;
  }

  // pega array do localStorage (ou vazio)
  const cart = JSON.parse(localStorage.getItem("carrinho")) || [];

  // limpa área
  listaCarrinho.replaceChildren();

  // se vazio, mostra imagem/placeholder
  if (cart.length === 0) {
    listaCarrinho.innerHTML = `
      <div class="text-align-center">
        <img width="300" src="images/empty.gif" alt="Carrinho vazio" />
        <br>
        <span class="color-gray">Nada por enquanto...</span>
      </div>
    `;

    if (toolbarTotais) toolbarTotais.classList.add("display-none");
    if (toolbarCheckout) toolbarCheckout.classList.add("display-none");
    

    atualizarContadorCarrinho();
    return;
  }

  // renderiza itens
  cart.forEach((entry, index) => {
    const produto = entry.item || {};
    const img = produto.imagem || "images/default.png";
    const nome = produto.nome || "Produto";
    const principal_caracteristica = produto.principal_caracteristica || "";
    const quantidade = entry.quantidade || 1;
    const totalItem =
      entry.total_item ?? quantidade * (produto.preco_promocional || 0);

    const itemDiv = `
      <div class="item-carrinho">
          <div class=container-img>  
            <div class="area-img">
              <img src="${img}" alt="${nome}" />
            </div>
          </div>
          <div class="area-details">
            <div class="sup">
              <span class="name-prod">${nome}</span>
              <a class="delete-item" href="#" data-index="${index}" aria-label="Remover item">
                <i class="ri-close-line"></i>
              </a>
            </div>
            <div class="middle">
              <span>${principal_caracteristica}</span>
            </div>
            <div class="preco-quantidade">
              <span>${totalItem.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}</span>
              <div class="count">
                <a class="menos" href="#" data-index="${index}" aria-label="Diminuir">-</a>
                <input readonly class="qtd-item" type="text" value="${quantidade}" />
                <a class="mais" href="#" data-index="${index}" aria-label="Aumentar">+</a>
              </div>
          </div>
        </div>
      </div>
    `;
    listaCarrinho.insertAdjacentHTML("beforeend", itemDiv);
  });

  // ==== CALCULAR SUBTOTAL ====
  const subtotal = cart.reduce((soma, entry) => {
    return (
      soma +
      (entry.total_item ??
        entry.quantidade * (entry.item.preco_promocional || 0))
    );
  }, 0);

  // atualizar toolbar de totais
  if (toolbarTotais) {
    toolbarTotais.classList.remove("display-none");
    toolbarTotais.innerHTML = `
      <div style="margin-top: 10px" class="subtotal-cart">
        <span>Subtotal: </span>
        <span>${subtotal.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}</span>
      </div>
      <div class="subtotal-cart">
        <span>Frete: </span>
        <span>À verificar</span>
      </div>
    `;
  }

  if (toolbarCheckout) {
    toolbarCheckout.classList.remove("display-none");
  }

  // ==== LISTENERS ====
  listaCarrinho.querySelectorAll(".mais").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const idx = Number(btn.dataset.index);
      const cartLocal = JSON.parse(localStorage.getItem("carrinho")) || [];
      cartLocal[idx].quantidade = (cartLocal[idx].quantidade || 0) + 1;
      cartLocal[idx].total_item =
        cartLocal[idx].quantidade *
        (cartLocal[idx].item.preco_promocional || 0);
      localStorage.setItem("carrinho", JSON.stringify(cartLocal));
      renderizarCarrinho();
    });
  });

  listaCarrinho.querySelectorAll(".menos").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const idx = Number(btn.dataset.index);
      const cartLocal = JSON.parse(localStorage.getItem("carrinho")) || [];
      if (!cartLocal[idx]) return;
      if (cartLocal[idx].quantidade > 1) {
        cartLocal[idx].quantidade -= 1;
        cartLocal[idx].total_item =
          cartLocal[idx].quantidade *
          (cartLocal[idx].item.preco_promocional || 0);
      } else {
        cartLocal.splice(idx, 1);
      }
      localStorage.setItem("carrinho", JSON.stringify(cartLocal));
      renderizarCarrinho();
    });
  });

  listaCarrinho.querySelectorAll(".delete-item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const idx = Number(btn.dataset.index);
      const cartLocal = JSON.parse(localStorage.getItem("carrinho")) || [];
      cartLocal.splice(idx, 1);
      localStorage.setItem("carrinho", JSON.stringify(cartLocal));
      renderizarCarrinho();
    });
  });

  atualizarContadorCarrinho();
}

// chamar após DOM pronto
document.addEventListener("DOMContentLoaded", () => {
  renderizarCarrinho();
});

// Selecionar o botão de reserva
const btnWhatsApp = document.querySelector("#toolbarCheckout .add-wpp");

if (btnWhatsApp) {
  btnWhatsApp.addEventListener("click", () => {
    const cart = JSON.parse(localStorage.getItem("carrinho")) || [];

    if (cart.length === 0) {
      alert("Carrinho vazio!");
      return;
    }

    // Cabeçalho
    let mensagem = "*RESERVA DE PRODUTOS*\n\n";

    // Listagem dos produtos
    cart.forEach((entry, idx) => {
      const produto = entry.item;
      const qtd = entry.quantidade;
      const precoUnit = (produto.preco_promocional || produto.preco || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      const totalItem = (entry.total_item || qtd * (produto.preco_promocional || produto.preco || 0)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

      mensagem += `*${idx + 1}. ${produto.nome}* (${produto.fabricante || "N/A"})\n`;
      mensagem += `Quantidade: ${qtd}\n`;
      mensagem += `Preço unitário: *${precoUnit}*\n`;
      mensagem += `Total: *${totalItem}*\n`;
      mensagem += "---------------------------\n";
    });

    // Total geral
    const total = cart.reduce((soma, entry) => soma + (entry.total_item || 0), 0);
    mensagem += `*TOTAL DO CARRINHO: ${total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}*\n\n`;

    mensagem += "Por favor, confirme disponibilidade e forma de pagamento.";

    // Abrir WhatsApp
    const numero = "5522999348043"; // substitua pelo seu número
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
  });
}
