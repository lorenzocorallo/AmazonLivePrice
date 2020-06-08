// ! Selectors

const dialog = remote.dialog;
const puppeteer = require("puppeteer");
const Path = require("path");
// *
const productInput = document.getElementById("product_input");
const productList = document.getElementById("product_list");
const productAdd = document.getElementById("product_input_btn");
const refreshBtn = document.querySelector(".refresh_btn");
const infoBar = document.getElementById("info");
const infoPrice = document.getElementById("totalprice");
const infoProducts = document.getElementById("totalproducts");
const nothingDiv = document.querySelector(".nothing_div");
// const refreshBtnImg = document.querySelector("#refresh_btn_img");

// * Getting App Version
const pjson = require("./package.json");
document.getElementById("title_version").innerText = pjson.version;

// ! Event Listener
productAdd.addEventListener("click", addProduct);
productList.addEventListener("click", productEvent);
document.addEventListener("DOMContentLoaded", getProducts);
refreshBtn.addEventListener("click", refresh);

// ! Functions

/*
? ----------------------------
?      Managing Products
? ----------------------------
*/
async function addProduct(event) {
  event.preventDefault();
  const URL = productInput.value;
  if (validURL(URL)) {
    if (nothingDiv.style.opacity == 1 || nothingDiv.style.display != "none") {
      nothingDiv.style.opacity = null;
      nothingDiv.style.display = "none";
    }
    productInput.value = "";

    //Toggle Working Stauts
    working(productInput);
    working(document.getElementById("product_input_btn"));

    const page = await startBrowser(URL);
    const productInfo = await getProductInfo(page);
    const pName = await productInfo.name;
    const pPrice = await productInfo.price;
    const pImgSrc = await productInfo.image;
    const pUrl = await productInfo.url;

    // PRODUCT DIV
    const productDiv = document.createElement("div");
    productDiv.classList.add("product");
    // CONTENT DIV
    const productContentDiv = document.createElement("div");
    productContentDiv.classList.add("product_content");
    productDiv.appendChild(productContentDiv);
    const productImg = document.createElement("img");
    productImg.src = pImgSrc;
    productImg.classList.add("product_image");
    productContentDiv.appendChild(productImg);
    const productName = document.createElement("li");
    productName.innerHTML = pName;
    productName.classList.add("product_name");
    productContentDiv.appendChild(productName);
    const productPrice = document.createElement("span");
    productPrice.innerHTML = pPrice;
    productPrice.classList.add("product_price");
    productContentDiv.appendChild(productPrice);
    const productUrl = document.createElement("span");
    productUrl.innerHTML = pUrl;
    productUrl.classList.add("hidden", "product_url");
    productContentDiv.appendChild(productUrl);
    // Adding Refresh Overlay
    const refreshOverlay = document.createElement("div");
    refreshOverlay.classList.add("refresh_overlay");
    const refreshOverlayP = document.createElement("p");
    refreshOverlayP.innerText = "Aggiornando...";
    refreshOverlay.appendChild(refreshOverlayP);
    productContentDiv.appendChild(refreshOverlay);
    // BUTTONS DIV
    const productButtonDiv = document.createElement("div");
    productButtonDiv.classList.add("product_buttons");
    productDiv.appendChild(productButtonDiv); //Delete Button
    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = `<img src="./assets/svg/delete.svg" />`;
    deleteBtn.classList.add("delete_btn");
    productButtonDiv.appendChild(deleteBtn);
    const checkBtn = document.createElement("button");
    checkBtn.innerHTML = `<img src="./assets/svg/tick.svg" />`;
    checkBtn.classList.add("check_btn");
    productButtonDiv.appendChild(checkBtn);
    // Append productDiv to productList
    productList.appendChild(productDiv);
    setTimeout(() => {
      productDiv.style.opacity = 1;
    }, 500);

    // Save Product to LocalStorage
    const product = {
      name: productName.innerHTML,
      price: productPrice.innerHTML,
      image: productImg.src,
      url: pUrl,
      checked: false,
    };
    saveProducts(product);
    checkTotalProducts();
    checkTotalPrice();
  } else {
    const errorURL = dialog.showMessageBox({
      type: "warning",
      message:
        "Hai inserito un URL Amazon non valido. Per favore ricontrolla! \nGrazie",
      title: "Errore",
    });
    console.log(errorURL);
  }
}

