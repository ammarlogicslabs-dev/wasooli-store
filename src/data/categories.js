export const CANONICAL_CATEGORIES = [
  "Routing",
  "Switching",
  "Wireless",
  "Network Security",
  "Optical & Fiber",
  "Cabling & Connectivity",
  "PoE",
  "Adapters & NICs",
  "Power & Racks",
  "Tools & Accessories",
];

export const CATEGORY_SUBCATEGORIES = {
  "Routing": [
    "SOHO Home Routers",
    "Business SMB Routers",
    "Enterprise Routers",
    "Edge Branch Routers",
    "Industrial Rugged Routers",
    "Cellular 4G–5G Routers",
    "VPN Security Gateways",
  ],
  "Switching": [
    "Unmanaged Switches",
    "Smart Web-Managed Switches",
    "Fully Managed Switches",
    "PoE PoE+ PoE++ Switches",
    "Core Aggregation Switches",
    "Data Center Switches",
    "Industrial Switches",
    "Desktop Compact Switches",
  ],
  "Wireless": [
    "Indoor Access Points",
    "Outdoor Access Points",
    "Wireless Controllers and Cloud Management",
    "Mesh Wi-Fi Systems",
    "Wi-Fi Range Extenders and Repeaters",
    "Wireless Bridges and CPE",
    "USB PCIe Wi-Fi Adapters",
    "Antennas and Mounts",
  ],
  "Network Security": [
    "UTM NGFW Firewalls",
    "VPN Appliances",
    "IDS IPS Appliances",
    "Secure Web Gateways and Proxies",
    "Network Access Control",
    "DDoS Mitigation Appliances",
  ],
  "Optical & Fiber": [
    "Media Converters",
    "SFP SFP+ QSFP Transceivers",
    "Fiber Patch Cables",
    "Fiber Patch Panels and Enclosures",
    "OTDR and Fiber Test Tools",
  ],
  "Cabling & Connectivity": [
    "Ethernet Patch Cables",
    "Bulk Copper Cables",
    "Keystone Jacks and Faceplates",
    "Copper Patch Panels",
    "Connectors and Boots",
    "Cable Management",
  ],
  "PoE": [
    "PoE Injectors and Midspans",
    "PoE Splitters",
    "PoE Extenders",
    "High-Power PoE Adapters",
  ],
  "Adapters & NICs": [
    "PCIe OCP NICs",
    "USB Ethernet Adapters",
    "Thunderbolt Networking Docks",
    "Bluetooth Combo Adapters",
  ],
  "Power & Racks": [
    "UPS Systems",
    "Power Distribution Units",
    "Network Racks and Cabinets",
    "Rack Shelves and Accessories",
    "Rack Cooling and Fans",
  ],
  "Tools & Accessories": [
    "Cable Testers and Certifiers",
    "Crimpers and Punch-Down Tools",
    "Network Tool Kits",
    "Labelers and Cable Markers",
    "Mounting Kits and Brackets",
    "Spare Fans, Power Supplies and Modules",
  ],
};

// Aliases for backward compatibility with legacy product/URL category names
CATEGORY_SUBCATEGORIES["Routers & Wireless"] = CATEGORY_SUBCATEGORIES["Routing"];
CATEGORY_SUBCATEGORIES["Routers"] = CATEGORY_SUBCATEGORIES["Routing"];
CATEGORY_SUBCATEGORIES["Switches & Adapters"] = CATEGORY_SUBCATEGORIES["Switching"];
CATEGORY_SUBCATEGORIES["Switches"] = CATEGORY_SUBCATEGORIES["Switching"];
CATEGORY_SUBCATEGORIES["Ethernet Cables"] = CATEGORY_SUBCATEGORIES["Cabling & Connectivity"];
CATEGORY_SUBCATEGORIES["Cat6 Cables"] = CATEGORY_SUBCATEGORIES["Cabling & Connectivity"];
CATEGORY_SUBCATEGORIES["Outdoor & Industrial Cables"] = CATEGORY_SUBCATEGORIES["Cabling & Connectivity"];
CATEGORY_SUBCATEGORIES["Gaming Cables"] = CATEGORY_SUBCATEGORIES["Cabling & Connectivity"];

/**
 * Normalizes legacy or variant category names to canonical names
 */
export function normalizeCategory(category) {
  if (!category) return "";
  const cat = String(category).trim();
  if (
    cat === "Routing" ||
    cat === "Routers & Wireless" ||
    cat === "Routers" ||
    cat.toLowerCase() === "routing"
  ) {
    return "Routing";
  }
  if (
    cat === "Switching" ||
    cat === "Switches & Adapters" ||
    cat === "Switches" ||
    cat.toLowerCase() === "switching"
  ) {
    return "Switching";
  }
  if (
    cat === "Cabling & Connectivity" ||
    cat === "Ethernet Cables" ||
    cat === "Cat6 Cables" ||
    cat === "Outdoor & Industrial Cables" ||
    cat === "Gaming Cables" ||
    cat.toLowerCase() === "cabling & connectivity" ||
    cat.toLowerCase() === "cabling"
  ) {
    return "Cabling & Connectivity";
  }
  if (cat.toLowerCase() === "wireless") return "Wireless";
  if (cat.toLowerCase() === "network security") return "Network Security";
  if (cat.toLowerCase() === "optical & fiber") return "Optical & Fiber";
  if (cat.toLowerCase() === "poe") return "PoE";
  if (cat.toLowerCase() === "adapters & nics") return "Adapters & NICs";
  if (cat.toLowerCase() === "power & racks") return "Power & Racks";
  if (cat.toLowerCase() === "tools & accessories") return "Tools & Accessories";
  return cat;
}
