"use client";

import { useState } from "react";
import { ThemeBackground } from "../../components/ui/ThemeBackground";
import { useUser } from "../../hooks/useUser";
import { Button } from "../../components/ui/Button";
import { RankPlate } from "../../components/ui/RankPlate";
import { KanjiEffect } from "../../components/game/KanjiEffect";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const themes = [
  { id: "default", name: "いつもの", price: 0, icon: "📄" },
  { id: "space", name: "うちゅう", price: 5000, icon: "🚀" },
  { id: "ninja", name: "にんじゃ", price: 7500, icon: "🥷" },
  { id: "cyber", name: "サイバー", price: 10000, icon: "⚡" },
];

const effects = [
  { id: "fire", name: "ほのお", price: 200, icon: "🔥" },
  { id: "water", name: "みず", price: 500, icon: "💧" },
  { id: "thunder", name: "いかずち", price: 1000, icon: "⚡" },
  { id: "star", name: "ほし", price: 2000, icon: "⭐" },
  { id: "rainbow", name: "にじ", price: 3000, icon: "🌈" },
];

const titles = [
  { id: "見習い", price: 0 },
  { id: "炎の", price: 300 },
  { id: "伝説の", price: 1000 },
  { id: "漢字マスター", price: 3000 },
  { id: "神話の", price: 5000 },
];

const avatars = [
  { id: "👦", name: "男の子", price: 0 },
  { id: "👧", name: "女の子", price: 0 },
  { id: "⚔️", name: "戦士", price: 100 },
  { id: "🛡️", name: "騎士", price: 200 },
  { id: "🐶", name: "イヌ", price: 300 },
  { id: "🐱", name: "ネコ", price: 300 },
  { id: "🐲", name: "ドラゴン", price: 800 },
  { id: "🦄", name: "ユニコーン", price: 1000 },
  { id: "👽", name: "宇宙人", price: 1200 },
  { id: "👻", name: "おばけ", price: 1200 },
  { id: "🤖", name: "ロボット", price: 1500 },
  { id: "👾", name: "エイリアン", price: 1500 },
  { id: "🧙‍♂️", name: "魔法使い", price: 1800 },
  { id: "🧛", name: "吸血鬼", price: 1800 },
  { id: "🧚", name: "妖精", price: 2000 },
  { id: "🦸", name: "ヒーロー", price: 2000 },
  { id: "🥷", name: "忍者", price: 2200 },
  { id: "🦁", name: "ライオン", price: 2500 },
  { id: "🦅", name: "タカ", price: 2500 },
  { id: "🦖", name: "恐竜", price: 2800 },
  { id: "🚀", name: "ロケット", price: 3000 },
  { id: "🛸", name: "UFO", price: 3000 },
  { id: "🏅", name: "マスターメダル", price: 99999 },
  { id: "🏆", name: "大マスターカップ", price: 99999 },
];

const gachaDrops = [
  { id: "xp", name: "経験値 +50", icon: "💎", rarity: "ノーマル", rate: "70%" },
  { id: "alien", name: "アバター「👽」", icon: "👽", rarity: "レア", rate: "7.5%" },
  { id: "ghost", name: "アバター「👻」", icon: "👻", rarity: "レア", rate: "7.5%" },
  { id: "robot", name: "アバター「🤖」", icon: "🤖", rarity: "レア", rate: "7.5%" },
  { id: "monster", name: "アバター「👾」", icon: "👾", rarity: "レア", rate: "2.5%" },
  { id: "sparkle", name: "きらきらエフェクト", icon: "✨", rarity: "超レア", rate: "5%" },
];

type Tab = "themes" | "effects" | "titles" | "avatars" | "gacha";

