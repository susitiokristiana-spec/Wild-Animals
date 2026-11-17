import React from 'react';
import { AnimalId } from '../data/animals';

interface AnimalArtworkProps {
  animalId: AnimalId;
  isShadow?: boolean;
  className?: string;
}

const LEFT_FACING_ANIMALS: ReadonlySet<AnimalId> = new Set([
  'harimau',
  'buaya',
  'serigala',
  'badak',
  'hiu',
]);

export const AnimalArtwork: React.FC<AnimalArtworkProps> = ({
  animalId,
  isShadow = false,
  className = 'w-full h-full',
}) => {
  const shadowStyle: React.CSSProperties | undefined = isShadow
    ? { filter: 'brightness(0) opacity(0.84)' }
    : undefined;
  const flipClass = LEFT_FACING_ANIMALS.has(animalId) ? '-scale-x-100' : '';

  return (
    <div
      className={`relative flex items-center justify-center select-none pointer-events-none ${flipClass} ${className}`}
      style={shadowStyle}
      aria-hidden="true"
    >
      {animalId === 'singa' && <SingaSvg />}
      {animalId === 'harimau' && <HarimauSvg />}
      {animalId === 'buaya' && <BuayaSvg />}
      {animalId === 'beruang' && <BeruangSvg />}
      {animalId === 'serigala' && <SerigalaSvg />}
      {animalId === 'badak' && <BadakSvg />}
      {animalId === 'hiu' && <HiuSvg />}
      {animalId === 'elang' && <ElangSvg />}
    </div>
  );
};

