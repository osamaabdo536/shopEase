function checkAuth() {
  var userData = localStorage.getItem("userData");

  if (!userData) {
    window.location.replace("login.html");
  }
  userData = JSON.parse(userData);
  if (userData.email !== "osama.abdo4040@gmail.com") {
    window.location.replace("login.html");
  }
}
checkAuth();

var products = [];
var tableBody = document.getElementById("productsData");
var isEditMode = false;
var currentEditId = null;

var navLinks = document.querySelectorAll(".nav-link");
var pages = document.querySelectorAll(".page");

for (var i = 0; i < navLinks.length - 1; i++) {
  navLinks[i].addEventListener("click", function (e) {
    e.preventDefault();

    for (var j = 0; j < navLinks.length - 1; j++) {
      navLinks[j].classList.remove("active");
    }

    for (var k = 0; k < pages.length; k++) {
      pages[k].classList.remove("active");
    }

    this.classList.add("active");

    var pageId = this.getAttribute("data-page");
    document.getElementById(pageId).classList.add("active");
    if (pageId == "products") {
      loadProducts();
    }
  });
}

loadProducts();

function loadProducts() {
  var productsTable = document.getElementById("productsTable");
  var errorMessage = document.getElementById("errorMessage");

  var http = new XMLHttpRequest();

  http.open("GET", "http://localhost:3000/products");

  http.addEventListener("readystatechange", function () {
    if (http.readyState === 4) {
      if (http.status >= 200 && http.status < 300) {
        products = JSON.parse(http.responseText);
        displayProducts(products);
        productsTable.style.display = "block";
      } else {
        errorMessage.style.display = "flex";
      }
    }
  });

  http.send();
}

function displayProducts(productsArray) {
  var rows = "";

  if (productsArray.length === 0) {
    rows = `
            <tr>
                <td colspan=6 style="text-align: center; padding: 2rem; color: var(--text-light);">
                    No products found
                </td>
            </tr>
        `;
  } else {
    for (var i = 0; i < productsArray.length; i++) {
      var product = productsArray[i];
      rows += `
                <tr data-product-id="${product.id}">
                    <td>${product.title}</td>
                    <td>${product.category.name}</td>
                    <td>${product.brand.name}</td>
                    <td>${product.quantity}</td>
                    <td>$${product.price}</td>
                    <td>
                        <button class="btn small edit" onclick="editProduct('${product.id}')">Edit</button>
                        <button class="btn small delete" onclick="deleteProduct('${product.id}')">Delete</button>
                    </td>
                </tr>
            `;
    }
  }

  tableBody.innerHTML = rows;
}

var productModal = document.getElementById("ProductModal");
var addProductBtn = document.getElementById("addProduct");
var cancelBtn = document.getElementById("cancelBtn");
var addProductForm = document.getElementById("addProductForm");
var modalTitle = document.getElementById("modalTitle");
var submitBtn = document.getElementById("submitBtn");

function fillCategoryDropdown() {
  var categorySelect = document.getElementById("productCategory");

  while (categorySelect.options.length > 1) {
    categorySelect.remove(1);
  }

  // إضافة الـ categories من المصفوفة categories الموجودة في categories.js
  for (var i = 0; i < categories.length; i++) {
    var option = document.createElement("option");
    option.value = categories[i].id;
    option.textContent = categories[i].name;
    option.setAttribute("data-category-name", categories[i].name);
    option.setAttribute("data-category-slug", categories[i].slug);
    option.setAttribute("data-category-image", categories[i].image);
    categorySelect.appendChild(option);
  }
}

addProductBtn.addEventListener("click", function () {
  isEditMode = false;
  currentEditId = null;
  modalTitle.textContent = "Add New Product";
  submitBtn.textContent = "Add Product";
  addProductForm.reset();
  fillCategoryDropdown();
  productModal.classList.add("show");
});

cancelBtn.addEventListener("click", closeModal);

productModal.addEventListener("click", function (e) {
  if (e.target === productModal) {
    closeModal();
  }
});

function closeModal() {
  productModal.classList.remove("show");
  addProductForm.reset();
  isEditMode = false;
  currentEditId = null;
}

addProductForm.addEventListener("submit", function (e) {
  e.preventDefault();
  if (isEditMode) {
    updateProduct();
  } else {
    addNewProduct();
  }
});

