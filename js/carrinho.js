// ======= POPOVER =======
const toggleBtn = document.querySelector(".popover-toggle");
const popover = document.querySelector(".popover");
const icon = toggleBtn?.querySelector("i");

function togglePopover(e) {
  e.preventDefault();
  const isOpen = popover.style.display === "block";
  if (isOpen) {
    popover.style.display = "none";
    icon.classList.replace("ri-close-large-line", "ri-more-fill");
  } else {
    popover.style.display = "block";
    icon.classList.replace("ri-more-fill", "ri-close-large-line");
  }
}

if (toggleBtn) toggleBtn.addEventListener("click", togglePopover);

// Fecha ao clicar fora
document.addEventListener("click", (e) => {
  if (!popover.contains(e.target) && !toggleBtn.contains(e.target)) {
    popover.style.display = "none";
    if (icon) icon.classList.replace("ri-close-large-line", "ri-more-fill");
  }
});

// Fechar links internos
document.querySelectorAll(".popover-close").forEach((link) => {
  link.addEventListener("click", () => {
    popover.style.display = "none";
    if (icon) icon.classList.replace("ri-close-large-line", "ri-more-fill");
  });
});

// ======= MODAL =======
const btnEsvaziar = document.getElementById("esvaziar");
const modal = document.getElementById("confirmModal");
const btnCancelar = document.getElementById("cancelar");
const btnConfirmar = document.getElementById("confirmar");

if (btnEsvaziar && modal) {
  btnEsvaziar.addEventListener("click", () => modal.style.display = "flex");
}

if (btnCancelar && modal) {
  btnCancelar.addEventListener("click", () => modal.style.display = "none");
}

if (btnConfirmar && modal) {
  btnConfirmar.addEventListener("click", () => {
    localStorage.removeItem("carrinho");
    modal.style.display = "none";
    renderizarCarrinho(); // atualiza imediatamente
  });
}

if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
}

// ======= FUNÇÃO CONTADOR =======
function atualizarContadorCarrinho() {
  const cart = JSON.parse(localStorage.getItem("carrinho")) || [];
  document.querySelectorAll(".btn-cart").forEach((btn) => {
    btn.setAttribute("data-count", cart.length);
  });
}

// ======= FUNÇÃO RENDER CARRINHO =======
function renderizarCarrinho() {
  const listaCarrinho = document.getElementById("listaCarrinho");
  const toolbarTotais = document.getElementById("toolbarTotais");
  const toolbarCheckout = document.getElementById("toolbarCheckout");

  if (!listaCarrinho) return;

  const cart = JSON.parse(localStorage.getItem("carrinho")) || [];
  listaCarrinho.replaceChildren();

  if (cart.length === 0) {
    // Carrinho vazio
    listaCarrinho.innerHTML = `
      <div class="text-align-center">
        <img width="300" src="images/empty.gif" alt="Carrinho vazio" />
        <br>
        <span class="color-gray">Nada por enquanto...</span>
      </div>
    `;
    toolbarTotais.style.display = "none";
    toolbarCheckout.style.display = "none";
    atualizarContadorCarrinho();
    return;
  }

  // Renderizar itens
  cart.forEach((entry, index) => {
    const produto = entry.item || {};
    const img = produto.imagem || "images/default.png";
    const nome = produto.nome || "Produto";
    const principal_caracteristica = produto.principal_caracteristica || "";
    const quantidade = entry.quantidade || 1;
    const totalItem = entry.total_item ?? quantidade * (produto.preco_promocional || 0);

    const itemDiv = `
      <div class="item-carrinho">
        <div class="container-img">
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
            <span>${totalItem.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</span>
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

  // Subtotal
  const subtotal = cart.reduce((soma, entry) => soma + (entry.total_item ?? entry.quantidade*(entry.item.preco_promocional||0)),0);

  // Mostrar toolbar
  toolbarTotais.style.display = "flex";
  toolbarCheckout.style.display = "flex";

  toolbarTotais.innerHTML = `
    <div class="subtotal-cart">
      <span>Subtotal: </span>
      <span>${subtotal.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</span>
    </div>
    <div class="subtotal-cart">
      <span>Frete: </span>
      <span>À verificar</span>
    </div>
  `;

  // Listeners
  listaCarrinho.querySelectorAll(".mais").forEach((btn) => {
    btn.addEventListener("click",(e)=>{
      e.preventDefault();
      const idx=Number(btn.dataset.index);
      const cartLocal=JSON.parse(localStorage.getItem("carrinho"))||[];
      cartLocal[idx].quantidade+=1;
      cartLocal[idx].total_item=cartLocal[idx].quantidade*(cartLocal[idx].item.preco_promocional||0);
      localStorage.setItem("carrinho",JSON.stringify(cartLocal));
      renderizarCarrinho();
    });
  });

  listaCarrinho.querySelectorAll(".menos").forEach((btn)=>{
    btn.addEventListener("click",(e)=>{
      e.preventDefault();
      const idx=Number(btn.dataset.index);
      const cartLocal=JSON.parse(localStorage.getItem("carrinho"))||[];
      if(cartLocal[idx].quantidade>1){
        cartLocal[idx].quantidade-=1;
        cartLocal[idx].total_item=cartLocal[idx].quantidade*(cartLocal[idx].item.preco_promocional||0);
      } else {
        cartLocal.splice(idx,1);
      }
      localStorage.setItem("carrinho",JSON.stringify(cartLocal));
      renderizarCarrinho();
    });
  });

  listaCarrinho.querySelectorAll(".delete-item").forEach((btn)=>{
    btn.addEventListener("click",(e)=>{
      e.preventDefault();
      const idx=Number(btn.dataset.index);
      const cartLocal=JSON.parse(localStorage.getItem("carrinho"))||[];
      cartLocal.splice(idx,1);
      localStorage.setItem("carrinho",JSON.stringify(cartLocal));
      renderizarCarrinho();
    });
  });

  atualizarContadorCarrinho();
}

// ======= WHATSAPP =======
const btnWhatsApp = document.querySelector("#toolbarCheckout .add-wpp");
if(btnWhatsApp){
  btnWhatsApp.addEventListener("click",()=>{
    const cart=JSON.parse(localStorage.getItem("carrinho"))||[];
    if(cart.length===0){ alert("Carrinho vazio!"); return; }

    let mensagem="*RESERVA DE PRODUTOS*\n\n";
    cart.forEach((entry,idx)=>{
      const produto=entry.item;
      const qtd=entry.quantidade;
      const precoUnit=(produto.preco_promocional||produto.preco||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
      const totalItem=(entry.total_item||qtd*(produto.preco_promocional||produto.preco||0)).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
      mensagem+=`*${idx+1}. ${produto.nome}* (${produto.fabricante||"N/A"})\nQuantidade: ${qtd}\nPreço unitário: *${precoUnit}*\nTotal: *${totalItem}*\n---------------------------\n`;
    });
    const total=cart.reduce((soma,entry)=>soma+(entry.total_item||0),0);
    mensagem+=`*TOTAL DO CARRINHO: ${total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}*\n\nPor favor, confirme disponibilidade e forma de pagamento.`;
    const numero="5522999348043"; // seu número
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`,"_blank");
  });
}

// ======= DOMContentLoaded =======
document.addEventListener("DOMContentLoaded",()=>renderizarCarrinho());
