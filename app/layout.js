import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Gallery',
  description: 'Modern image gallery with albums and metadata',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      background: '#000000',
                      foreground: '#ffffff',
                    }
                  }
                }
              }
            `,
          }}
        />
       <style
  dangerouslySetInnerHTML={{
    __html: `
      body {
        background: linear-gradient(to bottom, #000000, #0a0a0a);
        color: #ffffff;
        font-family: ${inter.style.fontFamily};
      }
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      @supports (backdrop-filter: blur(20px)) {
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);
        }
        .glass-dark {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(60px) saturate(180%);
          -webkit-backdrop-filter: blur(60px) saturate(180%);
        }
      }
      .card-hover {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .card-hover:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      }
      @keyframes fade-in {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes slide-down {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fade-in {
        animation: fade-in 0.5s ease-out;
      }
      .animate-slide-down {
        animation: slide-down 0.3s ease-out;
      }
    `,
  }}
/>
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}