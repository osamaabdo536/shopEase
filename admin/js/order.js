var allOrders = [];

// ================= ORDERS SECTION - ENHANCED =================
function getAllOrders() {
  var http = new XMLHttpRequest();
  http.open("GET", "http://localhost:3000/orders");
  http.onreadystatechange = function () {
    if (http.readyState === 4 && http.status === 200) {
      allOrders = JSON.parse(http.responseText);

      // ✅ ترتيب الأوردرات حسب التاريخ (الأحدث أولاً)
      allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      console.log("📦 Orders loaded:", allOrders.length, "orders");
      console.log("📋 Orders data:", allOrders);
      displayOrders(allOrders);
    } else if (http.readyState === 4) {
      console.error("❌ Failed to load orders. Status:", http.status);
    }
  };
  http.send();
}

function displayOrders(list) {
  var cartoona = "";

  if (!list || list.length === 0) {
    document.getElementById("ordersBody").innerHTML = `
            <tr><td colspan="6" style="text-align:center; padding:2rem;">
                <i class="fa-solid fa-inbox" style="font-size:50px; color:#ccc;"></i>
                <h3>No orders yet</h3>
            </td></tr>`;
    return;
  }

  list.forEach((order) => {
    var orderDate =
      order.date ||
      (order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("en-GB")
        : "N/A");
    var productsList = "";
    var totalPrice = order.totalPrice || "$0";
    var items = order.items || [];

    // ✅ عرض المنتجات
    items.forEach((item) => {
      var productTitle = item.title || "Unknown Product";
      // تقصير العنوان إذا كان طويل
      productTitle =
        productTitle.length > 40
          ? productTitle.substring(0, 37) + "..."
          : productTitle;

      productsList += `
                <div class="item-card p-2 mb-2 shadow-sm rounded border-start border-4 border-primary bg-light">
                    <p class="mb-0 fw-bold" style="font-size: 13px;">${productTitle}</p>
                    <div class="d-flex justify-content-between align-items-center mt-1">
                        <span class="badge bg-secondary">Qty: ${item.count}</span>
                        <span class="text-primary fw-bold" style="font-size: 12px;">$${item.price}</span>
                    </div>
                </div>`;
    });

    var status = order.status || "Pending";
    var badgeClass =
      status === "Delivered"
        ? "bg-success"
        : status === "Pending"
          ? "bg-warning text-dark"
          : status === "Confirmed" || status === "Pending Confirmation"
            ? "bg-info text-dark"
            : status === "Rejected"
              ? "bg-danger"
              : "bg-primary";

    cartoona += `
            <tr class="align-middle">
                <td><span class="fw-bold text-secondary">#${order.id}</span></td>
                <td style="width: 250px; max-height: 200px; overflow-y: auto;">${productsList || '<span style="color:#999;">No products</span>'}</td>
                <td>${orderDate}</td>
                <td><span class="badge ${badgeClass} p-2 w-100">${status}</span></td>
                <td><span class="fw-bold text-dark">${totalPrice}</span></td>
                <td>
                    <select class="form-select form-select-sm" onchange="changeOrderStatus('${order.id}', this.value)">
                        <option selected disabled>Update Status</option>
                        <option value="Pending" ${status === "Pending" ? "selected" : ""}>Pending</option>
                        <option value="Pending Confirmation" ${status === "Pending Confirmation" ? "selected" : ""}>Pending Confirmation</option>
                        <option value="Confirmed" ${status === "Confirmed" ? "selected" : ""}>Confirmed</option>
                        <option value="Delivered" ${status === "Delivered" ? "selected" : ""}>Delivered</option>
                        <option value="Rejected" ${status === "Rejected" ? "selected" : ""}>Rejected</option>
                    </select>
                    <button class="btn btn-sm btn-danger mt-2 w-100" onclick="deleteOrder('${order.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>`;
  });

  document.getElementById("ordersBody").innerHTML = cartoona;
}

function changeOrderStatus(id, newStatus) {
  console.log("🔄 Changing order", id, "to", newStatus);

  var http = new XMLHttpRequest();
  http.open("PATCH", `http://localhost:3000/orders/${id}`);
  http.setRequestHeader("Content-Type", "application/json");
  http.onreadystatechange = function () {
    if (http.readyState === 4 && (http.status === 200 || http.status === 204)) {
      console.log("✅ Order status updated successfully");

      // ✅ تحديث الـ status في الـ array المحلي
      var orderIndex = allOrders.findIndex((o) => o.id == id);
      if (orderIndex !== -1) {
        allOrders[orderIndex].status = newStatus;
      }

      // إعادة عرض الأوردرات
      displayOrders(allOrders);

      // عرض رسالة نجاح
      showNotification(
        "Order #" + id + " status updated to " + newStatus,
        "success",
      );
    } else if (http.readyState === 4) {
      console.error("❌ Failed to update order status");
      showNotification("Failed to update order status", "error");
    }
  };
  http.send(JSON.stringify({ status: newStatus }));
}

// ✅ DELETE ORDER
function deleteOrder(id) {
  if (!confirm("Are you sure you want to delete order #" + id + "?")) {
    return;
  }

  console.log("🗑️ Deleting order", id);

  var http = new XMLHttpRequest();
  http.open("DELETE", `http://localhost:3000/orders/${id}`);
  http.onreadystatechange = function () {
    if (http.readyState === 4 && (http.status === 200 || http.status === 204)) {
      console.log("✅ Order deleted successfully");

      // ✅ إزالة الـ order من الـ array المحلي
      allOrders = allOrders.filter((o) => o.id != id);

      // إعادة عرض الأوردرات
      displayOrders(allOrders);

      showNotification("Order #" + id + " deleted successfully", "success");
    } else if (http.readyState === 4) {
      console.error("❌ Failed to delete order");
      showNotification("Failed to delete order", "error");
    }
  };
  http.send();
}

// ✅ NOTIFICATION SYSTEM
function showNotification(message, type) {
  // إنشاء عنصر الإشعار
  var notification = document.createElement("div");
  notification.className = "notification " + type;
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === "success" ? "#10b981" : "#ef4444"};
        color: white;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        font-weight: 500;
    `;
  notification.textContent = message;

  document.body.appendChild(notification);

  // إزالة الإشعار بعد 3 ثواني
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-in";
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// إضافة الـ animations للـ CSS
var style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ================= AUTO REFRESH ORDERS =================
// تحديث الأوردرات كل 10 ثواني
setInterval(function () {
  var activePage = document.querySelector(".page.active");
  if (activePage && activePage.id === "orders") {
    console.log("🔄 Auto-refreshing orders...");
    getAllOrders();
  }
}, 10000); // كل 10 ثواني

// ================= INITIALIZE =================
getAllOrders();

console.log("✅ Orders module initialized");
