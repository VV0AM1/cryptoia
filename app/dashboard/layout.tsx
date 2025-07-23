import './globals.css';


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-900 text-white">
            <main className="flex-1 pt-[72px]">{children}</main>
      </body>
    </html>
  );
}