function SingaSvg() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
      {/* Tail curving left with tuft */}
      <path
        d="M55 142 C24 140, 18 106, 36 86"
        fill="none"
        stroke="#D97706"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M36 86 C26 76, 30 62, 42 64 C52 66, 52 80, 36 86 Z"
        fill="#92400E"
      />
      {/* Sitting Body */}
      <ellipse cx="105" cy="144" rx="44" ry="34" fill="#F59E0B" />
      <ellipse cx="108" cy="148" rx="26" ry="22" fill="#FDE68A" />
      {/* Hind & Front Paws */}
      <ellipse cx="78" cy="173" rx="15" ry="9" fill="#D97706" />
      <ellipse cx="132" cy="173" rx="15" ry="9" fill="#D97706" />
      <rect x="86" y="136" width="14" height="38" rx="7" fill="#FBBF24" />
      <rect x="114" y="136" width="14" height="38" rx="7" fill="#FBBF24" />
      <ellipse cx="93" cy="175" rx="10" ry="7" fill="#F59E0B" />
      <ellipse cx="121" cy="175" rx="10" ry="7" fill="#F59E0B" />

      {/* Big Scalloped Mane (iconic silhouette!) */}
      <path
        d="M106 24
           C118 22, 128 28, 134 36
           C144 34, 154 42, 154 54
           C164 60, 166 72, 158 82
           C164 92, 158 104, 146 108
           C144 120, 132 126, 120 122
           C112 130, 98 130, 90 122
           C78 126, 66 118, 66 106
           C54 102, 48 90, 54 80
           C46 70, 50 56, 60 52
           C60 40, 70 32, 80 34
           C86 24, 96 22, 106 24 Z"
        fill="#92400E"
      />
      {/* Round Ears peeking out */}
      <circle cx="72" cy="46" r="11" fill="#F59E0B" />
      <circle cx="72" cy="46" r="6" fill="#78350F" />
      <circle cx="140" cy="46" r="11" fill="#F59E0B" />
      <circle cx="140" cy="46" r="6" fill="#78350F" />

      {/* Face */}
      <circle cx="106" cy="78" r="34" fill="#FBBF24" />
      <ellipse cx="106" cy="90" rx="18" ry="13" fill="#FEF3C7" />
      {/* Eyes */}
      <circle cx="92" cy="72" r="5" fill="#1C1917" />
      <circle cx="93.5" cy="70.5" r="1.8" fill="#FFFFFF" />
      <circle cx="120" cy="72" r="5" fill="#1C1917" />
      <circle cx="121.5" cy="70.5" r="1.8" fill="#FFFFFF" />
      {/* Cheeks */}
      <circle cx="82" cy="84" r="5" fill="#FCA5A5" opacity="0.65" />
      <circle cx="130" cy="84" r="5" fill="#FCA5A5" opacity="0.65" />
      {/* Nose & Friendly Smile */}
      <path d="M98 84 L114 84 L106 93 Z" fill="#78350F" />
      <path
        d="M98 95 Q106 102 114 95"
        fill="none"
        stroke="#78350F"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HarimauSvg() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
      {/* Long Sweeping S-Tail */}
      <path
        d="M48 118 C20 112, 16 74, 34 58 C42 50, 50 56, 46 65"
        fill="none"
        stroke="#EA580C"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M27 88 L35 90 M26 72 L34 74 M36 58 L41 64"
        stroke="#1C1917"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Legs */}
      <rect x="58" y="132" width="18" height="44" rx="9" fill="#EA580C" />
      <rect x="84" y="136" width="16" height="40" rx="8" fill="#C2410C" />
      <rect x="122" y="132" width="18" height="44" rx="9" fill="#EA580C" />
      <rect x="142" y="136" width="16" height="40" rx="8" fill="#C2410C" />

      {/* Paws */}
      <ellipse cx="67" cy="176" rx="11" ry="6" fill="#FEF3C7" />
      <ellipse cx="131" cy="176" rx="11" ry="6" fill="#FEF3C7" />

      {/* Muscular Body */}
      <ellipse cx="98" cy="120" rx="52" ry="30" fill="#F97316" />
      <ellipse cx="98" cy="134" rx="36" ry="14" fill="#FFF7ED" />

      {/* Body Stripes */}
      <path
        d="M72 95 C75 106, 75 112, 70 122 M90 92 C94 104, 94 114, 88 124 M110 93 C114 104, 112 114, 108 122"
        fill="none"
        stroke="#1C1917"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Head & Cheek Tufts */}
      <circle cx="145" cy="78" r="11" fill="#F97316" />
      <circle cx="122" cy="50" r="11" fill="#F97316" />
      <circle cx="122" cy="50" r="5.5" fill="#FED7AA" />
      <circle cx="168" cy="50" r="11" fill="#F97316" />
      <circle cx="168" cy="50" r="5.5" fill="#FED7AA" />

      <path
        d="M112 76 C106 86, 114 96, 122 96 L168 96 C176 96, 184 86, 178 76 C178 52, 164 42, 145 42 C126 42, 112 52, 112 76 Z"
        fill="#F97316"
      />
      {/* White Cheek & Muzzle */}
      <ellipse cx="145" cy="86" rx="20" ry="13" fill="#FFF7ED" />
      {/* Forehead & Cheek Stripes */}
      <path
        d="M145 44 L145 56 M136 47 L139 56 M154 47 L151 56 M115 72 L125 74 M175 72 L165 74"
        stroke="#1C1917"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Eyes */}
      <circle cx="133" cy="70" r="4.5" fill="#1C1917" />
      <circle cx="134.5" cy="68.5" r="1.5" fill="#FFFFFF" />
      <circle cx="157" cy="70" r="4.5" fill="#1C1917" />
      <circle cx="158.5" cy="68.5" r="1.5" fill="#FFFFFF" />
      {/* Nose & Smile */}
      <path d="M139 81 L151 81 L145 88 Z" fill="#FB7185" />
      <path
        d="M138 91 Q145 96 152 91"
        fill="none"
        stroke="#1C1917"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BuayaSvg() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
      {/* Sweeping Jagged Tail */}
      <path
        d="M58 124 C32 126, 14 108, 12 88 C22 94, 34 102, 56 106 Z"
        fill="#15803D"
      />
      {/* Dorsal Spikes (very distinct silhouette!) */}
      <path
        d="M36 99 L42 86 L50 98 L58 84 L66 96 L76 82 L86 95 L96 83 L106 96"
        fill="#166534"
      />
      {/* Sturdy Short Legs */}
      <path d="M68 134 L62 162 L78 162 L82 134 Z" fill="#166534" />
      <path d="M114 134 L110 162 L126 162 L130 134 Z" fill="#166534" />

      {/* Main Crocodile Torso */}
      <path
        d="M52 110 C56 94, 96 92, 128 104 L134 134 C104 142, 62 140, 52 110 Z"
        fill="#22C55E"
      />
      {/* Belly Scales */}
      <path
        d="M62 128 Q94 140 124 132 L122 122 Q94 128 62 120 Z"
        fill="#BEF264"
      />

      {/* Open Snout & Teeth (iconic crocodile head!) */}
      {/* Lower Jaw */}
      <path
        d="M120 124 L184 124 C190 124, 190 134, 180 136 L120 136 Z"
        fill="#16A34A"
      />
      {/* Upper Snout */}
      <path
        d="M112 98 C120 80, 142 78, 150 96 L186 98 C192 98, 192 110, 184 112 L124 114 Z"
        fill="#22C55E"
      />
      {/* Friendly Zigzag Teeth */}
      <path
        d="M136 113 L141 120 L146 113 L152 120 L158 113 L164 120 L170 112 L176 119 L181 111"
        fill="#FFFFFF"
      />
      {/* Eye Ridge */}
      <circle cx="132" cy="88" r="10" fill="#22C55E" />
      <circle cx="133" cy="88" r="6" fill="#FFFFFF" />
      <circle cx="135" cy="88" r="3.2" fill="#1C1917" />
      {/* Nostril */}
      <circle cx="180" cy="102" r="2.5" fill="#14532D" />
      {/* Cute Spots */}
      <circle cx="80" cy="110" r="4" fill="#16A34A" />
      <circle cx="96" cy="107" r="5" fill="#16A34A" />
      <circle cx="108" cy="114" r="3.5" fill="#16A34A" />
    </svg>
  );
}

