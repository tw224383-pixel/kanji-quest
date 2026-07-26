"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "../lib/storage";
import { Button } from "../components/ui/Button";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";

export default function TopPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [grade, setGrade] = useState<number>(1);
  const [error, setError] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(false); // 新規登録をデフォルトに

  const handleGuest = () => {
    if (!name) {
      storage.setGuest("ゲスト", grade);
    } else {
      storage.setGuest(name, grade);
    }
    router.push("/home");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || pin.length !== 4) {
      setError("なまえと、4ケタのすうじをいれてね！");
      return;
    }
    
    const dummyEmail = `${encodeURIComponent(name)}@kanjiquest.local`;
    const dummyPassword = `${pin}000`; 

    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, dummyEmail, dummyPassword);
        storage.clearGuest();
        router.push("/home");
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
        router.push("/home");
      }
    } catch (err: any) {
      console.error(err);
      setError("エラーがおきました。なまえかすうじがちがうかも？");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ y: -50, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="glass w-full max-w-md p-8 rounded-[2rem] shadow-2xl flex flex-col items-center bg-white/40 border-4 border-white/60"
      >
        <motion.h1 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 mb-8 tracking-tighter drop-shadow-sm text-center py-2"
        >
          漢字クエスト
        </motion.h1>
        
        <form onSubmit={handleAuth} className="w-full flex flex-col gap-5">
          <div className="bg-white/60 p-4 rounded-2xl shadow-sm border-2 border-white/80">
            <label className="block text-blue-900 font-black mb-2 text-lg">なまえを おしえてね</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-4 border-blue-200 focus:outline-none focus:border-blue-500 font-bold text-lg bg-white/90 transition-colors"
              placeholder="ひらがな・カタカナ・えいご"
            />
          </div>

          <div className="bg-white/60 p-4 rounded-2xl shadow-sm border-2 border-white/80">
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

          <div className="bg-white/60 p-4 rounded-2xl shadow-sm border-2 border-white/80">
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
          
          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 font-black text-center bg-red-50 p-2 rounded-xl">{error}</motion.p>}
          
          <Button type="submit" variant="fun" size="lg" className="mt-2 w-full text-2xl py-4">
            {isLoginMode ? "冒険を つづける！" : "冒険を はじめる！"}
          </Button>
          
          <button 
            type="button" 
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-blue-700 font-bold underline mt-2 hover:text-blue-500 transition-colors"
          >
            {isLoginMode ? "はじめてあそぶひとは こちら" : "まえにあそんだひとは こちら"}
          </button>
        </form>

        <div className="w-full h-1 bg-white/50 rounded-full my-8"></div>

        <Button onClick={handleGuest} variant="outline" className="w-full text-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300">
          とうろくしないで あそぶ
        </Button>
        <p className="text-sm text-center text-emerald-800/70 mt-3 font-bold">
          ※ ゲストも がくねん はえらんでね！
        </p>
      </motion.div>
    </main>
  );
}
