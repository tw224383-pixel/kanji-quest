"use client";

import { useState } from "react";
import { ThemeBackground } from "../../components/ui/ThemeBackground";
import { useUser } from "../../hooks/useUser";
import { Button } from "../../components/ui/Button";
import { RankPlate } from "../../components/ui/RankPlate";
import { KanjiEffect } from "../../components/game/KanjiEffect";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { pullGachaItem, gachaRates, GachaItem } from "../../lib/gachaData";
import { getAllThemes, getAllEffects, getAllTitles, getAllAvatars } from "../../lib/itemData";

const themes = getAllThemes();
const effects = getAllEffects();
const titles = getAllTitles();
const avatars = getAllAvatars();



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
  const [pullStage, setPullStage] = useState(0);
  const [currentBoxIcon, setCurrentBoxIcon] = useState("📦");
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
    setPullStage(1);
    setCurrentBoxIcon("📦");
    
    await updateUserData({ pt: userData.pt - 100 });
    
    const result = pullGachaItem();
    let duplicated = false;

    if (result.type === 'effect') {
      if (userData.effects.includes(result.id)) duplicated = true;
      else await updateUserData({ effects: [...userData.effects, result.id] });
    } else if (result.type === 'avatar') {
      if (userData.avatars.includes(result.id)) duplicated = true;
      else await updateUserData({ avatars: [...userData.avatars, result.id] });
    } else if (result.type === 'title') {
      if (userData.titles.includes(result.id)) duplicated = true;
      else await updateUserData({ titles: [...userData.titles, result.id] });
    } else if (result.type === 'theme') {
      const themeEffectId = `theme_${result.id}`;
      if (userData.effects.includes(themeEffectId)) duplicated = true;
      else await updateUserData({ effects: [...userData.effects, themeEffectId] });
    }

    if (duplicated || result.type === 'xp') {
       await updateUserData({ xp: userData.xp + 50 });
       (result as any).duplicated = true;
    }
    
    const rarityLevels: Record<string, number> = { "ノーマル": 1, "レア": 2, "激レア": 3, "超激レア": 4, "神レア": 5 };
    const targetStage = rarityLevels[result.rarity] || 1;
    
    let currentStage = 1;
    const animateBox = () => {
      setTimeout(() => {
        if (currentStage < targetStage) {
          currentStage++;
          setPullStage(currentStage);
          if (currentStage === 2) setCurrentBoxIcon("🥈");
          if (currentStage === 3) setCurrentBoxIcon("🥇");
          if (currentStage === 4) setCurrentBoxIcon("🌈");
          if (currentStage === 5) setCurrentBoxIcon("🌌");
          animateBox();
        } else {
          setTimeout(() => {
            setPullStage(10);
            setGachaResult(result);
            setIsPulling(false);
          }, 800);
        }
      }, 700);
    };
    
    animateBox();
  };

  const tabs: { id: Tab, label: string }[] = [
    { id: "gacha", label: "🎁 ガチャ" },
    { id: "themes", label: "🎨 テーマ" },
    { id: "effects", label: "✨ エフェクト" },
    { id: "titles", label: "📛 しょうごう" },
    { id: "avatars", label: "👤 アバター" },
  ];

  return (
    <main className={`min-h-screen p-6 relative bg-cover bg-center bg-fixed ${(!previewTheme && (!userData.theme || userData.theme === 'default')) ? "bg-[url('/kanji-quest/images/ui/fantasy_bg.jpg')]" : ""}`}>
      {/* Dark overlay for readability */}
      {(!previewTheme && (!userData.theme || userData.theme === 'default')) && (
        <div className="absolute inset-0 bg-black/40 pointer-events-none z-0"></div>
      )}
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black flex items-center gap-2 text-amber-400 drop-shadow-md text-outline-dark">
            <span>🛍️</span> ショップ
          </h1>
          <Button variant="outline" onClick={() => router.push("/home")}>もどる</Button>
        </div>

        <div className="game-panel p-6 mb-6 flex justify-between items-center">
          <div className="font-bold text-slate-300">もっている PT</div>
          <div className="text-4xl font-black text-amber-400 drop-shadow-md">{userData.pt} <span className="text-xl text-amber-200">PT</span></div>
        </div>
        {/* Full screen theme preview */}
        {previewTheme && previewTheme !== 'default' && (
          <div className="fixed inset-0 pointer-events-none z-[-10]">
            <ThemeBackground theme={previewTheme} />
            <style dangerouslySetInnerHTML={{__html: `
              .game-panel, .game-panel-light { 
                background-color: ${previewTheme === 'cyber' ? 'rgba(0,0,0,0.8)' : 'rgba(15,23,42,0.6)'} !important; 
                backdrop-filter: blur(8px);
                border-color: ${previewTheme === 'cyber' ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.2)'} !important;
              }
              .game-panel-light {
                background-color: ${previewTheme === 'cyber' ? 'rgba(0,0,0,0.6)' : 'rgba(30,41,59,0.7)'} !important;
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
              <div className="game-panel-light p-6 flex flex-col items-center relative overflow-hidden">
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
              className={`px-4 py-3 font-black rounded-xl transition-all border-b-[4px] flex-1 min-w-[120px] shadow-md ${activeTab === t.id ? 'bg-amber-400 text-white border-amber-700 translate-y-1 border-b-0 drop-shadow-game-text' : 'bg-slate-700 text-slate-300 border-slate-900 hover:bg-slate-600'}`}
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
              <div className="game-panel p-8 text-center max-w-2xl mx-auto relative overflow-hidden">
                <div className={`text-6xl mb-6 ${pullStage > 0 && pullStage < 10 ? 'animate-bounce' : ''}`}>
                  {pullStage > 0 && pullStage < 10 ? currentBoxIcon : "🎁"}
                </div>
                <h2 className="text-2xl font-black text-amber-300 mb-2 drop-shadow-md">ランダム宝箱（ガチャ）</h2>
                <p className="text-slate-300 font-bold mb-8">1回 100 PT でレアアバターや限定エフェクトを引き当てよう！</p>
                
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
                  className="mt-2 px-6 py-2 bg-amber-100/50 hover:bg-amber-100 text-amber-800 font-black rounded-full shadow-sm border-2 border-amber-300 transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <span>🔍</span> 中身を見る
                </button>

                <AnimatePresence>
                  {showGachaRates && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-6 text-left game-panel-light p-6 overflow-hidden"
                    >
                      <h3 className="font-black text-blue-900 mb-4 border-b-2 border-blue-200 pb-2">提供割合</h3>
                      <div className="space-y-4">
                        {gachaRates.map((tier, idx) => (
                          <div key={idx} className={`p-4 rounded-lg border ${tier.bg} shadow-inner`}>
                            <div className="flex justify-between items-center mb-3 border-b border-black/10 pb-2">
                              <span className={`font-black text-xl ${tier.color} drop-shadow-sm`}>{tier.rarity}</span>
                              <span className="font-mono font-black text-lg bg-white/60 px-3 py-1 rounded-full text-slate-700">{tier.rate}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {tier.items.map(item => (
                                <div key={item.id} className="bg-white px-2 py-1 rounded shadow-sm text-sm font-bold flex items-center gap-1 text-slate-600">
                                  <span className="text-base">{item.icon}</span>
                                  <span>{item.name.replace(/称号「|アバター「|エフェクト「|テーマ「|」/g, '')}</span>
                                </div>
                              ))}
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
                      className="mt-8 game-panel-light p-6"
                    >
                      <div className={`text-sm font-black mb-2 inline-block px-3 py-1 rounded-full ${
                        gachaResult.rarity === '神レア' ? 'bg-purple-500 text-white animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.8)]' :
                        gachaResult.rarity === '超激レア' ? 'bg-red-500 text-white animate-bounce shadow-[0_0_10px_rgba(239,68,68,0.8)]' :
                        gachaResult.rarity === '激レア' ? 'bg-amber-500 text-white' :
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
                  const canAfford = userData.pt >= (theme.price || 0);
                  return (
                    <div key={theme.id} className={`game-panel-light p-4 flex flex-col gap-3 ${isEquipped ? 'border-primary bg-blue-50/90' : ''}`}>
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
                        ) : theme.isGachaOnly ? (
                          <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">ガチャ限定 🎁</div>
                        ) : (
                          <Button variant={canAfford ? "primary" : "ghost"} disabled={!canAfford} onClick={() => handleBuy("theme", theme.id, theme.price || 0)}>かう</Button>
                        )}
                      </div>
                      <div className="flex justify-end border-t border-slate-200/50 pt-2">
                         <button onClick={() => setPreviewTheme(theme.id)} className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-black shadow-sm border border-indigo-200 hover:bg-indigo-100 hover:scale-105 transition-all flex items-center gap-2">
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
                  const canAfford = userData.pt >= (effect.price || 0);
                  return (
                    <div key={effect.id} className={`game-panel-light p-4 flex flex-col gap-3 ${isEquipped ? 'border-primary bg-blue-50/90' : ''}`}>
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
                        ) : effect.isGachaOnly ? (
                          <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">ガチャ限定 🎁</div>
                        ) : (
                          <Button 
                            variant={canAfford ? "primary" : "ghost"}
                            disabled={!canAfford}
                            onClick={() => handleBuy("effect", effect.id, effect.price || 0)}
                            className="bg-white"
                          >
                            かう
                          </Button>
                        )}
                      </div>
                      <div className="flex justify-end border-t border-slate-200/50 pt-2">
                         <button onClick={() => setPreviewEffect(effect.id)} className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-black shadow-sm border border-indigo-200 hover:bg-indigo-100 hover:scale-105 transition-all flex items-center gap-2">
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
                      allTitles.push({ id: t, name: t, price: 0, isGachaOnly: false });
                    }
                  });
                  return allTitles.map(title => {
                  const isOwned = userData.titles.includes(title.id);
                  const isEquipped = userData.equippedTitle === title.id;
                  const canAfford = userData.pt >= (title.price || 0);
                  return (
                    <div key={title.id} className={`game-panel-light p-4 flex flex-col gap-3 ${isEquipped ? 'border-primary bg-blue-50/90' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-black text-xl text-indigo-900">【{title.id}】</div>
                          {!isOwned && <div className="text-amber-600 font-black mt-1">{title.price} PT</div>}
                        </div>
                        {isEquipped ? (
                          <div className="text-primary font-black px-4">そうび中</div>
                        ) : isOwned ? (
                          <Button variant="secondary" onClick={() => handleEquip("title", title.id)}>そうび</Button>
                        ) : title.isGachaOnly ? (
                          <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">ガチャ限定 🎁</div>
                        ) : (
                          <Button variant={canAfford ? "primary" : "ghost"} disabled={!canAfford} onClick={() => handleBuy("title", title.id, title.price || 0)}>かう</Button>
                        )}
                      </div>
                      <div className="flex justify-end border-t border-slate-200/50 pt-2">
                         <button onClick={() => setPreviewTitle(title.id)} className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-black shadow-sm border border-indigo-200 hover:bg-indigo-100 hover:scale-105 transition-all flex items-center gap-2">
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
                  const canAfford = userData.pt >= (avatar.price || 0);
                  return (
                    <div key={avatar.id} className={`game-panel-light p-4 flex flex-col gap-3 ${isEquipped ? 'border-primary bg-blue-50/90' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-5xl">{avatar.id}</div>
                          {!isOwned && <div className="text-amber-600 font-black">{avatar.price} PT</div>}
                        </div>
                        {isEquipped ? (
                          <div className="text-primary font-black px-4">そうび中</div>
                        ) : isOwned ? (
                          <Button variant="secondary" onClick={() => handleEquip("avatar", avatar.id)}>そうび</Button>
                        ) : avatar.isGachaOnly ? (
                          <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">ガチャ限定 🎁</div>
                        ) : (
                          <Button variant={canAfford ? "primary" : "ghost"} disabled={!canAfford} onClick={() => handleBuy("avatar", avatar.id, avatar.price || 0)}>かう</Button>
                        )}
                      </div>
                      <div className="flex justify-end border-t border-slate-200/50 pt-2">
                         <button onClick={() => setPreviewAvatar(avatar.id)} className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-black shadow-sm border border-indigo-200 hover:bg-indigo-100 hover:scale-105 transition-all flex items-center gap-2">
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