function BeruangSvg() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
      {/* Chunky Legs */}
      <rect x="58" y="138" width="28" height="40" rx="14" fill="#78350F" />
      <rect x="114" y="138" width="28" height="40" rx="14" fill="#78350F" />
      <ellipse cx="72" cy="174" rx="14" ry="8" fill="#5C2D0C" />
      <ellipse cx="128" cy="174" rx="14" ry="8" fill="#5C2D0C" />

      {/* Big Round Torso */}
      <ellipse cx="100" cy="126" rx="52" ry="44" fill="#92400E" />
      <ellipse cx="100" cy="132" rx="32" ry="28" fill="#D97706" opacity="0.5" />

      {/* Friendly Chubby Arms */}
      <ellipse cx="48" cy="120" rx="16" ry="24" transform="rotate(24 48 120)" fill="#78350F" />
      <ellipse cx="152" cy="120" rx="16" ry="24" transform="rotate(-24 152 120)" fill="#78350F" />

      {/* Round Ears (unmistakable bear silhouette!) */}
      <circle cx="62" cy="40" r="16" fill="#78350F" />
      <circle cx="62" cy="40" r="8" fill="#D97706" />
      <circle cx="138" cy="40" r="16" fill="#78350F" />
      <circle cx="138" cy="40" r="8" fill="#D97706" />

      {/* Head */}
      <ellipse cx="100" cy="70" rx="44" ry="38" fill="#92400E" />
      {/* Light Snout */}
      <ellipse cx="100" cy="82" rx="20" ry="15" fill="#FDE68A" />
      {/* Eyes */}
      <circle cx="82" cy="64" r="5" fill="#1C1917" />
      <circle cx="83.5" cy="62.5" r="1.8" fill="#FFFFFF" />
      <circle cx="118" cy="64" r="5" fill="#1C1917" />
      <circle cx="119.5" cy="62.5" r="1.8" fill="#FFFFFF" />
      {/* Big Bear Nose & Smile */}
      <ellipse cx="100" cy="77" rx="8" ry="6" fill="#1C1917" />
      <path
        d="M92 87 Q100 94 108 87"
        fill="none"
        stroke="#451A03"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SerigalaSvg() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
      {/* Big Fluffy Bushy Tail (iconic wolf silhouette!) */}
      <path
        d="M58 118 C22 114, 12 86, 26 68 C38 72, 48 86, 62 104 Z"
        fill="#64748B"
      />
      <path
        d="M26 68 C32 70, 38 75, 42 82 C34 84, 28 80, 26 68 Z"
        fill="#F1F5F9"
      />

      {/* Legs */}
      <rect x="64" y="130" width="14" height="46" rx="7" fill="#475569" />
      <rect x="86" y="134" width="13" height="42" rx="6.5" fill="#334155" />
      <rect x="122" y="130" width="14" height="46" rx="7" fill="#475569" />
      <rect x="138" y="134" width="13" height="42" rx="6.5" fill="#334155" />

      {/* Lean Body & Fluffy Chest */}
      <ellipse cx="100" cy="116" rx="46" ry="26" fill="#64748B" />
      <path
        d="M126 94 C146 96, 152 118, 134 134 C122 126, 116 112, 126 94 Z"
        fill="#E2E8F0"
      />

      {/* Tall Pointed Ears (very distinct from bear/tiger!) */}
      <path d="M122 52 L118 22 L140 44 Z" fill="#475569" />
      <path d="M125 48 L122 30 L135 44 Z" fill="#CBD5E1" />
      <path d="M144 50 L152 20 L162 48 Z" fill="#64748B" />
      <path d="M147 46 L152 28 L158 46 Z" fill="#CBD5E1" />

      {/* Wolf Head & Pointed Muzzle */}
      <circle cx="140" cy="70" r="26" fill="#64748B" />
      <path
        d="M148 64 L184 72 C188 73, 188 82, 180 84 L144 88 Z"
        fill="#94A3B8"
      />
      <path
        d="M148 76 L180 78 L178 84 L144 88 Z"
        fill="#F1F5F9"
      />
      {/* Eye */}
      <circle cx="144" cy="64" r="4.5" fill="#FACC15" />
      <circle cx="145" cy="64" r="2.4" fill="#1C1917" />
      {/* Black Nose */}
      <circle cx="183" cy="74" r="4.5" fill="#0F172A" />
    </svg>
  );
}

