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
import { getAllThemes } from "../../lib/itemData";
import { calculateLevel } from "../../lib/gameLogic";
import { calculateAdventurerStats } from "../../lib/userStatsLogic";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { storage } from "../../lib/storage";

import { AdventurerGrowthReport } from "../../components/profile/AdventurerGrowthReport";
import { ShareCodeCard } from "../../components/profile/ShareCodeCard";
import { useToast } from "../../components/ui/Toast";
import { TitlesTab } from "../../components/profile/TitlesTab";
import { AvatarsTab } from "../../components/profile/AvatarsTab";
import { EquipmentsTab } from "../../components/profile/EquipmentsTab";
import { ThemesTab } from "../../components/profile/ThemesTab";
import { EffectsTab } from "../../components/profile/EffectsTab";

const AvatarPreviewModal = dynamic(() => import("../../components/ui/AvatarPreviewModal").then(mod => mod.AvatarPreviewModal), { ssr: false });
const EquipmentPreviewModal = dynamic(() => import("../../components/ui/EquipmentPreviewModal").then(mod => mod.EquipmentPreviewModal), { ssr: false });

const allThemes = getAllThemes();

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
                <TitlesTab userData={userData} selectedRarity={selectedRarity} previewTitle={previewTitle} setPreviewTitle={setPreviewTitle} handleEquip={handleEquip} />
              )}

              {activeTab === "avatars" && (
                <AvatarsTab userData={userData} selectedRarity={selectedRarity} previewAvatar={previewAvatar} setPreviewAvatar={setPreviewAvatar} handleEquip={handleEquip} setPreviewingAvatarModal={setPreviewingAvatarModal} />
              )}

              {activeTab === "equipments" && (
                <EquipmentsTab userData={userData} selectedRarity={selectedRarity} previewEquipment={previewEquipment} setPreviewEquipment={setPreviewEquipment} handleEquip={handleEquip} setPreviewingEquipmentModal={setPreviewingEquipmentModal} />
              )}

              {activeTab === "themes" && (
                <ThemesTab userData={userData} selectedRarity={selectedRarity} previewTheme={previewTheme} setPreviewTheme={setPreviewTheme} handleEquip={handleEquip} />
              )}

              {activeTab === "effects" && (
                <EffectsTab userData={userData} selectedRarity={selectedRarity} previewEffect={previewEffect} setPreviewEffect={setPreviewEffect} handleEquip={handleEquip} />
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
