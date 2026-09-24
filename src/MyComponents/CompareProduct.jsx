"use client";

import React, { useEffect, useState } from "react";
import { Button, SearchField, Separator } from "@heroui/react";
import { Check, GitCompareArrows, X, Search } from "lucide-react";
import { IoIosReturnRight } from "react-icons/io";

export default function CompareProduct() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [compareProducts, setCompareProducts] = useState([]);

  // =========================================================
  // LOAD JSON DATA
  // =========================================================

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("/data.json");

        if (!response.ok) {
          throw new Error("Failed to load data.json");
        }

        const data = await response.json();

        // Supports:
        // [ {...}, {...} ]
        //
        // and:
        // { products: [ {...}, {...} ] }

        if (Array.isArray(data)) {
          setProducts(data);
        } else if (Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          console.error("data.json must contain an array of products");
        }
      } catch (error) {
        console.error("Error loading products:", error);
      }
    };

    loadProducts();
  }, []);

  // =========================================================
  // SEARCH
  // =========================================================

  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }

    const keyword = search.toLowerCase().trim();

    const filtered = products
      .filter((product) => {
        return (
          product.title?.toLowerCase().includes(keyword) ||
          product.sellerName?.toLowerCase().includes(keyword) ||
          product.category?.toLowerCase().includes(keyword) ||
          product.location?.district?.toLowerCase().includes(keyword) ||
          product.location?.country?.toLowerCase().includes(keyword) ||
          product.location?.shippingOrigin?.toLowerCase().includes(keyword) ||
          product.quality?.grade?.toLowerCase().includes(keyword) ||
          product.quality?.tasteProfile?.toLowerCase().includes(keyword) ||
          product.availability?.status?.toLowerCase().includes(keyword) ||
          product.highlights?.some((highlight) =>
            highlight.toLowerCase().includes(keyword),
          )
        );
      })
      .slice(0, 6);

    setSuggestions(filtered);
  }, [search, products]);

  // =========================================================
  // SELECT SEARCH RESULT
  // =========================================================

  const handleSelect = (product) => {
    setSearch(product.title);
    setSuggestions([]);
  };

  // =========================================================
  // ADD / REMOVE PRODUCT FROM COMPARISON
  // =========================================================

  const handleCompare = (product) => {
    const alreadyAdded = compareProducts.some((item) => item.id === product.id);

    // Remove if already selected
    if (alreadyAdded) {
      setCompareProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );

      return;
    }

    // Maximum 3 products
    if (compareProducts.length >= 3) {
      alert("You can compare maximum 3 products.");

      return;
    }

    // Add product
    setCompareProducts((current) => [...current, product]);
  };

  // =========================================================
  // REMOVE PRODUCT
  // =========================================================

  const removeCompareProduct = (id) => {
    setCompareProducts((current) =>
      current.filter((product) => product.id !== id),
    );
  };

  // =========================================================
  // CHECK WHETHER PRODUCT IS SELECTED
  // =========================================================

  const isCompared = (id) => {
    return compareProducts.some((product) => product.id === id);
  };

  // =========================================================
  // CLEAR ALL
  // =========================================================

  const clearComparison = () => {
    setCompareProducts([]);
  };

  // =========================================================
  // GET SPECIFIC VALUE FROM PRODUCT
  // =========================================================

  const getProductValue = (product, key) => {
    switch (key) {
      case "price":
        return product.price?.amount;

      case "perUnit":
        return product.price?.perUnit;

      case "bulkPrice":
        return product.price?.bulkDiscountPrice;

      case "netWeight":
        return product.quantity?.netWeight;

      case "moisture":
        return product.quantity?.moistureContent;

      case "minOrder":
        return product.quantity?.minOrderQuantity;

      case "district":
        return product.location?.district;

      case "country":
        return product.location?.country;

      case "shippingOrigin":
        return product.location?.shippingOrigin;

      case "grade":
        return product.quality?.grade;

      case "qualityScore":
        return product.quality?.score;

      case "purity":
        return product.quality?.purityPercentage;

      case "taste":
        return product.quality?.tasteProfile;

      case "availability":
        return product.availability?.status;

      case "stock":
        return product.availability?.stockQuantity;

      case "leadTime":
        return product.availability?.leadTimeDays;

      case "verifiedSeller":
        return product.verification?.isVerifiedSeller;

      case "labTested":
        return product.verification?.labTested;

      case "badge":
        return product.verification?.badge;

      default:
        return "";
    }
  };

  // =========================================================
  // CHECK WHETHER A SPECIFICATION IS DIFFERENT
  // =========================================================

  const hasDifference = (key) => {
    // No need to highlight with only one product
    if (compareProducts.length <= 1) {
      return false;
    }

    const values = compareProducts.map((product) =>
      String(getProductValue(product, key) ?? ""),
    );

    // If unique values > 1, products are different
    return new Set(values).size > 1;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav className="border-b border-default-200">
        <div className="mx-auto flex w-11/12 items-center justify-between gap-8 py-5">
          {/* Logo */}

          <div className="shrink-0 text-xl font-bold text-white">
            <span className="mr-1 rounded-md bg-orange-500 px-2 py-1">X</span>
            SOURCE-X
          </div>

          {/* Search */}

          <div className="flex flex-1 items-center justify-end">
            <div className="relative w-full max-w-2xl">
              <SearchField
                name="product-search"
                variant="secondary"
                value={search}
                onChange={setSearch}
              >
                <SearchField.Group>
                  <SearchField.SearchIcon />

                  <SearchField.Input
                    className="w-full"
                    placeholder="Search honey, seller, category..."
                  />

                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>

              {/* =================================================
                  AUTOCOMPLETE
              ================================================== */}

              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-default-200 bg-background shadow-2xl">
                  {suggestions.map((product) => {
                    const compared = isCompared(product.id);

                    return (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 border-b border-default-100 last:border-b-0 hover:bg-default-100"
                      >
                        {/* Product information */}

                        <button
                          type="button"
                          onClick={() => handleSelect(product)}
                          className="min-w-0 flex-1 px-4 py-3 text-left"
                        >
                          <p className="truncate font-semibold">
                            {product.title}
                          </p>

                          <p className="mt-1 text-sm text-default-500">
                            {product.sellerName}
                          </p>

                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-default-400">
                            <span>{product.category}</span>

                            <span>•</span>

                            <span>{product.location?.district}</span>
                          </div>
                        </button>

                        {/* Price */}

                        <div className="hidden shrink-0 text-right sm:block">
                          <p className="font-semibold">
                            ৳{product.price?.amount}
                          </p>

                          <p className="text-xs text-default-400">
                            / {product.price?.perUnit}
                          </p>
                        </div>

                        {/* Compare button */}

                        <button
                          type="button"
                          onClick={() => handleCompare(product)}
                          title={
                            compared
                              ? "Remove from comparison"
                              : "Add to comparison"
                          }
                          className={`mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition ${
                            compared
                              ? "border-orange-500 bg-orange-500 text-white"
                              : "border-default-200 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                          }`}
                        >
                          {compared ? (
                            <Check size={18} />
                          ) : (
                            <GitCompareArrows size={18} />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* =================================================
                  NO RESULTS
              ================================================== */}

              {search.trim() &&
                suggestions.length === 0 &&
                products.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-default-200 bg-background p-5 text-center shadow-xl">
                    <Search
                      size={25}
                      className="mx-auto mb-2 text-default-400"
                    />

                    <p className="text-sm text-default-500">
                      No products found
                    </p>
                  </div>
                )}
            </div>

            <Separator
              orientation="vertical"
              className="mx-4 h-10 bg-gray-500"
            />

            {/* Buttons */}

            <div className="flex shrink-0 gap-3">
              <Button variant="outline" className="rounded-lg">
                Sign In
              </Button>

              <Button className="flex items-center gap-2 rounded-lg bg-orange-500 transition-colors duration-500 hover:bg-orange-600">
                Get Started
                <IoIosReturnRight />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto w-11/12 py-12">
        {/* Page heading */}

        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-500">
            <GitCompareArrows size={16} />
            Product Comparison
          </div>

          <h1 className="text-4xl font-bold">Compare Products</h1>

          <p className="mx-auto mt-3 max-w-2xl text-default-500">
            Search products from the Navbar and select up to three products to
            compare their specifications side by side.
          </p>
        </div>

        {/* ===================================================
            EMPTY STATE
        ==================================================== */}

        {compareProducts.length === 0 && (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-default-300 p-10 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
              <GitCompareArrows size={38} />
            </div>

            <h2 className="text-2xl font-bold">No Products Selected</h2>

            <p className="mt-2 max-w-md text-default-500">
              Use the search box in the Navbar to find products. Click the
              compare icon beside a product to add it here.
            </p>
          </div>
        )}

        {/* ===================================================
            COMPARISON
        ==================================================== */}

        {compareProducts.length > 0 && (
          <>
            {/* Comparison header */}

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-bold">Selected Products</h2>

                <p className="mt-1 text-sm text-default-500">
                  {compareProducts.length} / 3 products selected
                </p>
              </div>

              <Button
                variant="outline"
                onPress={clearComparison}
                className="rounded-lg"
              >
                Clear All
              </Button>
            </div>

            {/* =================================================
                DIFFERENCE LEGEND
            ================================================== */}

            {compareProducts.length > 1 && (
              <div className="mb-6 flex items-center justify-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-500">
                <span className="h-3 w-3 rounded-sm bg-orange-500/30" />

                <span>
                  Highlighted rows contain different values between the selected
                  products.
                </span>
              </div>
            )}

            {/* =================================================
                PRODUCT GRID
            ================================================== */}

            <div
              className={`grid gap-6 ${
                compareProducts.length === 1
                  ? "grid-cols-1"
                  : compareProducts.length === 2
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {compareProducts.map((product) => (
                <ProductComparisonCard
                  key={product.id}
                  product={product}
                  allProducts={compareProducts}
                  onRemove={removeCompareProduct}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="mt-20 border-t border-default-200">
        <div className="mx-auto flex w-11/12 flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
          {/* Logo */}

          <div>
            <div className="text-xl font-bold text-white">
              <span className="mr-1 rounded-md bg-orange-500 px-2 py-1">X</span>
              SOURCE-X
            </div>

            <p className="mt-2 text-sm text-default-500">
              Compare products and make informed purchasing decisions.
            </p>
          </div>

          {/* Footer links */}

          <div className="flex gap-6 text-sm text-default-500">
            <button className="transition hover:text-orange-500">About</button>

            <button className="transition hover:text-orange-500">
              Products
            </button>

            <button className="transition hover:text-orange-500">
              Contact
            </button>

            <button className="transition hover:text-orange-500">
              Privacy
            </button>
          </div>

          <p className="text-sm text-default-500">
            © {new Date().getFullYear()} SOURCE-X
          </p>
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// PRODUCT COMPARISON CARD
// ============================================================

const ProductComparisonCard = ({ product, allProducts, onRemove }) => {
  // ----------------------------------------------------------
  // GET VALUE
  // ----------------------------------------------------------

  const getValue = (product, key) => {
    switch (key) {
      case "price":
        return product.price?.amount;

      case "perUnit":
        return product.price?.perUnit;

      case "bulkPrice":
        return product.price?.bulkDiscountPrice;

      case "netWeight":
        return product.quantity?.netWeight;

      case "moisture":
        return product.quantity?.moistureContent;

      case "minOrder":
        return product.quantity?.minOrderQuantity;

      case "district":
        return product.location?.district;

      case "country":
        return product.location?.country;

      case "shippingOrigin":
        return product.location?.shippingOrigin;

      case "grade":
        return product.quality?.grade;

      case "qualityScore":
        return product.quality?.score;

      case "purity":
        return product.quality?.purityPercentage;

      case "taste":
        return product.quality?.tasteProfile;

      case "availability":
        return product.availability?.status;

      case "stock":
        return product.availability?.stockQuantity;

      case "leadTime":
        return product.availability?.leadTimeDays;

      case "verifiedSeller":
        return product.verification?.isVerifiedSeller;

      case "labTested":
        return product.verification?.labTested;

      case "badge":
        return product.verification?.badge;

      default:
        return "";
    }
  };

  // ----------------------------------------------------------
  // CHECK DIFFERENCE
  // ----------------------------------------------------------

  const hasDifference = (key) => {
    if (allProducts.length <= 1) {
      return false;
    }

    const values = allProducts.map((item) => String(getValue(item, key) ?? ""));

    return new Set(values).size > 1;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-default-200 bg-background shadow-lg">
      {/* =====================================================
          PRODUCT HEADER
      ====================================================== */}

      <div className="relative min-h-[150px] border-b border-default-200 p-5">
        <button
          type="button"
          onClick={() => onRemove(product.id)}
          title="Remove product"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-default-200 transition hover:border-danger hover:bg-danger hover:text-white"
        >
          <X size={16} />
        </button>

        <p className="pr-10 text-lg font-bold">{product.title}</p>

        <p className="mt-2 text-sm text-default-500">{product.sellerName}</p>

        <span className="mt-3 inline-block rounded-full bg-orange-500/10 px-3 py-1 text-xs text-orange-500">
          {product.category}
        </span>
      </div>

      {/* =====================================================
          SPECIFICATIONS
      ====================================================== */}

      <div className="divide-y divide-default-100">
        <Spec
          label="Price"
          value={`৳${product.price?.amount}`}
          highlight={hasDifference("price")}
        />

        <Spec
          label="Per Unit"
          value={product.price?.perUnit}
          highlight={hasDifference("perUnit")}
        />

        <Spec
          label="Bulk Price"
          value={`৳${product.price?.bulkDiscountPrice}`}
          highlight={hasDifference("bulkPrice")}
        />

        <Spec
          label="Net Weight"
          value={product.quantity?.netWeight}
          highlight={hasDifference("netWeight")}
        />

        <Spec
          label="Moisture"
          value={product.quantity?.moistureContent}
          highlight={hasDifference("moisture")}
        />

        <Spec
          label="Min Order"
          value={product.quantity?.minOrderQuantity}
          highlight={hasDifference("minOrder")}
        />

        <Spec
          label="District"
          value={product.location?.district}
          highlight={hasDifference("district")}
        />

        <Spec
          label="Country"
          value={product.location?.country}
          highlight={hasDifference("country")}
        />

        <Spec
          label="Shipping Origin"
          value={product.location?.shippingOrigin}
          highlight={hasDifference("shippingOrigin")}
        />

        <Spec
          label="Grade"
          value={product.quality?.grade}
          highlight={hasDifference("grade")}
        />

        <Spec
          label="Quality Score"
          value={product.quality?.score ? `${product.quality.score}/100` : "—"}
          highlight={hasDifference("qualityScore")}
        />

        <Spec
          label="Purity"
          value={
            product.quality?.purityPercentage
              ? `${product.quality.purityPercentage}%`
              : "—"
          }
          highlight={hasDifference("purity")}
        />

        <Spec
          label="Taste"
          value={product.quality?.tasteProfile}
          highlight={hasDifference("taste")}
        />

        <Spec
          label="Availability"
          value={product.availability?.status}
          highlight={hasDifference("availability")}
        />

        <Spec
          label="Stock"
          value={
            product.availability?.stockQuantity
              ? `${product.availability.stockQuantity} units`
              : "—"
          }
          highlight={hasDifference("stock")}
        />

        <Spec
          label="Lead Time"
          value={
            product.availability?.leadTimeDays
              ? `${product.availability.leadTimeDays} days`
              : "—"
          }
          highlight={hasDifference("leadTime")}
        />

        <Spec
          label="Verified Seller"
          value={product.verification?.isVerifiedSeller ? "✓ Yes" : "✕ No"}
          highlight={hasDifference("verifiedSeller")}
        />

        <Spec
          label="Lab Tested"
          value={product.verification?.labTested ? "✓ Yes" : "✕ No"}
          highlight={hasDifference("labTested")}
        />

        <Spec
          label="Verification Badge"
          value={product.verification?.badge}
          highlight={hasDifference("badge")}
        />

        {/* =================================================
            CERTIFICATIONS
        ================================================== */}

        <div className="min-h-[110px] p-4">
          <p className="mb-3 text-xs text-default-500">Certifications</p>

          <div className="flex flex-wrap gap-2">
            {product.verification?.certifications?.length > 0 ? (
              product.verification.certifications.map((certificate) => (
                <span
                  key={certificate}
                  className="rounded-full bg-default-100 px-2 py-1 text-xs"
                >
                  {certificate}
                </span>
              ))
            ) : (
              <span className="text-sm text-default-400">—</span>
            )}
          </div>
        </div>

        {/* =================================================
            HIGHLIGHTS
        ================================================== */}

        <div className="min-h-[120px] p-4">
          <p className="mb-3 text-xs text-default-500">Highlights</p>

          <div className="space-y-2">
            {product.highlights?.length > 0 ? (
              product.highlights.map((highlight) => (
                <p key={highlight} className="text-sm">
                  ✓ {highlight}
                </p>
              ))
            ) : (
              <p className="text-sm text-default-400">—</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// SPEC ROW
// ============================================================

const Spec = ({ label, value, highlight = false }) => {
  return (
    <div
      className={`grid grid-cols-2 gap-4 p-4 transition-colors ${
        highlight ? "bg-orange-500/10" : ""
      }`}
    >
      <span
        className={`text-sm ${
          highlight ? "font-semibold text-orange-500" : "text-default-500"
        }`}
      >
        {label}
      </span>

      <span
        className={`break-words text-right text-sm font-medium ${
          highlight ? "font-bold text-orange-500" : ""
        }`}
      >
        {value || "—"}
      </span>
    </div>
  );
};
