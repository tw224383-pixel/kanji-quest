"use client";

import { useState, useEffect } from "react";
import { ThemeBackground } from "../../components/ui/ThemeBackground";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useUser } from "../../hooks/useUser";
import { Button } from "../../components/ui/Button";
import { LoadingScreen } from "../../components/ui/LoadingScreen";
import { AvatarRarityEffect } from "../../components/ui/AvatarRarityEffect";
import { RankPlate } from "../../components/ui/RankPlate";
import { KanjiEffect } from "../../components/game/KanjiEffect";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { getAllThemes, getAllEffects, getAllTitles, getAllAvatars, getAvatarInfo, getAvatarImageProps, getAvatarThumbUrl } from "../../lib/itemData";
import { getAllEquipment } from "../../lib/equipmentData";
import { calculateLevel } from "../../lib/gameLogic";
import { calculateAdventurerStats } from "../../lib/userStatsLogic";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { storage } from "../../lib/storage";

import { AdventurerGrowthReport } from "../../components/profile/AdventurerGrowthReport";
import { ShareCodeCard } from "../../components/profile/ShareCodeCard";
import { useToast } from "../../components/ui/Toast";

const AvatarPreviewModal = dynamic(() => import("../../components/ui/AvatarPreviewModal").then(mod => mod.AvatarPreviewModal), { ssr: false });
const EquipmentPreviewModal = dynamic(() => import("../../components/ui/EquipmentPreviewModal").then(mod => mod.EquipmentPreviewModal), { ssr: false });

const allThemes = getAllThemes();
const allEffects = getAllEffects();
const allTitles = getAllTitles();
const allAvatars = getAllAvatars();
const allEquipments = getAllEquipment();

type Tab = "stats" | "avatars" | "equipments" | "titles" | "themes" | "effects";

