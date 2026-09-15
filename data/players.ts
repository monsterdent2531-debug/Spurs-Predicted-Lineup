export type Player = {
  id: string;
  name: string;
  number: number;
  positions: string[];
  starterImage: string;
  subImage: string;
};

const img = (file: string, kind: "starters" | "subs") =>
  `/images/players/${kind}/${file}.webp`;

export const players: Player[] = [
  { id: "austin", name: "Austin", number: 40, positions: ["GK"], starterImage: img("austin", "starters"), subImage: img("austin", "subs") },
  { id: "bentancur", name: "Bentancur", number: 30, positions: ["DM", "CM"], starterImage: img("bentancur", "starters"), subImage: img("bentancur", "subs") },
  { id: "bergvall", name: "Bergvall", number: 15, positions: ["CM", "CAM"], starterImage: img("bergvall", "starters"), subImage: img("bergvall", "subs") },
  { id: "davies", name: "Davies", number: 33, positions: ["CB", "LCB", "LB"], starterImage: img("davies", "starters"), subImage: img("davies", "subs") },
  { id: "dubravka", name: "Dubravka", number: 39, positions: ["GK"], starterImage: img("dubravka", "starters"), subImage: img("dubravka", "subs") },
  { id: "fernandes", name: "Fernandes", number: 18, positions: ["CM", "DM"], starterImage: img("fernandes", "starters"), subImage: img("fernandes", "subs") },
  { id: "gallagher", name: "Gallagher", number: 8, positions: ["CM", "CAM"], starterImage: img("gallagher", "starters"), subImage: img("gallagher", "subs") },
  { id: "gray", name: "Gray", number: 14, positions: ["RB", "RWB", "CM", "DM", "CB"], starterImage: img("gray", "starters"), subImage: img("gray", "subs") },
  { id: "kinsky", name: "Kinsky", number: 31, positions: ["GK"], starterImage: img("kinsky", "starters"), subImage: img("kinsky", "subs") },
  { id: "kudus", name: "Kudus", number: 20, positions: ["RW", "RM", "CAM"], starterImage: img("kudus", "starters"), subImage: img("kudus", "subs") },
  { id: "kulusevski", name: "Kulusevski", number: 21, positions: ["RW", "RM", "CAM"], starterImage: img("kulusevski", "starters"), subImage: img("kulusevski", "subs") },
  { id: "tel", name: "Tel", number: 11, positions: ["ST", "CF", "LW", "LM"], starterImage: img("tel", "starters"), subImage: img("tel", "subs") },
  { id: "maddison", name: "Maddison", number: 10, positions: ["CAM", "CM"], starterImage: img("maddison", "starters"), subImage: img("maddison", "subs") },
  { id: "marmoush", name: "Marmoush", number: 22, positions: ["LW", "LM", "ST", "CF"], starterImage: img("marmoush", "starters"), subImage: img("marmoush", "subs") },
  { id: "savio", name: "Savio", number: 17, positions: ["RW", "RM", "LW", "LM"], starterImage: img("savio", "starters"), subImage: img("savio", "subs") },
  { id: "odobert", name: "Odobert", number: 28, positions: ["LW", "LM", "RW", "RM"], starterImage: img("odobert", "starters"), subImage: img("odobert", "subs") },
  { id: "porro", name: "Pedro Porro", number: 23, positions: ["RB", "RWB"], starterImage: img("porro", "starters"), subImage: img("porro", "subs") },
  { id: "robertson", name: "Robertson", number: 3, positions: ["LB", "LWB"], starterImage: img("robertson", "starters"), subImage: img("robertson", "subs") },
  { id: "richarlison", name: "Richarlison", number: 9, positions: ["ST", "CF"], starterImage: img("richarlison", "starters"), subImage: img("richarlison", "subs") },
  { id: "senesi", name: "Senesi", number: 5, positions: ["CB", "LCB"], starterImage: img("senesi", "starters"), subImage: img("senesi", "subs") },
  { id: "solanke", name: "Solanke", number: 19, positions: ["ST", "CF"], starterImage: img("solanke", "starters"), subImage: img("solanke", "subs") },
  { id: "tonali", name: "Tonali", number: 16, positions: ["DM", "CM"], starterImage: img("tonali", "starters"), subImage: img("tonali", "subs") },
  { id: "tosin", name: "Tosin", number: 4, positions: ["CB", "RCB"], starterImage: img("tosin", "starters"), subImage: img("tosin", "subs") },
  { id: "udogie", name: "Udogie", number: 13, positions: ["LB", "LWB"], starterImage: img("udogie", "starters"), subImage: img("udogie", "subs") },
  { id: "vanhecke", name: "Van Hecke", number: 5, positions: ["CB", "RCB"], starterImage: img("vanhecke", "starters"), subImage: img("vanhecke", "subs") },
  { id: "vandeven", name: "Van de Ven", number: 37, positions: ["CB", "LCB", "LB"], starterImage: img("vandeven", "starters"), subImage: img("vandeven", "subs") },
  { id: "williamsbarnett", name: "Williams-Barnett", number: 68, positions: ["CAM", "CM"], starterImage: img("williamsbarnett", "starters"), subImage: img("williamsbarnett", "subs") },
  { id: "xavi", name: "Xavi", number: 7, positions: ["CAM", "CM", "LW", "LM"], starterImage: img("xavi", "starters"), subImage: img("xavi", "subs") },
];
