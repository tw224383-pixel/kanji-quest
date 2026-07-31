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
import { getAllThemes, getAllEffects, getAllTitles, getAllAvatars } from "../../lib/itemData";

const allThemes = getAllThemes();
const allEffects = getAllEffects();
const allTitles = getAllTitles();
const allAvatars = getAllAvatars();

type Tab = "themes" | "effects" | "titles" | "avatars";

export default function ProfilePage() {
  const { userData, updateUserData, loading } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("titles");
  
  const [previewTitle, setPreviewTitle] = useState<string | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const { previewTheme, setPreviewTheme } = useThemeContext();
  const [previewEffect, setPreviewEffect] = useState<string | null>(null);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-2xl">ロード中...</div>;
  if (!userData) {
    router.push("/");
    return null;
  }

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

  const tabs: { id: Tab, label: string }[] = [
    { id: "titles", label: "📛 しょうごう" },
    { id: "avatars", label: "👤 アバター" },
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
              <span>👑</span> プロフィール・着せ替え
            </h1>
            <Button variant="outline" onClick={() => router.push("/home")}>もどる</Button>
          </div>

          {/* Preview Area for Titles and Avatars */}
          <div className="mb-8">
            <div className="game-panel-light p-6 flex flex-col items-center relative overflow-hidden">
              <div className="text-sm font-black text-indigo-400 mb-4 z-10">✨ 現在のすがた ✨</div>
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
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map(t => (
              <button 
                key={t.id}
                onClick={() => { setActiveTab(t.id); setPreviewTitle(null); setPreviewAvatar(null); setPreviewTheme(null); setPreviewEffect(null); }} 
                className={`px-4 py-3 font-black rounded-xl transition-all border-b-[4px] flex-1 min-w-[120px] shadow-md ${activeTab === t.id ? 'bg-indigo-500 text-white border-indigo-800 translate-y-1 border-b-0 drop-shadow-game-text' : 'bg-slate-700 text-slate-300 border-slate-900 hover:bg-slate-600'}`}
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
              {activeTab === "titles" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allTitles.filter(t => userData.titles.includes(t.id) || t.id === "見習い").map(title => {
                    const isEquipped = userData.equippedTitle === title.id;
                    const isPreviewing = previewTitle === title.id;
                    return (
                      <div key={title.id} className={`game-panel-light p-4 flex flex-col gap-3 ${isEquipped ? 'border-primary bg-blue-50/90' : ''}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-black text-xl text-indigo-900">【{title.name}】</div>
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
                  })}
                </div>
              )}

              {activeTab === "avatars" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allAvatars.filter(a => userData.avatars.includes(a.id) || ["👦", "👧"].includes(a.id)).map(avatar => {
                    const isEquipped = userData.equippedAvatar === avatar.id;
                    const isPreviewing = previewAvatar === avatar.id;
                    return (
                      <div key={avatar.id} className={`game-panel-light p-4 flex flex-col gap-3 ${isEquipped ? 'border-primary bg-blue-50/90' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {avatar.icon?.startsWith('/') ? (
                              <img src={avatar.icon} alt={avatar.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
                            ) : (
                              <div className="text-5xl">{avatar.icon}</div>
                            )}
                            <div className="font-bold text-lg text-slate-800">{avatar.name}</div>
                          </div>
                          {isEquipped ? (
                            <div className="text-primary font-black px-4">そうび中</div>
                          ) : (
                            <Button variant="secondary" onClick={() => handleEquip("avatar", avatar.id)}>そうび</Button>
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

              {activeTab === "themes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allThemes.filter(t => t.id === 'default' || userData.effects.includes(`theme_${t.id}`)).map(theme => {
                    const isEquipped = (userData.theme || 'default') === theme.id;
                    const isPreviewing = previewTheme === theme.id;
                    return (
                      <div key={theme.id} className={`game-panel-light p-4 flex flex-col gap-3 ${isEquipped ? 'border-primary bg-blue-50/90' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-4xl">{theme.icon}</div>
                            <div className="font-bold text-lg text-slate-800">{theme.name}</div>
                          </div>
                          {isEquipped ? (
                            <div className="text-primary font-black px-4">そうび中</div>
                          ) : (
                            <Button variant="secondary" onClick={() => handleEquip("theme", theme.id)}>そうび</Button>
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

              {activeTab === "effects" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allEffects.filter(e => userData.effects.includes(e.id)).map(effect => {
                    const isEquipped = userData.equippedEffect === effect.id;
                    const isPreviewing = previewEffect === effect.id;
                    return (
                      <div key={effect.id} className={`game-panel-light p-4 flex flex-col gap-3 ${isEquipped ? 'border-primary bg-blue-50/90' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-4xl">{effect.icon}</div>
                            <div className="font-bold text-lg text-slate-800">{effect.name}</div>
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
                  })}
                  {allEffects.filter(e => userData.effects.includes(e.id)).length === 0 && (
                    <div className="col-span-1 md:col-span-2 text-center py-10 font-bold text-slate-400">
                      まだエフェクトを持っていません。<br/>ガチャやショップで手に入れよう！
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </main>
    </>
  );
}
