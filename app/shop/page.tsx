"use client";

import { useState, useEffect } from "react";
import { ThemeBackground } from "../../components/ui/ThemeBackground";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useUser } from "../../hooks/useUser";
import { Button } from "../../components/ui/Button";
import { LoadingScreen } from "../../components/ui/LoadingScreen";
import { RankPlate } from "../../components/ui/RankPlate";
import { KanjiEffect } from "../../components/game/KanjiEffect";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { pullGachaItem, gachaRates, pullRichGachaItem, allRichGachaItems, richGachaRates, pullRichGacha2Item, richGacha2Rates, pullSpEquipmentGachaItem, spEquipmentGachaRates, pullRichEquipmentGachaItem, richEquipmentGachaRates, pullRichLadiesGachaItem, richLadiesGachaRates, all3000GachaRates, pullRichLadiesEquipmentGachaItem, richLadiesEquipmentGachaRates, all3000SpCombinedEquipmentRates } from "../../lib/gachaData";
import { getAllThemes, getAllEffects, getAllTitles, getAllAvatars, getAvatarInfo, getAvatarImageProps, getAvatarThumbUrl } from "../../lib/itemData";
import { getAllEquipment } from "../../lib/equipmentData";
import { avatarEncyclopediaList } from "../../lib/avatarEncyclopediaData";
import { calculateLevel } from "../../lib/gameLogic";
import { soundManager } from "../../lib/soundManager";

const RegularGachaAnimation = dynamic(() => import("../../components/game/RegularGachaAnimation").then(mod => mod.RegularGachaAnimation), { ssr: false });
const RichGachaAnimation = dynamic(() => import("../../components/game/RichGachaAnimation").then(mod => mod.RichGachaAnimation), { ssr: false });
const AvatarEncyclopediaModal = dynamic(() => import("../../components/shop/AvatarEncyclopediaModal").then(mod => mod.AvatarEncyclopediaModal), { ssr: false });
const AvatarPreviewModal = dynamic(() => import("../../components/ui/AvatarPreviewModal").then(mod => mod.AvatarPreviewModal), { ssr: false });
const EquipmentPreviewModal = dynamic(() => import("../../components/ui/EquipmentPreviewModal").then(mod => mod.EquipmentPreviewModal), { ssr: false });
const GachaResultModal = dynamic(() => import("../../components/game/GachaResultModal").then(mod => mod.GachaResultModal), { ssr: false });

const themes = getAllThemes();
const effects = getAllEffects();
const titles = getAllTitles();
const avatars = getAllAvatars();
const equipments = getAllEquipment();

type Tab = "themes" | "effects" | "titles" | "avatars" | "equipments" | "gacha";