async function productEvent(e) {
  const item = e.target;
  // DELETE
  if (item.classList[0] === "delete_btn") {
    const product = item.parentElement.parentElement;
    product.classList.add("fadeout");
    product.addEventListener("animationend", () => {
      product.remove();
      removeProduct(product);
    });
  }
  // CHECK
  if (item.classList[0] === "check_btn") {
    const product = item.parentElement.parentElement;
    const productContent = product.firstElementChild;
    productContent.classList.toggle("product_checked");
    const products = await checkExistingProducts();
    const productName = productContent.children[1];
    const productPrice = productContent.children[2];
    const productImg = productContent.children[0];
    const productUrl = productContent.children[3];
    const productIndex = {
      name: productName.innerHTML,
      price: productPrice.innerHTML,
      image: productImg.src,
      url: productUrl.innerHTML,
      checked: true,
    };
    const productChecked = {
      name: productName.innerHTML,
      price: productPrice.innerHTML,
      image: productImg.src,
      url: productUrl.innerHTML,
      checked: false,
    };
    if (productContent.classList.contains("product_checked")) {
      productChecked.checked = true;
      productIndex.checked = false;
    } else if (!productContent.classList.contains("product_checked")) {
      productChecked.checked = false;
      productIndex.checked = true;
    }
    products.splice(products.indexOf(productIndex), 1, productChecked);
    localStorage.setItem("products", JSON.stringify(products));
  }
}

function saveProducts(product) {
  return new Promise(async (resolve, reject) => {
    const products = await checkExistingProducts();
    products.push(product);
    localStorage.setItem("products", JSON.stringify(products));
    resolve();
  });
}

async function getProducts() {
  const products = await checkExistingProducts();
  if (products.length != 0) {
    // Remove Nothing Div
    if (nothingDiv.style.opacity != 0 || nothingDiv.style.display != "none") {
      nothingDiv.style.opacity = null;
      nothingDiv.style.display = "none";
    }
    products.forEach(async function (product) {
      // PRODUCT DIV
      const productDiv = document.createElement("div");
      productDiv.classList.add("product");
      productDiv.style.opacity = 1;
      // CONTENT DIV
      const productContentDiv = document.createElement("div");
      productContentDiv.classList.add("product_content");
      if (product.checked == true) {
        productContentDiv.classList.add("product_checked");
      } else if (product.checked == null) {
      }
      productDiv.appendChild(productContentDiv);

      const productImg = document.createElement("img");
      productImg.src = product.image;
      productImg.classList.add("product_image");
      productContentDiv.appendChild(productImg);
      const productName = document.createElement("li");
      productName.innerHTML = product.name;
      productName.classList.add("product_name");
      productContentDiv.appendChild(productName);
      const productPrice = document.createElement("span");
      productPrice.innerHTML = product.price;
      productPrice.classList.add("product_price");
      productContentDiv.appendChild(productPrice);
      const productUrl = document.createElement("span");
      productUrl.innerHTML = product.url;
      productUrl.classList.add("hidden", "product_url");
      productContentDiv.appendChild(productUrl);
      // Adding Refresh Overlay
      const refreshOverlay = document.createElement("div");
      refreshOverlay.classList.add("refresh_overlay");
      const refreshOverlayP = document.createElement("p");
      refreshOverlayP.innerText = "Aggiornando...";
      refreshOverlay.appendChild(refreshOverlayP);
      productContentDiv.appendChild(refreshOverlay);
      // BUTTONS DIV
      const productButtonDiv = document.createElement("div");
      productButtonDiv.classList.add("product_buttons");
      productDiv.appendChild(productButtonDiv); //Delete Button
      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = `<img src="./assets/svg/delete.svg" />`;
      deleteBtn.classList.add("delete_btn");
      productButtonDiv.appendChild(deleteBtn);
      const checkBtn = document.createElement("button");
      checkBtn.innerHTML = `<img src="./assets/svg/tick.svg" />`;
      checkBtn.classList.add("check_btn");
      productButtonDiv.appendChild(checkBtn);
      //Append productDiv to productList
      productList.appendChild(productDiv);
      checkTotalPrice();
      checkTotalProducts();
    });
  } else {
    nothingDiv.style.display = null;
    nothingDiv.classList.add("fadein");
    nothingDiv.style.opacity = 1;
    setTimeout(() => {
      nothingDiv.classList.remove("fadein");
    }, 500);
  }
}

async function refresh() {
  // stopRotate(refreshBtn);
  startRotate(refreshBtn, 1000, "linear", "infinite");
  addRefreshOverlay();
  await refreshAll();
  //TODO: FIX
  checkTotalPrice();
  checkTotalProducts();
  stopRotate(refreshBtn);
  removeRefreshOverlay();
}

