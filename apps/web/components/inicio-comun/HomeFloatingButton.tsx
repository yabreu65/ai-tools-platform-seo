'use client';

import Link from 'next/link';

export default function HomeFloatingButton() {
  return (
    <Link href="/" passHref legacyBehavior>
      <a
        className="fixed bottom-12 left-[75%]  z-50 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-indigo-700 transition"
        title="Volver al inicio"
      >
        🏠 Inicio
      </a>
    </Link>
  );
}
