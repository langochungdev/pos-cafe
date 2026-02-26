// Quản lý CRUD sản phẩm với phân trang và lọc

import type { Product, ProductCategory } from "~/types";
import { generateId } from "~/utils/seed-data";
import { usePosStorage } from "~/composables/usePosStorage";

export function useProducts() {
  const storage = usePosStorage();
  const products = ref<Product[]>([]);
  const searchQuery = ref("");
  const selectedCategory = ref<ProductCategory | "">("");
  const currentPage = ref(1);
  const itemsPerPage = 8;

  function load() {
    products.value = storage.getProducts();
  }

  const filteredProducts = computed(() => {
    let result = products.value;
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    if (selectedCategory.value) {
      result = result.filter((p) => p.category === selectedCategory.value);
    }
    return result;
  });

  const totalPages = computed(() =>
    Math.ceil(filteredProducts.value.length / itemsPerPage),
  );

  const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return filteredProducts.value.slice(start, start + itemsPerPage);
  });

  function addProduct(product: Omit<Product, "id" | "createdAt">) {
    const newProduct: Product = {
      ...product,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    products.value.push(newProduct);
    storage.saveProducts(products.value);
  }

  function updateProduct(id: string, updates: Partial<Product>) {
    const index = products.value.findIndex((p) => p.id === id);
    if (index !== -1) {
      Object.assign(products.value[index]!, updates);
      storage.saveProducts(products.value);
    }
  }

  function deleteProduct(id: string) {
    products.value = products.value.filter((p) => p.id !== id);
    storage.saveProducts(products.value);
  }

  function setPage(page: number) {
    currentPage.value = page;
  }

  watch([searchQuery, selectedCategory], () => {
    currentPage.value = 1;
  });

  return {
    products,
    searchQuery,
    selectedCategory,
    currentPage,
    filteredProducts,
    totalPages,
    paginatedProducts,
    load,
    addProduct,
    updateProduct,
    deleteProduct,
    setPage,
  };
}
