"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { storage } from "../lib/storage";
import { Button } from "../components/ui/Button";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import { validateName } from "../lib/validation";

export default function TopPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [grade, setGrade] = useState<number>(1);
  const [error, setError] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(false); // 新規登録をデフォルトに
  const [showQR, setShowQR] = useState(false);

  const [guestName, setGuestName] = useState<string | null>(null);

  // ログイン・新規登録・ゲスト開始のあとは、クライアント側遷移ではなく完全な再読み込みで
  // ホームへ移動する。UserProvider の初期化はマウント時の1回だけなので、router.push だと
  // 「ログインしたのに直前のゲスト状態のまま」「ゲストにしたのにデータ未設定のまま」といった
  // 食い違いが残り、ホームで固まったり元の画面へ戻されたりする原因になる。
  const goHomeWithReload = () => {
    window.location.assign("/home");
  };

  useEffect(() => {
    // 以前はゲストの記録がある端末だと、この画面を開いた瞬間に /home へ飛ばしていた。
    // そのため「学校でとうろくしたアカウントに、家や共用端末からログインしたい」ときに
    // ログイン画面へたどり着けず、事実上ログイン不能になっていた。
    // ゲストの続きは下の「つづきから あそぶ」ボタンから1タップで戻れるようにしたうえで、
    // 自動リダイレクトはやめて、必ずログインを選べるようにする。
    if (storage.isGuest()) {
      setGuestName(storage.getGuestName());
    }
    // 本アカウントでサインイン済みならそのままホームへ（こちらは従来どおり）
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !user.isAnonymous) {
        router.push("/home");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGuest = async () => {
    const isValid = await validateName(name);
    if (!isValid) {
      setError("そのなまえは つかえません。ちがうなまえにしてね。");
      return;
    }

    if (!name) {
      storage.setGuest("ゲスト", grade);
    } else {
      storage.setGuest(name, grade);
    }
    goHomeWithReload();
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || pin.length !== 4) {
      setError("なまえと、4ケタのすうじをいれてね！");
      return;
    }
    
    // Check for inappropriate names only when signing up
    if (!isLoginMode) {
      const isValid = await validateName(name);
      if (!isValid) {
        setError("そのなまえは つかえません。ちがうなまえにしてね。");
        return;
      }
    }
    
    const dummyEmail = `${encodeURIComponent(name)}@kanjiquest.local`;
    const dummyPassword = `${pin}000`; 

    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, dummyEmail, dummyPassword);
        storage.clearGuest();
        goHomeWithReload();
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, dummyEmail, dummyPassword);
        await setDoc(doc(db, "users", userCred.user.uid), {
          name: name,
          xp: 0,
          pt: 0,
          grade: grade, // 学年を保存
          effects: ["default"],
        });
        storage.clearGuest();
        goHomeWithReload();
      }
    } catch (err: any) {
      console.error(err);
      setError("エラーがおきました。なまえかすうじがちがうかも？");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative z-10">
      
      <motion.div 
        initial={{ y: -50, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="game-panel w-full max-w-md p-8 flex flex-col items-center relative z-10"
      >
        <motion.h1 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-5xl md:text-6xl font-black text-amber-400 text-outline-dark mb-4 drop-shadow-lg text-center py-2"
        >
          スタディ・モンスターズ
        </motion.h1>

        <button 
          onClick={() => setShowQR(true)}
          className="mb-8 px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-full text-sm flex items-center gap-2 border border-white/30 transition-colors"
        >
          📱 スマホ・タブレットであそぶ
        </button>
        
        {/* この端末にゲストの記録が残っている場合の「続きから」導線。
            以前はここで自動的に /home へ飛ばしていたため、ログイン画面に入れなかった。 */}
        {guestName && (
          <div className="w-full mb-6 p-4 rounded-2xl bg-emerald-900/60 border-2 border-emerald-400/60 shadow-inner flex flex-col gap-2">
            <div className="text-emerald-100 font-bold text-sm text-center">
              この たんまつに 「{guestName}」の とちゅうデータが あります
            </div>
            <Button
              type="button"
              variant="fun"
              onClick={goHomeWithReload}
              className="w-full py-3 text-lg"
            >
              ▶ つづきから あそぶ
            </Button>
            <div className="text-emerald-200/80 font-bold text-xs text-center">
              べつのアカウントで あそぶときは、下から ログインしてね
            </div>
          </div>
        )}

        {/* モード切り替えタブ */}
        <div className="flex w-full gap-2 mb-6">
          <Button 
            type="button"
            variant={!isLoginMode ? "fun" : "outline"}
            onClick={() => setIsLoginMode(false)}
            className={`flex-1 py-3 text-lg ${!isLoginMode ? "shadow-md" : "bg-slate-700/80 text-slate-300 border-slate-900"}`}
          >
            🆕 初めてあそぶ
          </Button>
          <Button 
            type="button"
            variant={isLoginMode ? "fun" : "outline"}
            onClick={() => setIsLoginMode(true)}
            className={`flex-1 py-3 text-lg ${isLoginMode ? "shadow-md" : "bg-slate-700/80 text-slate-300 border-slate-900"}`}
          >
            🔑 まえにあそんだ
          </Button>
        </div>

        <form onSubmit={handleAuth} className="w-full flex flex-col gap-5">
          <div className="game-panel-light p-4 shadow-inner">
            <label className="block text-blue-900 font-black mb-2 text-lg">なまえを おしえてね</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-4 border-blue-200 focus:outline-none focus:border-blue-500 font-bold text-lg bg-white/90 transition-colors"
              placeholder="ひらがな・カタカナ・えいご"
            />
          </div>

          {!isLoginMode && (
            <div className="game-panel-light p-4 shadow-inner">
              <label className="block text-blue-900 font-black mb-2 text-lg">がくねん は？</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGrade(g)}
                    className={`py-2 rounded-xl font-black text-lg transition-all border-b-4 ${
                      grade === g 
                        ? "bg-amber-400 text-white border-amber-600 shadow-sm translate-y-1 border-b-0" 
                        : "bg-white text-gray-500 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {g}年
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="game-panel-light p-4 shadow-inner">
            <label className="block text-blue-900 font-black mb-2 text-lg">ひみつの すうじ（4ケタ）</label>
            <input 
              type="password" 
              value={pin} 
              onChange={e => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
              className="w-full px-4 py-3 text-2xl tracking-widest text-center rounded-xl border-4 border-blue-200 focus:outline-none focus:border-blue-500 font-bold bg-white/90 transition-colors"
              placeholder="1234"
              maxLength={4}
              pattern="\d{4}"
            />
          </div>
          
          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 font-black text-center bg-red-50 border-2 border-red-200 p-2 rounded-xl">{error}</motion.p>}
          
          <Button type="submit" variant="primary" size="lg" className="mt-2 w-full text-2xl py-4 h-auto shadow-lg shadow-blue-500/30">
            {isLoginMode ? "冒険を つづける！" : "冒険を はじめる！"}
          </Button>
        </form>

        <div className="w-full h-1 bg-slate-600/50 rounded-full my-8"></div>

        <Button onClick={handleGuest} type="button" variant="outline" className="w-full text-lg border-emerald-500 text-emerald-100 bg-emerald-900/40 hover:bg-emerald-800/60">
          とうろくしないで あそぶ
        </Button>
        <p className="text-sm text-center text-amber-200/70 mt-3 font-bold">
          ※ ゲストも がくねん はえらんでね！
        </p>
      </motion.div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowQR(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-blue-900 mb-4">スマホであそぶ</h2>
            <p className="text-slate-600 font-bold mb-6 text-sm">カメラでこのQRコードを読み取ってね！</p>
            <div className="bg-white p-4 rounded-xl border-4 border-slate-200 flex justify-center mb-6">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://tw224383-pixel.github.io/" alt="QR Code" className="w-48 h-48" />
            </div>
            <Button variant="outline" onClick={() => setShowQR(false)} className="w-full">
              とじる
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
