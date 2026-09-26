import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-marine dark:bg-marine-600 text-white w-full md:w-[70%] mx-auto px-4 md:px-0 md:rounded-2xl">
      <div className="flex items-center h-16 px-5">
        <h1 className="text-xl font-bold shrink-0"><Link href="/">Egoshin Shop</Link></h1>
        <nav className="w-[70%] flex items-center justify-start gap-6 pl-8">
          <button className="hover:text-gray-200 transition-colors">
            <Link href="/">
            Главная
            </Link>
          </button>
          <button className="hover:text-gray-200 transition-colors">
            <Link href="/products">
            Каталог
            </Link>
          </button>
        </nav>
      </div>
    </header>
  );
}