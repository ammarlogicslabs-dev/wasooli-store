/**
 * Premium 3D-styled Duotone / Multi-layer Networking Icons with vibrant theme gradients.
 * Designed with rich depth, subtle highlights, glowing accents, and high visual impact.
 */

/* 1. Routing - Dual-antenna high-throughput router with signal waves & LEDs */
export function RoutingIcon({ size = 30, className = "", ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      {...rest}
    >
      <defs>
        <linearGradient id="rout-body" x1="2" y1="14" x2="30" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2c9aff" />
          <stop offset="50%" stopColor="#1676d2" />
          <stop offset="100%" stopColor="#0d47a1" />
        </linearGradient>
        <linearGradient id="rout-antenna" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="rout-accent" x1="6" y1="23" x2="26" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>

      {/* Signal radiation waves above antennas */}
      <path d="M4 6a14 14 0 0 1 6-4" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
      <path d="M22 2a14 14 0 0 1 6 4" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />

      {/* Left antenna */}
      <line x1="8" y1="5" x2="8" y2="17" stroke="url(#rout-antenna)" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="8" cy="4.5" r="1.8" fill="#38bdf8" />

      {/* Right antenna */}
      <line x1="24" y1="5" x2="24" y2="17" stroke="url(#rout-antenna)" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="24" cy="4.5" r="1.8" fill="#38bdf8" />

      {/* Center antenna */}
      <line x1="16" y1="7" x2="16" y2="17" stroke="url(#rout-antenna)" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="16" cy="6.5" r="1.6" fill="#67e8f9" />

      {/* Main router chassis shadow / base */}
      <rect x="2.5" y="16.5" width="27" height="11" rx="4" fill="#0c2d58" opacity="0.3" />

      {/* Main chassis body */}
      <rect x="2" y="15" width="28" height="11.5" rx="3.5" fill="url(#rout-body)" />

      {/* Top bevel highlight */}
      <path d="M4 16.5h24" stroke="#7ec4ff" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />

      {/* Front glossy ventilation band */}
      <rect x="5" y="21.5" width="22" height="2.5" rx="1.2" fill="#0a2a50" opacity="0.6" />

      {/* Activity LEDs */}
      <circle cx="7.5" cy="22.7" r="1" fill="#4ade80" />
      <circle cx="11.5" cy="22.7" r="1" fill="#4ade80" />
      <circle cx="15.5" cy="22.7" r="1" fill="#38bdf8" />
      <circle cx="19.5" cy="22.7" r="1" fill="#38bdf8" />
      <rect x="22.5" y="22.1" width="3.5" height="1.2" rx="0.6" fill="#67e8f9" />
    </svg>
  );
}

/* 2. Switching - Rackmount gigabit switch with Ethernet ports & status matrix */
export function SwitchingIcon({ size = 30, className = "", ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      {...rest}
    >
      <defs>
        <linearGradient id="sw-body" x1="1" y1="8" x2="31" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4338ca" />
          <stop offset="45%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="sw-plate" x1="4" y1="12" x2="28" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>

      {/* Chassis base */}
      <rect x="1.5" y="9" width="29" height="15" rx="3.5" fill="url(#sw-body)" />
      {/* Front panel recess */}
      <rect x="3.5" y="11.5" width="25" height="10" rx="2" fill="url(#sw-plate)" />

      {/* Top highlight */}
      <path d="M3.5 10.2h25" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round" opacity="0.6" />

      {/* RJ45 Ports row (4 dual port banks) */}
      {[
        { x: 5.5, led: "#4ade80" },
        { x: 10.5, led: "#4ade80" },
        { x: 15.5, led: "#38bdf8" },
        { x: 20.5, led: "#fbbf24" },
      ].map((port, i) => (
        <g key={i}>
          {/* LED activity lights */}
          <circle cx={port.x + 1.6} cy="13.2" r="0.75" fill={port.led} />
          {/* Port cutout */}
          <rect x={port.x} y="15" width="3.2" height="4.5" rx="0.8" fill="#334155" />
          {/* Gold pins */}
          <line x1={port.x + 0.8} y1="15.8" x2={port.x + 2.4} y2="15.8" stroke="#fbbf24" strokeWidth="0.8" strokeLinecap="round" />
        </g>
      ))}

      {/* SFP Uplink cage on right */}
      <rect x="25" y="14" width="2.6" height="5.5" rx="0.7" fill="#475569" stroke="#60a5fa" strokeWidth="0.6" />
      <circle cx="26.3" cy="13" r="0.6" fill="#a855f7" />

      {/* Rack ears with mounting screw holes */}
      <circle cx="2.7" cy="16.5" r="0.8" fill="#94a3b8" />
      <circle cx="29.3" cy="16.5" r="0.8" fill="#94a3b8" />
    </svg>
  );
}