export default function ShopPage() {
  const { userData, updateUserData, loading } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("gacha");

  const [previewTitle, setPreviewTitle] = useState<string | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [previewEquipment, setPreviewEquipment] = useState<string | null>(null);
  const { previewTheme, setPreviewTheme } = useThemeContext();
  const [previewEffect, setPreviewEffect] = useState<string | null>(null);

  // Gacha state
  const [pullingType, setPullingType] = useState<"regular" | "rich" | "rich2" | "rich_equipment" | "sp_equipment" | "rich_ladies" | "rich_ladies_equipment" | null>(null);
  const [lastPullType, setLastPullType] = useState<"regular" | "rich" | "rich2" | "rich_equipment" | "sp_equipment" | "rich_ladies" | "rich_ladies_equipment" | null>(null);
  const [gachaResult, setGachaResult] = useState<any>(null);
  const [pendingGachaResult, setPendingGachaResult] = useState<any>(null);
  const [gachaTargetStage, setGachaTargetStage] = useState(1);
  const [showGachaRates, setShowGachaRates] = useState<"regular" | "rich" | "rich2" | "rich_equipment" | "sp_equipment" | "rich_ladies" | "rich_ladies_equipment" | "all_3000" | "all_sp" | null>(null);
  const [previewingAvatar, setPreviewingAvatar] = useState<{url?: string, id?: string, name?: string} | null>(null);
  const [previewingEquipmentModal, setPreviewingEquipmentModal] = useState<string | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [confirmGacha, setConfirmGacha] = useState<{
    type: "regular" | "rich" | "rich2" | "rich_equipment" | "sp_equipment" | "rich_ladies" | "rich_ladies_equipment";
    name: string;
    cost: number;
    costType: "PT" | "SP";
    icon: string;
  } | null>(null);
  const [showEncyclopediaModal, setShowEncyclopediaModal] = useState<boolean>(false);

  useEffect(() => {
    return () => setPreviewTheme(null);
  }, [setPreviewTheme]);

  if (loading) return <LoadingScreen />;
  if (!userData) {
    router.push("/");
    return null;
  }

  const handleBuy = async (category: string, id: string, price: number) => {
    if (category === "equipment") {
      if ((userData.sp || 0) < price) return;
      const newSp = (userData.sp || 0) - price;
      const userEquips = userData.equipments || [];
      if (!userEquips.includes(id)) {
        await updateUserData({ sp: newSp, equipments: [...userEquips, id] });
      }
      return;
    }

    if (userData.pt < price) return;
    const newPt = userData.pt - price;
    if (category === "theme") {
      const isOwned = userData.effects.includes(`theme_${id}`);
      if (!isOwned) {
        await updateUserData({ pt: newPt, effects: [...userData.effects, `theme_${id}`] });
      }
    } else if (category === "effect" && !userData.effects.includes(id)) {
      await updateUserData({ pt: newPt, effects: [...userData.effects, id] });
    } else if (category === "title" && !userData.titles.includes(id)) {
      await updateUserData({ pt: newPt, titles: [...userData.titles, id] });
    } else if (category === "avatar" && !userData.avatars.includes(id)) {
      await updateUserData({ pt: newPt, avatars: [...userData.avatars, id] });
    }
  };

  const handleRequestGacha = (type: "regular" | "rich" | "rich2" | "rich_equipment" | "sp_equipment" | "rich_ladies" | "rich_ladies_equipment") => {
    if (pullingType) return;
    const configs = {
      regular: { name: "ノーマルガチャ", cost: 500, costType: "PT" as const, icon: "⭐" },
      rich: { name: "リッチガチャ 第1弾", cost: 3000, costType: "PT" as const, icon: "🌟" },
      rich2: { name: "リッチガチャ 第2弾", cost: 3000, costType: "PT" as const, icon: "🔥" },
      rich_ladies: { name: "ふわふわガチャ♡", cost: 3000, costType: "PT" as const, icon: "🌸" },
      sp_equipment: { name: "SP装備ガチャ", cost: 1000, costType: "SP" as const, icon: "⚔️" },
      rich_equipment: { name: "装備品リッチガチャ", cost: 3000, costType: "SP" as const, icon: "🛡️" },
      rich_ladies_equipment: { name: "ふわふわ装備ガチャ♡", cost: 3000, costType: "SP" as const, icon: "🎀" },
    };
    const target = configs[type];
    if (!target) return;
    const currentPoints = target.costType === "PT" ? userData.pt : (userData.sp || 0);
    if (currentPoints < target.cost) {
      alert(`${target.costType}が足りないよ！`);
      return;
    }
    setConfirmGacha({ type, ...target });
  };

  const pullGacha = async (type: "regular" | "rich" | "rich2" | "rich_equipment" | "sp_equipment" | "rich_ladies" | "rich_ladies_equipment" = "regular") => {
    setLastPullType(type);
    soundManager.playGacha();
    if (type === "sp_equipment") {
      if ((userData.sp || 0) < 1000 || pullingType) return;
      setPullingType(type);
      setGachaResult(null);
      setShowGachaRates(null);
      await updateUserData({ sp: (userData.sp || 0) - 1000 });

      const resultItem: any = pullSpEquipmentGachaItem();
      resultItem.gachaName = "⚔️ SP装備ガチャ";
      const userEquips = userData.equipments || [];
      if (userEquips.includes(resultItem.id)) {
        await updateUserData({ sp: (userData.sp || 0) - 1000 + 500 });
        resultItem.duplicated = true;
        resultItem.refund = "500 SP";
      } else {
        await updateUserData({ equipments: [...userEquips, resultItem.id] });
      }

      const rarityLevels: Record<string, number> = { "ノーマル": 1, "レア": 2, "激レア": 3, "超激レア": 4, "神レア": 5 };
      setGachaTargetStage(rarityLevels[resultItem.rarity] || 1);
      setPendingGachaResult(resultItem);
      return;
    }

    if (type === "rich_equipment") {
      if ((userData.sp || 0) < 3000 || pullingType) return;
      setPullingType(type);
      setGachaResult(null);
      setShowGachaRates(null);
      await updateUserData({ sp: (userData.sp || 0) - 3000 });

      const resultItem: any = pullRichEquipmentGachaItem();
      resultItem.gachaName = "🛡️ 装備品リッチガチャ";
      const userEquips = userData.equipments || [];
      if (userEquips.includes(resultItem.id)) {
        await updateUserData({ sp: (userData.sp || 0) - 3000 + 1000 });
        resultItem.duplicated = true;
        resultItem.refund = "1000 SP";
      } else {
        await updateUserData({ equipments: [...userEquips, resultItem.id] });
      }

      const rarityLevels: Record<string, number> = { "ノーマル": 1, "レア": 2, "激レア": 3, "超激レア": 4, "神レア": 5 };
      setGachaTargetStage(rarityLevels[resultItem.rarity] || 1);
      setPendingGachaResult(resultItem);
      return;
    }

    if (type === "rich_ladies") {
      if (userData.pt < 3000 || pullingType) return;
      setPullingType(type);
      setGachaResult(null);
      setShowGachaRates(null);

      const resultItem: any = pullRichLadiesGachaItem();
      resultItem.gachaName = "🌸 ふわふわガチャ♡";
      let duplicated = false;
      if (userData.avatars.includes(resultItem.id)) {
        duplicated = true;
        await updateUserData({ pt: userData.pt - 3000 + 1000 });
        resultItem.duplicated = true;
        resultItem.refund = "1000 PT";
      } else {
        await updateUserData({ pt: userData.pt - 3000, avatars: [...userData.avatars, resultItem.id] });
      }

      const rarityLevels: Record<string, number> = { "ノーマル": 1, "レア": 2, "激レア": 3, "超激レア": 4, "神レア": 5 };
      setGachaTargetStage(rarityLevels[resultItem.rarity] || 1);
      setPendingGachaResult(resultItem);
      return;
    }

    if (type === "rich_ladies_equipment") {
      if ((userData.sp || 0) < 3000 || pullingType) return;
      setPullingType(type);
      setGachaResult(null);
      setShowGachaRates(null);
      await updateUserData({ sp: (userData.sp || 0) - 3000 });

      const resultItem: any = pullRichLadiesEquipmentGachaItem();
      resultItem.gachaName = "🎀 ふわふわ装備リッチガチャ♡";
      const userEquips = userData.equipments || [];
      if (userEquips.includes(resultItem.id)) {
        await updateUserData({ sp: (userData.sp || 0) - 3000 + 1000 });
        resultItem.duplicated = true;
        resultItem.refund = "1000 SP";
      } else {
        await updateUserData({ equipments: [...userEquips, resultItem.id] });
      }

      const rarityLevels: Record<string, number> = { "ノーマル": 1, "レア": 2, "激レア": 3, "超激レア": 4, "神レア": 5 };
      setGachaTargetStage(rarityLevels[resultItem.rarity] || 1);
      setPendingGachaResult(resultItem);
      return;
    }

    const cost = type === "regular" ? 100 : 3000;
    if (userData.pt < cost || pullingType) return;
    setPullingType(type);
    setGachaResult(null);
    setShowGachaRates(null);
    await updateUserData({ pt: userData.pt - cost });
    
    let result: any;
    if (type === "rich") {
      result = pullRichGachaItem();
      result.gachaName = "💎 リッチガチャ1";
    } else if (type === "rich2") {
      result = pullRichGacha2Item();
      result.gachaName = "✨ リッチガチャ2";
    } else {
      result = pullGachaItem();
      result.gachaName = "🎁 通常ガチャ";
    }

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
      if (type !== "regular") {
        await updateUserData({ pt: userData.pt + 1000 });
        result.duplicated = true;
        result.refund = "1000 PT";
      } else {
        await updateUserData({ xp: userData.xp + 50 });
        result.duplicated = true;
        result.refund = "50 XP";
      }
    }
    
    const rarityLevels: Record<string, number> = { "ノーマル": 1, "レア": 2, "激レア": 3, "超激レア": 4, "神レア": 5 };
    setGachaTargetStage(rarityLevels[result.rarity] || 1);
    setPendingGachaResult(result);
  };

  const tabs: { id: Tab, label: string }[] = [
    { id: "gacha", label: "🎁 ガチャ" },
    { id: "equipments", label: "⚔️ 装備品 (SP)" },
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
      {(pullingType === "rich" || pullingType === "rich2" || pullingType === "rich_equipment" || pullingType === "rich_ladies" || pullingType === "rich_ladies_equipment" || pullingType === "sp_equipment") && pendingGachaResult && (
        <RichGachaAnimation
          targetStage={gachaTargetStage}
          rarity={pendingGachaResult?.rarity}
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
              {/* Equip button removed from shop */}
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
          {/* Equip button removed from shop */}
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

          <div className="game-panel p-6 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="font-bold text-slate-300">⭐ もっている PT</div>
              <div className="text-3xl font-black text-amber-400 drop-shadow-md">{userData.pt} <span className="text-lg text-amber-200">PT</span></div>
            </div>
            <div className="hidden sm:block h-8 w-px bg-slate-600"></div>
            <div className="flex items-center gap-3">
              <div className="font-bold text-slate-300">🧪 もっている SP</div>
              <div className="text-3xl font-black text-emerald-400 drop-shadow-md">{userData.sp || 0} <span className="text-lg text-emerald-200">SP</span></div>
            </div>
          </div>

          {/* Avatar & Equipment Encyclopedia Banner Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowEncyclopediaModal(true)}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black shadow-[0_0_25px_rgba(251,191,36,0.5)] border-2 border-white hover:scale-[1.02] active:scale-98 transition-all flex flex-col sm:flex-row items-center justify-between gap-3 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">📖</span>
                <div className="text-left">
                  <div className="text-lg sm:text-xl font-black flex items-center gap-2">
                    <span>リッチ大図鑑（アバター＆そうび）</span>
                    <span className="text-xs bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400 font-bold">
                      全{avatarEncyclopediaList.length}種
                    </span>
                  </div>
                  <div className="text-xs text-slate-900 font-bold mt-0.5">
                    全キャラ＆全装備の立ち絵・背景ストーリー・排出元ガチャを完全収録！
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-950/90 text-amber-300 px-4 py-2 rounded-xl border border-amber-400 shadow-md">
                <span className="text-xs font-black">
                  🌟 収集: {avatarEncyclopediaList.filter(e => {
                    if (e.type === "equipment") {
                      const userEquips = userData.equipments || [];
                      return userEquips.includes(e.gachaItemId) || userEquips.includes(e.id) || userEquips.some(id => id.includes(e.name) || e.name.includes(id));
                    }
                    const userAvatars = userData.avatars || [];
                    return userAvatars.includes(e.gachaItemId) || userAvatars.includes(e.icon) || userAvatars.includes(e.id) || userAvatars.some(a => a.includes(e.name) || e.name.includes(a));
                  }).length} / {avatarEncyclopediaList.length} 種類
                </span>
                <span className="text-sm">➔</span>
              </div>
            </button>
          </div>

          {/* Preview Area for Titles, Avatars, and Equipments (Only when previewing) */}
          <AnimatePresence>
            {(previewTitle || previewAvatar || previewEquipment) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-8"
              >
                <div className="game-panel-light p-6 flex flex-col items-center relative overflow-hidden">
                  <div className="text-sm font-black text-indigo-400 mb-4 z-10 flex items-center justify-between w-full max-w-xs">
                    <span>✨ しちゃくプレビュー ✨</span>
                    <button 
                      onClick={() => { setPreviewTitle(null); setPreviewAvatar(null); setPreviewEquipment(null); }}
                      className="text-xs text-red-500 font-bold hover:underline"
                    >
                      ✕ とじる
                    </button>
                  </div>
                  <div className="max-w-xs w-full pointer-events-none z-10">
                    <RankPlate
                      level={calculateLevel(userData.xp).level}
                      name={userData.name}
                      title={previewTitle || userData.equippedTitle}
                      avatar={previewAvatar || userData.equippedAvatar}
                      equipment={previewEquipment !== null ? previewEquipment : userData.equippedEquipment}
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

          {/* Rarity Filter Selector Box */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6 game-panel-light p-3.5 rounded-2xl shadow-md border-2 border-amber-300/60">
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
                      ? `${r.bg} ring-2 ring-amber-400 scale-105 shadow-md`
                      : "bg-white/80 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
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
                  <p className="text-slate-300 font-bold mb-4">通常ガチャは100PT、リッチガチャは3000PT、豪華な装備ガチャは1000SPでまわせる！</p>
                  
                  <div className="flex flex-col gap-6 justify-center mb-6 items-stretch max-w-md mx-auto">
                    {/* --- PT Gachas --- */}
                    <div className="text-left font-black text-amber-300 text-sm flex items-center gap-1.5 border-b border-amber-500/40 pb-1">
                      <span>⭐</span> <span>ポイントガチャ (PT)</span>
                    </div>

                    <div className="flex-1 game-panel-light p-4 bg-slate-800/80 border-2 border-amber-900/50 flex flex-col justify-between">
                      <div>
                        <div className="text-amber-200 font-black mb-2">通常ガチャ (100 PT)</div>
                        <button
                          onClick={() => setShowGachaRates(showGachaRates === "regular" ? null : "regular")}
                          className="mb-4 px-6 py-2 bg-amber-100/50 hover:bg-amber-100 text-amber-800 font-black text-base rounded-full shadow-sm border-2 border-amber-300 transition-colors inline-flex items-center justify-center gap-2"
                        >
                          <span className="text-xl">🔍</span> 中身を見る
                        </button>
                      </div>
                      <button
                        className={`w-full py-4 text-xl md:text-2xl tracking-wide whitespace-nowrap bg-amber-400 hover:bg-amber-300 text-amber-900 font-black rounded-xl shadow-[0_4px_0_0_#b45309] active:shadow-none active:translate-y-1 transition-all ${pullingType ? 'animate-pulse' : ''} ${pullingType !== null || userData.pt < 100 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleRequestGacha("regular")}
                        disabled={pullingType !== null || userData.pt < 100}
                      >
                        {pullingType ? "..." : userData.pt < 100 ? "PT不足" : "100 PT でまわす！"}
                      </button>
                    </div>
                    
                    <div className="flex-1 p-5 rounded-[2rem] bg-gradient-to-b from-white/90 to-blue-50/90 border-[3px] border-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0icmdiYSgyNTIsIDIxMSwgNzcsIDAuMykiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>
                      <div className="relative z-10 text-center">
                        <div className="text-amber-500 font-black text-xl mb-3 drop-shadow-md flex items-center justify-center gap-2">
                          <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,1)]">💎</span> リッチガチャ１ <span className="text-sm">(3000 PT)</span>
                        </div>
                        <button
                          onClick={() => setShowGachaRates(showGachaRates === "rich" ? null : "rich")}
                          className="mb-6 px-6 py-2 bg-[#fdf8e1] hover:bg-[#faedb9] text-[#5c3a21] font-black text-sm rounded-full shadow-md border-2 border-[#e6c770] transition-transform hover:scale-105 inline-flex items-center justify-center gap-2"
                        >
                          <span className="text-lg">🔍</span> 中身を見る
                        </button>
                      </div>
                      <button
                        className={`w-full py-4 text-xl md:text-2xl tracking-wide whitespace-nowrap ${pullingType ? 'animate-pulse' : 'btn-rich-gacha'} ${pullingType !== null || userData.pt < 3000 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleRequestGacha("rich")}
                        disabled={pullingType !== null || userData.pt < 3000}
                      >
                        {pullingType ? "..." : userData.pt < 3000 ? "PT不足" : "3000 PT でまわす"}
                      </button>
                    </div>

                    <div className="flex-1 p-5 rounded-[2rem] bg-gradient-to-b from-purple-50/90 to-purple-200/90 border-[3px] border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)] flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0icmdiYSgyNTIsIDIxMSwgNzcsIDAuMykiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>
                      <div className="relative z-10 text-center">
                        <div className="text-purple-600 font-black text-xl mb-3 drop-shadow-md flex items-center justify-center gap-2">
                          <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,1)]">✨</span> リッチガチャ２ <span className="text-sm">(3000 PT)</span>
                        </div>
                        <button
                          onClick={() => setShowGachaRates(showGachaRates === "rich2" ? null : "rich2")}
                          className="mb-6 px-6 py-2 bg-[#fdf8e1] hover:bg-[#faedb9] text-[#5c3a21] font-black text-sm rounded-full shadow-md border-2 border-[#e6c770] transition-transform hover:scale-105 inline-flex items-center justify-center gap-2"
                        >
                          <span className="text-lg">🔍</span> 中身を見る
                        </button>
                      </div>
                      <button
                        className={`w-full py-4 text-xl md:text-2xl tracking-wide whitespace-nowrap ${pullingType ? 'animate-pulse' : 'btn-rich-gacha'} ${pullingType !== null || userData.pt < 3000 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleRequestGacha("rich2")}
                        disabled={pullingType !== null || userData.pt < 3000}
                      >
                        {pullingType ? "..." : userData.pt < 3000 ? "PT不足" : "3000 PT でまわす"}
                      </button>
                    </div>

                    <div className="flex-1 p-5 rounded-[2rem] bg-gradient-to-b from-pink-50/90 to-rose-200/90 border-[3px] border-pink-400 shadow-[0_0_20px_rgba(244,63,94,0.3)] flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0icmdiYSgyNTIsIDIxMSwgNzcsIDAuMykiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>
                      <div className="relative z-10 text-center">
                        <div className="text-pink-600 font-black text-xl mb-3 drop-shadow-md flex items-center justify-center gap-2">
                          <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,1)]">🌸</span> ふわふわガチャ♡ <span className="text-sm">(3000 PT)</span>
                        </div>
                        <button
                          onClick={() => setShowGachaRates(showGachaRates === "rich_ladies" ? null : "rich_ladies")}
                          className="mb-6 px-6 py-2 bg-[#fff0f5] hover:bg-[#ffe4e1] text-[#8b008b] font-black text-sm rounded-full shadow-md border-2 border-pink-300 transition-transform hover:scale-105 inline-flex items-center justify-center gap-2"
                        >
                          <span className="text-lg">🔍</span> 中身を見る
                        </button>
                      </div>
                      <button
                        className={`w-full py-4 text-xl md:text-2xl tracking-wide whitespace-nowrap ${pullingType ? 'animate-pulse' : 'btn-fluffy-gacha'} ${pullingType !== null || userData.pt < 3000 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleRequestGacha("rich_ladies")}
                        disabled={pullingType !== null || userData.pt < 3000}
                      >
                        {pullingType ? "..." : userData.pt < 3000 ? "PT不足" : "3000 PT でまわす"}
                      </button>
                    </div>

                    {/* --- SP Gachas --- */}
                    <div className="text-left font-black text-emerald-300 text-sm flex items-center gap-1.5 border-b border-emerald-500/40 pb-1 mt-4">
                      <span>🧪</span> <span>スキルポイント装備ガチャ (SP)</span>
                    </div>

                    <div className="flex-1 p-5 rounded-[2rem] bg-gradient-to-b from-fuchsia-50/90 to-pink-200/90 border-[3px] border-fuchsia-400 shadow-[0_0_20px_rgba(232,121,249,0.4)] flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute inset-0 pointer-events-none" style={{background: 'radial-gradient(circle at 30% 70%, rgba(251,207,232,0.4) 0%, transparent 60%), radial-gradient(circle at 70% 30%, rgba(216,180,254,0.3) 0%, transparent 60%)'}}></div>
                      <div className="relative z-10 text-center">
                        <div className="text-fuchsia-700 font-black text-xl mb-3 drop-shadow-md flex items-center justify-center gap-2">
                          <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,1)]">🎀</span> ふわふわ装備ガチャ♡ <span className="text-sm">(3000 SP)</span>
                        </div>
                        <div className="text-xs text-fuchsia-600 font-bold mb-2">💫 NEW！全15種のかわいい装備が登場</div>
                        <button
                          onClick={() => setShowGachaRates(showGachaRates === "rich_ladies_equipment" ? null : "rich_ladies_equipment")}
                          className="mb-6 px-6 py-2 bg-[#fff0f9] hover:bg-[#fce7f3] text-[#86198f] font-black text-sm rounded-full shadow-md border-2 border-fuchsia-300 transition-transform hover:scale-105 inline-flex items-center justify-center gap-2"
                        >
                          <span className="text-lg">🔍</span> 中身を見る
                        </button>
                      </div>
                      <button
                        className={`w-full py-4 text-xl md:text-2xl tracking-wide whitespace-nowrap font-black rounded-xl transition-all ${
                          pullingType ? 'animate-pulse bg-fuchsia-300 text-white opacity-50 cursor-not-allowed' :
                          (userData.sp || 0) < 3000 ? 'bg-fuchsia-200 text-fuchsia-400 opacity-50 cursor-not-allowed' :
                          'bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-400 hover:to-pink-400 text-white shadow-[0_4px_0_0_#a21caf] active:shadow-none active:translate-y-1'
                        }`}
                        onClick={() => handleRequestGacha("rich_ladies_equipment")}
                        disabled={pullingType !== null || (userData.sp || 0) < 3000}
                      >
                        {pullingType ? "..." : (userData.sp || 0) < 3000 ? "SP不足" : "3000 SP でまわす"}
                      </button>
                    </div>

                    <div className="flex-1 p-5 rounded-[2rem] bg-gradient-to-b from-amber-100/90 to-amber-300/90 border-[3px] border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)] flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0icmdiYSgyNTIsIDIxMSwgNzcsIDAuMykiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>
                      <div className="relative z-10 text-center">
                        <div className="text-amber-900 font-black text-xl mb-3 drop-shadow-md flex items-center justify-center gap-2">
                          <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,1)]">🛡️</span> 装備品リッチガチャ <span className="text-sm">(3000 SP)</span>
                        </div>
                        <button
                          onClick={() => setShowGachaRates(showGachaRates === "rich_equipment" ? null : "rich_equipment")}
                          className="mb-6 px-6 py-2 bg-[#fdf8e1] hover:bg-[#faedb9] text-[#5c3a21] font-black text-sm rounded-full shadow-md border-2 border-[#e6c770] transition-transform hover:scale-105 inline-flex items-center justify-center gap-2"
                        >
                          <span className="text-lg">🔍</span> 中身を見る
                        </button>
                      </div>
                      <button
                        className={`w-full py-4 text-xl md:text-2xl tracking-wide whitespace-nowrap ${pullingType ? 'animate-pulse' : 'btn-rich-gacha'} ${pullingType !== null || (userData.sp || 0) < 3000 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleRequestGacha("rich_equipment")}
                        disabled={pullingType !== null || (userData.sp || 0) < 3000}
                      >
                        {pullingType ? "..." : (userData.sp || 0) < 3000 ? "SP不足" : "3000 SP でまわす"}
                      </button>
                    </div>

                    <div className="flex-1 p-5 rounded-[2rem] bg-gradient-to-b from-emerald-50/90 to-emerald-200/90 border-[3px] border-emerald-400 shadow-[0_0_20px_rgba(168,85,247,0.3)] flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0icmdiYSgyNTIsIDIxMSwgNzcsIDAuMykiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>
                      <div className="relative z-10 text-center">
                        <div className="text-emerald-700 font-black text-xl mb-3 drop-shadow-md flex items-center justify-center gap-2">
                          <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,1)]">⚔️</span> SP装備ガチャ <span className="text-sm">(1000 SP)</span>
                        </div>
                        <button
                          onClick={() => setShowGachaRates(showGachaRates === "sp_equipment" ? null : "sp_equipment")}
                          className="mb-6 px-6 py-2 bg-[#e6f7ed] hover:bg-[#c9f0d8] text-[#14532d] font-black text-sm rounded-full shadow-md border-2 border-emerald-300 transition-transform hover:scale-105 inline-flex items-center justify-center gap-2"
                        >
                          <span className="text-lg">🔍</span> 中身を見る
                        </button>
                      </div>
                      <button
                        className={`w-full py-4 text-xl md:text-2xl tracking-wide whitespace-nowrap bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl shadow-[0_4px_0_0_#047857] active:shadow-none active:translate-y-1 transition-all ${pullingType ? 'animate-pulse' : ''} ${pullingType !== null || (userData.sp || 0) < 1000 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleRequestGacha("sp_equipment")}
                        disabled={pullingType !== null || (userData.sp || 0) < 1000}
                      >
                        {pullingType ? "..." : (userData.sp || 0) < 1000 ? "SP不足" : "1000 SP でまわす"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
                    <button
                      onClick={() => setShowGachaRates(showGachaRates === "all_3000" ? null : "all_3000")}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-black text-sm rounded-full shadow-md border border-amber-200 transition-transform hover:scale-105 inline-flex items-center justify-center gap-2"
                    >
                      <span className="text-lg">🌟</span> 3000PTガチャ全中身をまとめて見る
                    </button>
                    <button
                      onClick={() => setShowGachaRates(showGachaRates === "all_sp" ? null : "all_sp")}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-fuchsia-600 hover:from-emerald-500 hover:to-fuchsia-500 text-white font-black text-sm rounded-full shadow-md border border-emerald-200 transition-transform hover:scale-105 inline-flex items-center justify-center gap-2"
                    >
                      <span className="text-lg">🛡️</span> 3000SP装備ガチャ全中身をまとめて見る
                    </button>
                  </div>

                  <AnimatePresence>
                    {showGachaRates && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-6 text-left game-panel-light p-6 overflow-hidden"
                      >
                        <h3 className="font-black text-blue-900 mb-4 border-b-2 border-blue-200 pb-2">
                          {showGachaRates === "all_3000" ? "🌟 3000PTガチャ 全排出内容（レアリティ順）" :
                           showGachaRates === "all_sp" ? "🛡️ 3000SP装備ガチャ 全排出内容（レアリティ順）" :
                           showGachaRates === "rich_ladies_equipment" ? "🎀 ふわふわ装備リッチガチャ♡ 提供割合 (3000 SP)" :
                           showGachaRates === "rich_equipment" ? "🛡️ 装備品リッチガチャ 提供割合 (3000 SP)" :
                           showGachaRates === "sp_equipment" ? "⚔️ SP装備ガチャ 提供割合 (1000 SP)" :
                           "提供割合"}
                        </h3>
                        <div className="space-y-4">
                          {(showGachaRates === "all_3000" ? all3000GachaRates :
                            showGachaRates === "all_sp" ? all3000SpCombinedEquipmentRates :
                            showGachaRates === "sp_equipment" ? spEquipmentGachaRates :
                            showGachaRates === "rich_equipment" ? richEquipmentGachaRates :
                            showGachaRates === "rich_ladies" ? richLadiesGachaRates :
                            showGachaRates === "rich_ladies_equipment" ? richLadiesEquipmentGachaRates :
                            showGachaRates === "rich" ? richGachaRates :
                            showGachaRates === "rich2" ? richGacha2Rates :
                            gachaRates).map((tier, idx) => (
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
                                  else if (item.type === "effect") { typeLabel = "エフェクト"; typeColor = "bg-[#d8b4fe] text-[#581c87]"; }
                                  else if (item.type === "theme") { typeLabel = "テーマ"; typeColor = "bg-pink-100 text-pink-700"; }
                                  else if (item.type === "equipment") { typeLabel = "装備"; typeColor = "bg-amber-100 text-amber-800"; }
                                  
                                  const isInteractive = item.type === 'avatar' || item.type === 'equipment';

                                  return (
                                    <button 
                                      key={item.id} 
                                      onClick={() => {
                                        if (item.type === 'avatar') {
                                          setPreviewingAvatar({ url: item.icon, id: item.id, name: item.name });
                                        } else if (item.type === 'equipment') {
                                          setPreviewingEquipmentModal(item.id);
                                        }
                                      }}
                                      className={`bg-white px-2.5 py-1.5 rounded-lg shadow-sm text-sm font-bold flex items-center gap-2 text-slate-700 border border-slate-200 transition-all ${isInteractive ? 'hover:scale-105 hover:border-amber-400 hover:shadow-md cursor-pointer' : ''}`}
                                    >
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${typeColor}`}>{typeLabel}</span>
                                      {item.gachaName && (
                                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 border border-pink-200">
                                          {item.gachaName}
                                        </span>
                                      )}
                                      <span className="text-base flex items-center justify-center min-w-[20px]">
                                        {item.icon.startsWith('/') ? (() => {
                                          const imgProps = getAvatarImageProps(item.icon);
                                          return (
                                            <div className="w-5 h-5 rounded-full overflow-hidden inline-block relative align-middle">
                                              <img src={item.icon} alt="icon" className={`w-full h-full object-cover ${imgProps.className}`} style={imgProps.style} />
                                            </div>
                                          );
                                        })() : (
                                          item.icon
                                        )}
                                      </span>
                                      <span>{item.name.replace(/称号「|アバター「|エフェクト「|テーマ「|装備「|」/g, '')}</span>
                                      {isInteractive && <span className="text-xs text-amber-500 font-bold">🔍</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ===== EQUIPMENTS TAB ===== */}
              {activeTab === "equipments" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const list = equipments.filter(item => selectedRarity === "all" || (item.rarity || "ノーマル") === selectedRarity);
                    if (list.length === 0) {
                      return (
                        <div className="game-panel-light p-8 text-center col-span-full">
                          <div className="text-4xl mb-2">🔍</div>
                          <div className="font-black text-slate-700 text-lg">「{selectedRarity}」のそうびはありません</div>
                        </div>
                      );
                    }
                    return list.map(item => {
                      const isOwned = (userData.equipments || []).includes(item.id);
                      const canAfford = (userData.sp || 0) >= (item.price || 0);

                      return (
                        <div key={item.id} className={`game-panel-light p-4 flex flex-col justify-between gap-3 ${isOwned ? 'border-emerald-500 bg-emerald-50/90' : ''}`}>
                          <div className="flex items-center gap-4">
                            <div className="text-5xl w-16 h-16 flex items-center justify-center bg-slate-900/80 rounded-2xl border-2 border-emerald-300 shadow-md overflow-hidden">
                              {item.icon.startsWith('/') ? (
                                <img 
                                  src={getAvatarThumbUrl(item.icon)} 
                                  alt="eq" 
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full h-full object-cover rounded-xl" 
                                />
                              ) : item.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-lg text-slate-800">{item.name}</span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                  item.rarity === '神レア' ? 'bg-purple-500 text-white' :
                                  item.rarity === '超激レア' ? 'bg-red-500 text-white' :
                                  item.rarity === '激レア' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                                }`}>{item.rarity}</span>
                                {item.gachaName && (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-300">
                                    {item.gachaName}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-600 font-bold mt-1">{item.description}</div>
                              {!isOwned && !item.isGachaOnly && (
                                <div className="text-emerald-600 font-black text-sm mt-1">{item.price} SP</div>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-end items-center gap-2 mt-2 pt-2 border-t border-slate-200">
                            {isOwned ? (
                              <div className="text-sm font-bold text-emerald-600 bg-emerald-100 px-4 py-1.5 rounded-full border border-emerald-300">
                                ✓ 所持中
                              </div>
                            ) : item.isGachaOnly ? (
                              <div className="text-xs font-black text-purple-700 bg-purple-100 px-3 py-1.5 rounded-full border border-purple-300">
                                🎲 ガチャ限定
                              </div>
                            ) : (
                              <Button
                                variant="fun"
                                size="sm"
                                className="bg-emerald-500 hover:bg-emerald-600 border-emerald-700 text-white text-sm"
                                disabled={!canAfford}
                                onClick={() => handleBuy("equipment", item.id, item.price || 0)}
                              >
                                {canAfford ? `${item.price} SP でこうにゅう` : "SP 不足"}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}

              {/* ===== THEMES TAB ===== */}
              {activeTab === "themes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const list = themes.filter(theme => selectedRarity === "all" || (theme.rarity || "ノーマル") === selectedRarity);
                    if (list.length === 0) {
                      return (
                        <div className="game-panel-light p-8 text-center col-span-full">
                          <div className="text-4xl mb-2">🔍</div>
                          <div className="font-black text-slate-700 text-lg">「{selectedRarity}」のテーマはありません</div>
                        </div>
                      );
                    }
                    return list.map(theme => {
                      const isOwned = theme.price === 0 || userData.effects.includes(`theme_${theme.id}`);
                      const isEquipped = userData.theme === theme.id || (!userData.theme && theme.id === 'default');
                      const canAfford = userData.pt >= (theme.price || 0);
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
                                {!isOwned && <div className="text-amber-600 font-black text-sm mt-1">{theme.price} PT</div>}
                              </div>
                            </div>
                            {isEquipped ? (
                              <div className="text-primary font-black px-4 flex-shrink-0">そうび中</div>
                            ) : isOwned ? (
                              <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 flex-shrink-0">所持済み</div>
                            ) : theme.isGachaOnly ? (
                              <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 flex-shrink-0">ガチャ限定 🎁</div>
                            ) : (
                              <Button variant={canAfford ? "primary" : "ghost"} disabled={!canAfford} onClick={() => handleBuy("theme", theme.id, theme.price || 0)} className="flex-shrink-0">かう</Button>
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

              {/* ===== EFFECTS TAB ===== */}
              {activeTab === "effects" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const list = effects.filter(effect => selectedRarity === "all" || (effect.rarity || "ノーマル") === selectedRarity);
                    if (list.length === 0) {
                      return (
                        <div className="game-panel-light p-8 text-center col-span-full">
                          <div className="text-4xl mb-2">🔍</div>
                          <div className="font-black text-slate-700 text-lg">「{selectedRarity}」のエフェクトはありません</div>
                        </div>
                      );
                    }
                    return list.map(effect => {
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
                                {!isOwned && <div className="text-amber-600 font-black">{effect.price} PT</div>}
                              </div>
                            </div>
                            {isEquipped ? (
                              <div className="text-primary font-black px-4">そうび中</div>
                            ) : isOwned ? (
                              <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">所持済み</div>
                            ) : effect.isGachaOnly ? (
                              <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">ガチャ限定 🎁</div>
                            ) : (
                              <Button variant={canAfford ? "primary" : "ghost"} disabled={!canAfford} onClick={() => handleBuy("effect", effect.id, effect.price || 0)}>
                                {canAfford ? "かう" : "PT不足"}
                              </Button>
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
                    const list = allTitles.filter(title => selectedRarity === "all" || (title.rarity || "ノーマル") === selectedRarity);
                    if (list.length === 0) {
                      return (
                        <div className="game-panel-light p-8 text-center col-span-full">
                          <div className="text-4xl mb-2">🔍</div>
                          <div className="font-black text-slate-700 text-lg">「{selectedRarity}」のしょうごうはありません</div>
                        </div>
                      );
                    }
                    return list.map(title => {
                      const isOwned = userData.titles.includes(title.id);
                      const isEquipped = userData.equippedTitle === title.id;
                      const canAfford = userData.pt >= (title.price || 0);
                      const isPreviewing = previewTitle === title.id;
                      return (
                        <div key={title.id} className={`game-panel-light p-4 flex flex-col gap-3 ${isEquipped ? 'border-primary bg-blue-50/90' : ''}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="font-black text-xl text-indigo-900">【{title.id}】</div>
                                {title.rarity && (
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                    title.rarity === '神レア' ? 'bg-purple-500 text-white' :
                                    title.rarity === '超激レア' ? 'bg-red-500 text-white' :
                                    title.rarity === '激レア' ? 'bg-amber-500 text-white' :
                                    title.rarity === 'レア' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
                                  }`}>{title.rarity}</span>
                                )}
                                {title.gachaName && (
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                    title.gachaName.includes("実績") 
                                      ? 'bg-amber-100 text-amber-900 border-amber-300' 
                                      : 'bg-pink-100 text-pink-800 border border-pink-300'
                                  }`}>
                                    {title.gachaName}
                                  </span>
                                )}
                              </div>
                              {title.description && (
                                <div className="text-xs font-bold text-slate-500 mt-1">{title.description}</div>
                              )}
                              {!isOwned && title.price !== null && (
                                <div className="text-amber-600 font-black mt-1">{title.price} PT</div>
                              )}
                            </div>
                            {isEquipped ? (
                              <div className="text-primary font-black px-4">そうび中</div>
                            ) : isOwned ? (
                              <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">所持済み</div>
                            ) : title.gachaName && title.gachaName.includes("実績") ? (
                              <button 
                                onClick={() => router.push("/achievements")}
                                className="text-xs font-black text-amber-800 bg-amber-200/80 hover:bg-amber-300 px-3 py-1.5 rounded-xl border border-amber-400 shadow-sm transition-all hover:scale-105"
                              >
                                実績へ ➔
                              </button>
                            ) : title.isGachaOnly ? (
                              <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">ガチャ限定 🎁</div>
                            ) : (
                              <Button variant={canAfford ? "primary" : "ghost"} disabled={!canAfford} onClick={() => handleBuy("title", title.id, title.price || 0)}>
                                {canAfford ? "かう" : "PT不足"}
                              </Button>
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
                  {(() => {
                    const list = avatars.filter(avatar => {
                      if (selectedRarity === "all") return true;
                      const info = getAvatarInfo(avatar.id);
                      const r = info?.rarity || avatar.rarity || "ノーマル";
                      return r === selectedRarity;
                    });
                    if (list.length === 0) {
                      return (
                        <div className="game-panel-light p-8 text-center col-span-full">
                          <div className="text-4xl mb-2">🔍</div>
                          <div className="font-black text-slate-700 text-lg">「{selectedRarity}」のアバターはありません</div>
                        </div>
                      );
                    }
                    return list.map(avatar => {
                      const isOwned = userData.avatars.includes(avatar.id);
                      const isEquipped = userData.equippedAvatar === avatar.id;
                      const canAfford = userData.pt >= (avatar.price || 0);
                      const isPreviewing = previewAvatar === avatar.id;
                      const info = getAvatarInfo(avatar.id);

                      return (
                        <div key={avatar.id} className={`game-panel-light p-4 flex flex-col justify-between gap-3 ${isEquipped ? 'border-primary bg-blue-50/90' : ''}`}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-4 flex-1">
                              <button 
                                onClick={() => setPreviewingAvatar({ url: avatar.icon, id: avatar.id, name: avatar.name })}
                                className="flex justify-center w-14 h-14 flex-shrink-0 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                              >
                                {avatar.icon && avatar.icon.startsWith('/') ? (() => {
                                  const imgProps = getAvatarImageProps(avatar.icon);
                                  return (
                                    <div className="w-14 h-14 rounded-full overflow-hidden relative border-2 border-white shadow-md mx-auto">
                                      <img 
                                        src={getAvatarThumbUrl(avatar.icon)} 
                                        alt={avatar.name} 
                                        loading="lazy"
                                        decoding="async"
                                        className={`w-full h-full object-cover ${imgProps.className}`} 
                                        style={imgProps.style} 
                                      />
                                    </div>
                                  );
                                })() : (
                                  <div className="text-4xl w-14 h-14 flex items-center justify-center bg-slate-900/80 rounded-xl border border-slate-700 shadow-md">{avatar.icon}</div>
                                )}
                              </button>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-lg text-slate-800">{avatar.name}</span>
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
                                {!isOwned && !avatar.isGachaOnly && (
                                  <div className="text-amber-600 font-black text-sm mt-1">{avatar.price} PT</div>
                                )}
                              </div>
                            </div>
                            {isEquipped ? (
                              <div className="text-primary font-black px-4 flex-shrink-0">そうび中</div>
                            ) : isOwned ? (
                              <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 flex-shrink-0">所持済み</div>
                            ) : avatar.isGachaOnly ? (
                              <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 flex-shrink-0">ガチャ限定 🎁</div>
                            ) : (
                              <Button variant={canAfford ? "primary" : "ghost"} disabled={!canAfford} onClick={() => handleBuy("avatar", avatar.id, avatar.price || 0)} className="flex-shrink-0">
                                {canAfford ? "かう" : "PT不足"}
                              </Button>
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
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AvatarPreviewModal 
        isOpen={!!previewingAvatar} 
        onClose={() => setPreviewingAvatar(null)}
        avatarUrl={previewingAvatar?.url}
        avatarId={previewingAvatar?.id}
        name={previewingAvatar?.name}
      />

      <EquipmentPreviewModal
        isOpen={!!previewingEquipmentModal}
        onClose={() => setPreviewingEquipmentModal(null)}
        equipmentId={previewingEquipmentModal}
      />

      <AvatarEncyclopediaModal
        isOpen={showEncyclopediaModal}
        onClose={() => setShowEncyclopediaModal(false)}
        ownedAvatarIds={userData.avatars || []}
        equippedAvatarId={userData.equippedAvatar}
        ownedEquipmentIds={userData.equipments || []}
        equippedEquipmentId={userData.equippedEquipment}
        onEquipAvatar={async (avatarId) => {
          await updateUserData({ equippedAvatar: avatarId });
        }}
        onEquipEquipment={async (equipmentId) => {
          await updateUserData({ equippedEquipment: equipmentId });
        }}
        onGoToGacha={() => {
          setActiveTab("gacha");
          setShowEncyclopediaModal(false);
        }}
      />

      {/* Gacha Confirmation Modal */}
      <AnimatePresence>
        {confirmGacha && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="game-panel p-6 sm:p-8 max-w-sm w-full text-center border-4 border-amber-400 shadow-2xl relative"
            >
              <div className="text-5xl mb-3 animate-bounce">{confirmGacha.icon}</div>
              <h3 className="text-xl font-black text-amber-300 mb-1">
                {confirmGacha.name}
              </h3>
              <p className="text-sm font-bold text-slate-200 mb-4">
                本当にガチャをまわしますか？
              </p>

              <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-700 mb-6 space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-300">
                  <span>消費ポイント</span>
                  <span className="text-amber-400 font-black text-base">
                    {confirmGacha.cost.toLocaleString()} {confirmGacha.costType}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-400 border-t border-slate-800 pt-2">
                  <span>現在の所持</span>
                  <span className="text-slate-200 font-black">
                    {(confirmGacha.costType === "PT" ? userData.pt : (userData.sp || 0)).toLocaleString()} {confirmGacha.costType}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <Button
                  variant="fun"
                  size="lg"
                  className="w-full font-black text-lg py-3 shadow-lg"
                  onClick={() => {
                    const type = confirmGacha.type;
                    setConfirmGacha(null);
                    pullGacha(type);
                  }}
                >
                  ✨ まわす！
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-slate-300 font-bold"
                  onClick={() => setConfirmGacha(null)}
                >
                  やめる
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <GachaResultModal
        isOpen={!!gachaResult}
        result={gachaResult}
        onClose={() => setGachaResult(null)}
        onEquip={async (type, id) => {
          if (type === 'avatar') await updateUserData({ equippedAvatar: id });
          else if (type === 'equipment') await updateUserData({ equippedEquipment: id });
          else if (type === 'title') await updateUserData({ equippedTitle: id });
          else if (type === 'theme') await updateUserData({ theme: id });
          else if (type === 'effect') await updateUserData({ equippedEffect: id });
        }}
        onPullAgain={lastPullType ? () => pullGacha(lastPullType) : undefined}
        canPullAgain={
          lastPullType === "regular" ? userData.pt >= 100 :
          lastPullType === "sp_equipment" ? (userData.sp || 0) >= 1000 :
          (lastPullType === "rich_equipment" || lastPullType === "rich_ladies_equipment") ? (userData.sp || 0) >= 3000 :
          userData.pt >= 3000
        }
        pullAgainLabel={
          lastPullType === "regular" ? "100 PT でもう1回" :
          lastPullType === "sp_equipment" ? "1000 SP でもう1回" :
          (lastPullType === "rich_equipment" || lastPullType === "rich_ladies_equipment") ? "3000 SP でもう1回" :
          "3000 PT でもう1回"
        }
      />
    </>
  );
}
