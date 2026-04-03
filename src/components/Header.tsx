export default function Header() {
  return (
    <header className="bg-gradient-to-r from-primary-700 to-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          ふるさと納税 控除上限額シミュレーター
        </h1>
        <p className="mt-2 text-primary-200 text-sm sm:text-base max-w-2xl">
          令和8年度対応。給与収入や各種控除を入力して、ふるさと納税の控除上限額（自己負担2,000円の範囲）を計算します。
        </p>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs text-primary-100">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          令和7年度税制改正（基礎控除引き上げ・給与所得控除改正）対応済み
        </div>
      </div>
    </header>
  );
}