export default function ProfilePage() {
  const { userData, updateUserData, logout, loading } = useUser();
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("stats");
  
  const [previewTitle, setPreviewTitle] = useState<string | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [previewEquipment, setPreviewEquipment] = useState<string | null>(null);
  const { previewTheme, setPreviewTheme } = useThemeContext();
  const [previewEffect, setPreviewEffect] = useState<string | null>(null);
  const [previewingAvatarModal, setPreviewingAvatarModal] = useState<{url?: string, id?: string, name?: string} | null>(null);
  const [previewingEquipmentModal, setPreviewingEquipmentModal] = useState<string | null>(null);

  const [selectedRarity, setSelectedRarity] = useState<string>("all");

  useEffect(() => {
    return () => setPreviewTheme(null);
  }, [setPreviewTheme]);

  const handleLogout = async () => {
    if (confirm("ログアウトしますか？")) {
      await logout();
      router.push("/");
    }
  };

  if (loading) return <LoadingScreen />;
  if (!userData) {
    router.push("/");
    return null;
  }

  const handleEquip = async (category: "title" | "avatar" | "theme" | "effect" | "equipment", id: string) => {
    let ok = true;
    if (category === "title") ok = await updateUserData({ equippedTitle: id });
    if (category === "avatar") ok = await updateUserData({ equippedAvatar: id });
    if (category === "theme") ok = await updateUserData({ theme: id });
    if (category === "effect") ok = await updateUserData({ equippedEffect: id });
    if (category === "equipment") ok = await updateUserData({ equippedEquipment: id });
    if (!ok) showToast("へんこうを保存できませんでした。もう一度お試しください");
    setPreviewTitle(null);
    setPreviewAvatar(null);
    setPreviewEquipment(null);
    setPreviewTheme(null);
    setPreviewEffect(null);
  };

  const tabs: { id: Tab, label: string }[] = [
    { id: "stats", label: "📊 せいちょうカルテ" },
    { id: "avatars", label: "👤 アバター" },
    { id: "equipments", label: "⚔️ そうび" },
    { id: "titles", label: "📛 しょうごう" },
    { id: "themes", label: "🎨 テーマ" },
    { id: "effects", label: "✨ エフェクト" },
  ];

  // Determine the current active theme to display as background
  const activeTheme = previewTheme ?? userData.theme ?? 'default';
  const isDefaultTheme = !activeTheme || activeTheme === 'default';

  return (
    <>
      {/* Fixed background layer has been moved to global ThemeProvider to prevent overlap bugs */}
      {/* Full screen effect preview overlay */}
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

      {/* Theme preview banner */}
      {previewTheme && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center gap-4 py-3 bg-black/70 backdrop-blur-sm">
          <div className="text-white font-black text-lg">👀 しちゃく中: {allThemes.find(t => t.id === previewTheme)?.name}</div>
          <Button variant="secondary" size="sm" onClick={() => handleEquip("theme", previewTheme)}>✅ そうびする</Button>
          <Button variant="danger" size="sm" onClick={() => setPreviewTheme(null)}>❌ やめる</Button>
        </div>
      )}

      <main className="min-h-screen p-6 relative z-10">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className={`flex items-center justify-between mb-6 ${previewTheme ? 'mt-16' : ''}`}>
            <h1 className="text-3xl font-black flex items-center gap-2 text-indigo-300 drop-shadow-md text-outline-dark">
              <span>👑</span> プロフィール・きせかえ
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="danger" onClick={handleLogout}>ログアウト</Button>
              <Button variant="outline" onClick={() => router.push("/home")}>もどる</Button>
            </div>
          </div>

          {/* Preview Area for Titles and Avatars */}
          <div className="mb-8">
            <div className="game-panel-light p-6 flex flex-col items-center relative overflow-hidden">
              <div className="text-sm font-black text-indigo-400 mb-4 z-10">✨ 現在のすがた ✨</div>
              <div className="max-w-xs w-full pointer-events-auto z-10 cursor-pointer">
                {(() => {
                  const { averageLevel } = calculateAdventurerStats(userData);
                  return (
                    <RankPlate 
                      level={calculateLevel(userData.xp).level} 
                      growthLevel={averageLevel}
                      name={userData.name} 
                      title={previewTitle || userData.equippedTitle} 
                      avatar={previewAvatar || userData.equippedAvatar}
                      equipment={previewEquipment !== null ? previewEquipment : userData.equippedEquipment}
                      isMvp={userData.totalDamage > 0}
                      onAvatarClick={(url, id) => setPreviewingAvatarModal({url, id, name: userData.name})}
                      onEquipmentClick={(eqId) => eqId && setPreviewingEquipmentModal(eqId)}
                    />
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map(t => (
              <button 
                key={t.id}
                onClick={() => { setActiveTab(t.id); setPreviewTitle(null); setPreviewAvatar(null); setPreviewEquipment(null); setPreviewTheme(null); setPreviewEffect(null); }} 
                className={`px-4 py-3 font-black rounded-xl transition-all border-b-[4px] flex-1 min-w-[120px] shadow-md ${activeTab === t.id ? 'bg-indigo-500 text-white border-indigo-800 translate-y-1 border-b-0 drop-shadow-game-text' : 'bg-slate-700 text-slate-300 border-slate-900 hover:bg-slate-600'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Rarity Filter Selector Box (only shown for item collection tabs) */}
          {activeTab !== "stats" && (
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6 game-panel-light p-3.5 rounded-2xl shadow-md border-2 border-indigo-300/60">
              <div className="flex items-center gap-2 font-black text-sm text-indigo-950">
                <span className="text-lg">🔍</span> レアリティ絞り込み:
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: "all", name: "すべて", bg: "bg-slate-700 text-white" },
                  { id: "ノーマル", name: "ノーマル", bg: "bg-slate-200 text-slate-800 border border-slate-300" },
                  { id: "レア", name: "レア", bg: "bg-blue-500 text-white shadow-sm" },
                  { id: "激レア", name: "激レア", bg: "bg-amber-500 text-white shadow-sm" },
                  { id: "超激レア", name: "超激レア", bg: "bg-red-500 text-white shadow-sm" },
                  { id: "神レア", name: "神レア", bg: "bg-purple-600 text-white animate-pulse shadow-md" },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedRarity(r.id);
                      setPreviewTitle(null);
                      setPreviewAvatar(null);
                      setPreviewEquipment(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs md:text-sm font-black transition-all shadow-sm ${
                      selectedRarity === r.id
                        ? `${r.bg} ring-2 ring-indigo-400 scale-105 shadow-md`
                        : "bg-white/80 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "stats" && (
                <div className="space-y-6">
                  <AdventurerGrowthReport />
                  <ShareCodeCard />
                </div>
              )}

              {activeTab === "titles" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const list = allTitles
                      .filter(t => userData.titles.includes(t.id) || t.id === "見習い")
                      .filter(t => selectedRarity === "all" || (t.rarity || "ノーマル") === selectedRarity);

                    if (list.length === 0) {
                      return (
                        <div className="game-panel-light p-8 text-center col-span-full">
                          <div className="text-4xl mb-2">🔍</div>
                          <div className="font-black text-slate-700 text-lg">「{selectedRarity}」の所持しょうごうはありません</div>
                        </div>
                      );
                    }

                    return list.map(title => {
                      const isEquipped = userData.equippedTitle === title.id;
                      const isPreviewing = previewTitle === title.id;
                      return (
                        <div key={title.id} className={`game-panel-light p-4 flex flex-col gap-3 ${isEquipped ? 'border-primary bg-blue-50/90' : ''}`}>
                          <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="font-black text-xl text-indigo-900">【{title.name}】</div>
                                {title.rarity && (
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                    title.rarity === '神レア' ? 'bg-purple-500 text-white' :
                                    title.rarity === '超激レア' ? 'bg-red-500 text-white' :
                                    title.rarity === '激レア' ? 'bg-amber-500 text-white' :
                                    title.rarity === 'レア' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
                                  }`}>{title.rarity}</span>
                                )}
                                {title.gachaName && (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-300">
                                    {title.gachaName}
                                  </span>
                                )}
                              </div>
                            {isEquipped ? (
                              <div className="text-primary font-black px-4">そうび中</div>
                            ) : (
                              <Button variant="secondary" onClick={() => handleEquip("title", title.id)}>そうび</Button>
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

              {activeTab === "avatars" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const list = allAvatars
                      .filter(a => userData.avatars.includes(a.id) || ["👦", "👧"].includes(a.id))
                      .filter(a => {
                        if (selectedRarity === "all") return true;
                        const info = getAvatarInfo(a.id);
                        return (info?.rarity || a.rarity || "ノーマル") === selectedRarity;
                      });

                    if (list.length === 0) {
                      return (
                        <div className="game-panel-light p-8 text-center col-span-full">
                          <div className="text-4xl mb-2">🔍</div>
                          <div className="font-black text-slate-700 text-lg">「{selectedRarity}」の所持アバターはありません</div>
                        </div>
                      );
                    }

                    return list.map(avatar => {
                      const isEquipped = userData.equippedAvatar === avatar.id;
                      const isPreviewing = previewAvatar === avatar.id;
                      const info = getAvatarInfo(avatar.id);

                      return (
                        <div key={avatar.id} className={`game-panel-light p-4 flex flex-col justify-between gap-3 ${isEquipped ? 'border-primary bg-blue-50/90' : ''}`}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => setPreviewingAvatarModal({url: avatar.icon, id: avatar.id, name: avatar.name})}>
                              <AvatarRarityEffect rarity={info?.rarity || "ノーマル"} size="sm">
                                {avatar.icon?.startsWith('/') ? (() => {
                                  const imgProps = getAvatarImageProps(avatar.icon);
                                  return (
                                    <img 
                                      src={getAvatarThumbUrl(avatar.icon)} 
                                      alt={avatar.name} 
                                      loading="lazy"
                                      decoding="async"
                                      className={`w-full h-full object-cover ${imgProps.className}`} 
                                      style={imgProps.style} 
                                    />
                                  );
                                })() : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                    <span className="text-3xl drop-shadow-md">{avatar.icon}</span>
                                  </div>
                                )}
                              </AvatarRarityEffect>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-lg text-slate-800 hover:text-indigo-600 transition-colors">{avatar.name}</span>
                                  {info?.rarity && (
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                      info.rarity === '神レア' ? 'bg-purple-500 text-white' :
                                      info.rarity === '超激レア' ? 'bg-red-500 text-white' :
                                      info.rarity === '激レア' ? 'bg-amber-500 text-white' :
                                      info.rarity === 'レア' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
                                    }`}>{info.rarity}</span>
                                  )}
                                  {(info?.gachaName || avatar.gachaName) && (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-300">
                                      {info?.gachaName || avatar.gachaName}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-600 font-bold mt-1">{info?.description || avatar.description || "冒険を彩る魅力的なアバター。"}</div>
                              </div>
                            </div>
                            {isEquipped ? (
                              <div className="text-primary font-black px-4 flex-shrink-0">そうび中</div>
                            ) : (
                              <Button variant="secondary" onClick={() => handleEquip("avatar", avatar.id)} className="flex-shrink-0">そうび</Button>
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
                    });
                  })()}
                </div>
              )}

              {activeTab === "equipments" && (
                <div className="space-y-4">
                  {userData.equippedEquipment && (
                    <div className="flex justify-end mb-2">
                      <Button variant="outline" size="sm" onClick={() => handleEquip("equipment", "")} className="text-red-500 border-red-300">
                        ❌ そうびをはずす
                      </Button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(() => {
                      const list = allEquipments.filter(eq => selectedRarity === "all" || (eq.rarity || "ノーマル") === selectedRarity);

                      if (list.length === 0) {
                        return (
                          <div className="game-panel-light p-8 text-center col-span-full">
                            <div className="text-4xl mb-2">🔍</div>
                            <div className="font-black text-slate-700 text-lg">「{selectedRarity}」のそうびはありません</div>
                          </div>
                        );
                      }

                      return list.map(eq => {
                        const isOwned = (userData.equipments || []).includes(eq.id);
                        const isEquipped = userData.equippedEquipment === eq.id;
                        const isPreviewing = previewEquipment === eq.id;

                        return (
                          <div key={eq.id} className={`game-panel-light p-4 flex flex-col justify-between gap-3 ${isEquipped ? 'border-emerald-500 bg-emerald-50/90' : !isOwned ? 'opacity-85' : ''}`}>
                            <div className="flex items-center gap-4">
                              <div 
                                className="text-5xl w-16 h-16 flex items-center justify-center bg-slate-900/80 rounded-2xl border-2 border-amber-300 shadow-md flex-shrink-0 cursor-pointer hover:scale-110 transition-transform overflow-hidden"
                                onClick={() => setPreviewingEquipmentModal(eq.id)}
                              >
                                {eq.icon.startsWith('/') ? (
                                  <img 
                                    src={getAvatarThumbUrl(eq.icon)} 
                                    alt="eq" 
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover rounded-xl" 
                                  />
                                ) : eq.icon}
                              </div>
                              <div className="flex-1 cursor-pointer" onClick={() => setPreviewingEquipmentModal(eq.id)}>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-lg text-slate-800 hover:text-indigo-600 transition-colors">{eq.name}</span>
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                    eq.rarity === '神レア' ? 'bg-purple-500 text-white' :
                                    eq.rarity === '超激レア' ? 'bg-red-500 text-white' :
                                    eq.rarity === '激レア' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                                  }`}>{eq.rarity}</span>
                                  {eq.gachaName && (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-300">
                                      {eq.gachaName}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-600 font-bold mt-1">{eq.description}</div>
                                {!isOwned && (
                                  <div className="text-[11px] font-bold text-indigo-600 mt-1">🔒 未所持 (ショップ/ガチャでGET)</div>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-between items-center border-t border-slate-200/50 pt-2">
                              <button
                                onClick={() => setPreviewEquipment(isPreviewing ? null : eq.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-black shadow-sm border transition-all flex items-center gap-2 ${isPreviewing ? 'bg-emerald-500 text-white border-emerald-700' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:scale-105'}`}
                              >
                                👀 しちゃく{isPreviewing ? '中' : ''}
                              </button>

                              {isEquipped ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-600 font-black text-sm">✓ そうび中</span>
                                  <Button size="sm" variant="outline" className="text-xs text-red-500 border-red-300 py-1 px-2" onClick={() => handleEquip("equipment", "")}>はずす</Button>
                                </div>
                              ) : isOwned ? (
                                <Button variant="fun" size="sm" className="bg-emerald-500 hover:bg-emerald-600 border-emerald-700 text-white font-bold" onClick={() => handleEquip("equipment", eq.id)}>
                                  ✅ そうびする
                                </Button>
                              ) : (
                                <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">未所持</div>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {activeTab === "themes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const list = allThemes
                      .filter(t => t.id === 'default' || userData.effects.includes(`theme_${t.id}`))
                      .filter(t => selectedRarity === "all" || (t.rarity || "ノーマル") === selectedRarity);

                    if (list.length === 0) {
                      return (
                        <div className="game-panel-light p-8 text-center col-span-full">
                          <div className="text-4xl mb-2">🔍</div>
                          <div className="font-black text-slate-700 text-lg">「{selectedRarity}」の所持テーマはありません</div>
                        </div>
                      );
                    }

                    return list.map(theme => {
                      const isEquipped = (userData.theme || 'default') === theme.id;
                      const isPreviewing = previewTheme === theme.id;
                      return (
                        <div key={theme.id} className={`game-panel-light p-4 flex flex-col justify-between gap-3 ${isEquipped ? 'border-primary bg-blue-50/90' : ''}`}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="text-4xl w-12 h-12 flex items-center justify-center bg-slate-900/80 rounded-xl border border-slate-700 shadow-md flex-shrink-0">{theme.icon}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <div className="font-bold text-lg text-slate-800">{theme.name}</div>
                                  {theme.rarity && (
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                      theme.rarity === '神レア' ? 'bg-purple-500 text-white' :
                                      theme.rarity === '超激レア' ? 'bg-red-500 text-white' :
                                      theme.rarity === '激レア' ? 'bg-amber-500 text-white' :
                                      theme.rarity === 'レア' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
                                    }`}>{theme.rarity}</span>
                                  )}
                                  {theme.gachaName && (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-300">
                                      {theme.gachaName}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-600 font-bold mt-1">{theme.description || "冒険画面を彩るテーマ。"}</div>
                              </div>
                            </div>
                            {isEquipped ? (
                              <div className="text-primary font-black px-4 flex-shrink-0">そうび中</div>
                            ) : (
                              <Button variant="secondary" onClick={() => handleEquip("theme", theme.id)} className="flex-shrink-0">そうび</Button>
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
                    });
                  })()}
                </div>
              )}

              {activeTab === "effects" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const list = allEffects
                      .filter(e => userData.effects.includes(e.id))
                      .filter(e => selectedRarity === "all" || (e.rarity || "ノーマル") === selectedRarity);

                    if (list.length === 0) {
                      return (
                        <div className="game-panel-light p-8 text-center col-span-full">
                          <div className="text-4xl mb-2">🔍</div>
                          <div className="font-black text-slate-700 text-lg">「{selectedRarity}」の所持エフェクトはありません</div>
                        </div>
                      );
                    }

                    return list.map(effect => {
                      const isEquipped = userData.equippedEffect === effect.id;
                      const isPreviewing = previewEffect === effect.id;
                      return (
                        <div key={effect.id} className={`game-panel-light p-4 flex flex-col gap-3 ${isEquipped ? 'border-primary bg-blue-50/90' : ''}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-4xl">{effect.icon}</div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="font-bold text-lg text-slate-800">{effect.name}</div>
                                {effect.rarity && (
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                    effect.rarity === '神レア' ? 'bg-purple-500 text-white' :
                                    effect.rarity === '超激レア' ? 'bg-red-500 text-white' :
                                    effect.rarity === '激レア' ? 'bg-amber-500 text-white' :
                                    effect.rarity === 'レア' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
                                  }`}>{effect.rarity}</span>
                                )}
                                {effect.gachaName && (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-300">
                                    {effect.gachaName}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isEquipped ? (
                              <div className="text-primary font-black px-4">そうび中</div>
                            ) : (
                              <Button variant="secondary" onClick={() => handleEquip("effect", effect.id)}>そうび</Button>
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
                    });
                  })()}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </main>

      <AvatarPreviewModal 
        isOpen={!!previewingAvatarModal} 
        onClose={() => setPreviewingAvatarModal(null)}
        avatarUrl={previewingAvatarModal?.url}
        avatarId={previewingAvatarModal?.id}
        name={previewingAvatarModal?.name}
      />

      <EquipmentPreviewModal
        isOpen={!!previewingEquipmentModal}
        onClose={() => setPreviewingEquipmentModal(null)}
        equipmentId={previewingEquipmentModal}
      />
    </>
  );
}
