export const EMPTY_BOT_INSTRUCTIONS = {
  setupSteps: [],
  dosAndDonts: [],
  compatibilityList: [],
  speedTips: [],
  troubleshooting: [],
  quickFaqs: [],
};

function hasCustomInstructions(raw) {
  if (!raw || typeof raw !== "object") return false;
  return (
    (Array.isArray(raw.setupSteps) && raw.setupSteps.length > 0) ||
    (Array.isArray(raw.dosAndDonts) && raw.dosAndDonts.length > 0) ||
    (Array.isArray(raw.compatibilityList) && raw.compatibilityList.length > 0) ||
    (Array.isArray(raw.speedTips) && raw.speedTips.length > 0) ||
    (Array.isArray(raw.troubleshooting) && raw.troubleshooting.length > 0) ||
    (Array.isArray(raw.quickFaqs) && raw.quickFaqs.length > 0)
  );
}

export function normalizeBotInstructions(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const setupSteps = (Array.isArray(source.setupSteps) ? source.setupSteps : [])
    .map((item, index) => ({
      step: Number(item?.step) || index + 1,
      title: String(item?.title || "").trim(),
      detail: String(item?.detail || "").trim(),
    }))
    .filter((item) => item.title || item.detail)
    .map((item, index) => ({ ...item, step: index + 1 }));

  const dosAndDonts = (Array.isArray(source.dosAndDonts) ? source.dosAndDonts : [])
    .map((item) => ({
      type: item?.type === "dont" ? "dont" : "do",
      text: String(item?.text || "").trim(),
    }))
    .filter((item) => item.text);

  const compatibilityList = (Array.isArray(source.compatibilityList) ? source.compatibilityList : [])
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  const speedTips = (Array.isArray(source.speedTips) ? source.speedTips : [])
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  const troubleshooting = (Array.isArray(source.troubleshooting) ? source.troubleshooting : [])
    .map((item) => ({
      problem: String(item?.problem || "").trim(),
      solution: String(item?.solution || "").trim(),
    }))
    .filter((item) => item.problem || item.solution);

  const quickFaqs = (Array.isArray(source.quickFaqs) ? source.quickFaqs : [])
    .map((item) => ({
      q: String(item?.q || "").trim(),
      a: String(item?.a || "").trim(),
    }))
    .filter((item) => item.q || item.a);

  return {
    setupSteps,
    dosAndDonts,
    compatibilityList,
    speedTips,
    troubleshooting,
    quickFaqs,
  };
}

