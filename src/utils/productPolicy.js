import { getProductCondition } from "../data/product";
import { normalizeCategory } from "../data/categories";

/**
 * Returns customized Return & Exchange policy based on product category and condition (New vs Used).
 */
export function getProductPolicy(product) {
  if (!product) {
    return {
      condition: "New Product",
      isUsed: false,
      category: "Networking",
      warrantyPeriod: "7 Days",
      warrantyType: "Replacement Policy",
      badge: "7-Day Replacement",
      shortSummary: "Sealed unused items or defective units within 7 days of delivery",
      conditionTerms: "Brand new sealed product with complete manufacturer packaging.",
      categoryTerms: "Covers factory defects and dead-on-arrival equipment.",
      eligibleItems: [
        "Product in original, unopened sealed retail box with all seals intact",
        "Includes all serial-matched accessories, manuals, and warranty cards",
        "Reported within the designated warranty window with proof of purchase",
      ],
      ineligibleItems: [
        "Items with physical damage, liquid damage, power surge, or burnt components",
        "Missing original packaging, serial number label removed or tampered",
        "Change of mind after opening sealed electronics packaging",
      ],
      claimProcess: [
        "Step 1: Contact Wasooli Store support via WhatsApp or email within the warranty period.",
        "Step 2: Share your Order ID along with clear unboxing photos/video of the issue.",
        "Step 3: Our technical team inspects and dispatches your replacement immediately.",
      ],
    };
  }

  const isUsed = getProductCondition(product) === "Used Product";
  const category = normalizeCategory(product.category) || "Networking";

  // Category specific customizations
  switch (category) {
    case "Routing":
      return isUsed
        ? {
            condition: "Used Product",
            isUsed: true,
            category: "Routing",
            warrantyPeriod: "3 Days",
            warrantyType: "Testing & Checking Warranty",
            badge: "3-Day Checking Warranty",
            shortSummary: "3-day hardware testing warranty · Inspected & port-verified pre-owned",
            conditionTerms:
              "Certified pre-owned equipment. Thoroughly cleaned, reset to factory defaults, and bench-tested prior to dispatch.",
            categoryTerms:
              "Covers WAN/LAN port connectivity, power supply, and router OS firmware boot. Faulty units are exchanged within 3 days.",
            eligibleItems: [
              "Hardware malfunction, port failure, or failure to boot within 3 days of delivery",
              "Must be returned with the original power adapter and accessories supplied",
              "Tamper-evident warranty seals must remain intact and undamaged",
            ],
            ineligibleItems: [
              "Custom firmware flashing (bricked devices) or configuration errors",
              "Electrical surge damage, lightning strikes, or burnt RJ45/SFP ports",
              "Change of mind or cosmetic blemishes typical of pre-owned gear",
            ],
            claimProcess: defaultClaimProcess("3 days"),
          }
        : {
            condition: "New Product",
            isUsed: false,
            category: "Routing",
            warrantyPeriod: "7 Days",
            warrantyType: "Replacement Guarantee",
            badge: "7-Day Replacement",
            shortSummary: "7-day replacement for manufacturing defects · Brand new & factory sealed",
            conditionTerms:
              "100% genuine brand-new sealed unit with complete manufacturer warranty support.",
            categoryTerms:
              "Covers manufacturing defects and Dead-on-Arrival (DOA). Free replacement if defective within 7 days.",
            eligibleItems: [
              "Unopened sealed packaging with intact factory security tapes",
              "Defective hardware verified by technical team within 7 days of delivery",
              "Complete box contents (antennas, power brick, patch cable, manuals)",
            ],
            ineligibleItems: [
              "Opened box items with no hardware fault (change of mind)",
              "Physical damage, broken antennas, or electrical burn from unstable power",
              "Voided manufacturer serial numbers",
            ],
            claimProcess: defaultClaimProcess("7 days"),
          };

    case "Switching":
      return isUsed
        ? {
            condition: "Used Product",
            isUsed: true,
            category: "Switching",
            warrantyPeriod: "3 Days",
            warrantyType: "Checking Warranty",
            badge: "3-Day Checking Warranty",
            shortSummary: "3-day testing warranty · All RJ45 & SFP ports bench-tested",
            conditionTerms:
              "Tested enterprise pre-owned switch. Rack ears and power cord included where specified.",
            categoryTerms:
              "Covers port link detection, backplane switching, fan operation, and PoE power delivery on tested ports.",
            eligibleItems: [
              "Dead ports, PoE delivery failure, or PSU faults detected within 3 days",
              "Returned in same physical condition with Wasooli warranty sticker intact",
            ],
            ineligibleItems: [
              "Burnt PCB tracks or surge damage from direct power fluctuation",
              "Physical chassis dents caused during user rack installation",
            ],
            claimProcess: defaultClaimProcess("3 days"),
          }
        : {
            condition: "New Product",
            isUsed: false,
            category: "Switching",
            warrantyPeriod: "7 Days",
            warrantyType: "Replacement Guarantee",
            badge: "7-Day Replacement",
            shortSummary: "7-day replacement for defective units · Brand new factory sealed",
            conditionTerms:
              "Brand new in sealed box. Standard vendor warranty included.",
            categoryTerms:
              "Full exchange available if switch fails port testing or power-on test out of the box.",
            eligibleItems: [
              "Dead on arrival (DOA) or internal PSU failure within 7 days",
              "Sealed packaging for return or exchange request",
              "Original rackmount brackets, power cord, and console cable included",
            ],
            ineligibleItems: [
              "Scratched rack ears from mounting before testing",
              "Blown ports caused by outdoor unshielded surge",
            ],
            claimProcess: defaultClaimProcess("7 days"),
          };

    case "Wireless":
      return isUsed
        ? {
            condition: "Used Product",
            isUsed: true,
            category: "Wireless",
            warrantyPeriod: "3 Days",
            warrantyType: "RF & Checking Warranty",
            badge: "3-Day Testing Warranty",
            shortSummary: "3-day RF & Wi-Fi signal test warranty · Clean pre-owned",
            conditionTerms:
              "Refurbished / pre-owned access point or bridge. RF radiation and dual-band broadcasting verified.",
            categoryTerms:
              "Covers 2.4GHz / 5GHz radio transmission, PoE negotiation, and controller adoption.",
            eligibleItems: [
              "Radio hardware failure or refusal to broadcast SSID within 3 days",
              "Complete with supplied mounting plate and power adapter",
            ],
            ineligibleItems: [
              "Outdoor water ingress on improperly mounted units",
              "Radio chip blowout from operating high-gain antennas without load",
            ],
            claimProcess: defaultClaimProcess("3 days"),
          }
        : {
            condition: "New Product",
            isUsed: false,
            category: "Wireless",
            warrantyPeriod: "7 Days",
            warrantyType: "Replacement Guarantee",
            badge: "7-Day Replacement",
            shortSummary: "7-day replacement for Wi-Fi hardware defects · Sealed retail unit",
            conditionTerms:
              "Factory fresh with official vendor warranty. Includes all ceiling/wall mounts.",
            categoryTerms:
              "Covers radio defects, antenna connectivity, and controller cloud adoption.",
            eligibleItems: [
              "Hardware malfunction within 7 days of delivery",
              "Sealed box or verified DOA with intact mounting accessories",
            ],
            ineligibleItems: [
              "Environment-related range issues (thick concrete walls / interference)",
              "Damage from external lightning or outdoor exposure without grounding",
            ],
            claimProcess: defaultClaimProcess("7 days"),
          };

    case "Network Security":
      return isUsed
        ? {
            condition: "Used Product",
            isUsed: true,
            category: "Network Security",
            warrantyPeriod: "3 Days",
            warrantyType: "Hardware Testing Warranty",
            badge: "3-Day Hardware Warranty",
            shortSummary: "3-day hardware warranty · Firewall boot & interface verified",
            conditionTerms:
              "Certified pre-owned security appliance. Hardware only; licenses subject to vendor transfer.",
            categoryTerms:
              "Covers appliance hardware, console access, throughput interfaces, and power supplies.",
            eligibleItems: [
              "Hardware interface failure or memory/boot fault within 3 days",
              "Warranty seal intact",
            ],
            ineligibleItems: [
              "Cloud UTM license expiry or subscription renewals (hardware only warranty)",
              "Software configuration lockout or bricking during firmware upgrade",
            ],
            claimProcess: defaultClaimProcess("3 days"),
          }
        : {
            condition: "New Product",
            isUsed: false,
            category: "Network Security",
            warrantyPeriod: "7 Days",
            warrantyType: "Hardware Replacement",
            badge: "7-Day Hardware Replacement",
            shortSummary: "7-day hardware replacement · Non-returnable once software license registered",
            conditionTerms:
              "Brand new enterprise security appliance with original license certificate.",
            categoryTerms:
              "IMPORTANT: Once the device is registered to your vendor portal (e.g. FortiCloud, Sophos Central, Cisco Meraki), the unit CANNOT be returned or exchanged.",
            eligibleItems: [
              "Hardware defect verified prior to vendor cloud license activation",
              "Unopened sealed retail box with original security seal intact",
            ],
            ineligibleItems: [
              "Appliances with registered cloud license keys or activated subscriptions",
              "Tampered warranty labels or opened software vouchers",
            ],
            claimProcess: defaultClaimProcess("7 days"),
          };

    case "Optical & Fiber":
      return isUsed
        ? {
            condition: "Used Product",
            isUsed: true,
            category: "Optical & Fiber",
            warrantyPeriod: "3 Days",
            warrantyType: "Optical Link Warranty",
            badge: "3-Day Optical Link Warranty",
            shortSummary: "3-day optical link test warranty · TX/RX laser power verified",
            conditionTerms:
              "Tested optical transceivers / media converters with clean optics.",
            categoryTerms:
              "Covers optical link establishment, DDM/DOM telemetry, and laser transmission.",
            eligibleItems: [
              "Transceiver failed link test or DOM telemetry within 3 days",
              "Dust caps must be reinstalled when returning",
            ],
            ineligibleItems: [
              "Scratched or dirty optical ferrules caused by inserting contaminated patch cords",
              "Custom cut-to-order fiber spools",
            ],
            claimProcess: defaultClaimProcess("3 days"),
          }
        : {
            condition: "New Product",
            isUsed: false,
            category: "Optical & Fiber",
            warrantyPeriod: "7 Days",
            warrantyType: "Replacement Guarantee",
            badge: "7-Day Replacement",
            shortSummary: "7-day replacement for transceivers & converters · Sealed anti-static pack",
            conditionTerms:
              "Factory sealed in anti-static blister packs with protective dust caps.",
            categoryTerms:
              "Covers laser failure or switch compatibility issues within 7 days. Custom-length fiber cables non-returnable.",
            eligibleItems: [
              "Defective optical transceiver or media converter within 7 days",
              "Factory sealed anti-static packaging with dust caps present",
            ],
            ineligibleItems: [
              "Custom-terminated or pulled fiber cables",
              "Burned optical receiver from connecting High-Power optics without attenuation",
            ],
            claimProcess: defaultClaimProcess("7 days"),
          };

    case "Cabling & Connectivity":
      return isUsed
        ? {
            condition: "Used Product",
            isUsed: true,
            category: "Cabling & Connectivity",
            warrantyPeriod: "2 Days",
            warrantyType: "Continuity Test Warranty",
            badge: "2-Day Continuity Warranty",
            shortSummary: "2-day continuity test warranty · Pins 1-8 verified",
            conditionTerms:
              "Pre-owned / surplus patch cables and structured copper accessories.",
            categoryTerms:
              "Covers wire continuity and pinout mapping.",
            eligibleItems: [
              "Cable fails 8-pin continuity test on cable tester within 2 days",
            ],
            ineligibleItems: [
              "Cables that have been pulled through conduit, cut, or crimped",
            ],
            claimProcess: defaultClaimProcess("2 days"),
          }
        : {
            condition: "New Product",
            isUsed: false,
            category: "Cabling & Connectivity",
            warrantyPeriod: "3 Days",
            warrantyType: "Sealed Exchange Policy",
            badge: "3-Day Sealed Exchange",
            shortSummary: "3-day exchange on uncut & factory sealed packs · Cut cables non-returnable",
            conditionTerms:
              "Factory sealed bags (patch cables) or 305m wooden/plastic reel boxes.",
            categoryTerms:
              "Exchanges allowed for unopened rolls and sealed patch cables. Cut-to-length cables, opened keystone packs, or altered patch cords are strictly non-returnable.",
            eligibleItems: [
              "Uncut 305m cable box with original factory plastic wrap intact",
              "Unopened manufacturer patch cord packets within 3 days",
            ],
            ineligibleItems: [
              "Any cable that has been pulled, cut, stripped, or terminated",
              "Opened keystone jack multipacks",
            ],
            claimProcess: defaultClaimProcess("3 days"),
          };

    case "PoE":
      return isUsed
        ? {
            condition: "Used Product",
            isUsed: true,
            category: "PoE",
            warrantyPeriod: "3 Days",
            warrantyType: "Checking Warranty",
            badge: "3-Day Checking Warranty",
            shortSummary: "3-day testing warranty · Voltage & wattage delivery verified",
            conditionTerms:
              "Tested pre-owned PoE injectors and splitters with verified output.",
            categoryTerms:
              "Covers 802.3af/at/bt power delivery and Gigabit data passthrough.",
            eligibleItems: [
              "Injector fails to power standard PoE device within 3 days",
            ],
            ineligibleItems: [
              "Burnt injector from passive 24V/48V mismatch with incompatible device",
            ],
            claimProcess: defaultClaimProcess("3 days"),
          }
        : {
            condition: "New Product",
            isUsed: false,
            category: "PoE",
            warrantyPeriod: "7 Days",
            warrantyType: "Replacement Guarantee",
            badge: "7-Day Replacement",
            shortSummary: "7-day replacement for power delivery defects · Sealed pack",
            conditionTerms:
              "Brand new in retail box with manufacturer power cord.",
            categoryTerms:
              "Covers power supply defects, handshake negotiation, and data passthrough.",
            eligibleItems: [
              "Hardware defect or failure to negotiate PoE within 7 days",
              "Complete original box and power cord",
            ],
            ineligibleItems: [
              "Burned pinouts due to water entering outdoor RJ45 socket",
            ],
            claimProcess: defaultClaimProcess("7 days"),
          };

    case "Adapters & NICs":
      return isUsed
        ? {
            condition: "Used Product",
            isUsed: true,
            category: "Adapters & NICs",
            warrantyPeriod: "3 Days",
            warrantyType: "Link & Bus Detection Warranty",
            badge: "3-Day Checking Warranty",
            shortSummary: "3-day checking warranty · PCIe/USB link speed verified",
            conditionTerms:
              "Tested server-pull or desktop network interface cards and adapters.",
            categoryTerms:
              "Covers PCIe bus detection, Windows/Linux driver compatibility, and rated link speed.",
            eligibleItems: [
              "Card not detected in PCIe slot or fails link speed negotiation within 3 days",
            ],
            ineligibleItems: [
              "Gold connector teeth scratched or chipped from improper slot insertion",
            ],
            claimProcess: defaultClaimProcess("3 days"),
          }
        : {
            condition: "New Product",
            isUsed: false,
            category: "Adapters & NICs",
            warrantyPeriod: "7 Days",
            warrantyType: "Replacement Guarantee",
            badge: "7-Day Replacement",
            shortSummary: "7-day replacement for chipset/hardware defects · Sealed box",
            conditionTerms:
              "Brand new retail packaging with standard and low-profile brackets.",
            categoryTerms:
              "Covers hardware failure and link speed defects within 7 days.",
            eligibleItems: [
              "Hardware defect in card or adapter within 7 days",
              "Original box, driver CD (if any), and both brackets returned",
            ],
            ineligibleItems: [
              "Physical PCB cracks or bent bracket from forced case installation",
            ],
            claimProcess: defaultClaimProcess("7 days"),
          };

    case "Power & Racks":
      return isUsed
        ? {
            condition: "Used Product",
            isUsed: true,
            category: "Power & Racks",
            warrantyPeriod: "3 Days",
            warrantyType: "Testing Warranty",
            badge: "3-Day Testing Warranty",
            shortSummary: "3-day testing warranty · PDU sockets & UPS load tested",
            conditionTerms:
              "Clean pre-owned server racks, PDUs, and UPS units.",
            categoryTerms:
              "Covers socket power delivery, surge protection indicator, and UPS inverter load.",
            eligibleItems: [
              "PDU socket power failure or UPS inverter fault within 3 days",
            ],
            ineligibleItems: [
              "Overloaded UPS with damaged inverter or expanded batteries",
              "Racks assembled and scratched on site",
            ],
            claimProcess: defaultClaimProcess("3 days"),
          }
        : {
            condition: "New Product",
            isUsed: false,
            category: "Power & Racks",
            warrantyPeriod: "7 Days",
            warrantyType: "Exchange Guarantee",
            badge: "7-Day Exchange",
            shortSummary: "7-day exchange for electrical faults · Assembled racks non-returnable",
            conditionTerms:
              "Brand new in carton packaging. UPS includes fresh battery warranty.",
            categoryTerms:
              "Covers electrical defects on PDUs and UPS units. Server racks cannot be returned once unboxed and assembled.",
            eligibleItems: [
              "Electrical defect in PDU/UPS within 7 days",
              "Unassembled server rack in original wooden/carton crate",
            ],
            ineligibleItems: [
              "Server racks with assembly scratches or cage nut marks",
              "UPS battery drained below recovery voltage due to storage without charging",
            ],
            claimProcess: defaultClaimProcess("7 days"),
          };

    case "Tools & Accessories":
      return isUsed
        ? {
            condition: "Used Product",
            isUsed: true,
            category: "Tools & Accessories",
            warrantyPeriod: "3 Days",
            warrantyType: "Tester Checking Warranty",
            badge: "3-Day Testing Warranty",
            shortSummary: "3-day testing warranty for digital testers · Hand tools as-inspected",
            conditionTerms:
              "Inspected testing equipment, toner probes, and toolkit accessories.",
            categoryTerms:
              "Covers LCD screen operation, tone generator signal, and continuity testing.",
            eligibleItems: [
              "Digital tester screen fault or toner signal failure within 3 days",
            ],
            ineligibleItems: [
              "Hand crimpers or punch tools that have been used on job sites",
              "Burnt tester ports from connecting tester to live PoE switch port",
            ],
            claimProcess: defaultClaimProcess("3 days"),
          }
        : {
            condition: "New Product",
            isUsed: false,
            category: "Tools & Accessories",
            warrantyPeriod: "3 Days",
            warrantyType: "Manufacturing Defect Exchange",
            badge: "3-Day Inspection Exchange",
            shortSummary: "3-day exchange for out-of-box defects · Job-used tools non-returnable",
            conditionTerms:
              "Brand new in blister packaging or toolkit carrying case.",
            categoryTerms:
              "Exchange available only for factory defects (e.g. cracked tester screen, misaligned crimper jaw). Tools used on cabling jobs cannot be returned.",
            eligibleItems: [
              "Manufacturing defect noticed immediately upon unboxing within 3 days",
              "Complete original blister pack or pouch with all tester remotes/batteries",
            ],
            ineligibleItems: [
              "Tools with visible job site wear, scuffs, blade dullness, or job-residue",
              "Testers connected to active PoE switches (blown tester chip)",
            ],
            claimProcess: defaultClaimProcess("3 days"),
          };

    default:
      return isUsed
        ? {
            condition: "Used Product",
            isUsed: true,
            category,
            warrantyPeriod: "3 Days",
            warrantyType: "Checking Warranty",
            badge: "3-Day Checking Warranty",
            shortSummary: "3-day hardware testing warranty for pre-owned equipment",
            conditionTerms:
              "Pre-owned equipment tested for basic operational functionality.",
            categoryTerms: "Covers hardware defects identified within 3 days of delivery.",
            eligibleItems: ["Hardware failure within 3 days", "Warranty seal intact"],
            ineligibleItems: ["Physical damage, power surge, or moisture"],
            claimProcess: defaultClaimProcess("3 days"),
          }
        : {
            condition: "New Product",
            isUsed: false,
            category,
            warrantyPeriod: "7 Days",
            warrantyType: "Replacement Guarantee",
            badge: "7-Day Replacement",
            shortSummary: "7-day replacement for factory defects · Brand new sealed packaging",
            conditionTerms: "Brand new sealed product in original retail box.",
            categoryTerms: "Covers manufacturing defects and DOA within 7 days.",
            eligibleItems: ["Factory defect or DOA within 7 days", "Original packaging intact"],
            ineligibleItems: ["Change of mind after opening seal", "Physical damage"],
            claimProcess: defaultClaimProcess("7 days"),
          };
  }
}

function defaultClaimProcess(days) {
  return [
    `1. Contact Wasooli Store support within ${days} of delivery with your Order ID.`,
    "2. Send a short video or photos showing the product serial number and the issue.",
    "3. Our technical team verifies the claim and dispatches a replacement immediately.",
  ];
}
