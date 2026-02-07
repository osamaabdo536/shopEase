var categories = [];
var categoriesTableBody = document.getElementById("categoriesData");
var isCategoryEditMode = false;
var currentCategoryEditId = null;

loadCategories();

function loadCategories() {
  var categoriesTable = document.getElementById("categoriesTable");
  var categoryErrorMessage = document.getElementById("categoryErrorMessage");

  var http = new XMLHttpRequest();

  http.open("GET", "http://localhost:3000/categories");

  http.addEventListener("readystatechange", function () {
    if (http.readyState === 4) {
      if (http.status >= 200 && http.status < 300) {
        categories = JSON.parse(http.responseText);
        displayCategories(categories);
        categoriesTable.style.display = "block";
      } else {
        categoryErrorMessage.style.display = "flex";
      }
    }
  });

  http.send();
}

function displayCategories(categoriesArray) {
  var rows = "";

  if (categoriesArray.length === 0) {
    rows = `
            <tr>
                <td colspan="2" style="text-align: center; padding: 2rem; color: var(--text-light);">
                    No categories found
                </td>
            </tr>
        `;
  } else {
    for (var i = 0; i < categoriesArray.length; i++) {
      var category = categoriesArray[i];
      rows += `
                <tr data-category-id="${category.id}">
                    <td class="category-name">${category.name}</td>
                    <td>
                        <button class="btn small edit" onclick="editCategory('${category.id}')">Edit</button>
                        <button class="btn small delete" onclick="deleteCategory('${category.id}')">Delete</button>
                    </td>
                </tr>
            `;
    }
  }

  categoriesTableBody.innerHTML = rows;
}

var categoryModal = document.getElementById("CategoryModal");
var addCategoryBtn = document.getElementById("addCategory");
var cancelCategoryBtn = document.getElementById("cancelCategoryBtn");
var addCategoryForm = document.getElementById("addCategoryForm");
var categoryModalTitle = document.getElementById("categoryModalTitle");
var submitCategoryBtn = document.getElementById("submitCategoryBtn");

addCategoryBtn.addEventListener("click", function (e) {
  isCategoryEditMode = false;
  currentCategoryEditId = null;
  categoryModalTitle.textContent = "Add New Category";
  submitCategoryBtn.textContent = "Add Category";
  addCategoryForm.reset();
  categoryModal.classList.add("show");
});

cancelCategoryBtn.addEventListener("click", closeCategoryModal);

categoryModal.addEventListener("click", function (e) {
  if (e.target === categoryModal) {
    closeCategoryModal();
  }
});

function closeCategoryModal() {
  categoryModal.classList.remove("show");
  addCategoryForm.reset();
  isCategoryEditMode = false;
  currentCategoryEditId = null;
}

addCategoryForm.addEventListener("submit", function (e) {
  e.preventDefault();
  if (isCategoryEditMode) {
    updateCategory();
  } else {
    addNewCategory();
  }
});

/*
var imageBase64;
document.getElementById("categoryImage").addEventListener("change", function () {
    var file = this.files[0];
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener("load", function () {
        imageBase64 = reader.result;
        console.log(imageBase64);
    });
});
*/
function addNewCategory() {
  var name = document.getElementById("categoryName").value;
  var slug = document.getElementById("categorySlug").value;
  var image = document.getElementById("categoryImage").value;

  var newCategory = {
    name: name,
    slug: slug,
    image: image,
  };

  for (var i = 0; i < categories.length; i++) {
    if (categories[i].name.toLowerCase() === name.toLowerCase()) {
      alert("Category with this name already exists!");
      return;
    }
  }
  var http = new XMLHttpRequest();
  http.open("POST", "http://localhost:3000/categories");

  http.addEventListener("readystatechange", function () {
    if (http.readyState === 4) {
      if (http.status >= 200 && http.status < 300) {
        // prevent duplicate category

        categories.push(newCategory);
        loadCategories();
        closeCategoryModal();
        alert("Category added successfully!");
      } else {
        alert("Failed to add category. Please try again.");
      }
    }
  });

  http.send(JSON.stringify(newCategory));
}

