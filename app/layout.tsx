// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// // import "./styles.css"; // Your global styles import
// import Providers from "./components/Providers"; // Import your client-side providers

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Skill Profile Tool",
//   description: "AI-Driven Skill Management Platform",
// };

// // This is a Server Component by default
// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         {/* Your Providers component is a Client Component.
//           It's best practice to wrap your children with client-side
//           context providers as deeply as possible. Here, we wrap the <body>
//           content.
//         */}
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }

// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import Providers from "./components/Providers";
// import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Skill Profile Tool",
//   description: "AI-Driven Skill Management Platform",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className={inter.className}>
//         <AppRouterCacheProvider options={{ enableCssLayer: true }}>
//           <Providers>{children}</Providers>
//         </AppRouterCacheProvider>
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./carbon.scss";
import Providers from "./components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Skill Profile Tool",
  description: "AI-Driven Skill Management Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
