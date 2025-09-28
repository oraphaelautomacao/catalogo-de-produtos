let produtos = []; // produtos.json
let ultimosProdutos = []; // novidades.json

// --------------------------
// FUNÇÃO DE BUSCA
// --------------------------
function filtrar() {
  const input = document.querySelector(".input-busca");
  const filter = input.value.trim().toUpperCase();
  const ul = document.querySelector(".listaProdutos");
  if (!ul) return;

  ul.innerHTML = "";

  if (!filter) {
    ul.style.display = "none";
    return;
  }

  const filtrados = produtos.filter(p => p.nome.toUpperCase().includes(filter));

  filtrados.forEach(item => {
    const regex = new RegExp(filter, "gi");
    const nomeDestacado = item.nome.replace(regex, m => `<strong>${m}</strong>`);

    const li = document.createElement("li");
    li.innerHTML = `
      <a href="https://oraphaelautomacao.github.io/catalogo-de-produtos/detalhes.html?id=${item.id}">
        <img width="50" src="${item.imagem}">
        <span class="item-name">${nomeDestacado}</span>
      </a>
    `;
    ul.appendChild(li);
  });

  ul.style.display = filtrados.length ? "block" : "none";
}

// --------------------------
// CARREGAR PRODUTOS (produtos.json)
// --------------------------
fetch("js/produtos.json")
  .then(res => res.json())
  .then(json => { produtos = json; })
  .catch(err => console.error("Erro ao carregar produtos.json:", err));

// --------------------------
// CARREGAR ÚLTIMOS PRODUTOS
// --------------------------
function carregarUltimosProdutos() {
  const container = document.getElementById("ultimosProdutos");
  if (!container) return;

  container.replaceChildren();

 // Carregar produtos JSON
fetch("js/produtos.json")
  .then(res => res.json())
  .then(data => {
    // Filtrar novidades
    const novidades = data.filter(p => p.destaque === "novidade");

    // Renderizar novidades
    novidades.forEach(produto => {
      const a = document.createElement("a");
      a.href = `https://oraphaelautomacao.github.io/catalogo-de-produtos/detalhes.html?id=${produto.id}`;
      a.className = "item-link product";
      a.dataset.id = produto.id;
      a.innerHTML = `
        <img src="${produto.imagem}" alt="${produto.nome}" />
        <p class="product-name">${produto.nome}</p>
        <p class="rate">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
        <p class="product-price">
          ${produto.preco_promocional.toLocaleString("pt-BR", { 
            style: "currency", 
            currency: "BRL" 
          })}
        </p>
      `;
      document.querySelector("#ultimosProdutos").appendChild(a);
    });
  })
  .catch(err => console.error("Erro ao carregar novidades:", err));

}


// --------------------------
// CONTADOR DO CARRINHO
// --------------------------
function atualizarContadorCarrinho() {
  const cart = JSON.parse(localStorage.getItem("carrinho")) || [];
  document.querySelectorAll(".btn-cart").forEach(btn => {
    btn.setAttribute("data-count", cart.length);
  });
}

// --------------------------
// MENU HAMBURGUER
// --------------------------
function initMenu() {
  const menuBtn = document.querySelector(".ri-menu-line");
  const navBar = document.querySelector(".nav-bar");

  if (!menuBtn || !navBar) return;

  menuBtn.addEventListener("click", () => {
    navBar.classList.toggle("show-menu");
    menuBtn.classList.toggle("ri-close-line");
    menuBtn.classList.toggle("ri-menu-line");
  });

  // Fecha ao clicar fora
  document.addEventListener("click", e => {
    if (!navBar.contains(e.target) && navBar.classList.contains("show-menu")) {
      navBar.classList.remove("show-menu");
      menuBtn.classList.add("ri-menu-line");
      menuBtn.classList.remove("ri-close-line");
    }
  });
}

// --------------------------
// SWIPER BANNER
// --------------------------
function initSwiper() {
  const slides = document.querySelectorAll(".banner .slides img");
  const dots = document.querySelectorAll(".banner .dots span");
  if (!slides.length) return;

  let index = 0;

  function showSlide(i) {
    slides.forEach((s, idx) => s.classList.toggle("active", idx === i));
    dots.forEach((d, idx) => d.classList.toggle("active", idx === i));
    index = i;
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      showSlide(i);
      resetAutoplay();
    });
  });

  function nextSlide() {
    index = (index + 1) % slides.length;
    showSlide(index);
  }

  let interval = setInterval(nextSlide, 3000);
  function resetAutoplay() {
    clearInterval(interval);
    interval = setInterval(nextSlide, 3000);
  }
}

// --------------------------
// INICIALIZAÇÃO
// --------------------------
document.addEventListener("DOMContentLoaded", () => {
  carregarUltimosProdutos();
  atualizarContadorCarrinho();
  initMenu();
  initSwiper();
});
