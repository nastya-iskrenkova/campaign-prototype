export type Product = {
  id: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  image: string;
};

const toyName =
  "Игрушка Маленький Мандалорец Малыш Йода Такое большое название аж в целых 3 строки";

export const categories = [
  "Брюки",
  "Игрушки",
  "Юбки",
  "Сапоги",
  "Солнцезащитные очки",
  "Игрушечные музыкальные инструменты",
  "Пиджаки",
  "Шорты",
  "Свитшоты",
  "Серьги",
];

const asset = (file: string) => `${import.meta.env.BASE_URL}assets/${file}`;

export const products: Product[] = [
  { id: "toy-1", name: toyName, sku: "1503278140", brand: "[Название]", category: "Игрушки", image: asset("toy-1.jpg") },
  { id: "toy-2", name: toyName, sku: "1503278141", brand: "[Название]", category: "Игрушки", image: asset("toy-2.jpg") },
  { id: "toy-3", name: toyName, sku: "1503278142", brand: "[Название]", category: "Игрушки", image: asset("toy-3.jpg") },
  { id: "toy-4", name: toyName, sku: "1503278143", brand: "[Название]", category: "Игрушки", image: asset("toy-4.jpg") },
  { id: "toy-5", name: toyName, sku: "1503278144", brand: "[Название]", category: "Игрушки", image: asset("toy-5.jpg") },
  { id: "pants-1", name: "Брюки прямые хлопковые", sku: "2201844001", brand: "O'STIN", category: "Брюки", image: asset("pants-1.jpg") },
  { id: "pants-2", name: "Брюки зауженные серые", sku: "2201844008", brand: "Befree", category: "Брюки", image: asset("pants-2.jpg") },
  { id: "skirt-1", name: "Юбка миди плиссе", sku: "3301002211", brand: "Zarika", category: "Юбки", image: asset("skirt-1.jpg") },
  { id: "boots-1", name: "Сапоги кожаные высокие", sku: "4412900188", brand: "Respect", category: "Сапоги", image: asset("boots-1.jpg") },
  { id: "glasses-1", name: "Солнцезащитные очки авиаторы", sku: "5500128834", brand: "Polaroid", category: "Солнцезащитные очки", image: asset("glasses-1.jpg") },
  { id: "music-1", name: "Игрушечное пианино деревянное", sku: "1600442190", brand: "Janod", category: "Игрушечные музыкальные инструменты", image: asset("music-1.jpg") },
  { id: "jacket-1", name: "Пиджак оверсайз льняной", sku: "7703310042", brand: "Lime", category: "Пиджаки", image: asset("jacket-1.jpg") },
  { id: "shorts-1", name: "Шорты джинсовые", sku: "8802201176", brand: "Colin's", category: "Шорты", image: asset("shorts-1.jpg") },
  { id: "sweat-1", name: "Свитшот с вышивкой", sku: "9901183340", brand: "Mark Formelle", category: "Свитшоты", image: asset("sweat-1.jpg") },
  { id: "ear-1", name: "Серьги кольца золотистые", sku: "1207786503", brand: "Sokolov", category: "Серьги", image: asset("ear-1.jpg") },
];

export function formatMoney(value: number) {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

export function defaultCampaignName(product: Product) {
  if (product.id === "toy-1") return "Кампания Игрушка Мандалорец Малыш";
  return `Кампания ${product.name.split(" ").slice(0, 3).join(" ")}`;
}

export function matchesQuery(query: string, parts: string[]) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return parts.some((part) => part.toLowerCase().includes(normalized));
}

export function searchPosition(bid: number) {
  if (bid < 10) return { text: "Ниже конкурентной ставки", level: 0 };
  if (bid < 50) return { text: "11–34 позиции в поиске", level: 1 };
  if (bid < 440) return { text: "1–10 позиции в поиске", level: 2 };
  return { text: bid < 880 ? "Лидерская позиция" : "Топ-ставка", level: 3 };
}

export const ratePresets = [
  { id: "competitive", label: "11–34 позиции", value: 10, hint: "Конкурентная ставка" },
  { id: "leader", label: "Лидерская", value: 440, hint: "Верх выдачи" },
  { id: "top", label: "Топ-ставка", value: 880, hint: "Максимальный охват" },
];

export const helpCopy = {
  cpc: {
    title: "Ставка выше — цена ниже",
    body: "Чем выше ставка, тем ниже цена клика в аукционе. Товар чаще попадает в выдачу, а платите вы за фактический клик.",
  },
  searchBid: {
    title: "Ставка в поиске",
    body: "Стоимость одного клика в поиске и каталоге. От ставки зависят позиции по запросам покупателей.",
  },
  recoBid: {
    title: "Ставка в рекомендациях",
    body: "Стоимость одного клика в подборках товаров, похожих на недавние запросы или открытые карточки.",
  },
  cpm: {
    title: "Единая ставка",
    body: "Вы платите за 1 000 показов во всех включённых зонах. Конкурентная ставка сейчас около 150 ₽.",
  },
  limit: {
    title: "Дневной лимит",
    body: "Кампания остановится на сегодня, когда расход достигнет лимита, и продолжится на следующий день.",
  },
  balance: {
    title: "Доступно",
    body: "Откуда списывается бюджет. Сначала можно использовать промобонусы, остальное — с единого счёта.",
  },
} as const;

export type HelpId = keyof typeof helpCopy;
