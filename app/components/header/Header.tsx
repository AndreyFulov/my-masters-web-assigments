import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-marine text-white w-full md:w-[70%] mx-auto px-4 md:px-0 md:rounded-2xl">
      <div className="flex items-center h-16 px-5">
        <h1 className="text-xl font-bold shrink-0">Egoshin Shop</h1>
        <nav className="w-[70%] flex items-center justify-start gap-6 pl-8">
          <button className="hover:text-gray-200 transition-colors">
            <Link href="/">
            Каталог
            </Link>
          </button>
        </nav>
      </div>
    </header>
  );
}