export function UpdateNews() {
  return (
    <div className="game-panel p-4 flex flex-col gap-2 shadow-lg">
      <h3 className="text-lg font-black text-amber-300 border-b border-slate-600 pb-2 flex items-center gap-2 whitespace-nowrap">
        <span>📣</span> アップデートのお知らせ
      </h3>
      <ul className="text-sm font-bold text-slate-200 space-y-3 max-h-36 overflow-y-auto pr-2 custom-scrollbar">
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/14 (最新)</div>
          <div>📖 <strong>「リッチ大図鑑」に全装備品を完全収録＆装備ガチャSP対応！</strong><br/>
          図鑑がアバター・装備品全93種の大図鑑にパワーアップ！「ふわふわ装備ガチャ♡」「装備品リッチガチャ」をSP（1000SP）で引けるよう修正し、小1の文章題・生活科の問題をすべてひらがな表記に統一しました！</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/13</div>
          <div>🎀 <strong>ふわふわ装備ガチャ♡ 新登場！</strong><br/>
          かわいいティアラ・レイピア・魔導書など15種のフェミニンな装備ガチャを実装！神レア「天使の羽根のティアラ」「星屑のキラキラスタッフ」を目指してまわそう！</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/13</div>
          <div>🎬 <strong>リッチガチャ演出を動画にリニューアル！</strong><br/>
          レアリティに合わせた迫力の演出動画が再生されるようになりました！ノーマル〜神レアまで、それぞれ専用映像でガチャがより盛り上がる！</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/11</div>
          <div>🏆 <strong>じっせき画面リニューアル＆成長カルテ実績新設！</strong><br/>
          カルテのレベルアップや特訓正解数で大量のPT・SP・限定称号が貰える新実績が大量追加！タブ分割＆絞り込みでさらに使いやすくなりました！</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/11</div>
          <div>📊 <strong>新機能「冒険者の成長カルテ」登場！</strong><br/>
          6軸レーダーチャートで自分の得意・苦手を客観分析！ワンタップで各分野の学年別特訓バトルへ出撃してLv.99を目指そう！</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/11</div>
          <div>🧠 <strong>学年別・思考力（文章題）＆空間図形問題大幅拡充！</strong><br/>
          小1〜小6の教科書・学力テストに完全準拠した本格文章題・面積・体積問題を大量追加！特訓時はいつでも満額報酬を保証！</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/11</div>
          <div>🎨 <strong>全画面でのテーマ背景同期＆画像軽量化・UI高速化！</strong><br/>
          どの画面でもお気に入りテーマが美しく表示され、動作もさらに軽快になりました！</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/09</div>
          <div>実績解除でPT・SP報酬が貰える機能を実装！さらに「連続ログイン実績」が登場！毎日ログインして豪華報酬をゲットしよう！</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/07</div>
          <div>理科・社会の単元選択出題の不具合を修正＆下の学年でも報酬が貰いやすくなりました！装備品リッチガチャ・アバター説明文・レアリティ別光演出も実装！</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/06</div>
          <div>リッチガチャ２追加！ガチャ画面のレイアウトも修正し、見やすくしました！</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/07/31</div>
          <div>超豪華な「リッチガチャ」が登場！かっこいい・かわいいアバターが当たるよ！</div>
        </li>
      </ul>
    </div>
  );
}