/* 3. Wireless - High-gain AP with omni-directional radiating wavefronts */
export function WirelessIcon({ size = 30, className = "", ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      {...rest}
    >
      <defs>
        <linearGradient id="wifi-grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <radialGradient id="wifi-core" cx="16" cy="23" r="5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="60%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </radialGradient>
      </defs>

      {/* Outer radiation arc */}
      <path
        d="M3 8a18.5 18.5 0 0 1 26 0"
        stroke="url(#wifi-grad)"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.95"
      />
      {/* Mid radiation arc */}
      <path
        d="M7.5 13a12.5 12.5 0 0 1 17 0"
        stroke="url(#wifi-grad)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Inner radiation arc */}
      <path
        d="M12 18a6.5 6.5 0 0 1 8 0"
        stroke="url(#wifi-grad)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Central transmitter emitter node */}
      <circle cx="16" cy="24" r="3.2" fill="url(#wifi-core)" />
      <circle cx="16" cy="24" r="1.4" fill="#ffffff" />
      {/* Pulse ring */}
      <circle cx="16" cy="24" r="4.8" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" opacity="0.75" />
    </svg>
  );
}

/* 4. Network Security - Shield with glowing padlock & firewall mesh */
export function NetworkSecurityIcon({ size = 30, className = "", ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      {...rest}
    >
      <defs>
        <linearGradient id="sec-shield" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
        <linearGradient id="sec-gold" x1="11" y1="12" x2="21" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      {/* Shield backdrop glow */}
      <path
        d="M16 2.5 5 7.2v8.5c0 7.2 4.7 13.6 11 15.5 6.3-1.9 11-8.3 11-15.5V7.2L16 2.5z"
        fill="url(#sec-shield)"
      />
      {/* Inner cyber defense border */}
      <path
        d="M16 5 7.2 8.8v6.9c0 5.6 3.7 10.8 8.8 12.3 5.1-1.5 8.8-6.7 8.8-12.3V8.8L16 5z"
        stroke="#38bdf8"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      {/* Padlock shackle */}
      <path
        d="M12.5 14v-2.2a3.5 3.5 0 0 1 7 0V14"
        stroke="#fef08a"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Padlock solid body */}
      <rect x="10.5" y="14" width="11" height="8.5" rx="2" fill="url(#sec-gold)" />

      {/* Keyhole */}
      <circle cx="16" cy="17.2" r="1.3" fill="#451a03" />
      <path d="M15.3 17.5 14.8 20.5h2.4l-.5-3z" fill="#451a03" />
    </svg>
  );
}

/* 5. Optical & Fiber - Dual LC fiber optic strands with glowing beam tips */
export function OpticalFiberIcon({ size = 30, className = "", ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      {...rest}
    >
      <defs>
        <linearGradient id="fib-body" x1="2" y1="10" x2="10" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="fib-laser1" x1="10" y1="16" x2="28" y2="7" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="70%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
        <linearGradient id="fib-laser2" x1="10" y1="16" x2="28" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="70%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* Ferrule / connector housing */}
      <rect x="2" y="9.5" width="8" height="13" rx="2.5" fill="url(#fib-body)" />
      <rect x="10" y="11.5" width="2.5" height="4" rx="0.6" fill="#cbd5e1" />
      <rect x="10" y="16.5" width="2.5" height="4" rx="0.6" fill="#cbd5e1" />

      {/* Top fiber optic wave strand */}
      <path
        d="M12.5 13.5c4.5 0 5-6 10-6h4"
        stroke="url(#fib-laser1)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* Center fiber strand */}
      <path
        d="M12.5 16h14.5"
        stroke="#38bdf8"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Bottom fiber strand */}
      <path
        d="M12.5 18.5c4.5 0 5 6 10 6h4"
        stroke="url(#fib-laser2)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* Luminescent laser tip blooms */}
      <circle cx="27" cy="7.5" r="2.5" fill="#f43f5e" />
      <circle cx="27" cy="7.5" r="1.1" fill="#fff" />

      <circle cx="27.5" cy="16" r="2.2" fill="#38bdf8" />
      <circle cx="27.5" cy="16" r="1" fill="#fff" />

      <circle cx="27" cy="24.5" r="2.5" fill="#8b5cf6" />
      <circle cx="27" cy="24.5" r="1.1" fill="#fff" />
    </svg>
  );
}