function editCategory(categoryId) {
  var category = null;
  for (var i = 0; i < categories.length; i++) {
    if (categories[i].id == categoryId) {
      category = categories[i];
      break;
    }
  }

  if (!category) {
    alert("Category not found!");
    return;
  }

  document.getElementById("categoryName").value = category.name;
  document.getElementById("categorySlug").value = category.slug;
  document.getElementById("categoryImage").value = category.image;

  isCategoryEditMode = true;
  currentCategoryEditId = categoryId;

  categoryModalTitle.textContent = "Edit Category";
  submitCategoryBtn.textContent = "Update Category";

  categoryModal.classList.add("show");
}

function updateCategory() {
  var name = document.getElementById("categoryName").value;
  var slug = document.getElementById("categorySlug").value;
  var image = document.getElementById("categoryImage").value;

  var updatedCategory = {
    name: name,
    slug: slug,
    image: image,
  };

  var http = new XMLHttpRequest();
  http.open("PUT", "http://localhost:3000/categories/" + currentCategoryEditId);

  http.addEventListener("readystatechange", function () {
    if (http.readyState === 4) {
      if (http.status >= 200 && http.status < 300) {
        for (var i = 0; i < categories.length; i++) {
          if (categories[i].id == currentCategoryEditId) {
            categories[i] = updatedCategory;
            break;
          }
        }
        updateProductsWithCategory(currentCategoryEditId, updatedCategory);
        loadCategories();
        closeCategoryModal();
        alert("Category updated successfully!");
      } else {
        alert("Failed to update category. Please try again.");
      }
    }
  });

  http.send(JSON.stringify(updatedCategory));
}

function updateProductsWithCategory(categoryId, updatedCategoryData) {
  var httpGet = new XMLHttpRequest();
  httpGet.open("GET", "http://localhost:3000/products");

  httpGet.addEventListener("readystatechange", function () {
    if (
      httpGet.readyState === 4 &&
      httpGet.status >= 200 &&
      httpGet.status < 300
    ) {
      var allProducts = JSON.parse(httpGet.responseText);
      for (var i = 0; i < allProducts.length; i++) {
        var product = allProducts[i];

        if (product.category._id == categoryId) {
          product.category = {
            _id: categoryId,
            name: updatedCategoryData.name,
            slug: updatedCategoryData.slug,
            image: updatedCategoryData.image,
          };
          console.log("Updated product category:", product.category);
          var httpUpdate = new XMLHttpRequest();
          httpUpdate.open(
            "PUT",
            "http://localhost:3000/products/" + product.id,
          );
          httpUpdate.send(JSON.stringify(product));
        }
      }
    }
  });

  httpGet.send();
}

function deleteCategory(categoryId) {
  if (!confirm("Are you sure you want to delete this category?")) {
    return;
  }

  var http = new XMLHttpRequest();
  http.open("DELETE", "http://localhost:3000/categories/" + categoryId);
  http.setRequestHeader("Content-Type", "application/json");

  http.addEventListener("readystatechange", function () {
    if (http.readyState === 4) {
      if (http.status >= 200 && http.status < 300) {
        var newCategories = [];
        for (var i = 0; i < categories.length; i++) {
          if (categories[i].id != categoryId) {
            newCategories.push(categories[i]);
          }
        }
        categories = newCategories;

        loadCategories();

        alert("Category deleted successfully!");
      } else {
        alert("Failed to delete category. Please try again.");
      }
    }
  });

  http.send();
}

var searchInput = document.querySelector(".search input");
if (searchInput) {
  searchInput.addEventListener("input", function () {
    var searchTerm = searchInput.value.toLowerCase();
    var filteredCategories = [];
    for (var i = 0; i < categories.length; i++) {
      var category = categories[i];
      var name = category.name.toLowerCase();
      if (name.includes(searchTerm)) {
        filteredCategories.push(category);
      }
    }
    displayCategories(filteredCategories);
  });
}