function BadakSvg() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
      {/* Small Tail */}
      <path
        d="M34 114 C22 120, 20 132, 24 140"
        fill="none"
        stroke="#64748B"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* Stocky Pillar Legs */}
      <rect x="48" y="134" width="22" height="40" rx="8" fill="#64748B" />
      <rect x="76" y="138" width="20" height="36" rx="8" fill="#475569" />
      <rect x="114" y="134" width="22" height="40" rx="8" fill="#64748B" />
      <rect x="138" y="138" width="20" height="36" rx="8" fill="#475569" />

      {/* Heavy Armor-Plated Body */}
      <ellipse cx="94" cy="116" rx="58" ry="38" fill="#94A3B8" />
      {/* Skin Fold Lines */}
      <path
        d="M72 82 C76 102, 76 124, 72 142 M120 84 C116 104, 116 124, 120 142"
        fill="none"
        stroke="#64748B"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Ears */}
      <ellipse cx="136" cy="66" rx="7" ry="13" transform="rotate(-15 136 66)" fill="#64748B" />
      <ellipse cx="148" cy="66" rx="7" ry="13" transform="rotate(10 148 66)" fill="#94A3B8" />

      {/* Rhino Head */}
      <path
        d="M124 94 C126 70, 152 68, 168 86 L182 104 C184 118, 168 128, 148 126 L126 118 Z"
        fill="#94A3B8"
      />

      {/* Iconic Curved Rhino Horns! */}
      <path
        d="M174 96 C188 86, 192 64, 182 52 C178 68, 170 80, 162 88 Z"
        fill="#F1F5F9"
      />
      <path
        d="M158 84 C166 76, 166 64, 158 58 C156 68, 152 74, 148 80 Z"
        fill="#E2E8F0"
      />

      {/* Eye & Smile */}
      <circle cx="148" cy="92" r="4" fill="#0F172A" />
      <circle cx="149" cy="90.5" r="1.4" fill="#FFFFFF" />
      <path
        d="M156 116 Q168 120 176 112"
        fill="none"
        stroke="#475569"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HiuSvg() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
      {/* Crescent Tail Fin (classic shark tail!) */}
      <path
        d="M44 104 L12 62 C18 82, 22 98, 22 106 C22 114, 18 128, 14 146 L46 114 Z"
        fill="#0284C7"
      />
      {/* Tall Dorsal Fin */}
      <path
        d="M84 82 C88 46, 108 32, 118 32 C110 52, 112 72, 120 82 Z"
        fill="#0284C7"
      />
      {/* Pectoral Fin Back */}
      <path d="M126 122 L134 152 L110 130 Z" fill="#0369A1" />

      {/* Streamlined Shark Body */}
      <path
        d="M36 106 C62 74, 128 70, 184 104 C168 124, 134 134, 88 130 C64 128, 46 118, 36 106 Z"
        fill="#0EA5E9"
      />
      {/* White Belly */}
      <path
        d="M44 110 C72 114, 130 112, 176 106 C158 124, 124 133, 86 129 C65 127, 52 118, 44 110 Z"
        fill="#F8FAFC"
      />
      {/* Front Pectoral Fin */}
      <path d="M98 118 L80 156 L114 126 Z" fill="#0284C7" />

      {/* Gill Slits */}
      <path
        d="M124 98 C122 104, 122 110, 124 116 M131 98 C129 104, 129 110, 131 116 M138 99 C136 104, 136 110, 138 115"
        fill="none"
        stroke="#0369A1"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Friendly Shark Eye & Grin */}
      <circle cx="152" cy="96" r="4.5" fill="#0F172A" />
      <circle cx="153.5" cy="94.5" r="1.5" fill="#FFFFFF" />
      <path
        d="M148 114 Q162 118 172 110"
        fill="none"
        stroke="#0F172A"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ElangSvg() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
      {/* Fanned Tail Feathers */}
      <path
        d="M84 132 L74 176 L92 170 L100 180 L108 170 L126 176 L116 132 Z"
        fill="#78350F"
      />
      {/* Wide Outstretched Eagle Wings (distinctive feathered wingtips!) */}
      <path
        d="M92 92 C66 56, 30 44, 10 58 C18 68, 22 72, 14 78 C24 84, 30 88, 22 96 C38 102, 66 112, 92 116 Z"
        fill="#92400E"
      />
      <path
        d="M108 92 C134 56, 170 44, 190 58 C182 68, 178 72, 186 78 C176 84, 170 88, 178 96 C162 102, 134 112, 108 116 Z"
        fill="#92400E"
      />
      {/* Wing Highlight Feathers */}
      <path
        d="M28 66 Q58 68 84 94 M172 66 Q142 68 116 94"
        fill="none"
        stroke="#D97706"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Eagle Body */}
      <ellipse cx="100" cy="112" rx="24" ry="34" fill="#78350F" />
      <ellipse cx="100" cy="118" rx="14" ry="20" fill="#B45309" />

      {/* Talons */}
      <path
        d="M88 142 L84 156 M88 148 L92 156 M112 142 L116 156 M112 148 L108 156"
        stroke="#F59E0B"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Iconic White Bald Eagle Head */}
      <circle cx="100" cy="64" r="22" fill="#FEFCE8" />
      {/* Brow & Eyes */}
      <circle cx="91" cy="62" r="4" fill="#1C1917" />
      <circle cx="92" cy="60.8" r="1.3" fill="#FFFFFF" />
      <circle cx="109" cy="62" r="4" fill="#1C1917" />
      <circle cx="110" cy="60.8" r="1.3" fill="#FFFFFF" />
      {/* Hooked Yellow Beak */}
      <path
        d="M94 68 L106 68 L100 84 Z"
        fill="#F59E0B"
      />
    </svg>
  );
}