function addNewProduct() {
  var title = document.getElementById("productTitle").value;
  var categorySelect = document.getElementById("productCategory");
  var selectedOption = categorySelect.options[categorySelect.selectedIndex];
  var brand = document.getElementById("productBrand").value;
  var quantity = document.getElementById("productQuantity").value;
  var price = document.getElementById("productPrice").value;
  var imageCover = document.getElementById("productImageCover").value;
  var description = document.getElementById("productDescription").value;

  var categoryData = {
    _id: selectedOption.value,
    name: selectedOption.getAttribute("data-category-name"),
    slug: selectedOption.getAttribute("data-category-slug"),
    image: selectedOption.getAttribute("data-category-image"),
  };

  var newProduct = {
    title: title,
    description: description,
    category: categoryData,
    brand: { name: brand },
    quantity: parseInt(quantity),
    price: parseFloat(price),
    imageCover: imageCover,
    images: [imageCover],
  };
  // prevent duplicates
  for (var i = 0; i < products.length; i++) {
    if (products[i].title.toLowerCase() === title.toLowerCase()) {
      alert("Product with this name already exists!");
      return;
    }
  }
  var http = new XMLHttpRequest();
  http.open("POST", "http://localhost:3000/products");

  http.addEventListener("readystatechange", function () {
    if (http.readyState === 4) {
      if (http.status >= 200 && http.status < 300) {
        for (var i = 0; i < products.length; i++) {}
        products.push(newProduct);
        loadProducts();
        closeModal();
        alert("Product added successfully!");
      } else {
        alert("Failed to add product. Please try again.");
      }
    }
  });

  http.send(JSON.stringify(newProduct));
}

function editProduct(productId) {
  var product = null;
  for (var i = 0; i < products.length; i++) {
    if (products[i].id == productId) {
      product = products[i];
      break;
    }
  }

  if (!product) {
    alert("Product not found!");
    return;
  }

  fillCategoryDropdown();

  document.getElementById("productTitle").value = product.title;

  document.getElementById("productCategory").value = product.category._id;
  document.getElementById("productBrand").value = product.brand.name;
  document.getElementById("productQuantity").value = product.quantity;
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productImageCover").value = product.imageCover || "";
  document.getElementById("productDescription").value =
    product.description || "";

  isEditMode = true;
  currentEditId = productId;

  modalTitle.textContent = "Edit Product";
  submitBtn.textContent = "Update Product";

  productModal.classList.add("show");
}

function updateProduct() {
  var title = document.getElementById("productTitle").value;
  var categorySelect = document.getElementById("productCategory");
  var selectedOption = categorySelect.options[categorySelect.selectedIndex];
  var brand = document.getElementById("productBrand").value;
  var quantity = document.getElementById("productQuantity").value;
  var price = document.getElementById("productPrice").value;
  var imageCover = document.getElementById("productImageCover").value;
  var description = document.getElementById("productDescription").value;

  var categoryData = {
    _id: selectedOption.value,
    name: selectedOption.getAttribute("data-category-name"),
    slug: selectedOption.getAttribute("data-category-slug"),
    image: selectedOption.getAttribute("data-category-image"),
  };

  var updatedProduct = {
    title: title,
    description: description,
    category: categoryData,
    brand: { name: brand },
    quantity: parseInt(quantity),
    price: parseFloat(price),
    imageCover: imageCover,
    images: [imageCover],
  };

  var http = new XMLHttpRequest();
  http.open("PUT", "http://localhost:3000/products/" + currentEditId);

  http.addEventListener("readystatechange", function () {
    if (http.readyState === 4) {
      if (http.status >= 200 && http.status < 300) {
        var returnedProduct = JSON.parse(http.responseText);
        for (var i = 0; i < products.length; i++) {
          if (products[i].id == currentEditId) {
            products[i] = returnedProduct;
            break;
          }
        }

        loadProducts();
        closeModal();
        alert("Product updated successfully!");
      } else {
        alert("Failed to update product. Please try again.");
      }
    }
  });

  http.send(JSON.stringify(updatedProduct));
}

function deleteProduct(productId) {
  if (!confirm("Are you sure you want to delete this product?")) {
    return;
  }

  var http = new XMLHttpRequest();
  http.open("DELETE", "http://localhost:3000/products/" + productId);

  http.addEventListener("readystatechange", function () {
    if (http.readyState === 4) {
      if (http.status >= 200 && http.status < 300) {
        var newProducts = [];
        for (var i = 0; i < products.length; i++) {
          if (products[i].id != productId) {
            newProducts.push(products[i]);
          }
        }
        products = newProducts;

        loadProducts();

        alert("Product deleted successfully!");
      } else {
        alert("Failed to delete product. Please try again.");
      }
    }
  });

  http.send();
}

var searchInput = document.querySelector(".search input");
searchInput.addEventListener("input", function () {
  var searchTerm = searchInput.value.toLowerCase();
  var filteredProducts = [];
  for (var i = 0; i < products.length; i++) {
    var product = products[i];
    var title = product.title.toLowerCase();
    var category = product.category.name.toLowerCase();
    var brand = product.brand.name.toLowerCase();
    if (
      title.includes(searchTerm) ||
      category.includes(searchTerm) ||
      brand.includes(searchTerm)
    ) {
      filteredProducts.push(product);
    }
  }
  displayProducts(filteredProducts);
});

document.getElementById("logout").addEventListener("click", function () {
  localStorage.removeItem("userData");
});
