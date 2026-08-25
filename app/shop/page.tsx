"use client";

import { useState, useEffect } from "react";
import { ThemeBackground } from "../../components/ui/ThemeBackground";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useUser } from "../../hooks/useUser";
import type { UserData } from "../../contexts/UserContext";
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
import { GachaTab } from "../../components/shop/GachaTab";
import { EquipmentsTab } from "../../components/shop/EquipmentsTab";
import { ThemesTab } from "../../components/shop/ThemesTab";
import { EffectsTab } from "../../components/shop/EffectsTab";
import { TitlesTab } from "../../components/shop/TitlesTab";
import { AvatarsTab } from "../../components/shop/AvatarsTab";
import { useToast } from "../../components/ui/Toast";

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
  const { userData, updateUserData, updateUserDataAtomic, loading } = useUser();
  const router = useRouter();
  const { showToast } = useToast();
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
    const ok = await updateUserDataAtomic(current => {
      if (category === "equipment") {
        if ((current.sp || 0) < price) return null;
        const userEquips = current.equipments || [];
        if (userEquips.includes(id)) return null;
        return { sp: (current.sp || 0) - price, equipments: [...userEquips, id] };
      }

      if (current.pt < price) return null;
      const newPt = current.pt - price;
      if (category === "theme") {
        const key = `theme_${id}`;
        if (current.effects.includes(key)) return null;
        return { pt: newPt, effects: [...current.effects, key] };
      } else if (category === "effect") {
        if (current.effects.includes(id)) return null;
        return { pt: newPt, effects: [...current.effects, id] };
      } else if (category === "title") {
        if (current.titles.includes(id)) return null;
        return { pt: newPt, titles: [...current.titles, id] };
      } else if (category === "avatar") {
        if (current.avatars.includes(id)) return null;
        return { pt: newPt, avatars: [...current.avatars, id] };
      }
      return null;
    });
    if (ok === false) showToast("通信エラーでこうにゅうできませんでした。もう一度お試しください");
    else if (ok === null) showToast("ポイントが足りないか、すでに持っています");
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
    // 装備系ガチャ（SP消費・装備リストに追加、重複時はSP一部返還）を共通処理する。
    // 残高チェック・消費・付与を1回のFirestoreトランザクションにまとめることで、
    // 「消費だけ反映されて景品が付与されない」といった中途半端な状態を防ぐ。
    const runEquipmentGacha = async (
      cost: number,
      pull: () => any,
      gachaName: string,
      refundAmount: number,
      refundLabel: string
    ) => {
      if ((userData.sp || 0) < cost || pullingType) return;
      setPullingType(type);
      setGachaResult(null);
      setShowGachaRates(null);

      let resultItem: any = null;
      const ok = await updateUserDataAtomic(current => {
        const balance = current.sp || 0;
        if (balance < cost) { resultItem = null; return null; }
        resultItem = pull();
        resultItem.gachaName = gachaName;
        const userEquips = current.equipments || [];
        if (userEquips.includes(resultItem.id)) {
          resultItem.duplicated = true;
          resultItem.refund = refundLabel;
          return { sp: balance - cost + refundAmount };
        }
        return { sp: balance - cost, equipments: [...userEquips, resultItem.id] };
      });

      if (!ok || !resultItem) {
        setPullingType(null);
        if (ok === false) showToast("通信エラーでガチャをまわせませんでした。もう一度お試しください");
        else showToast("SPが足りません");
        return;
      }
      const rarityLevels: Record<string, number> = { "ノーマル": 1, "レア": 2, "激レア": 3, "超激レア": 4, "神レア": 5 };
      setGachaTargetStage(rarityLevels[resultItem.rarity] || 1);
      setPendingGachaResult(resultItem);
    };

    if (type === "sp_equipment") {
      await runEquipmentGacha(1000, pullSpEquipmentGachaItem, "⚔️ SP装備ガチャ", 500, "500 SP");
      return;
    }

    if (type === "rich_equipment") {
      await runEquipmentGacha(3000, pullRichEquipmentGachaItem, "🛡️ 装備品リッチガチャ", 1000, "1000 SP");
      return;
    }

    if (type === "rich_ladies_equipment") {
      await runEquipmentGacha(3000, pullRichLadiesEquipmentGachaItem, "🎀 ふわふわ装備リッチガチャ♡", 1000, "1000 SP");
      return;
    }

    if (type === "rich_ladies") {
      if (userData.pt < 3000 || pullingType) return;
      setPullingType(type);
      setGachaResult(null);
      setShowGachaRates(null);

      let resultItem: any = null;
      const ok = await updateUserDataAtomic(current => {
        if (current.pt < 3000) { resultItem = null; return null; }
        resultItem = pullRichLadiesGachaItem();
        resultItem.gachaName = "🌸 ふわふわガチャ♡";
        if (current.avatars.includes(resultItem.id)) {
          resultItem.duplicated = true;
          resultItem.refund = "1000 PT";
          return { pt: current.pt - 3000 + 1000 };
        }
        return { pt: current.pt - 3000, avatars: [...current.avatars, resultItem.id] };
      });

      if (!ok || !resultItem) {
        setPullingType(null);
        if (ok === false) showToast("通信エラーでガチャをまわせませんでした。もう一度お試しください");
        else showToast("PTが足りません");
        return;
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

    let result: any = null;
    const ok = await updateUserDataAtomic(current => {
      if (current.pt < cost) { result = null; return null; }

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

      const updates: Partial<UserData> = { pt: current.pt - cost };
      let duplicated = false;

      if (result.type === 'effect') {
        if (current.effects.includes(result.id)) duplicated = true;
        else updates.effects = [...current.effects, result.id];
      } else if (result.type === 'avatar') {
        if (current.avatars.includes(result.id)) duplicated = true;
        else updates.avatars = [...current.avatars, result.id];
      } else if (result.type === 'title') {
        if (current.titles.includes(result.id)) duplicated = true;
        else updates.titles = [...current.titles, result.id];
      } else if (result.type === 'theme') {
        const themeEffectId = `theme_${result.id}`;
        if (current.effects.includes(themeEffectId)) duplicated = true;
        else updates.effects = [...current.effects, themeEffectId];
      }

      if (duplicated || result.type === 'xp') {
        if (type !== "regular") {
          updates.pt = current.pt - cost + 1000;
          result.duplicated = true;
          result.refund = "1000 PT";
        } else {
          updates.xp = current.xp + 50;
          result.duplicated = true;
          result.refund = "50 XP";
        }
      }

      return updates;
    });

    if (!ok || !result) {
      setPullingType(null);
      if (ok === false) showToast("通信エラーでガチャをまわせませんでした。もう一度お試しください");
      else showToast("PTが足りません");
      return;
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
                      return userEquips.includes(e.gachaItemId) || userEquips.includes(e.id);
                    }
                    const userAvatars = userData.avatars || [];
                    return userAvatars.includes(e.gachaItemId) || userAvatars.includes(e.icon) || userAvatars.includes(e.id);
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
                <GachaTab
                  userData={userData}
                  pullingType={pullingType}
                  showGachaRates={showGachaRates}
                  setShowGachaRates={setShowGachaRates}
                  handleRequestGacha={handleRequestGacha}
                  setPreviewingAvatar={setPreviewingAvatar}
                  setPreviewingEquipmentModal={setPreviewingEquipmentModal}
                />
              )}

              {/* ===== EQUIPMENTS TAB ===== */}
              {activeTab === "equipments" && (
                <EquipmentsTab userData={userData} selectedRarity={selectedRarity} handleBuy={handleBuy} />
              )}

              {/* ===== THEMES TAB ===== */}
              {activeTab === "themes" && (
                <ThemesTab userData={userData} selectedRarity={selectedRarity} previewTheme={previewTheme} setPreviewTheme={setPreviewTheme} handleBuy={handleBuy} />
              )}

              {/* ===== EFFECTS TAB ===== */}
              {activeTab === "effects" && (
                <EffectsTab userData={userData} selectedRarity={selectedRarity} previewEffect={previewEffect} setPreviewEffect={setPreviewEffect} handleBuy={handleBuy} />
              )}

              {/* ===== TITLES TAB ===== */}
              {activeTab === "titles" && (
                <TitlesTab userData={userData} selectedRarity={selectedRarity} previewTitle={previewTitle} setPreviewTitle={setPreviewTitle} handleBuy={handleBuy} />
              )}

              {/* ===== AVATARS TAB ===== */}
              {activeTab === "avatars" && (
                <AvatarsTab userData={userData} selectedRarity={selectedRarity} previewAvatar={previewAvatar} setPreviewAvatar={setPreviewAvatar} handleBuy={handleBuy} setPreviewingAvatar={setPreviewingAvatar} />
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
          const ok = await updateUserData({ equippedAvatar: avatarId });
          if (!ok) showToast("そうびを保存できませんでした");
        }}
        onEquipEquipment={async (equipmentId) => {
          const ok = await updateUserData({ equippedEquipment: equipmentId });
          if (!ok) showToast("そうびを保存できませんでした");
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
          let ok = true;
          if (type === 'avatar') ok = await updateUserData({ equippedAvatar: id });
          else if (type === 'equipment') ok = await updateUserData({ equippedEquipment: id });
          else if (type === 'title') ok = await updateUserData({ equippedTitle: id });
          else if (type === 'theme') ok = await updateUserData({ theme: id });
          else if (type === 'effect') ok = await updateUserData({ equippedEffect: id });
          if (!ok) showToast("そうびを保存できませんでした");
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
