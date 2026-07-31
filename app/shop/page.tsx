"use client";

import { useState } from "react";
import { ThemeBackground } from "../../components/ui/ThemeBackground";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useUser } from "../../hooks/useUser";
import { Button } from "../../components/ui/Button";
import { RankPlate } from "../../components/ui/RankPlate";
import { KanjiEffect } from "../../components/game/KanjiEffect";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { pullGachaItem, gachaRates, pullRichGachaItem, allRichGachaItems, richGachaRates } from "../../lib/gachaData";
import { getAllThemes, getAllEffects, getAllTitles, getAllAvatars } from "../../lib/itemData";
import { RegularGachaAnimation } from "../../components/game/RegularGachaAnimation";
import { RichGachaAnimation } from "../../components/game/RichGachaAnimation";

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
  const { previewTheme, setPreviewTheme } = useThemeContext();
  const [previewEffect, setPreviewEffect] = useState<string | null>(null);

  // Gacha state
  const [pullingType, setPullingType] = useState<"regular" | "rich" | null>(null);
  const [gachaResult, setGachaResult] = useState<any>(null);
  const [pendingGachaResult, setPendingGachaResult] = useState<any>(null);
  const [gachaTargetStage, setGachaTargetStage] = useState(1);
  const [showGachaRates, setShowGachaRates] = useState<"regular" | "rich" | null>(null);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-2xl">ロード中...</div>;
  if (!userData) {
    router.push("/");
    return null;
  }

  const handleBuy = async (category: string, id: string, price: number) => {
    if (userData.pt < price) return;
    const newPt = userData.pt - price;
    if (category === "theme") {
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

  const pullGacha = async (isRich: boolean = false) => {
    const cost = isRich ? 3000 : 100;
    if (userData.pt < cost || pullingType) return;
    setPullingType(isRich ? "rich" : "regular");
    setGachaResult(null);
    setShowGachaRates(null);
    await updateUserData({ pt: userData.pt - cost });
    
    const result = isRich ? pullRichGachaItem() : pullGachaItem();
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
      if (isRich) {
        await updateUserData({ pt: userData.pt + 1000 });
        (result as any).duplicated = true;
        (result as any).refund = "1000 PT";
      } else {
        await updateUserData({ xp: userData.xp + 50 });
        (result as any).duplicated = true;
        (result as any).refund = "50 XP";
      }
    }
    
    const rarityLevels: Record<string, number> = { "ノーマル": 1, "レア": 2, "激レア": 3, "超激レア": 4, "神レア": 5 };
    setGachaTargetStage(rarityLevels[result.rarity] || 1);
    setPendingGachaResult(result);
  };

  const tabs: { id: Tab, label: string }[] = [
    { id: "gacha", label: "🎁 ガチャ" },
    { id: "themes", label: "🎨 テーマ" },
    { id: "effects", label: "✨ エフェクト" },
    { id: "titles", label: "📛 しょうごう" },
    { id: "avatars", label: "👤 アバター" },
  ];

  const activeTheme = previewTheme ?? userData.theme ?? 'default';
  const isDefaultTheme = !activeTheme || activeTheme === 'default';

  return (
    <>
      {/* Gacha animation full screen */}
      {pullingType === "rich" && pendingGachaResult && (
        <RichGachaAnimation
          targetStage={gachaTargetStage}
          onComplete={() => {
            setGachaResult(pendingGachaResult);
            setPendingGachaResult(null);
            setPullingType(null);
          }}
        />
      )}
      {pullingType === "regular" && pendingGachaResult && (
        <RegularGachaAnimation
          onComplete={() => {
            setGachaResult(pendingGachaResult);
            setPendingGachaResult(null);
            setPullingType(null);
          }}
        />
      )}

      {/* Fixed background layer has been moved to global ThemeProvider to prevent overlap bugs */}

      {/* Effect preview overlay - z-50 */}
      {previewEffect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/60 backdrop-blur-sm">
          <div className="relative flex items-center justify-center w-full h-full">
            <KanjiEffect effect={previewEffect} />
            <div className="text-[180px] leading-none font-serif text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] z-10 relative select-none">
              漢
            </div>
          </div>
          <div className="absolute bottom-12 left-0 right-0 text-center z-20 flex flex-col items-center gap-4">
            <div className="text-white font-black text-2xl drop-shadow-md">✨ こんな感じになるよ！ ✨</div>
            <div className="flex gap-4">
              <Button variant="secondary" size="lg" onClick={() => handleEquip("effect", previewEffect)} className="shadow-2xl">
                ✅ そうびする
              </Button>
              <Button variant="danger" size="lg" onClick={() => setPreviewEffect(null)} className="shadow-2xl">
                ❌ やめる
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Theme preview banner - z-40 */}
      {previewTheme && (
        <div className="fixed top-0 left-0 right-0 z-40 flex justify-center items-center gap-4 py-3 bg-black/80 backdrop-blur-sm">
          <div className="text-white font-black text-base">👀 しちゃく中: {themes.find(t => t.id === previewTheme)?.name ?? previewTheme}</div>
          <Button variant="secondary" size="sm" onClick={() => handleEquip("theme", previewTheme)}>✅ そうびする</Button>
          <Button variant="danger" size="sm" onClick={() => setPreviewTheme(null)}>❌ やめる</Button>
        </div>
      )}

      {/* Main page content - z-10 */}
      <main className={`min-h-screen p-6 relative z-10 ${previewTheme ? 'pt-20' : ''}`}>
        <div className="max-w-4xl mx-auto">
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

          {/* Preview Area for Titles and Avatars */}
          <AnimatePresence>
            {(previewTitle || previewAvatar || activeTab === "titles" || activeTab === "avatars") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-8"
              >
                <div className="game-panel-light p-6 flex flex-col items-center relative overflow-hidden">
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

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* ===== GACHA TAB ===== */}
              {activeTab === "gacha" && (
                <div className="game-panel p-8 text-center max-w-2xl mx-auto relative overflow-hidden">
                  <div className="text-6xl mb-6">🎁</div>
                  <h2 className="text-2xl font-black text-amber-300 mb-2 drop-shadow-md">ランダム宝箱（ガチャ）</h2>
                  <p className="text-slate-300 font-bold mb-4">通常ガチャは100PT、リッチガチャは3000PTで限定AIアバターが当たる！</p>
                  
                  <div className="flex flex-col md:flex-row gap-4 justify-center mb-6 items-stretch">
                    <div className="flex-1 game-panel-light p-4 bg-slate-800/80 border-2 border-amber-900/50 flex flex-col justify-between">
                      <div>
                        <div className="text-amber-200 font-black mb-2">通常ガチャ (100 PT)</div>
                        <button
                          onClick={() => setShowGachaRates(showGachaRates === "regular" ? null : "regular")}
                          className="mb-4 px-4 py-1 bg-amber-100/50 hover:bg-amber-100 text-amber-800 font-black text-sm rounded-full shadow-sm border border-amber-300 transition-colors inline-flex items-center justify-center gap-1"
                        >
                          <span>🔍</span> 中身を見る
                        </button>
                      </div>
                      <Button
                        size="lg"
                        variant="fun"
                        className={`w-full py-4 ${pullingType ? 'animate-pulse' : ''}`}
                        onClick={() => pullGacha(false)}
                        disabled={pullingType !== null || userData.pt < 100}
                      >
                        {pullingType ? "..." : "100 PT で まわす！"}
                      </Button>
                    </div>
                    
                    <div className="flex-1 game-panel-light p-4 bg-amber-900/80 border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)] flex flex-col justify-between">
                      <div>
                        <div className="text-yellow-300 font-black mb-2">💎 リッチガチャ (3000 PT)</div>
                        <button
                          onClick={() => setShowGachaRates(showGachaRates === "rich" ? null : "rich")}
                          className="mb-4 px-4 py-1 bg-yellow-100/50 hover:bg-yellow-100 text-yellow-900 font-black text-sm rounded-full shadow-sm border border-yellow-400 transition-colors inline-flex items-center justify-center gap-1"
                        >
                          <span>🔍</span> 中身を見る
                        </button>
                      </div>
                      <Button
                        size="lg"
                        variant="primary"
                        className={`w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white font-black shadow-[0_0_10px_rgba(250,204,21,0.5)] ${pullingType ? 'animate-pulse' : ''}`}
                        onClick={() => pullGacha(true)}
                        disabled={pullingType !== null || userData.pt < 3000}
                      >
                        {pullingType ? "..." : "3000 PT で まわす！"}
                      </Button>
                    </div>
                  </div>
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
                          {(showGachaRates === "rich" ? richGachaRates : gachaRates).map((tier, idx) => (
                            <div key={idx} className={`p-4 rounded-lg border ${tier.bg} shadow-inner`}>
                              <div className="flex justify-between items-center mb-3 border-b border-black/10 pb-2">
                                <span className={`font-black text-xl ${tier.color} drop-shadow-sm`}>{tier.rarity}</span>
                                <span className="font-mono font-black text-lg bg-white/60 px-3 py-1 rounded-full text-slate-700">{tier.rate}</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {tier.items.map(item => {
                                  let typeLabel = "不明";
                                  let typeColor = "bg-gray-100 text-gray-600";
                                  if (item.type === "title") { typeLabel = "称号"; typeColor = "bg-blue-100 text-blue-700"; }
                                  else if (item.type === "avatar") { typeLabel = "アバター"; typeColor = "bg-green-100 text-green-700"; }
                                  else if (item.type === "effect") { typeLabel = "エフェクト"; typeColor = "bg-purple-100 text-purple-700"; }
                                  else if (item.type === "theme") { typeLabel = "テーマ"; typeColor = "bg-pink-100 text-pink-700"; }
                                  
                                  return (
                                    <div key={item.id} className="bg-white px-2 py-1 rounded shadow-sm text-sm font-bold flex items-center gap-2 text-slate-600">
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${typeColor}`}>{typeLabel}</span>
                                      <span className="text-base flex items-center justify-center min-w-[20px]">
                                        {item.icon.startsWith('/') ? <img src={item.icon} alt="icon" className="w-5 h-5 rounded-full object-cover inline-block" /> : item.icon}
                                      </span>
                                      <span>{item.name.replace(/称号「|アバター「|エフェクト「|テーマ「|」/g, '')}</span>
                                    </div>
                                  );
                                })}
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
                        <div className="text-6xl my-4 drop-shadow-md flex justify-center">
                          {gachaResult.icon.startsWith('/') ? (
                            <img src={gachaResult.icon} alt={gachaResult.name} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl" />
                          ) : (
                            gachaResult.icon
                          )}
                        </div>
                        <div className="text-2xl font-black text-slate-800">{gachaResult.name}</div>
                        {gachaResult.duplicated && (
                          <div className="text-amber-600 font-bold mt-2 text-sm bg-amber-100 p-2 rounded-lg">
                            すでにもっていたので、代わりに {gachaResult.refund} 獲得した！
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ===== THEMES TAB ===== */}
              {activeTab === "themes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {themes.map(theme => {
                    const isOwned = theme.price === 0 || userData.effects.includes(`theme_${theme.id}`);
                    const isEquipped = userData.theme === theme.id || (!userData.theme && theme.id === 'default');
                    const canAfford = userData.pt >= (theme.price || 0);
                    const isPreviewing = previewTheme === theme.id;
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
                          <button
                            onClick={() => setPreviewTheme(isPreviewing ? null : theme.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-black shadow-sm border transition-all flex items-center gap-2 ${isPreviewing ? 'bg-indigo-500 text-white border-indigo-700' : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 hover:scale-105'}`}
                          >
                            👀 しちゃく{isPreviewing ? '中' : ''}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ===== EFFECTS TAB ===== */}
              {activeTab === "effects" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {effects.map(effect => {
                    const isOwned = userData.effects.includes(effect.id);
                    const isEquipped = userData.equippedEffect === effect.id;
                    const canAfford = userData.pt >= (effect.price || 0);
                    const isPreviewing = previewEffect === effect.id;
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
                            <Button variant={canAfford ? "primary" : "ghost"} disabled={!canAfford} onClick={() => handleBuy("effect", effect.id, effect.price || 0)}>かう</Button>
                          )}
                        </div>
                        <div className="flex justify-end border-t border-slate-200/50 pt-2">
                          <button
                            onClick={() => setPreviewEffect(isPreviewing ? null : effect.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-black shadow-sm border transition-all flex items-center gap-2 ${isPreviewing ? 'bg-indigo-500 text-white border-indigo-700' : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 hover:scale-105'}`}
                          >
                            👀 しちゃく{isPreviewing ? '中' : ''}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ===== TITLES TAB ===== */}
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
                      const isPreviewing = previewTitle === title.id;
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
                            <button
                              onClick={() => setPreviewTitle(isPreviewing ? null : title.id)}
                              className={`px-4 py-2 rounded-lg text-sm font-black shadow-sm border transition-all flex items-center gap-2 ${isPreviewing ? 'bg-indigo-500 text-white border-indigo-700' : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 hover:scale-105'}`}
                            >
                              👀 しちゃく{isPreviewing ? '中' : ''}
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}

              {/* ===== AVATARS TAB ===== */}
              {activeTab === "avatars" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {avatars.map(avatar => {
                    const isOwned = userData.avatars.includes(avatar.id);
                    const isEquipped = userData.equippedAvatar === avatar.id;
                    const canAfford = userData.pt >= (avatar.price || 0);
                    const isPreviewing = previewAvatar === avatar.id;
                    return (
                      <div key={avatar.id} className={`game-panel-light p-4 flex flex-col gap-3 ${isEquipped ? 'border-primary bg-blue-50/90' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-5xl flex justify-center w-16">
                              {avatar.icon && avatar.icon.startsWith('/') ? (
                                <img src={avatar.icon} alt={avatar.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" />
                              ) : (
                                avatar.id
                              )}
                            </div>
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
                          <button
                            onClick={() => setPreviewAvatar(isPreviewing ? null : avatar.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-black shadow-sm border transition-all flex items-center gap-2 ${isPreviewing ? 'bg-indigo-500 text-white border-indigo-700' : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 hover:scale-105'}`}
                          >
                            👀 しちゃく{isPreviewing ? '中' : ''}
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
    </>
  );
}