async function refreshAll() {
  return new Promise(async (resolve, reject) => {
    const local = await checkExistingProducts();
    function saveLocal(local, browser) {
      pChanged = 0;
      localStorage.setItem("products", JSON.stringify(local));
      browser.close();
      resolve();
    }
    if (local.length != 0) {
      // TODO : Add RESOLVE() where code finish to execute
      await changeText(infoPrice, "Aggiornando...", 300);
      const browser = await puppeteer.launch();
      let pChanged = 0;
      local.forEach(async function (p) {
        const prod = p;
        const index = local.indexOf(p);
        const page = await browser.newPage();
        await page.goto(prod.url);
        prod.price = await page.evaluate(
          () => document.querySelector("#priceblock_ourprice").innerText
        );
        await page.close();
        const el = retriveProducts()[index];
        await changeText(el[2], prod.price, 300);
        local[index] = prod;
        pChanged++;
        if (pChanged == local.length) {
          saveLocal(local, browser);
        }
      });
    } else {
      stopRotate(refreshBtn);
      const errorURL = dialog.showMessageBox({
        type: "warning",
        message: "Non ci sono prodotti da aggiornare \n\n",
        title: "Impossibile Aggiornare",
        icon: Path.Join(),
      });
      console.log(errorURL);
    }
  });
}

async function removeProduct(p) {
  const products = await checkExistingProducts();
  const productContent = p.children[0];
  const productName = productContent.children[1];
  const productPrice = productContent.children[2];
  const productImg = productContent.children[0];
  const productUrl = productContent.children[3];
  const productChecked = isChecked(productContent);
  const productIndex = {
    name: productName.innerHTML,
    price: productPrice.innerHTML,
    image: productImg.src,
    url: productUrl.innerHTML,
    checked: productChecked,
  };
  products.splice(products.indexOf(productIndex, 1));
  localStorage.setItem("products", JSON.stringify(products));
  // const productIndex =
  checkTotalPrice();
  checkTotalProducts();
}

function isChecked(product) {
  if (product.classList.contains("product_checked")) {
    const checked = true;
    return checked;
  } else if (!product.classList.contains("product_checked")) {
    const checked = false;
    return checked;
  }
}

/*
? ----------------------------
?          Info Bar
? ----------------------------
*/
function calculateTotalPrice() {
  const list = retriveProducts();
  const prices = [];
  let pushed = 0;
  let totalPrice;
  function setTotalPrice(prices) {
    totalPrice = prices
      .reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
      })
      .toFixed(2);
    totalPrice = String(totalPrice).replace(".", ",") + " €";
  }
  list.forEach(function (p) {
    let price = p[2].innerText;
    priceNumber = Number(price.replace("€", "").replace(",", ".").trim());
    prices.push(priceNumber);
    pushed++;
    if (pushed == list.length) {
      setTotalPrice(prices);
    }
  });
  if (totalPrice === undefined || totalPrice === null) {
    totalPrice = "0,00 €";
  }
  return totalPrice;
}

function checkTotalPrice() {
  changeText(infoPrice, calculateTotalPrice(), 300);
}

function checkTotalProducts() {
  // return new Promise(async (resolve, reject) => {
  //   let products = await checkExistingProducts();
  //   await changeText(infoProducts, products.length, 300);
  //   resolve();
  // });
  const list = retriveProducts();
  changeText(infoProducts, list.length, 300);
  if (list.length == 0) {
    nothingDiv.style.display = "";
    nothingDiv.classList.add("fadein");
    nothingDiv.style.opacity = 1;
    setTimeout(() => {
      nothingDiv.classList.remove("fadein");
    }, 500);
  }
}

/*
  ? ----------------------------
?        Web Scraping
? ----------------------------
*/

async function startBrowser(url) {
  const browser = await puppeteer.launch();
  const pages = await browser.pages();
  const page = await pages[0];
  await page.goto(url);
  return page;
}

