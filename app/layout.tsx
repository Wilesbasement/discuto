import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "DiscPlus", description: "Disc golf check-ins, scorecards, courses, and leaderboards." };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
