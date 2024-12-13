import { Theme } from '@radix-ui/themes';
import { themeProps } from './theme-config';
import { Inter } from 'next/font/google';
import '@radix-ui/themes/styles.css';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata = {
  title: 'YouTube Gaming Trends',
  description: 'Interactive visualization of YouTube gaming trends and statistics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Theme {...themeProps}>
          <main>{children}</main>
        </Theme>
      </body>
    </html>
  );
}