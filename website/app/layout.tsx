import { Theme } from '@radix-ui/themes';
import { themeProps } from './theme-config';
import { Inter } from 'next/font/google';
import '@radix-ui/themes/styles.css';
import './globals.css';
import { DesktopIcon } from '@radix-ui/react-icons';

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
          <div className="hidden lg:block">
            <main>{children}</main>
          </div>
          <div className="flex lg:hidden h-screen w-screen items-center justify-center p-8 text-center">
            <div className="space-y-4">
              <DesktopIcon className="w-16 h-16 mx-auto mb-6" />
              <h1 className="text-2xl font-bold">Please Use a Desktop Device</h1>
              <p>
                For the best experience of our interactive visualizations, 
                please view this website on a desktop or laptop computer.
              </p>
            </div>
          </div>
        </Theme>
      </body>
    </html>
  );
}