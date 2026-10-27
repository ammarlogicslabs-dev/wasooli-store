export function formatPrice(price) {
    return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        maximumFractionDigits: 0,
    }).format(price);
}

export function getProductCondition(product) {
    if (!product) return "New Product";
    if (product.condition) {
        const c = String(product.condition).toLowerCase().trim();
        if (
            c.includes("used") ||
            c.includes("refurb") ||
            c.includes("pre-owned") ||
            c === "old"
        ) {
            return "Used Product";
        }
        return "New Product";
    }
    const text = `${product.title || ""} ${product.sku || ""} ${product.shortDescription || ""}`.toLowerCase();
    if (
        text.includes("used") ||
        text.includes("refurbished") ||
        text.includes("pre-owned") ||
        text.includes("2nd hand")
    ) {
        return "Used Product";
    }
    const usedProductIds = [14, 16, 20];
    if (usedProductIds.includes(Number(product.id))) {
        return "Used Product";
    }
    return "New Product";
}