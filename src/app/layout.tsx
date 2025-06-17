
"use client"; 

import React, { useEffect } from 'react';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import { inter, spaceGrotesk, sourceCodePro } from './fonts';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    const applyInitialTheme = () => {
      const storedTheme = localStorage.getItem('appTheme');
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark'); 

      if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
    };

    applyInitialTheme();
  }, []);

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable} ${sourceCodePro.variable}`}>
<head>
        <title>PR Visualizer</title>
        <meta name="description" content="Visualize your GitHub Pull Requests dynamically." />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2388ce" />
</head>
      <body className="font-body antialiased min-h-screen flex flex-col pb-24">
        {children}
        <BottomNavBar />
        <Toaster />
      </body>
    </html>
  );
}
