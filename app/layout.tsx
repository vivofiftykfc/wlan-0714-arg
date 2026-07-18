import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "待注销用户｜WLAN-0714",
    template: "%s｜待注销用户",
  },
  description: "一部关于数字遗产、共同身份与被系统遗忘之人的网页 ARG。",
  openGraph: {
    title: "待注销用户｜WLAN-0714",
    description: "一个已经死亡的用户，为什么仍在每天登录？",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
