import './globals.css';

export const metadata = {
  title: 'El taller de Norma',
  description: 'Piezas de cerámica hechas a mano por Norma.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