/** Category-based defaults used when a product has no saved bot instructions. */
export function buildDefaultInstructions(product) {
  if (!product) return { ...EMPTY_BOT_INSTRUCTIONS };

  const title = product.title || "Product";
  const category = (product.category || "").toLowerCase();
  const brand = product.brand || "Standard";
  const portType = product.portType || "Standard Interface";

  let setupSteps;
  let dosAndDonts;
  let compatibilityList;
  let speedTips;
  let troubleshooting;
  let quickFaqs;

  if (category.includes("cable")) {
    setupSteps = [
      {
        step: 1,
        title: "Inspect Connectors",
        detail: `Check both ${portType} gold-plated pins for any protective dust covers. Ensure the snagless latch is intact.`,
      },
      {
        step: 2,
        title: "Connect to Source",
        detail: "Insert one end firmly into your router, modem, or network switch LAN port until you hear a clear 'click'.",
      },
      {
        step: 3,
        title: "Connect to Device",
        detail: "Plug the other end into your PC, laptop, gaming console (PS5/Xbox), or Smart TV ethernet port.",
      },
      {
        step: 4,
        title: "Verify Link Indicator",
        detail: "Confirm the green/amber LED on the RJ45 port illuminates. In Windows/Mac, network status should show 'Connected (1 Gbps / 10 Gbps)'.",
      },
    ];

    dosAndDonts = [
      { type: "do", text: "Maintain a minimum bend radius of at least 4 times the cable diameter." },
      { type: "do", text: "Use cable clips or trunking to protect the cable from foot traffic or doors." },
      { type: "dont", text: "Do not pull or yank the cable by the cord when disconnecting; always press the clip tab." },
      { type: "dont", text: "Avoid running parallel to high-voltage 220V power cables to eliminate EMI interference." },
    ];

    compatibilityList = [
      "Desktop PCs, Laptops & Workstations",
      "WiFi Routers, Mesh Nodes & Modems",
      "Gigabit & 10G Managed/Unmanaged Network Switches",
      "PlayStation 4/5, Xbox Series X/S, Nintendo Switch",
      "Network Attached Storage (NAS) & Media Servers",
      "Smart TVs, Apple TV & Android Streaming Boxes",
    ];

    speedTips = [
      "Ensure your device network card (NIC) is set to 'Auto-Negotiation' or '1.0 Gbps / 10 Gbps Full Duplex'.",
      "Verify that your router port is Gigabit (1000M) rather than Fast Ethernet (100M).",
      "For gaming, wired ethernet provides 0% jitter and ultra-low ping (<5ms local gateway).",
    ];

    troubleshooting = [
      {
        problem: "No Internet / Cable Unplugged Error",
        solution: "Make sure the connector clip clicks in completely. Test with another LAN port on your router.",
      },
      {
        problem: "Speed Capped at 100 Mbps instead of 1000 Mbps",
        solution: "Inspect port pins on both your PC and router. If one pin isn't contacting, Ethernet falls back to 100 Mbps.",
      },
      {
        problem: "Yellow Exclamation / Identifying Network",
        solution: "Open Command Prompt and run 'ipconfig /renew' or reboot your router to assign a valid DHCP IP.",
      },
    ];

    quickFaqs = [
      {
        q: "Can I use this cable under carpets or along door frames?",
        a: title.toLowerCase().includes("flat")
          ? "Yes! This cable features an ultra-slim flat profile designed specifically for under-carpet and baseboard routing without bulging."
          : "Yes, you can route it along walls and baseboards using cable clips. Avoid sharp 90-degree creases.",
      },
      {
        q: `What is the maximum speed supported by this ${brand} cable?`,
        a: `This cable supports full rated bandwidth as specified in specifications (${product.specifications?.find((s) => s.label?.toLowerCase().includes("speed"))?.value || "Gigabit speeds"}).`,
      },
      {
        q: "Does this cable require any software drivers?",
        a: "No, this is completely plug-and-play. No drivers or software installation required.",
      },
    ];
  } else if (category.includes("switch") || category.includes("router") || category.includes("access point")) {
    setupSteps = [
      {
        step: 1,
        title: "Power On Device",
        detail: "Connect the provided power adapter to the DC port and plug it into a surge-protected wall socket.",
      },
      {
        step: 2,
        title: "Uplink Connection",
        detail: "Connect port 1 (or the designated WAN/Uplink port) to your main internet modem or gateway router.",
      },
      {
        step: 3,
        title: "Client Distribution",
        detail: "Plug your client cables (PCs, Smart TVs, Access Points, Printers) into any available LAN ports.",
      },
      {
        step: 4,
        title: "Check Status LEDs",
        detail: "Power LED should be solid green. Port LEDs flash when network traffic is passing through.",
      },
    ];

    dosAndDonts = [
      { type: "do", text: "Place in an open, well-ventilated area to prevent overheating during high traffic." },
      { type: "do", text: "Use shielded Cat6 or Cat7 cables for connecting high-bandwidth devices." },
      { type: "dont", text: "Do not create network loops (connecting both ends of a cable into the same switch)." },
      { type: "dont", text: "Do not place directly next to heat sources, humid areas, or microwave ovens." },
    ];

    compatibilityList = [
      "All standard IEEE 802.3/u/ab/x Ethernet standards",
      "Any brand router (PTCL, Nayatel, StormFiber, TP-Link, MikroTik, Cisco)",
      "Standard RJ45 Cat5e, Cat6, Cat6a, Cat7 cables",
      "IP CCTV Cameras & NVRs",
    ];

    speedTips = [
      "Green LED indicates 1000 Mbps Gigabit link; Amber LED indicates 100 Mbps Fast Ethernet link.",
      "Use quality pure copper cables for runs longer than 15 meters to prevent speed degradation.",
    ];

    troubleshooting = [
      {
        problem: "Port LED doesn't light up",
        solution: "Check if the connected device is powered on. Try switching to a different port on the switch.",
      },
      {
        problem: "Intermittent disconnection",
        solution: "Ensure power plug is tight. Check if cable length exceeds the maximum standard limit (100m).",
      },
    ];

    quickFaqs = [
      {
        q: "Does this require any manual configuration or IP setting?",
        a: "Unmanaged switches are 100% plug-and-play with Auto-MDI/MDIX. No software or IP configuration needed.",
      },
      {
        q: "Can I connect multiple switches together?",
        a: "Yes, you can daisy-chain switches via any LAN port using standard Ethernet cables.",
      },
    ];
  } else {
    setupSteps = [
      {
        step: 1,
        title: "Unpack & Inspect",
        detail: `Inspect the ${title} hardware and ensure interface contacts are clean and undamaged.`,
      },
      {
        step: 2,
        title: "Physical Installation",
        detail: `Firmly plug into the appropriate slot or interface (${portType}).`,
      },
      {
        step: 3,
        title: "System Recognition",
        detail: "Wait for system or LED indicator to confirm connection. Install drivers if prompted.",
      },
    ];

    dosAndDonts = [
      { type: "do", text: "Ensure proper static discharge precautions before handling electronic components." },
      { type: "dont", text: "Do not force connectors into ports. Align properly before pushing." },
    ];

    compatibilityList = [
      "Standard PC/Server motherboards & Operating Systems (Windows, Linux, macOS)",
      "Compatible standard networking peripherals",
    ];

    speedTips = [
      "Always use the latest official drivers for maximum throughput and hardware stability.",
    ];

    troubleshooting = [
      {
        problem: "Device not recognized",
        solution: "Try reconnecting or testing in another port. Check Device Manager / System Information.",
      },
    ];

    quickFaqs = [
      {
        q: "What is included in the package?",
        a: `${title}, protective packaging, and Wasooli Store purchase invoice.`,
      },
      {
        q: "What warranty does Wasooli Store provide?",
        a: "All items include safe delivery guarantee and 2-day inspection exchange for sealed original items.",
      },
    ];
  }

  return normalizeBotInstructions({
    setupSteps,
    dosAndDonts,
    compatibilityList,
    speedTips,
    troubleshooting,
    quickFaqs,
  });
}

