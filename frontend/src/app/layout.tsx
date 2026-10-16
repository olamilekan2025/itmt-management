
// // import type { Metadata } from "next";
// // import { Montserrat, Protest } from "next/font/google";

// // import AuthSessionProvider from "@/components/providers/session-provider";
// // import { Toaster } from "@/components/ui/sonner";

// // import "./globals.css";

// // const montserrat = Montserrat({
// //   variable: "--font-montserrat",
// //   subsets: ["latin"],
// //   weight: ["400", "500", "600", "700", "800"],
// //   display: "swap",
// // });

// // const protest = Protest({
// //   variable: "--font-protest",
// //   subsets: ["latin"],
// //   weight: "400",
// //   display: "swap",
// // });

// // export const metadata: Metadata = {
// //   title: {
// //     default: "ITMT Management System",
// //     template: "%s | ITMT Management System",
// //   },
// //   description:
// //     "ITMT Academy Management System — academic administration, student services, finance, and institutional management.",
// //   icons: {
// //     icon: "/newLogo.png",
// //     shortcut: "/newLogo.png",
// //     apple: "/newLogo.png",
// //   },
// // };

// // export default function RootLayout({
// //   children,
// // }: Readonly<{
// //   children: React.ReactNode;
// // }>) {
// //   return (
// //     <html
// //       lang="en"
// //       className={`${montserrat.variable} ${protest.variable}`}
// //     >
// //       <body className="min-h-screen antialiased">
// //         <AuthSessionProvider>
// //           {children}

// //           <Toaster
// //             position="top-right"
// //             richColors
// //             closeButton
// //           />
// //         </AuthSessionProvider>
// //       </body>
// //     </html>
// //   );
// // }


// import type { Metadata } from "next";
// import { Geist_Mono, Montserrat, Protest_Riot } from "next/font/google";

// import AuthSessionProvider from "@/components/providers/session-provider";
// import { Toaster } from "@/components/ui/sonner";

// import "./globals.css";

// const montserrat = Montserrat({
//   variable: "--font-montserrat",
//   subsets: ["latin"],
//   weight: ["400", "500", "600", "700", "800"],
//   display: "swap",
// });

// const protest = Protest_Riot({
//   variable: "--font-protest",
//   subsets: ["latin"],
//   weight: "400",
//   display: "swap",
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
//   display: "swap",
// });

// export const metadata: Metadata = {
//   title: {
//     default: "ITMT Management System",
//     template: "%s | ITMT Management System",
//   },
//   description:
//     "ITMT Academy Management System — academic administration, student services, finance, and institutional management.",
//   icons: {
//     icon: "/newLogo.png",
//     shortcut: "/newLogo.png",
//     apple: "/newLogo.png",
//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html
//       lang="en"
//       className={`${montserrat.variable} ${protest.variable} ${geistMono.variable}`}
//     >
//       <body className="min-h-screen antialiased">
//         <AuthSessionProvider>
//           {children}
//           <Toaster position="top-right" richColors closeButton />
//         </AuthSessionProvider>
//       </body>
//     </html>
//   );
// }


import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import AuthSessionProvider from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ITMT Management System",
    template: "%s | ITMT Management System",
  },
  description:
    "ITMT Academy Management System — academic administration, student services, finance, and institutional management.",
  icons: {
    icon: "/newLogo.png",
    shortcut: "/newLogo.png",
    apple: "/newLogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="min-h-screen antialiased">
        <AuthSessionProvider>
          {children}

          <Toaster
            position="top-right"
            richColors
            closeButton
          />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
