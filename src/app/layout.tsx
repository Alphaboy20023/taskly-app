// app/layout.tsx
import type { Metadata } from "next";
import "./styles/globals.css";
import { Providers } from "./providers";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "taskly",
  description: "Your productivity companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
        <ToastContainer 
          position="top-right" 
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '10px',
              background: '#fff',
              color: '#333',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#4BB543',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff3333',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}