export function getProductInstructions(product) {
  if (!product) return null;

  const title = product.title || "Product";
  const brand = product.brand || "Standard";
  const portType = product.portType || "Standard Interface";
  const specs = product.specifications || [];
  const custom = hasCustomInstructions(product.botInstructions)
    ? normalizeBotInstructions(product.botInstructions)
    : buildDefaultInstructions(product);

  return {
    productTitle: title,
    brand,
    category: product.category,
    portType,
    specs,
    ...custom,
  };
}

/**
 * Intelligent response generator for the interactive chat bot
 */
export function generateBotResponse(query, product, instructions) {
  if (!query || !product) {
    return "Hi there! I am your Wasooli Product Assistant. Ask me anything about how to use, install, or troubleshoot this item!";
  }

  const q = query.toLowerCase().trim();
  const title = product.title || "this product";
  const brand = product.brand || "Wasooli";
  const price = product.price ? `Rs. ${product.price.toLocaleString()}` : "our listed price";

  if (q.includes("install") || q.includes("setup") || q.includes("how to use") || q.includes("connect") || q.includes("plug")) {
    const steps = (instructions.setupSteps || []).map((s) => `• Step ${s.step} (${s.title}): ${s.detail}`).join("\n");
    return steps
      ? `Here are the official setup instructions for ${title}:\n\n${steps}\n\n Pro tip: Always make sure the connection clicks firmly into place!`
      : `Setup details for ${title} are being prepared. Check the product description meanwhile.`;
  }

  if (q.includes("compatible") || q.includes("support") || q.includes("work with") || q.includes("ps5") || q.includes("xbox") || q.includes("tv") || q.includes("router")) {
    const devices = (instructions.compatibilityList || []).map((d) => `✓ ${d}`).join("\n");
    return devices
      ? `Yes! ${title} is designed for wide networking compatibility:\n\n${devices}\n\nIt features standard ${instructions.portType} interfaces for zero-hassle connectivity.`
      : `${title} uses standard ${instructions.portType || "networking"} interfaces. Check the specifications tab for details.`;
  }

  if (q.includes("speed") || q.includes("bandwidth") || q.includes("gbps") || q.includes("fast") || q.includes("ping") || q.includes("gaming") || q.includes("lag")) {
    const speedSpec = (instructions.specs || []).find((s) => s.label.toLowerCase().includes("speed") || s.label.toLowerCase().includes("bandwidth"));
    const tips = (instructions.speedTips || []).map((t) => `• ${t}`).join("\n");
    return `Performance & Speed for ${title}:\n` +
      (speedSpec ? `Rated capacity: ${speedSpec.value}\n\n` : "") +
      (tips ? `Tips to achieve full performance:\n${tips}` : "See product specifications for rated speed.");
  }

  if (q.includes("spec") || q.includes("detail") || q.includes("feature") || q.includes("material") || q.includes("length")) {
    const specList = (instructions.specs || []).length > 0
      ? instructions.specs.map((s) => `• ${s.label}: ${s.value}`).join("\n")
      : product.features?.map((f) => `• ${f}`).join("\n") || "Standard high-performance specifications.";
    return `Specifications for ${title}:\n\n${specList}`;
  }

  if (q.includes("problem") || q.includes("not working") || q.includes("issue") || q.includes("fix") || q.includes("error") || q.includes("slow")) {
    const fixes = (instructions.troubleshooting || []).map((t) => ` ${t.problem}\n Fix: ${t.solution}`).join("\n\n");
    return fixes
      ? `Here are quick troubleshooting steps for ${title}:\n\n${fixes}\n\nIf the issue persists, feel free to contact Wasooli Store support at hello@wasooli.store!`
      : `If ${title} is not working as expected, try reconnecting and contact hello@wasooli.store if the issue continues.`;
  }

  if (q.includes("price") || q.includes("cost") || q.includes("discount") || q.includes("buy")) {
    return `${title} is currently priced at ${price}.${product.oldPrice > product.price ? ` You save Rs. ${(product.oldPrice - product.price).toLocaleString()} off the original Rs. ${product.oldPrice.toLocaleString()} price!` : ""} You can add it to your cart or click 'Buy it now' for fast nationwide delivery.`;
  }

  if (q.includes("warranty") || q.includes("return") || q.includes("exchange") || q.includes("guarantee")) {
    return `Wasooli Store offers a safe delivery guarantee on ${title}. Exchanges are available within 2 days of delivery for unused items in their original sealed packaging.`;
  }

  const faqHit = (instructions.quickFaqs || []).find((item) => {
    const question = (item.q || "").toLowerCase();
    return question && q.split(/\s+/).some((word) => word.length > 3 && question.includes(word));
  });
  if (faqHit) {
    return `${faqHit.q}\n\n${faqHit.a}`;
  }

  return `Regarding "${query}" for ${title}:\n` +
    `This is a genuine ${brand} product (${instructions.portType}) with tested high reliability. ` +
    `You can explore the 'Instructions' tab above for step-by-step setup guides, compatibility checklists, and troubleshooting!`;
}
