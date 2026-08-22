const fs = require('fs');
let content = fs.readFileSync('lib/gachaData.ts', 'utf8');

const repl = [
  {id: 'gacha_king', icon: '/kanji-quest/images/avatars/avatar_knight.jpg'},
  {id: 'gacha_ancient_dragon', icon: '/kanji-quest/images/avatars/avatar_dragon.jpg'},
  {id: 'gacha_pegasus', icon: '/kanji-quest/images/bosses/cute_griffin.jpg'},
  {id: 'gacha_light_fairy', icon: '/kanji-quest/images/bosses/cute_slime.jpg'},
  {id: 'gacha_super_robot', icon: '/kanji-quest/images/avatars/avatar_cyborg.jpg'},
  {id: 'gacha_alien_boss', icon: '/kanji-quest/images/bosses/boss_golem.jpg'},
  {id: 'gacha_trex', icon: '/kanji-quest/images/bosses/boss_trex.jpg'},
  {id: 'gacha_griffin', icon: '/kanji-quest/images/bosses/boss_griffin.jpg'},
  {id: 'gacha_megalodon', icon: '/kanji-quest/images/bosses/boss_kraken.jpg'},
  {id: 'gacha_vampire', icon: '/kanji-quest/images/bosses/boss_bat.jpg'},
  {id: 'gacha_great_wizard', icon: '/kanji-quest/images/bosses/boss_ogre.jpg'},
  {id: 'gacha_master_ninja', icon: '/kanji-quest/images/bosses/boss_wolf.jpg'},
  {id: 'gacha_white_tiger', icon: '/kanji-quest/images/bosses/boss_dragon.jpg'},
  {id: 'gacha_fenrir', icon: '/kanji-quest/images/bosses/boss_wolf.jpg'},
  {id: 'gacha_dog', icon: '/kanji-quest/images/bosses/cute_wolf.jpg'},
  {id: 'gacha_cat', icon: '/kanji-quest/images/bosses/cute_bat.jpg'},
  {id: 'gacha_fox', icon: '/kanji-quest/images/bosses/cute_dragon.jpg'},
  {id: 'gacha_bear', icon: '/kanji-quest/images/bosses/cute_ogre.jpg'},
  {id: 'gacha_panda', icon: '/kanji-quest/images/bosses/cute_scorpion.jpg'},
  {id: 'gacha_lion', icon: '/kanji-quest/images/bosses/cute_trex.jpg'},
  {id: 'gacha_frog', icon: '/kanji-quest/images/bosses/cute_slime.jpg'},
  {id: 'gacha_owl', icon: '/kanji-quest/images/bosses/cute_griffin.jpg'},
  {id: 'gacha_ghost', icon: '/kanji-quest/images/bosses/boss_bat.jpg'},
  {id: 'gacha_skull', icon: '/kanji-quest/images/bosses/boss_scorpion.jpg'}
];

repl.forEach(r => {
  const regex = new RegExp(`{ id: "${r.id}", type: "avatar", name: "(.*?)", icon: ".*?", rarity: "(.*?)", weight: (.*?) }`);
  content = content.replace(regex, `{ id: "${r.id}", type: "avatar", name: "$1", icon: "${r.icon}", rarity: "$2", weight: $3 }`);
});

fs.writeFileSync('lib/gachaData.ts', content, 'utf8');
