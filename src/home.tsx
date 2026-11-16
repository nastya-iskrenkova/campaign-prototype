import { useMemo, useState } from "react";
import { formatMoney, products, type Product } from "./data";
import { Radio, Sheet } from "./ui";

export type ListedCampaign = {
  key: string;
  id: string;
  name: string;
  pay: "CPC" | "CPM";
  placement: string;
  items: number;
  balance: number;
  autoTopup: boolean;
};

export const listedCampaigns: ListedCampaign[] = [
  {
    key: "seed-cpc",
    id: "124324344",
    name: "Тестовая кампания",
    pay: "CPC",
    placement: "Поиск",
    items: 2,
    balance: 1200,
    autoTopup: true,
  },
  {
    key: "seed-cpm",
    id: "124324344",
    name: "Название кампании может быть очень длинным в две строки или более вот таким длинным",
    pay: "CPM",
    placement: "Ручная: поиск",
    items: 2,
    balance: 100200,
    autoTopup: false,
  },
];

export function placementLabel(input: {
  model: "cpc" | "cpm";
  cpmBidMode: "unified" | "manual";
  zoneSearch: boolean;
  zoneReco: boolean;
}) {
  if (input.model === "cpc") {
    if (input.zoneSearch && input.zoneReco) return "Поиск и рекомендации";
    return input.zoneSearch ? "Поиск" : "Рекомендации";
  }
  if (input.cpmBidMode === "unified") return "Единая: поиск и рекомендации";
  const zones = [input.zoneSearch ? "поиск" : "", input.zoneReco ? "рекомендации" : ""].filter(Boolean);
  return `Ручная: ${zones.join(" и ")}`;
}

function Asset({ file, width, height }: { file: string; width: number; height: number }) {
  return <img className="icon" src={`${import.meta.env.BASE_URL}assets/${file}.svg`} width={width} height={height} alt="" />;
}

