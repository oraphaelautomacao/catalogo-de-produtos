let produtos = []; // produtos.json
let ultimosProdutos = []; // novidades.json

const CACHE_KEY_PRODUTOS = "produtos_cache";
const CACHE_KEY_NOVIDADES = "novidades_cache";
const CACHE_TIME = 5 * 60 * 1000; // 5 minutos

// --------------------------
// CARREGAR PRODUTOS COM CACHE
// --------------------------
async function carregarProdutos() {
  // Verifica cache
  const cache = localStorage.getItem(CACHE_KEY_PRODUTOS);
  if (cache) {
    const { data, timestamp } = JSON.parse(cache);
    if (Date.now() - timestamp < CACHE_TIME) {
      console.log("🔄 Usando cache de produtos");
      produtos = data;
      return;
    }
  }

  // Busca na API
  try {
    const res = await fetch("https://script.google.com/macros/s/AKfycbycFZtfiz0O49MlOzekcjduaFSeTRnrTd61k2edZJS--TEDKxkKDKOgkHbW7N0qbl6U/exec");
    const json = await res.json();
    produtos = json;

    // Salva no cache local
    localStorage.setItem(
      CACHE_KEY_PRODUTOS,
      JSON.stringify({ data: json, timestamp: Date.now() })
    );
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
  }
}

// --------------------------
// CARREGAR ÚLTIMOS PRODUTOS COM CACHE
// --------------------------
async function carregarUltimosProdutos() {
  const container = document.getElementById("ultimosProdutos");
  if (!container) return;

  container.replaceChildren();

  // Verifica cache
  const cache = localStorage.getItem(CACHE_KEY_NOVIDADES);
  if (cache) {
    const { data, timestamp } = JSON.parse(cache);
    if (Date.now() - timestamp < CACHE_TIME) {
      console.log("🔄 Usando cache de novidades");
      ultimosProdutos = data;
      renderizarNovidades(ultimosProdutos);
      return;
    }
  }

  try {
    const res = await fetch("https://script.google.com/macros/s/AKfycbycFZtfiz0O49MlOzekcjduaFSeTRnrTd61k2edZJS--TEDKxkKDKOgkHbW7N0qbl6U/exec");
    const data = await res.json();
    // Filtrar novidades
    const novidades = data.filter(p => p.destaque === "novidade");
    ultimosProdutos = novidades;

    // Salva no cache local
    localStorage.setItem(
      CACHE_KEY_NOVIDADES,
      JSON.stringify({ data: novidades, timestamp: Date.now() })
    );

    renderizarNovidades(novidades);
  } catch (err) {
    console.error("Erro ao carregar novidades:", err);
  }
}

// --------------------------
// FUNÇÃO PARA RENDERIZAR NOVIDADES
// --------------------------
function renderizarNovidades(novidades) {
  const container = document.getElementById("ultimosProdutos");
  if (!container) return;

  container.replaceChildren();

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
    container.appendChild(a);
  });
}

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
document.addEventListener("DOMContentLoaded", async () => {
  await carregarProdutos();
  await carregarUltimosProdutos();
  atualizarContadorCarrinho();
  initMenu();
  initSwiper();
});
