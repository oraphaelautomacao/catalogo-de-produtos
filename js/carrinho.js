// ======== FUNÇÃO PARA TOGGLE DO BOTÃO WHATSAPP ========
function toggleBtnWhatsApp(show) {
  const btn = document.querySelector("#toolbarCheckout .add-wpp");
  if (!btn) return;
  if (show) btn.classList.remove("display-none");
  else btn.classList.add("display-none");
}

// ======== CARRINHO VAZIO ========
function carrinhoVazio() {
  console.log("Carrinho está vazio");

  // Limpar lista do carrinho
  document.getElementById("listaCarrinho").replaceChildren();

  // Esconder toolbar de totais e checkout
  document.getElementById("toolbarTotais").classList.add("display-none");
  document.getElementById("toolbarCheckout").classList.add("display-none");

  // Esconder botão WhatsApp
  toggleBtnWhatsApp(false);

  // Mostrar placeholder
  document.getElementById("listaCarrinho").innerHTML = `
    <div class="text-align-center">
      <img src="images/empty.gif" alt="Carrinho vazio">
      <br>
      <span class="color-gray">Nada por enquanto...</span>
    </div>
  `;
}

// ======== RENDERIZAÇÃO DO CARRINHO ========
function renderizarCarrinho() {
  const listaCarrinho = document.getElementById("listaCarrinho");
  const toolbarTotais = document.getElementById("toolbarTotais");
  const toolbarCheckout = document.getElementById("toolbarCheckout");

  if (!listaCarrinho) return console.error("Elemento #listaCarrinho não encontrado");

  const cart = JSON.parse(localStorage.getItem("carrinho")) || [];

  listaCarrinho.replaceChildren();

  if (cart.length === 0) {
    carrinhoVazio();
    atualizarContadorCarrinho();
    return;
  }

  // Renderizar itens
  cart.forEach((entry, index) => {
    const produto = entry.item || {};
    const img = produto.imagem || "images/default.png";
    const nome = produto.nome || "Produto";
    const quantidade = entry.quantidade || 1;
    const totalItem = entry.total_item ?? quantidade * (produto.preco_promocional || 0);

    listaCarrinho.insertAdjacentHTML("beforeend", `
      <div class="item-carrinho">
        <div class="container-img">
          <div class="area-img"><img src="${img}" alt="${nome}" /></div>
        </div>
        <div class="area-details">
          <div class="sup">
            <span class="name-prod">${nome}</span>
            <a class="delete-item" href="#" data-index="${index}" aria-label="Remover item">
              <i class="ri-close-line"></i>
            </a>
          </div>
          <div class="preco-quantidade">
            <span>${totalItem.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            <div class="count">
              <a class="menos" href="#" data-index="${index}" aria-label="Diminuir">-</a>
              <input readonly class="qtd-item" type="text" value="${quantidade}" />
              <a class="mais" href="#" data-index="${index}" aria-label="Aumentar">+</a>
            </div>
          </div>
        </div>
      </div>
    `);
  });

  // Calcular subtotal
  const subtotal = cart.reduce((soma, entry) => soma + (entry.total_item ?? entry.quantidade * (entry.item.preco_promocional || 0)), 0);

  if (toolbarTotais) {
    toolbarTotais.classList.remove("display-none");
    toolbarTotais.innerHTML = `
      <div style="margin-top: 10px" class="subtotal-cart">
        <span>Subtotal: </span>
        <span>${subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
      </div>
      <div class="subtotal-cart">
        <span>Frete: </span>
        <span>À verificar</span>
      </div>
    `;
  }

  if (toolbarCheckout) toolbarCheckout.classList.remove("display-none");

  // Mostrar botão WhatsApp
  toggleBtnWhatsApp(true);

  // Listeners para mais/menos/delete
  listaCarrinho.querySelectorAll(".mais").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      const idx = Number(btn.dataset.index);
      const cartLocal = JSON.parse(localStorage.getItem("carrinho")) || [];
      cartLocal[idx].quantidade = (cartLocal[idx].quantidade || 0) + 1;
      cartLocal[idx].total_item = cartLocal[idx].quantidade * (cartLocal[idx].item.preco_promocional || 0);
      localStorage.setItem("carrinho", JSON.stringify(cartLocal));
      renderizarCarrinho();
    });
  });

  listaCarrinho.querySelectorAll(".menos").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      const idx = Number(btn.dataset.index);
      const cartLocal = JSON.parse(localStorage.getItem("carrinho")) || [];
      if (!cartLocal[idx]) return;
      if (cartLocal[idx].quantidade > 1) {
        cartLocal[idx].quantidade -= 1;
        cartLocal[idx].total_item = cartLocal[idx].quantidade * (cartLocal[idx].item.preco_promocional || 0);
      } else cartLocal.splice(idx, 1);
      localStorage.setItem("carrinho", JSON.stringify(cartLocal));
      renderizarCarrinho();
    });
  });

  listaCarrinho.querySelectorAll(".delete-item").forEach(btn => {
    btn.addEventListener("click", e => {
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

// ======== CONTADOR DE ITENS ========
function atualizarContadorCarrinho() {
  const cart = JSON.parse(localStorage.getItem("carrinho")) || [];
  document.querySelectorAll(".btn-cart").forEach(btn => {
    btn.setAttribute("data-count", cart.length);
  });
}

// ======== EVENTO DO BOTÃO WHATSAPP ========
const btnWhatsApp = document.querySelector("#toolbarCheckout .add-wpp");
if (btnWhatsApp) {
  btnWhatsApp.addEventListener("click", () => {
    const cart = JSON.parse(localStorage.getItem("carrinho")) || [];
    if (cart.length === 0) return alert("Carrinho vazio!");

    let mensagem = "*RESERVA DE PRODUTOS*\n\n";
    cart.forEach((entry, idx) => {
      const produto = entry.item;
      const qtd = entry.quantidade;
      const precoUnit = (produto.preco_promocional || produto.preco || 0)
        .toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      const totalItem = (entry.total_item || qtd * (produto.preco_promocional || produto.preco || 0))
        .toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

      mensagem += `*${idx + 1}. ${produto.nome}* (${produto.fabricante || "N/A"})\n`;
      mensagem += `Quantidade: ${qtd}\n`;
      mensagem += `Preço unitário: *${precoUnit}*\n`;
      mensagem += `Total: *${totalItem}*\n---------------------------\n`;
    });

    const total = cart.reduce((soma, entry) => soma + (entry.total_item || 0), 0);
    mensagem += `*TOTAL DO CARRINHO: ${total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}*\n\n`;
    mensagem += "Por favor, confirme disponibilidade e forma de pagamento.";

    const numero = "5522999348043";
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`, "_blank");
  });
}

// ======== CHAMAR RENDERIZAÇÃO AO CARREGAR DOM ========
document.addEventListener("DOMContentLoaded", renderizarCarrinho);