/* 6. Cabling & Connectivity - High-speed Cat8 RJ45 connector with gold pins */
export function CablingIcon({ size = 30, className = "", ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      {...rest}
    >
      <defs>
        <linearGradient id="cab-body" x1="7" y1="3" x2="25" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="40%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="cab-cord" x1="12" y1="20" x2="20" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* Flexible strain-relief boot */}
      <path
        d="M12 20h8v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-8z"
        fill="url(#cab-cord)"
      />
      {/* Cord segment lines */}
      <line x1="12" y1="23.5" x2="20" y2="23.5" stroke="#334155" strokeWidth="1" />
      <line x1="12" y1="26.5" x2="20" y2="26.5" stroke="#334155" strokeWidth="1" />

      {/* RJ45 Modular Plug Body */}
      <path
        d="M9.5 4h13v10.5h3v5.5H6.5v-5.5h3V4z"
        fill="url(#cab-body)"
      />

      {/* Retention snap latch */}
      <path
        d="M13 3h6v4.5a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 13 7.5V3z"
        fill="#93c5fd"
        opacity="0.9"
      />

      {/* Gold plated 8-pin contact teeth */}
      <line x1="11.5" y1="6.5" x2="11.5" y2="11.5" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="13.5" y1="6.5" x2="13.5" y2="11.5" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="15.5" y1="6.5" x2="15.5" y2="11.5" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="17.5" y1="6.5" x2="17.5" y2="11.5" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="19.5" y1="6.5" x2="19.5" y2="11.5" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" />

      {/* Metallic clip latch bevel */}
      <path d="M7 17.5h18" stroke="#60a5fa" strokeWidth="1.2" opacity="0.6" />
    </svg>
  );
}

/* 7. PoE - Power over Ethernet (Electric Energy Bolt + RJ45) */
export function PoeIcon({ size = 30, className = "", ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      {...rest}
    >
      <defs>
        <linearGradient id="poe-box" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="50%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <linearGradient id="poe-bolt" x1="13" y1="5" x2="19" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>

      {/* PoE Injector chassis */}
      <rect x="4" y="3.5" width="24" height="25" rx="5" fill="url(#poe-box)" stroke="#38bdf8" strokeWidth="1.2" />

      {/* Subtle ports on top & bottom */}
      <rect x="12" y="2" width="8" height="2.5" rx="0.8" fill="#334155" />
      <rect x="12" y="27.5" width="8" height="2.5" rx="0.8" fill="#334155" />

      {/* Radiant High Voltage Lightning Bolt */}
      <path
        d="M17.5 5.5 10 16h5.5l-2.5 10.5 10-12.5h-6l3-8.5z"
        fill="url(#poe-bolt)"
      />

      {/* Glow sparks */}
      <circle cx="21" cy="9" r="1" fill="#fef08a" />
      <circle cx="8" cy="22" r="1" fill="#38bdf8" />
    </svg>
  );
}

/* 8. Adapters & NICs - High-speed PCIe Network Interface Card */
export function AdaptersNicIcon({ size = 30, className = "", ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      {...rest}
    >
      <defs>
        <linearGradient id="nic-pcb" x1="4" y1="8" x2="28" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="60%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="nic-bracket" x1="2" y1="2" x2="5" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      {/* PCI Metal I/O Bracket */}
      <rect x="2" y="3" width="3.5" height="26" rx="1.2" fill="url(#nic-bracket)" />

      {/* Green Circuit Board (PCB) */}
      <rect x="5.5" y="7.5" width="23.5" height="15" rx="2.5" fill="url(#nic-pcb)" />

      {/* Gold PCIe bus pins */}
      <rect x="10" y="22.5" width="13" height="3" rx="0.5" fill="#facc15" />
      <line x1="12" y1="22.5" x2="12" y2="25.5" stroke="#78350f" strokeWidth="0.6" />
      <line x1="14" y1="22.5" x2="14" y2="25.5" stroke="#78350f" strokeWidth="0.6" />
      <line x1="16" y1="22.5" x2="16" y2="25.5" stroke="#78350f" strokeWidth="0.6" />
      <line x1="18" y1="22.5" x2="18" y2="25.5" stroke="#78350f" strokeWidth="0.6" />
      <line x1="20" y1="22.5" x2="20" y2="25.5" stroke="#78350f" strokeWidth="0.6" />

      {/* Network Controller Processor Chip */}
      <rect x="18" y="11" width="7" height="7" rx="1.2" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />
      <circle cx="21.5" cy="14.5" r="1.4" fill="#38bdf8" />

      {/* RJ45 Shielded Port on Bracket */}
      <rect x="5" y="10.5" width="6" height="8" rx="1.2" fill="#334155" stroke="#e2e8f0" strokeWidth="0.8" />
      <rect x="6.5" y="12.5" width="3.5" height="4" fill="#0f172a" />
    </svg>
  );
}

