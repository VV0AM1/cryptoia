import './globals.css';
import { Providers } from './providers';
import { SidebarProvider } from './context/SidebarContext';
import SideBar from '@/components/SideBar';
import ClientNavbarWrapper from '@/components/ClientNavbarWrapper';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-900 text-white">
        <Providers>
          <SidebarProvider>
            <SideBar />
            <ClientNavbarWrapper />
            <main className="flex-1 pt-[72px]">{children}</main>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}