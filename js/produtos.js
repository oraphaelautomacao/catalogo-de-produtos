// Pegar parâmetros da URL
const params = new URLSearchParams(window.location.search);
const marca = params.get("marca");
const categoria = params.get("categoria");

// Elementos do DOM
const titulo = document.getElementById("page-titulo");
const subtitulo = document.getElementById("page-subtitulo");
const lista = document.getElementById("lista-produtos");

// Capitalizar primeira letra
function capitalizar(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
}

// Carregar produtos JSON
fetch("https://script.google.com/macros/s/AKfycbycFZtfiz0O49MlOzekcjduaFSeTRnrTd61k2edZJS--TEDKxkKDKOgkHbW7N0qbl6U/exec")
  .then(res => res.json())
  .then(produtos => {
    localStorage.setItem("produtos-chave", JSON.stringify(produtos));

    let filtrados = produtos;

    // Ajustar títulos e filtros
   if (marca) {
  filtrados = filtrados.filter(
    p => (p.marca || "").toLowerCase() === marca.toLowerCase()
  );

  if (categoria) {
    filtrados = filtrados.filter(
      p => (p.categoria || "").toLowerCase() === categoria.toLowerCase()
    );
  }

  titulo.innerText = `${capitalizar(categoria || "")} ${capitalizar(marca)}`;
  subtitulo.innerText = `Confira os modelos de ${capitalizar(categoria || "")} ${capitalizar(marca)}`;
} else if (categoria) {
  filtrados = filtrados.filter(
    p => (p.categoria || "").toLowerCase() === categoria.toLowerCase()
  );
  titulo.innerText = `${capitalizar(categoria)} e mais...`;
  subtitulo.innerText = `Confira os modelos da categoria ${capitalizar(categoria)}`;
}


    if (filtrados.length === 0) {
      lista.innerHTML = `<p>Nenhum produto encontrado para ${capitalizar(marca || categoria)}.</p>`;
      return;
    }

    // Renderizar produtos
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

  })
  .catch(err => console.error("Erro ao carregar produtos: " + err));
