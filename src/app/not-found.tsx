import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-20">
      <h1 className="font-heading text-4xl tracking-tight">页面不存在</h1>
      <p className="mt-3 text-muted-foreground">
        这个地址没有对应内容。你可以从压缩工具、技术原理或常见问题继续。
      </p>
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/" className="font-medium underline-offset-4 hover:underline">
          回压缩工具
        </Link>
        <Link
          href="/principles"
          className="font-medium underline-offset-4 hover:underline"
        >
          技术原理
        </Link>
        <Link href="/faq" className="font-medium underline-offset-4 hover:underline">
          常见问题
        </Link>
      </div>
    </main>
  );
}
