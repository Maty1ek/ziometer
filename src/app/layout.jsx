import "./globals.css";
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],  // Add 'latin-ext' if needed for extended chars
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],  // Specify weights (e.g., regular and bold)
  variable: '--font-inter',  // Optional: CSS variable for tailwind/integration
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={inter.className}
      >
        {children}
      </body>
    </html>
  );
}