async function getProductInfo(page) {
  try {
    await page.waitForSelector("#productTitle");
    const pName = await page.evaluate(
      () => document.querySelector("#productTitle").innerText
    );
    const pPrice = await page.evaluate(
      () => document.querySelector("#priceblock_ourprice").innerText
    );
    const pImgSrc = await page.evaluate(
      () => document.querySelector("#landingImage").src
    );
    const pUrl = page.url();
    await page.close();
    return {
      name: pName,
      price: pPrice,
      image: pImgSrc,
      url: pUrl,
    };
  } catch (ex) {
    const errorURL = dialog.showMessageBox({
      type: "warning",
      message:
        "Hai inserito un prodotto che non riusciamo ad identificare! \nSe credi che ci sia un errore, ti invitiamo a segnalarlo. Grazie \n\nErrore:\n" +
        ex,
      title: "Prodotto non valido",
    });
    console.log(errorURL);
  }
}

/*
? ----------------------------
?          Utility
? ----------------------------
*/

// Enter Key Binding
var input = document.getElementById("product_input");
input.addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    // 13 is the Enter
    event.preventDefault();
    document.getElementById("product_input_btn").click();
  }
});

function checkExistingProducts() {
  // Check For Arleady Exisiting Products
  return new Promise((resolve, reject) => {
    let products;
    if (localStorage.getItem("products") === null) {
      products = [];
    } else {
      products = JSON.parse(localStorage.getItem("products"));
    }
    products = products.filter(function (el) {
      return el != null;
    });
    resolve(products);
  });
}

function retriveProducts() {
  let products = document.querySelectorAll(".product_content");
  const list = Array.prototype.slice.call(products, 0);
  const productsContent = [];
  list.forEach(function (container) {
    content = container.children;
    productsContent.push(content);
  });
  return productsContent;
}

function validURL(str) {
  var pattern = new RegExp(
    "^(http://www.|https://www.|http://|https://)?[a-z0-9]+([-.]amazon+).[a-z]{2,5}(:[0-9]{1,5})?(/.*)?$"
  );
  return !!pattern.test(str);
}

function addRefreshOverlay() {
  let i, ii;
  const refreshOverlay = document.querySelectorAll(".refresh_overlay");
  for (i = 0; i < refreshOverlay.length; i++) {
    refreshOverlay[i].style.opacity = "1";
  }
  // const productName = document.querySelectorAll(".product_name");
  // const productImg = document.querySelectorAll(".product_image");
  // const productPrice = document.querySelectorAll(".product_price");
  // const product = {
  //   name: productName,
  //   img: productImg,
  //   price: productPrice,
  // };
  // for (ii = 0; i <= productName.length; i++) {
  //   console.log(product[ii]);
  //   product.name[ii].style.opacity = 0.2;
  //   product.price[ii].style.opacity = 0.2;
  //   product.img[ii].style.opacity = 0.2;
  // }
}
// TODO: FIX SECOND TIME REFRESH
function removeRefreshOverlay() {
  let i;
  const refreshOverlay = document.querySelectorAll(".refresh_overlay");
  for (i = 0; i < refreshOverlay.length; i++) {
    refreshOverlay[i].style.opacity = "0";
  }
  // const productName = document.querySelectorAll(".product_name");
  // const productImg = document.querySelectorAll(".product_image");
  // const productPrice = document.querySelectorAll(".product_price");
  // const product = {
  //   name: productName,
  //   img: productImg,
  //   price: productPrice,
  // };
  // for (ii = 0; i <= productName.length; i++) {
  //   product.name[ii].style.opacity = null;
  //   product.price[ii].style.opacity = null;
  //   product.img[ii].style.opacity = null;
  // }
}

/*
  ? ----------------------------
  ?         Animations
  ? ----------------------------
  */
function working(el) {
  // Change Input style
  el.classList.add("working");
  el.placeholder = "In Lavorazione";
  el.disabled = true;
  el.addEventListener("animationend", () => {
    el.classList.remove("working");
    el.placeholder = "Inserisci qui un URL";
    el.disabled = false;
  });
}

function fadeOut(el) {
  el.style.opacity = 0;
}

function fadeIn(el) {
  el.style.opacity = 1;
}

function changeText(el, value, duration) {
  new Promise((resolve, reject) => {
    fadeOut(el);
    setTimeout(() => {
      el.innerText = value;
    }, duration);
    setTimeout(() => {
      fadeIn(el);
    }, duration);
    el.removeAttribute("style");
    resolve();
  });
}

function startRotate(el, duration, timing, iteration) {
  el.disabled = true;
  el.style.animationPlayState = "running";
  el.style.animationName = "rotate";
  el.style.animationDuration = duration + "ms";
  el.style.animationTimingFunction = timing;
  el.style.animationIterationCount = iteration;
}

function stopRotate(el) {
  el.style.animationPlayState = "paused";
  el.disabled = false;
}
