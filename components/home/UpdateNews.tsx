export function UpdateNews() {
  return (
    <div className="game-panel p-4 flex flex-col gap-2 shadow-lg">
      <h3 className="text-lg font-black text-amber-300 border-b border-slate-600 pb-2 flex items-center gap-2 whitespace-nowrap">
        <span>📣</span> アップデートのお知らせ
      </h3>
      <ul className="text-sm font-bold text-slate-200 space-y-3 max-h-36 overflow-y-auto pr-2 custom-scrollbar">
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/09/01 (最新)</div>
          <div>👑 <strong>ついに「レジェンドガチャ」が登場！（10万PT）</strong><br/>
          すべてのガチャの <strong>超激レア・神レアだけ</strong> を あつめた さいきょうのガチャ。
          アバター・そうび・テーマ・称号・エフェクト ぜんぶ入りの <strong>62種</strong> で、
          <strong>超激レア80% / 神レア20%</strong>、<strong>ハズレなし</strong>！
          いままでSPでしか手に入らなかった そうびも ここから出るよ。
          10万PTは とおい道のりだけど…みんなで 裏ボスを たおせば 一気に ちかづくかも！</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/31</div>
          <div>🔥 <strong>「今日限定！」でXP・PT・SPが3ばいに！</strong><br/>
          「きょうのミッション」を パワーアップ！ いま カルテのレベルが ひくい <strong>3つの分野</strong> が
          毎日えらばれて、そこで あそぶと <strong>XP・PT・SPが3ばい</strong>（1日1回ではなく、その日じゅう なんどでも！）。
          にがてな ところを うめると、いっきに つよくなれるよ。</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/31</div>
          <div>🖼️ <strong>きれいな絵のテーマは「テーマガチャ」だけに！</strong><br/>
          「うちゅう」「にんじゃ」「サイバー」など、絵の背景テーマ11種を ショップと通常ガチャから
          <strong>テーマガチャ</strong> へ引っこし。テーマガチャは ぜんぶで <strong>23種類</strong> になりました！
          （もう持っているテーマは そのまま つかえます）<br/>
          プロフィールの そうび一覧に「持っていない そうび」が ならんでしまうバグも直しました。</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/30</div>
          <div>🎨 <strong>テーマが15種類も増えた！さらに「テーマガチャ」が登場！</strong><br/>
          ショップに <strong>「さくら並木」「夕やけの丘」「オーロラの夜」</strong> の3つが なかまいり（PTをためれば かならず 買えるよ）。
          さらに <strong>🖼️ テーマガチャ（1回10000PT）</strong> を新しく追加！ぜんぶで12種類、すべて激レア以上で、
          <strong>「星海の竜宮」「万象の始まり」</strong> などの神レアも ねらえます。
          どのテーマも 動くエフェクトつき。レアなほど 豪華だよ！</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/29</div>
          <div>🎯 <strong>「きょうのミッション」＆やりこみ要素が大量追加！</strong><br/>
          毎日ひとつ、いま いちばん のびしろのある分野が ミッションとして とどきます。クリアすると XP・PTが <strong>1.5ばい</strong>！
          さらに、バトルの けっか画面から <strong>じっせきの ごほうびを すぐ うけとれる</strong> ようになり、
          カルテの Lv.99の さきには <strong>★ランク</strong>（★5まで）が 追加。
          「ぜんぶの分野を そだてた人」「4日・5日 れんぞくログイン」などの じっせきも 新しくふえました！</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/29</div>
          <div>❓ <strong>「？？？？？？」</strong><br/>
          Lv10の アルティメットドラゴンを たおした学年だけが たどりつける <strong>なにか</strong> を、こっそり追加しました。
          もし たおすことが できたら…その学年の <strong>ぜんいん</strong> に、とんでもない ごほうびが とどくらしい。</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/28</div>
          <div>🥇 <strong>ランキング実績が正しく受け取れるように修正！</strong><br/>
          先週・先月の成績がきちんと保存されるようになり、「先週のヒーロー」「先月のダメージ」に載っていれば、いつランキングを開いても実績がもらえるようになりました！</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/28</div>
          <div>📖 <strong>ふりがなモードの読みまちがいを修正！</strong><br/>
          「元寇（げんこう）」「承久の乱（じょうきゅうのらん）」「維管束（いかんそく）」など、歴史や理科の言葉のふりがなを正しく直しました。</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/28</div>
          <div>🪙 <strong>PTのもらいかたを調整＆ガチャの表示バグを修正！</strong><br/>
          同じ問題ばかりくり返したときだけPTが少なくなるようになりました（ちがう問題ならいつも通りもらえるよ）。ガチャで一度かぶったアイテムが、次に新しく当てても「再獲得」と出てしまうバグも修正しました。</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/27</div>
          <div>📝 <strong>算数の文章題が読みやすく！</strong><br/>
          長い文章題のときだけ自動で文字サイズを小さくし、スクロールしなくても問題全体が見やすくなりました！</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/27</div>
          <div>📖 <strong>「ふりがなモード」を追加！</strong><br/>
          ホーム画面のチェックボックスをONにすると、算数・理科・社会の問題文と選択肢がぜんぶひらがな表示になります！</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/27</div>
          <div>🎉 <strong>通常ガチャに「10連」が登場！</strong><br/>
          1000PTで10回いっきにガチャがまわせるようになりました！通常ガチャの消費PTが正しく表示されないバグも修正済み。</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/27</div>
          <div>🥇 <strong>ランキングまわりのバグを修正！</strong><br/>
          「今週のヒーロー」「今月のダメージランキング」が正しい順位で表示されるように修正し、先週・先月の最終結果をもとにランキング実績を受け取れるようにしました。</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/27</div>
          <div>🏷️ <strong>ガチャの称号アイテム表示を修正！</strong><br/>
          称号を引いたときに絵文字が大きく出てアバターと間違えやすかったのを、「【称号名】」のプレート表示にしてわかりやすくしました。</div>
        </li>
        <li>
          <div className="text-xs text-amber-400 mb-0.5">2026/08/14</div>
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
