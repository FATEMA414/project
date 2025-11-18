// cart.js
document.addEventListener("DOMContentLoaded", function () {
  // جلب السلة من localStorage أو إنشاء جديدة
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  const cartList = document.getElementById("cart");
  const totalPriceEl = document.getElementById("total");
  const cartCountEl = document.getElementById("cart-count"); // اختياري لو حطيتي عنصر يظهر عدد السلع

  // حفظ السلة في المتصفح
  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
  }

  function updateCartCount() {
    if (!cartCountEl) return;
    const sum = cart.reduce((s, it) => s + (it.quantity || 0), 0);
    cartCountEl.innerText = sum;
  }

  // عرض محتوى السلة
  function renderCart() {
    if (!cartList || !totalPriceEl) return;
    cartList.innerHTML = "";
    let total = 0;
    cart.forEach((item) => {
      const li = document.createElement("li");
      li.innerText = item.name + " - " + item.quantity + " × " + item.price + " ريال";
      cartList.appendChild(li);
      total += item.price * item.quantity;
    });
    totalPriceEl.innerText = "المجموع: " + total + " ريال";
  }

  // دالة مساعدة لقراءة السعر والكم من العنصر .pet
  function readPriceAndAvailable(petDiv) {
    // أولا نجرب data-attributes لو موجودة لأنها أكثر أمانًا
    if (petDiv.dataset && petDiv.dataset.price && petDiv.dataset.available) {
      const p = parseInt(petDiv.dataset.price, 10);
      const a = parseInt(petDiv.dataset.available, 10);
      if (!isNaN(p) && !isNaN(a)) return { price: p, available: a };
    }

    // خلاف ذلك نحاول استخراج من النص داخل <p>
    const pTag = petDiv.querySelector("p");
    const text = pTag ? pTag.innerText : "";
    const priceMatch = text.match(/السعر:\s*(\d+)/);
    const availableMatch = text.match(/العدد المتوفر:\s*(\d+)/);
    if (!priceMatch || !availableMatch) return null;
    return {
      price: parseInt(priceMatch[1], 10),
      available: parseInt(availableMatch[1], 10),
    };
  }

  // ربط أزرار الإضافة
  const buttons = document.querySelectorAll(".add-to-cart");
  buttons.forEach((btn) => {
    btn.addEventListener("click", function () {
      // نأخذ العنصر الأب الأقرب (يدعم هيكلة مختلفة إن لزم)
      const petDiv = btn.closest(".pet") || btn.parentElement;
      if (!petDiv) {
        alert("خطأ: لم يتم العثور على عنصر المنتج.");
        return;
      }

      const nameEl = petDiv.querySelector("h3");
      if (!nameEl) {
        alert("خطأ: اسم المنتج غير موجود.");
        return;
      }
      const name = nameEl.innerText.trim();

      const pa = readPriceAndAvailable(petDiv);
      if (!pa) {
        alert("خطأ: لم أتمكن من قراءة السعر أو العدد المتوفر لهذا المنتج.");
        return;
      }
      const price = pa.price;
      const available = pa.available;

      const qtyInput = petDiv.querySelector(".quantity");
      let quantity = 1;
      if (qtyInput) quantity = parseInt(qtyInput.value, 10) || 1;

      if (quantity < 1) {
        alert("اختر كمية صحيحة (أكبر من أو يساوي 1).");
        return;
      }

      if (quantity > available) {
        alert("خطأ: الكمية المطلوبة أكبر من العدد المتوفر.");
        return;
      }

      const existing = cart.find((it) => it.name === name);
      if (existing) {
        if (existing.quantity + quantity > available) {
          alert("خطأ: لا يوجد كمية كافية في المخزون!");
          return;
        }
        existing.quantity += quantity;
      } else {
        cart.push({ name: name, price: price, quantity: quantity, available: available });
      }

      saveCart();
      renderCart();
    });
  });

  // عرض السلة عند التحميل
  renderCart();
  updateCartCount();
});