export function HomeScreen({
  campaigns,
  onCreate,
  onHelp,
  onTopup,
}: {
  campaigns: ListedCampaign[];
  onCreate: () => void;
  onHelp: () => void;
  onTopup: () => void;
}) {
  const [tab, setTab] = useState<"campaigns" | "products">("campaigns");
  const [query, setQuery] = useState("");
  const [payFilter, setPayFilter] = useState<"all" | "CPC" | "CPM">("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBalance, setSortBalance] = useState(false);

  const visibleCampaigns = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = campaigns.filter((campaign) => {
      if (payFilter !== "all" && campaign.pay !== payFilter) return false;
      if (!normalized) return true;
      return [campaign.name, campaign.id, campaign.pay, campaign.placement].some((part) =>
        part.toLowerCase().includes(normalized),
      );
    });
    return sortBalance ? [...filtered].sort((a, b) => b.balance - a.balance) : filtered;
  }, [campaigns, payFilter, query, sortBalance]);

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = products.filter((product) => {
      if (!normalized) return true;
      return [product.name, product.sku, product.brand, product.category].some((part) =>
        part.toLowerCase().includes(normalized),
      );
    });
    return sortBalance ? [...filtered].sort((a, b) => a.name.localeCompare(b.name, "ru")) : filtered;
  }, [query, sortBalance]);

  return (
    <>
      <div className="scroll home-scroll">
        <div className="home-pad">
          <section className="balance-card">
            <div className="balance-top">
              <div>
                <div className="balance-label">
                  Единый счёт
                  <button type="button" className="help-btn" aria-label="Откуда списывается бюджет" onClick={onHelp}>
                    <Asset file="home-question" width={20} height={20} />
                  </button>
                </div>
                <p className="balance-sum">
                  10 000<span>₽</span>
                </p>
              </div>
              <button type="button" className="refill" onClick={onTopup}>
                Пополнить
              </button>
            </div>
            <p className="balance-bonus">Промобонусы: 1 000 B</p>
          </section>
        </div>
        <div className="home-widgets">
          <button type="button" className="widget" onClick={onTopup}>
            <Asset file="home-wallet" width={32} height={32} />
            <span>Финансы</span>
          </button>
          <button type="button" className="widget" onClick={() => setTab("campaigns")}>
            <Asset file="home-tasks" width={34} height={34} />
            <span>Задания</span>
          </button>
        </div>
        <div className="home-board">
          <section className="home-panel">
            <div className="segments" role="tablist" aria-label="Раздел продвижения">
              <button type="button" role="tab" aria-selected={tab === "campaigns"} className={`segment${tab === "campaigns" ? " on" : ""}`} onClick={() => setTab("campaigns")}>
                Кампании
              </button>
              <button type="button" role="tab" aria-selected={tab === "products"} className={`segment${tab === "products" ? " on" : ""}`} onClick={() => setTab("products")}>
                Товары
              </button>
            </div>
            <div className="home-tools">
              <label className="search home-search">
                <Asset file="home-search" width={20} height={20} />
                <input
                  value={query}
                  placeholder="Поиск"
                  aria-label="Поиск"
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <button type="button" className="tool-btn" aria-label="Фильтр" aria-pressed={payFilter !== "all"} onClick={() => setFilterOpen(true)}>
                <Asset file="home-filter" width={20} height={20} />
              </button>
              <button type="button" className="tool-btn" aria-label="Сортировка" aria-pressed={sortBalance} onClick={() => setSortBalance((current) => !current)}>
                <Asset file="home-sort" width={20} height={20} />
              </button>
            </div>
          </section>
          <div className="home-list">
            {tab === "campaigns" && visibleCampaigns.length === 0 && <p className="home-empty">Ничего не нашли</p>}
            {tab === "campaigns" &&
              visibleCampaigns.map((campaign) => (
                <article key={campaign.key} className="campaign-card">
                  <div className="campaign-main">
                    <div className="campaign-status">
                      <span className="status-row">
                        <span className="status-tag">Активна</span>
                        <span className="campaign-id">ID {campaign.id}</span>
                      </span>
                      <Asset file="home-chevron" width={20} height={20} />
                    </div>
                    <h2 className="campaign-name">{campaign.name}</h2>
                    <p className="campaign-meta">
                      <span>{campaign.pay}</span>
                      <span className="meta-dot">•</span>
                      <span>{campaign.placement}</span>
                      <span className="meta-dot">•</span>
                      <span>{campaign.items} шт</span>
                    </p>
                  </div>
                  <div className="campaign-foot">
                    <div className="budget-line">
                      <span>Остаток бюджета</span>
                      <span className="leader" />
                      <span className="budget-rest">{formatMoney(campaign.balance)}</span>
                      <button type="button" className="plus-btn" aria-label={`Пополнить бюджет кампании ${campaign.name}`} onClick={onTopup}>
                        <Asset file="home-plus" width={16} height={16} />
                      </button>
                    </div>
                    {campaign.autoTopup && (
                      <p className="autotop">
                        <Asset file="home-check" width={16} height={16} />
                        Автопополнение
                      </p>
                    )}
                  </div>
                </article>
              ))}
            {tab === "products" && visibleProducts.length === 0 && <p className="home-empty">Ничего не нашли</p>}
            {tab === "products" && visibleProducts.map((product) => <ProductRow key={product.id} product={product} />)}
          </div>
        </div>
      </div>
      <div className="dock home-dock">
        <button type="button" className="primary home-create" onClick={onCreate}>
          <Asset file="home-plus-white" width={20} height={20} />
          Создать кампанию
        </button>
        <div className="home" aria-hidden><i /></div>
      </div>
      {filterOpen && (
        <Sheet title="Фильтр" onClose={() => setFilterOpen(false)}>
          <div role="radiogroup" aria-label="Модель оплаты">
            {(
              [
                ["all", "Все кампании"],
                ["CPC", "За клики (CPC)"],
                ["CPM", "За показы (CPM)"],
              ] as const
            ).map(([value, label]) => (
              <div
                key={value}
                className="choice selectable"
                role="radio"
                aria-checked={payFilter === value}
                tabIndex={0}
                onClick={() => {
                  setPayFilter(value);
                  setTab("campaigns");
                  setFilterOpen(false);
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  setPayFilter(value);
                  setTab("campaigns");
                  setFilterOpen(false);
                }}
              >
                <span className="choice-title">{label}</span>
                <Radio checked={payFilter === value} />
              </div>
            ))}
          </div>
        </Sheet>
      )}
    </>
  );
}

function ProductRow({ product }: { product: Product }) {
  return (
    <article className="campaign-card product-row">
      <img className="photo" src={product.image} alt="" />
      <span className="product-copy">
        <span className="campaign-name">{product.name}</span>
        <span className="meta"><b>Артикул</b><span>{product.sku}</span></span>
        <span className="meta"><b>Бренд</b><span>{product.brand}</span></span>
      </span>
    </article>
  );
}