/* 9. Power & Racks - Datacenter Server Rack Unit with LED blades */
export function PowerRacksIcon({ size = 30, className = "", ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      {...rest}
    >
      <defs>
        <linearGradient id="rack-frame" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* 19-inch Server Cabinet Outer Frame */}
      <rect x="4.5" y="2.5" width="23" height="27" rx="3.5" fill="url(#rack-frame)" stroke="#475569" strokeWidth="1.2" />

      {/* Server Blade 1 */}
      <rect x="7" y="5.5" width="18" height="4.5" rx="1" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.6" />
      <circle cx="9.5" cy="7.7" r="1" fill="#4ade80" />
      <circle cx="12.5" cy="7.7" r="1" fill="#38bdf8" />
      <line x1="16" y1="7.7" x2="22" y2="7.7" stroke="#475569" strokeWidth="1" strokeLinecap="round" />

      {/* Server Blade 2 */}
      <rect x="7" y="11.5" width="18" height="4.5" rx="1" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.6" />
      <circle cx="9.5" cy="13.7" r="1" fill="#4ade80" />
      <circle cx="12.5" cy="13.7" r="1" fill="#facc15" />
      <line x1="16" y1="13.7" x2="22" y2="13.7" stroke="#475569" strokeWidth="1" strokeLinecap="round" />

      {/* Server Blade 3 (PDU / Power Unit) */}
      <rect x="7" y="17.5" width="18" height="4.5" rx="1" fill="#0f172a" stroke="#f59e0b" strokeWidth="0.6" />
      <circle cx="9.5" cy="19.7" r="1" fill="#ef4444" />
      <rect x="13" y="18.7" width="3" height="2" rx="0.5" fill="#f59e0b" />
      <rect x="18" y="18.7" width="5" height="2" rx="0.5" fill="#334155" />

      {/* Bottom ventilation grill */}
      <rect x="7" y="23.5" width="18" height="3" rx="0.8" fill="#1e293b" />
      <line x1="9" y1="25" x2="23" y2="25" stroke="#64748b" strokeWidth="1" strokeDasharray="1.5 1.5" />
    </svg>
  );
}

/* 10. Tools & Accessories - Network crimper & precision tool */
export function ToolsAccessoriesIcon({ size = 30, className = "", ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      {...rest}
    >
      <defs>
        <linearGradient id="tool-metal" x1="8" y1="2" x2="24" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="40%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="tool-grip" x1="14" y1="12" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="60%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
      </defs>

      {/* Main chrome tool body */}
      <path
        transform="rotate(45 16 16)"
        d="M19 3a6 6 0 0 1 6 6v3h-3.5L20 8.5 16 12.5 19.5 16H16V28a3 3 0 0 1-6 0V16h-3.5L10 12.5 14 8.5 10.5 5H14V3h5z"
        fill="url(#tool-metal)"
      />

      {/* High-visibility ergonomic rubber grip handles */}
      <rect
        x="6"
        y="18"
        width="6.5"
        height="12"
        rx="2.5"
        transform="rotate(-45 6 18)"
        fill="url(#tool-grip)"
      />
      <rect
        x="20"
        y="18"
        width="6.5"
        height="12"
        rx="2.5"
        transform="rotate(45 20 18)"
        fill="url(#tool-grip)"
      />

      {/* Center pivot bolt */}
      <circle cx="16" cy="16" r="2.2" fill="#1e293b" />
      <circle cx="16" cy="16" r="1.1" fill="#f8fafc" />
    </svg>
  );
}