export default function ShopPage() {
  const { userData, updateUserData, loading } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("gacha");
  
  const [previewTitle, setPreviewTitle] = useState<string | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const [previewEffect, setPreviewEffect] = useState<string | null>(null);

  // Gacha state
  const [isPulling, setIsPulling] = useState(false);
  const [gachaResult, setGachaResult] = useState<any>(null);
  const [showGachaRates, setShowGachaRates] = useState(false);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-2xl">ロード中...</div>;
  if (!userData) {
    router.push("/");
    return null;
  }

  const handleBuy = async (category: string, id: string, price: number) => {
    if (userData.pt < price) return;
    
    const newPt = userData.pt - price;
    if (category === "theme" && userData.theme !== id) {
      const isOwned = userData.effects.includes(`theme_${id}`);
      if (!isOwned) {
        await updateUserData({ pt: newPt, effects: [...userData.effects, `theme_${id}`], theme: id });
      } else {
        await updateUserData({ theme: id });
      }
    } else if (category === "effect" && !userData.effects.includes(id)) {
      await updateUserData({ pt: newPt, effects: [...userData.effects, id] });
    } else if (category === "title" && !userData.titles.includes(id)) {
      await updateUserData({ pt: newPt, titles: [...userData.titles, id] });
    } else if (category === "avatar" && !userData.avatars.includes(id)) {
      await updateUserData({ pt: newPt, avatars: [...userData.avatars, id] });
    }
  };

  const handleEquip = async (category: "title" | "avatar" | "theme" | "effect", id: string) => {
    if (category === "title") await updateUserData({ equippedTitle: id });
    if (category === "avatar") await updateUserData({ equippedAvatar: id });
    if (category === "theme") await updateUserData({ theme: id });
    if (category === "effect") await updateUserData({ equippedEffect: id });
    setPreviewTitle(null);
    setPreviewAvatar(null);
    setPreviewTheme(null);
    setPreviewEffect(null);
  };

  const pullGacha = async () => {
    if (userData.pt < 100 || isPulling) return;
    
    setIsPulling(true);
    setGachaResult(null);
    setShowGachaRates(false);
    
    await updateUserData({ pt: userData.pt - 100 });
    
    setTimeout(async () => {
      const rand = Math.random();
      let result: any = null;
      let duplicated = false;
      
      if (rand < 0.05) {
         result = { type: 'effect', id: 'sparkle', name: 'きらきらエフェクト', icon: '✨', rarity: '超レア' };
         if (userData.effects.includes(result.id)) duplicated = true;
         else await updateUserData({ effects: [...userData.effects, result.id] });
      } else if (rand < 0.3) {
         const rares = ['👽', '👻', '🤖', '👾'];
         const selected = rares[Math.floor(Math.random() * rares.length)];
         result = { type: 'avatar', id: selected, name: `アバター「${selected}」`, icon: selected, rarity: 'レア' };
         if (userData.avatars.includes(result.id)) duplicated = true;
         else await updateUserData({ avatars: [...userData.avatars, result.id] });
      } else {
         result = { type: 'xp', id: 'xp', name: '経験値 +50', icon: '💎', rarity: 'ノーマル' };
         await updateUserData({ xp: userData.xp + 50 });
      }

      if (duplicated && result.type !== 'xp') {
         await updateUserData({ xp: userData.xp + 50 });
         result.duplicated = true;
      }
      
      setGachaResult(result);
      setIsPulling(false);
    }, 1500);
  };

  const tabs: { id: Tab, label: string }[] = [
    { id: "gacha", label: "🎁 ガチャ" },
    { id: "themes", label: "🎨 テーマ" },
    { id: "effects", label: "✨ エフェクト" },
    { id: "titles", label: "📛 しょうごう" },
    { id: "avatars", label: "👤 アバター" },
  ];

  return (
    <main className="min-h-screen p-6 z-10 relative">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black flex items-center gap-2 drop-shadow-sm">
            <span>🛍️</span> ショップ
          </h1>
          <Button variant="outline" onClick={() => router.push("/home")} className="bg-white/80">もどる</Button>
        </div>

        <div className="glass rounded-3xl p-6 shadow-md mb-6 flex justify-between items-center border-4 border-white/50 bg-white/70">
          <div className="font-bold text-slate-700">もっている PT</div>
          <div className="text-4xl font-black text-amber-500">{userData.pt} <span className="text-xl">PT</span></div>
        </div>
        {/* Full screen theme preview */}
        {previewTheme && previewTheme !== 'default' && (
          <div className="fixed inset-0 pointer-events-none z-0">
            <ThemeBackground theme={previewTheme} />
            <style dangerouslySetInnerHTML={{__html: `
              body { background-image: none !important; background-color: ${previewTheme === 'space' ? '#0f172a' : previewTheme === 'ninja' ? '#27272a' : '#000'} !important; }
              main { background: transparent !important; }
              .glass { 
                background: ${previewTheme === 'cyber' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.1)'} !important; 
                border-color: ${previewTheme === 'cyber' ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.2)'} !important;
                color: ${previewTheme === 'cyber' ? '#22d3ee' : '#f8fafc'} !important;
              }
              .glass .text-slate-800, .glass .text-slate-700, .glass .text-gray-600 {
                color: ${previewTheme === 'cyber' ? '#67e8f9' : '#f8fafc'} !important;
              }
            `}} />
          </div>
        )}

        {/* Full screen effect preview */}
        {previewEffect && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden bg-black/40 backdrop-blur-sm">
            <div className="relative flex items-center justify-center w-full h-full max-w-lg max-h-lg">
              <KanjiEffect effect={previewEffect} />
              <div className="text-[150px] leading-none font-serif text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] z-10 relative">
                漢
              </div>
            </div>
            <div className="absolute top-8 right-8 z-20 pointer-events-auto">
              <Button variant="danger" size="lg" onClick={() => setPreviewEffect(null)} className="shadow-2xl shadow-red-500/50">
                ❌ 試着をやめる
              </Button>
            </div>
            <div className="absolute bottom-20 left-0 right-0 text-center text-white font-bold text-2xl drop-shadow-md">
              ✨ こんな感じになるよ！ ✨
            </div>
          </div>
        )}

        {/* Preview Area for Titles and Avatars */}
        <AnimatePresence>
          {(previewTitle || previewAvatar || previewTheme || previewEffect || activeTab === "titles" || activeTab === "avatars") && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8"
            >
              <div className="glass p-6 rounded-3xl flex flex-col items-center border-4 border-dashed border-indigo-200 bg-indigo-50/50 relative overflow-hidden">
                {(previewTheme || previewEffect) && (
                  <Button variant="danger" size="sm" className="absolute top-2 right-2 z-10" onClick={() => {setPreviewTheme(null); setPreviewEffect(null);}}>
                    試着をやめる
                  </Button>
                )}
                <div className="text-sm font-black text-indigo-400 mb-4 z-10">✨ プレビュー ✨</div>
                <div className="max-w-xs w-full pointer-events-none z-10">
                  <RankPlate 
                    level={Math.floor(userData.xp / 100) + 1} 
                    name={userData.name} 
                    title={previewTitle || userData.equippedTitle} 
                    avatar={previewAvatar || userData.equippedAvatar}
                    isMvp={userData.totalDamage > 0}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(t => (
            <button 
              key={t.id}
              onClick={() => { setActiveTab(t.id); setGachaResult(null); setPreviewTitle(null); setPreviewAvatar(null); setPreviewTheme(null); setPreviewEffect(null); }} 
              className={`px-4 py-3 font-black rounded-xl transition-all border-b-4 flex-1 min-w-[120px] ${activeTab === t.id ? 'bg-amber-400 text-white border-amber-600 shadow-sm translate-y-1 border-b-0' : 'bg-white/80 text-amber-600 border-amber-200 hover:bg-amber-50'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "gacha" && (
              <div className="glass rounded-[3rem] p-8 text-center border-4 border-amber-300 bg-amber-50/90 shadow-xl max-w-2xl mx-auto relative overflow-hidden">
                <div className="text-6xl mb-6">{isPulling ? "📦" : "🎁"}</div>
                <h2 className="text-2xl font-black text-amber-800 mb-2">ランダム宝箱（ガチャ）</h2>
                <p className="text-slate-600 font-bold mb-8">1回 100 PT でレアアバターや限定エフェクトを引き当てよう！</p>
                
                <Button 
                  size="lg" 
                  variant="fun" 
                  className={`w-full max-w-sm text-2xl py-6 mb-6 ${isPulling ? 'animate-pulse' : ''}`}
                  onClick={pullGacha}
                  disabled={isPulling || userData.pt < 100}
                >
                  {isPulling ? "まわしています..." : "100 PT で まわす！"}
                </Button>
                
                <button 
                  onClick={() => setShowGachaRates(!showGachaRates)}
                  className="text-amber-600 font-bold underline hover:text-amber-800"
                >
                  中身を見る
                </button>

                <AnimatePresence>
                  {showGachaRates && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-6 text-left bg-white p-6 rounded-2xl border-2 border-amber-200 shadow-inner overflow-hidden"
                    >
                      <h3 className="font-black text-amber-800 mb-4 border-b-2 border-amber-100 pb-2">提供割合</h3>
                      <div className="space-y-3">
                        {gachaDrops.map(drop => (
                          <div key={drop.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{drop.icon}</span>
                              <span className="font-bold text-slate-700">{drop.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`text-xs font-black px-2 py-1 rounded ${drop.rarity === '超レア' ? 'bg-red-500 text-white' : drop.rarity === 'レア' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}>{drop.rarity}</span>
                              <span className="font-mono font-bold text-amber-600">{drop.rate}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {gachaResult && (
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      className="mt-8 bg-white rounded-3xl p-6 border-4 border-amber-200 shadow-inner"
                    >
                      <div className={`text-sm font-black mb-2 inline-block px-3 py-1 rounded-full ${
                        gachaResult.rarity === '超レア' ? 'bg-red-500 text-white animate-bounce' :
                        gachaResult.rarity === 'レア' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {gachaResult.rarity}
                      </div>
                      <div className="text-6xl my-4 drop-shadow-md">{gachaResult.icon}</div>
                      <div className="text-2xl font-black text-slate-800">{gachaResult.name}</div>
                      {gachaResult.duplicated && (
                        <div className="text-amber-600 font-bold mt-2 text-sm bg-amber-100 p-2 rounded-lg">
                          すでにもっていたので、代わりに 50 XP 獲得した！
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {activeTab === "themes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {themes.map(theme => {
                  const isOwned = theme.price === 0 || userData.effects.includes(`theme_${theme.id}`);
                  const isEquipped = userData.theme === theme.id;
                  const canAfford = userData.pt >= theme.price;
                  return (
                    <div key={theme.id} className={`glass rounded-2xl p-4 shadow-sm border-4 flex flex-col gap-3 ${isEquipped ? 'border-primary bg-primary/10' : 'border-white/50 bg-white/60'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{theme.icon}</div>
                          <div>
                            <div className="font-bold text-lg text-slate-800">{theme.name}</div>
                            {!isOwned && <div className="text-amber-600 font-black">{theme.price} PT</div>}
                          </div>
                        </div>
                        {isEquipped ? (
                          <div className="text-primary font-black px-4">そうび中</div>
                        ) : isOwned ? (
                          <Button variant="secondary" onClick={() => handleEquip("theme", theme.id)}>そうび</Button>
                        ) : (
                          <Button variant={canAfford ? "primary" : "ghost"} disabled={!canAfford} onClick={() => handleBuy("theme", theme.id, theme.price)}>かう</Button>
                        )}
                      </div>
                      <div className="flex justify-end border-t border-slate-200/50 pt-2">
                         <button onClick={() => setPreviewTheme(theme.id)} className="text-sm font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1">
                           👀 しちゃく
                         </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "effects" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {effects.map(effect => {
                  const isOwned = userData.effects.includes(effect.id);
                  const isEquipped = userData.equippedEffect === effect.id;
                  const canAfford = userData.pt >= effect.price;
                  return (
                    <div key={effect.id} className={`glass rounded-2xl p-4 shadow-sm border-2 flex flex-col gap-3 ${isEquipped ? 'border-primary bg-primary/10' : 'border-white/50 bg-white/60'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{effect.icon}</div>
                          <div>
                            <div className="font-bold text-lg text-slate-800">{effect.name}</div>
                            {!isOwned && <div className="text-amber-600 font-black">{effect.price} PT</div>}
                          </div>
                        </div>
                        {isEquipped ? (
                          <div className="text-primary font-black px-4">そうび中</div>
                        ) : isOwned ? (
                          <Button variant="secondary" onClick={() => handleEquip("effect", effect.id)}>そうび</Button>
                        ) : (
                          <Button 
                            variant={canAfford ? "primary" : "ghost"}
                            disabled={!canAfford}
                            onClick={() => handleBuy("effect", effect.id, effect.price)}
                            className="bg-white"
                          >
                            かう
                          </Button>
                        )}
                      </div>
                      <div className="flex justify-end border-t border-slate-200/50 pt-2">
                         <button onClick={() => setPreviewEffect(effect.id)} className="text-sm font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1">
                           👀 しちゃく
                         </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "titles" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                  const allTitles = [...titles];
                  userData.titles.forEach(t => {
                    if (!allTitles.find(x => x.id === t)) {
                      allTitles.push({ id: t, price: 0 });
                    }
                  });
                  return allTitles.map(title => {
                  const isOwned = userData.titles.includes(title.id);
                  const isEquipped = userData.equippedTitle === title.id;
                  const canAfford = userData.pt >= title.price;
                  return (
                    <div key={title.id} className={`glass rounded-2xl p-4 shadow-sm border-2 flex flex-col gap-3 ${isEquipped ? 'border-primary bg-primary/10' : 'border-white/50 bg-white/60'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-black text-xl text-indigo-900">【{title.id}】</div>
                          {!isOwned && <div className="text-amber-600 font-black mt-1">{title.price} PT</div>}
                        </div>
                        {isEquipped ? (
                          <div className="text-primary font-black px-4">そうび中</div>
                        ) : isOwned ? (
                          <Button variant="secondary" onClick={() => handleEquip("title", title.id)}>そうび</Button>
                        ) : (
                          <Button variant={canAfford ? "primary" : "ghost"} disabled={!canAfford} onClick={() => handleBuy("title", title.id, title.price)}>かう</Button>
                        )}
                      </div>
                      <div className="flex justify-end border-t border-slate-200/50 pt-2">
                         <button onClick={() => setPreviewTitle(title.id)} className="text-sm font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1">
                           👀 しちゃく
                         </button>
                      </div>
                    </div>
                  );
                })})()}
              </div>
            )}

            {activeTab === "avatars" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {avatars.map(avatar => {
                  const isOwned = userData.avatars.includes(avatar.id);
                  const isEquipped = userData.equippedAvatar === avatar.id;
                  const canAfford = userData.pt >= avatar.price;
                  return (
                    <div key={avatar.id} className={`glass rounded-2xl p-4 shadow-sm border-2 flex flex-col gap-3 ${isEquipped ? 'border-primary bg-primary/10' : 'border-white/50 bg-white/60'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-5xl">{avatar.id}</div>
                          {!isOwned && <div className="text-amber-600 font-black">{avatar.price} PT</div>}
                        </div>
                        {isEquipped ? (
                          <div className="text-primary font-black px-4">そうび中</div>
                        ) : isOwned ? (
                          <Button variant="secondary" onClick={() => handleEquip("avatar", avatar.id)}>そうび</Button>
                        ) : (
                          <Button variant={canAfford ? "primary" : "ghost"} disabled={!canAfford} onClick={() => handleBuy("avatar", avatar.id, avatar.price)}>かう</Button>
                        )}
                      </div>
                      <div className="flex justify-end border-t border-slate-200/50 pt-2">
                         <button onClick={() => setPreviewAvatar(avatar.id)} className="text-sm font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1">
                           👀 しちゃく
                         </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </main>
  );
}
