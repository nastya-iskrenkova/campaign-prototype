import { useMemo, useState, type FormEvent } from "react";
import {
  categories,
  defaultCampaignName,
  daysLeftLabel,
  formatBonus,
  formatMoney,
  helpCopy,
  matchesQuery,
  products,
  promoCap,
  promoPackages,
  ratePresets,
  searchPosition,
  type HelpId,
  type Product,
  type PromoPackageId,
} from "./data";
import {
  HelpButton,
  HomeIndicator,
  Icon,
  NavBar,
  PrimaryButton,
  Radio,
  SearchField,
  Sheet,
  StatusBar,
  Stepper,
  Toggle,
} from "./ui";
import { HomeScreen, listedCampaigns, placementLabel, type ListedCampaign } from "./home";

type Screen = "home" | "fork" | "search" | "category" | "settings" | "bids" | "budget" | "done";
type SheetKind = "categories" | "rates" | "topup" | "help" | null;
type PayModel = "cpc" | "cpm";
type CpmBidMode = "unified" | "manual";
type RateTarget = "search" | "cpm" | "cpmSearch";

const PASSWORD = import.meta.env.VITE_PASSWORD ?? "";
const UNLOCK_KEY = "campaign-unlocked";

const initial = {
  screen: "home" as Screen,
  cameFrom: "search" as "search" | "category",
  query: "",
  categoryQuery: "",
  category: "",
  selectedId: "toy-1",
  name: "Кампания Игрушка Мандалорец Малыш",
  nameEdited: false,
  model: "cpc" as PayModel,
  cpmBidMode: "unified" as CpmBidMode,
  zoneSearch: true,
  zoneReco: true,
  searchBid: 10,
  recoBid: 10,
  cpmBid: 150,
  cpmSearchBid: 190,
  cpmRecoBid: 190,
  cpmFocused: false,
  budget: 2000,
  budgetEdited: false,
  limitOn: false,
  limit: 500,
  promo: false,
  promoPackageId: "week" as PromoPackageId,
  promoAmount: 999,
  promoEdited: false,
  topupMin: 500,
  topupAmount: 1000,
  topupOn: false,
};

export default function App() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(UNLOCK_KEY) === "1");
  const [state, setState] = useState(initial);
  const [campaigns, setCampaigns] = useState<ListedCampaign[]>(listedCampaigns);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [help, setHelp] = useState<HelpId>("cpc");
  const [rateTarget, setRateTarget] = useState<RateTarget>("search");

  const selected = products.find((product) => product.id === state.selectedId) ?? null;

  const visibleProducts = useMemo(() => {
    const source =
      state.screen === "category"
        ? products.filter((product) => product.category === state.category)
        : products;
    return source.filter((product) =>
      matchesQuery(state.query, [product.name, product.sku, product.brand, product.category]),
    );
  }, [state.screen, state.category, state.query]);

  const visibleCategories = categories.filter((category) =>
    matchesQuery(state.categoryQuery, [category]),
  );

  const budgetValid = state.budget >= 1000;
  const promoPackage = promoPackages.find((item) => item.id === state.promoPackageId) ?? promoPackages[0];
  const promoMax = promoCap(promoPackage.amount, promoPackage.percent, state.budget);
  const promoUsed = state.promo ? Math.min(state.promoAmount, promoMax) : 0;
  const accountCharge = Math.max(state.budget - promoUsed, 0);
  const promoReady = !state.promo || state.promoAmount <= promoMax;
  const zonesReady =
    state.model === "cpm" && state.cpmBidMode === "unified" ? true : state.zoneSearch || state.zoneReco;
  const canLeaveSettings = state.name.trim().length > 0 && zonesReady;
  const selectedVisible = visibleProducts.some((product) => product.id === state.selectedId);

  function patch(partial: Partial<typeof initial>) {
    setState((current) => ({ ...current, ...partial }));
  }

  function openHelp(id: HelpId) {
    setHelp(id);
    setSheet("help");
  }

  function chooseProduct(product: Product) {
    patch({
      selectedId: product.id,
      ...(state.nameEdited ? {} : { name: defaultCampaignName(product) }),
    });
  }

  function goSettings() {
    if (!selected || !selectedVisible) return;
    patch({
      screen: "settings",
      ...(state.nameEdited ? {} : { name: defaultCampaignName(selected) }),
    });
  }

  function reset() {
    setState(initial);
    setSheet(null);
  }

  function launch() {
    setCampaigns((current) => [
      {
        key: `created-${current.length}`,
        id: String(124324300 + current.length),
        name: state.name.trim() || "Новая кампания",
        pay: state.model === "cpc" ? "CPC" : "CPM",
        placement: placementLabel(state),
        items: 1,
        balance: state.budget,
        autoTopup: state.topupOn,
      },
      ...current,
    ]);
    patch({ screen: "done" });
  }

  const title =
    state.screen === "search"
      ? "Добавление товара"
      : state.screen === "category"
        ? "Добавление товаров"
        : "Создание кампании";

  function back() {
    if (state.screen === "search" || state.screen === "category") {
      patch({ screen: "fork", query: "" });
      setSheet(null);
    } else if (state.screen === "settings") patch({ screen: state.cameFrom });
    else if (state.screen === "bids") patch({ screen: "settings" });
    else if (state.screen === "budget") patch({ screen: "bids" });
    else if (state.screen === "done") patch({ screen: "budget" });
  }

  if (!unlocked) {
    return (
      <div className="stage">
        <div className="phone">
          <LockScreen
            onUnlock={() => {
              sessionStorage.setItem(UNLOCK_KEY, "1");
              setUnlocked(true);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="stage">
      <div className="phone">
        <StatusBar />
        <NavBar
          title={state.screen === "home" ? "Продвижение" : title}
          onBack={state.screen === "home" ? () => undefined : state.screen === "fork" ? () => patch({ screen: "home" }) : back}
        />
        {state.screen === "home" ? (
          <HomeScreen
            campaigns={campaigns}
            onCreate={() => patch({ screen: "fork" })}
            onHelp={() => openHelp("balance")}
            onTopup={() => setSheet("topup")}
          />
        ) : (
        <>
        <div className="scroll">
          {state.screen === "fork" && (
            <>
              <Stepper current={1} />
              <section className="empty">
                <Icon name="tag" alt="" />
                <div className="empty-copy">
                  <h2>Добавьте товар для продвижения</h2>
                  <p>Выберите, как хотите найти товар</p>
                </div>
                <div className="options">
                  <button
                    type="button"
                    className="option"
                    onClick={() => patch({ screen: "search", cameFrom: "search", query: "", selectedId: selected?.id ?? "toy-1" })}
                  >
                    <span className="option-icon"><Icon name="search-sm" alt="" /></span>
                    <span className="option-copy">
                      <strong>Найти конкретный товар</strong>
                      <span>По названию, артикулу или бренду</span>
                    </span>
                    <Icon name="chevron-right" alt="" />
                  </button>
                  <button
                    type="button"
                    className="option"
                    onClick={() => {
                      patch({ screen: "category", cameFrom: "category", query: "", categoryQuery: "" });
                      setSheet("categories");
                    }}
                  >
                    <span className="option-icon"><Icon name="grid" alt="" /></span>
                    <span className="option-copy">
                      <strong>Выбрать по категории</strong>
                      <span>Выберите категорию, затем товар</span>
                    </span>
                    <Icon name="chevron-right" alt="" />
                  </button>
                </div>
              </section>
            </>
          )}

          {(state.screen === "search" || state.screen === "category") && (
            <>
              <div className="card pad stack" style={{ borderRadius: "0 0 16px 16px" }}>
                {state.screen === "category" && (
                  <button type="button" className="select" onClick={() => setSheet("categories")}>
                    <span className={`select-value${state.category ? "" : " placeholder"}`}>
                      {state.category || "Категория товара"}
                    </span>
                    <span className="select-chevron"><Icon name="chevron-down" alt="" /></span>
                  </button>
                )}
                <SearchField
                  value={state.query}
                  onChange={(query) => patch({ query })}
                  placeholder="Поиск по названию, артикулу или бренду"
                />
              </div>
              <div className="card" style={{ flex: 1 }}>
                {state.screen === "category" && state.category && (
                  <div className="list-head">
                    <h2 className="section-title" style={{ padding: 0 }}>{state.category}</h2>
                    <span>{visibleProducts.length}</span>
                  </div>
                )}
                {state.screen === "category" && !state.category ? (
                  <div className="empty" style={{ borderRadius: 16 }}>
                    <h2>Сначала выберите категорию</h2>
                    <p>Товары появятся после выбора</p>
                    <button type="button" className="ghost" onClick={() => setSheet("categories")}>Выбрать категорию</button>
                  </div>
                ) : visibleProducts.length === 0 ? (
                  <div className="empty" style={{ borderRadius: 16 }}>
                    <h2>Ничего не нашли</h2>
                    <p>Попробуйте другое название, артикул или бренд</p>
                  </div>
                ) : (
                  <div role="radiogroup" aria-label="Товары">
                    {visibleProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        className="product"
                        role="radio"
                        aria-checked={product.id === state.selectedId}
                        onClick={() => chooseProduct(product)}
                      >
                        <img className="photo" src={product.image} alt="" />
                        <span className="product-copy">
                          <span className="product-name">{product.name}</span>
                          <span className="meta"><b>Артикул</b><span>{product.sku}</span></span>
                          <span className="meta"><b>Бренд</b><span>{product.brand}</span></span>
                        </span>
                        <Radio checked={product.id === state.selectedId} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {state.screen === "settings" && selected && (
            <>
              <Stepper current={1} />
              <div className="card">
                <div className="product">
                  <img className="photo" src={selected.image} alt="" />
                  <span className="product-copy">
                    <span className="product-name">{selected.name}</span>
                    <span className="meta"><b>Артикул</b><span>{selected.sku}</span></span>
                    <span className="meta"><b>Бренд</b><span>{selected.brand}</span></span>
                  </span>
                  <button
                    type="button"
                    className="pencil"
                    aria-label="Изменить товар"
                    onClick={() => patch({ screen: state.cameFrom })}
                  >
                    <Icon name="pencil" alt="" />
                  </button>
                </div>
              </div>
              <div className="card pad">
                <label className="field">
                  <span className="field-label">Название кампании</span>
                  <span className="field-box">
                    <input
                      value={state.name}
                      aria-label="Название кампании"
                      onChange={(event) => patch({ name: event.target.value, nameEdited: true })}
                    />
                  </span>
                </label>
              </div>
              <div className="card">
                <div className="section-title" style={{ paddingTop: 16 }}>Модель оплаты</div>
                <div role="radiogroup" aria-label="Модель оплаты">
                  <div
                    className="choice selectable"
                    role="radio"
                    aria-checked={state.model === "cpc"}
                    tabIndex={0}
                    onClick={() => patch({ model: "cpc" })}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        patch({ model: "cpc" });
                      }
                    }}
                  >
                    <span className="choice-copy">
                      <span className="choice-title">За клики (CPC)</span>
                      <span className="choice-text">Вы платите за 1 клик по товару</span>
                      <span className="tag">
                        Ставка выше — цена ниже
                        <span onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                          <HelpButton label="Что значит ставка выше — цена ниже" onClick={() => openHelp("cpc")} />
                        </span>
                      </span>
                    </span>
                    <Radio checked={state.model === "cpc"} />
                  </div>
                  <div
                    className="choice selectable"
                    role="radio"
                    aria-checked={state.model === "cpm"}
                    tabIndex={0}
                    onClick={() => patch({ model: "cpm" })}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        patch({ model: "cpm" });
                      }
                    }}
                  >
                    <span className="choice-copy">
                      <span className="choice-title">За показы (CPM)</span>
                      <span className="choice-text">Вы платите за 1 000 показов</span>
                    </span>
                    <Radio checked={state.model === "cpm"} />
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="section-title" style={{ paddingTop: 16 }}>Зоны показов</div>
                {state.model === "cpc" ? (
                  <>
                    <div className="choice">
                      <span className="choice-copy">
                        <span className="choice-title">Поиск</span>
                        <span className="choice-text">Продвижение по запросам покупателя — они влияют на выдачу в поиске и в каталоге</span>
                      </span>
                      <Toggle checked={state.zoneSearch} label="Поиск" onChange={(zoneSearch) => patch({ zoneSearch })} />
                    </div>
                    <div className="choice">
                      <span className="choice-copy">
                        <span className="choice-title">Рекомендации</span>
                        <span className="choice-text">Продвижение в подборках товаров, похожих на недавние запросы или открытые карточки</span>
                      </span>
                      <Toggle checked={state.zoneReco} label="Рекомендации" onChange={(zoneReco) => patch({ zoneReco })} />
                    </div>
                  </>
                ) : (
                  <div role="radiogroup" aria-label="Ставка для зон показов">
                    <div
                      className="choice selectable"
                      role="radio"
                      aria-checked={state.cpmBidMode === "unified"}
                      tabIndex={0}
                      onClick={() => patch({ cpmBidMode: "unified" })}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          patch({ cpmBidMode: "unified" });
                        }
                      }}
                    >
                      <span className="choice-copy">
                        <span className="choice-title">Единая ставка</span>
                        <span className="choice-text">Продвижение сразу в поиске и рекомендациях, мин. ставка от 155 ₽ в зависимости от категории</span>
                      </span>
                      <Radio checked={state.cpmBidMode === "unified"} />
                    </div>
                    <div
                      className="choice selectable flat"
                      role="radio"
                      aria-checked={state.cpmBidMode === "manual"}
                      tabIndex={0}
                      onClick={() => patch({ cpmBidMode: "manual" })}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          patch({ cpmBidMode: "manual" });
                        }
                      }}
                    >
                      <span className="choice-copy">
                        <span className="choice-title">Ручная ставка</span>
                        <span className="choice-text">Выбирайте зоны показов и ставку для них, мин. ставка от 190 ₽ в зависимости от категории</span>
                      </span>
                      <Radio checked={state.cpmBidMode === "manual"} />
                    </div>
                    {state.cpmBidMode === "manual" && (
                      <div className="zone-list">
                        <div className="zone-card">
                          <span className="choice-copy">
                            <span className="choice-title">Поиск</span>
                            <span className="choice-text">Когда запустите кампанию, сможете управлять поисковыми фразами, по которым продвигается товар</span>
                          </span>
                          <Toggle checked={state.zoneSearch} label="Поиск" onChange={(zoneSearch) => patch({ zoneSearch })} />
                        </div>
                        <div className="zone-card">
                          <span className="choice-copy">
                            <span className="choice-title">Рекомендации</span>
                            <span className="choice-text">Действует дисконтирование — ставка на продвижение будет ниже, чем укажете в настройках</span>
                          </span>
                          <Toggle checked={state.zoneReco} label="Рекомендации" onChange={(zoneReco) => patch({ zoneReco })} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {!zonesReady && <p className="hint error" style={{ padding: "0 12px 12px" }}>Включите хотя бы одну зону показов</p>}
              </div>
            </>
          )}

          {state.screen === "bids" && selected && (
            <>
              <Stepper
                current={2}
                onJump={(next) => {
                  if (next === 1) patch({ screen: "settings" });
                }}
              />
              <div className="card pad stack">
                <div className="product" style={{ padding: 0, border: 0 }}>
                  <img className="photo" src={selected.image} alt="" />
                  <span className="product-copy">
                    <span className="product-name">{selected.name}</span>
                    <span className="meta"><b>Артикул</b><span>{selected.sku}</span></span>
                    <span className="meta"><b>Бренд</b><span>{selected.brand}</span></span>
                  </span>
                </div>
                {state.model === "cpc" && state.zoneSearch && (
                  <BidField
                    label="Ставка в поиске (CPC)"
                    value={state.searchBid}
                    onChange={(searchBid) => patch({ searchBid })}
                    onHelp={() => openHelp("searchBid")}
                    onChart={() => {
                      setRateTarget("search");
                      setSheet("rates");
                    }}
                    position={searchPosition(state.searchBid)}
                  />
                )}
                {state.model === "cpc" && state.zoneReco && (
                  <BidField
                    label="Ставка в рекомендациях (CPC)"
                    value={state.recoBid}
                    onChange={(recoBid) => patch({ recoBid })}
                    onHelp={() => openHelp("recoBid")}
                  />
                )}
                {state.model === "cpm" && state.cpmBidMode === "unified" && (
                  <BidField
                    label="Единая ставка (CPM)"
                    value={state.cpmBid}
                    onChange={(cpmBid) => patch({ cpmBid })}
                    onHelp={() => openHelp("cpm")}
                    onFocus={(cpmFocused) => patch({ cpmFocused })}
                    onChart={() => {
                      setRateTarget("cpm");
                      setSheet("rates");
                    }}
                    note="Конкурентная ставка"
                    chips={
                      state.cpmFocused
                        ? [
                            { label: "Лидерская 440 ₽", value: 440 },
                            { label: "Топ-ставка 880 ₽", value: 880 },
                          ]
                        : undefined
                    }
                    onChip={(cpmBid) => patch({ cpmBid })}
                  />
                )}
                {state.model === "cpm" && state.cpmBidMode === "manual" && state.zoneSearch && (
                  <BidField
                    label="Ставка в поиске (CPM)"
                    value={state.cpmSearchBid}
                    onChange={(cpmSearchBid) => patch({ cpmSearchBid })}
                    onHelp={() => openHelp("cpm")}
                    onChart={() => {
                      setRateTarget("cpmSearch");
                      setSheet("rates");
                    }}
                    note="Минимум 190 ₽"
                  />
                )}
                {state.model === "cpm" && state.cpmBidMode === "manual" && state.zoneReco && (
                  <BidField
                    label="Ставка в рекомендациях (CPM)"
                    value={state.cpmRecoBid}
                    onChange={(cpmRecoBid) => patch({ cpmRecoBid })}
                    onHelp={() => openHelp("cpm")}
                    note="Минимум 190 ₽, с учётом дисконтирования"
                  />
                )}
              </div>
            </>
          )}

          {state.screen === "budget" && (
            <>
              <Stepper
                current={3}
                onJump={(next) => patch({ screen: next === 1 ? "settings" : "bids" })}
              />
              <div className="card pad">
                <MoneyField
                  label="Бюджет"
                  value={state.budget}
                  onChange={(budget) => patch({ budget, budgetEdited: true })}
                  hint="Минимум 1 000 ₽"
                  error={state.budgetEdited && !budgetValid}
                />
              </div>
              <div className="card">
                <div className="setting-row">
                  <span className="setting-copy">
                    <span className="setting-title">Автопополнение</span>
                    {state.topupOn && (
                      <span className="sub">Если меньше {formatMoney(state.topupMin)} — пополним на {formatMoney(state.topupAmount)}</span>
                    )}
                  </span>
                  <button type="button" className="ghost" onClick={() => setSheet("topup")}>
                    {state.topupOn ? "Изменить" : "Настроить"}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="setting-row">
                  <span className="setting-title">
                    Дневной лимит
                    <HelpButton label="Что такое дневной лимит" onClick={() => openHelp("limit")} />
                  </span>
                  <Toggle checked={state.limitOn} label="Дневной лимит" onChange={(limitOn) => patch({ limitOn })} />
                </div>
                {state.limitOn && (
                  <div className="pad" style={{ paddingTop: 0 }}>
                    <MoneyField label="Лимит в день" value={state.limit} onChange={(limit) => patch({ limit })} />
                  </div>
                )}
              </div>
              <div className="card" style={{ flex: 1 }}>
                <div className="section-title" style={{ paddingTop: 16 }}>
                  Доступно
                  <HelpButton label="Откуда списывается бюджет" onClick={() => openHelp("balance")} />
                </div>
                <div className="source">
                  <span className="setting-copy">
                    <span className="setting-title">Единый счёт: 10 000 ₽</span>
                    <span className="sub">Спишем {formatMoney(accountCharge)}</span>
                  </span>
                  <Icon name="wallet" alt="" />
                </div>
                <div className="hairline" />
                <div className="source">
                  <span className="setting-title">Промобонусы: {formatBonus(promoPackage.amount)}</span>
                  <Toggle
                    checked={state.promo}
                    label="Списывать промобонусы"
                    onChange={(promo) =>
                      patch({
                        promo,
                        promoAmount: promoCap(promoPackage.amount, promoPackage.percent, state.budget),
                        promoEdited: false,
                      })
                    }
                  />
                </div>
                {state.promo && (
                  <>
                    <div className="promo-packages" role="radiogroup" aria-label="Пакет промобонусов">
                      {promoPackages.map((item) => {
                        const selectedPackage = item.id === promoPackage.id;
                        return (
                          <div
                            key={item.id}
                            className={`promo-package${selectedPackage ? " selected" : ""}`}
                            role="radio"
                            aria-checked={selectedPackage}
                            tabIndex={0}
                            onClick={() =>
                              patch({
                                promoPackageId: item.id,
                                promoAmount: promoCap(item.amount, item.percent, state.budget),
                                promoEdited: false,
                              })
                            }
                            onKeyDown={(event) => {
                              if (event.key !== "Enter" && event.key !== " ") return;
                              event.preventDefault();
                              patch({
                                promoPackageId: item.id,
                                promoAmount: promoCap(item.amount, item.percent, state.budget),
                                promoEdited: false,
                              });
                            }}
                          >
                            <b>{formatBonus(item.amount)}</b>
                            <span className="tag">
                              до {item.percent}%
                              <span onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                                <HelpButton label={`Подсказка: пакет до ${item.percent}%`} onClick={() => openHelp("promo")} />
                              </span>
                            </span>
                            <span className="sub">{daysLeftLabel(item.days)}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="pad promo-amount">
                      <BonusField
                        value={state.promoAmount}
                        max={promoMax}
                        onChange={(promoAmount) => patch({ promoAmount, promoEdited: true })}
                      />
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {state.screen === "done" && selected && (
            <section className="empty">
              <span className="badge"><Icon name="check" alt="" /></span>
              <div className="empty-copy">
                <h2>Кампания запущена</h2>
                <p>{state.name}</p>
              </div>
              <div className="success-list">
                <div><span>Товар</span><b>{selected.name}</b></div>
                <div><span>Оплата</span><b>{state.model === "cpc" ? "За клики (CPC)" : "За показы (CPM)"}</b></div>
                <div><span>Бюджет</span><b>{formatMoney(state.budget)}</b></div>
              </div>
            </section>
          )}
        </div>

        {!sheet && state.screen === "fork" && <div className="dock" style={{ padding: 0 }}><HomeIndicator /></div>}
        {!sheet && (state.screen === "search" || state.screen === "category") && (
          <PrimaryButton disabled={!selectedVisible} onClick={goSettings}>Продолжить</PrimaryButton>
        )}
        {!sheet && state.screen === "settings" && (
          <PrimaryButton disabled={!canLeaveSettings} onClick={() => patch({ screen: "bids" })}>Продолжить</PrimaryButton>
        )}
        {!sheet && state.screen === "bids" && (
          <PrimaryButton onClick={() => patch({ screen: "budget" })}>Продолжить</PrimaryButton>
        )}
        {!sheet && state.screen === "budget" && (
          <PrimaryButton disabled={!budgetValid || !promoReady} onClick={launch}>Запустить кампанию</PrimaryButton>
        )}
        {!sheet && state.screen === "done" && <PrimaryButton onClick={reset}>Создать ещё</PrimaryButton>}
        </>
        )}

        {sheet === "categories" && (
          <Sheet title="Категория товара" tall onClose={() => setSheet(null)}>
            <div className="pad">
              <SearchField value={state.categoryQuery} onChange={(categoryQuery) => patch({ categoryQuery })} placeholder="Поиск" />
            </div>
            {visibleCategories.length === 0 ? (
              <p className="sheet-text">Ничего не нашли</p>
            ) : (
              visibleCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className="category-row"
                  onClick={() => {
                    const first = products.find((product) => product.category === category);
                    patch({
                      category,
                      query: "",
                      selectedId: first?.id ?? state.selectedId,
                      ...(state.nameEdited || !first ? {} : { name: defaultCampaignName(first) }),
                    });
                    setSheet(null);
                  }}
                >
                  <span>{category}</span>
                  <Radio checked={category === state.category} />
                </button>
              ))
            )}
          </Sheet>
        )}

        {sheet === "rates" && (
          <Sheet title="Ставки конкурентов" onClose={() => setSheet(null)}>
            {ratePresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="preset"
                onClick={() => {
                  patch(
                    rateTarget === "search"
                      ? { searchBid: preset.value }
                      : rateTarget === "cpmSearch"
                        ? { cpmSearchBid: preset.value }
                        : { cpmBid: preset.value },
                  );
                  setSheet(null);
                }}
              >
                <span className="setting-copy">
                  <b>{preset.label}</b>
                  <span className="sub">{preset.hint}</span>
                </span>
                <b>{formatMoney(preset.value)}</b>
              </button>
            ))}
          </Sheet>
        )}

        {sheet === "topup" && (
          <Sheet title="Автопополнение" onClose={() => setSheet(null)}>
            <div className="sheet-form">
              <MoneyField label="Если баланс ниже" value={state.topupMin} onChange={(topupMin) => patch({ topupMin })} />
              <MoneyField label="Пополнить на" value={state.topupAmount} onChange={(topupAmount) => patch({ topupAmount })} />
              <button
                type="button"
                className="primary"
                onClick={() => {
                  patch({ topupOn: true });
                  setSheet(null);
                }}
              >
                Сохранить
              </button>
            </div>
          </Sheet>
        )}

        {sheet === "help" && (
          <Sheet title={helpCopy[help].title} onClose={() => setSheet(null)}>
            <p className="sheet-text">{helpCopy[help].body}</p>
          </Sheet>
        )}
      </div>
    </div>
  );
}

function BonusField({ value, max, onChange }: { value: number; max: number; onChange: (value: number) => void }) {
  const [focused, setFocused] = useState(false);
  const over = value > max;
  const shown = focused ? (value ? String(value) : "") : formatBonus(value);
  return (
    <label className="field">
      <span className="field-label">Сколько промобонусы из пакета использовать</span>
      <span className={`field-box${over ? " error" : ""}`}>
        <input
          inputMode="numeric"
          aria-label="Сколько промобонусы из пакета использовать"
          value={shown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(event) => onChange(Number(event.target.value.replace(/\D/g, "")) || 0)}
        />
      </span>
      <span className={`hint${over ? " error" : ""}`}>До {formatBonus(max)} (1 B = 1 ₽)</span>
    </label>
  );
}

function MoneyField({
  label,
  value,
  onChange,
  hint,
  error,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
  error?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const shown = focused ? (value ? String(value) : "") : formatMoney(value);
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className={`field-box${error ? " error" : ""}`}>
        <input
          inputMode="numeric"
          aria-label={label}
          value={shown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(event) => onChange(Number(event.target.value.replace(/\D/g, "")) || 0)}
        />
      </span>
      {hint && <span className={`hint${error ? " error" : ""}`}>{hint}</span>}
    </label>
  );
}

function BidField({
  label,
  value,
  onChange,
  onHelp,
  onChart,
  onFocus,
  position,
  note,
  chips,
  onChip,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onHelp: () => void;
  onChart?: () => void;
  onFocus?: (focused: boolean) => void;
  position?: { text: string; level: number };
  note?: string;
  chips?: { label: string; value: number }[];
  onChip?: (value: number) => void;
}) {
  const [focused, setFocused] = useState(false);
  const shown = focused ? (value ? String(value) : "") : formatMoney(value);
  return (
    <div className="field">
      <span className="field-label">
        {label}
        <HelpButton label={`Подсказка: ${label}`} onClick={onHelp} />
      </span>
      <div className="field-line">
        <span className="field-box">
          <input
            inputMode="numeric"
            aria-label={label}
            value={shown}
            onFocus={() => {
              setFocused(true);
              onFocus?.(true);
            }}
            onBlur={() => {
              setFocused(false);
              onFocus?.(false);
            }}
            onChange={(event) => onChange(Number(event.target.value.replace(/\D/g, "")) || 0)}
          />
        </span>
        {onChart && (
          <button type="button" className="icon-action" aria-label="Ставки конкурентов" onClick={onChart}>
            <Icon name="graph" alt="" />
          </button>
        )}
      </div>
      {position && (
        <div className="hint-row">
          <span className="bars" aria-hidden>
            {[9, 12, 14].map((height, index) => (
              <i
                key={height}
                style={{
                  height,
                  background: index < position.level ? "#84cc16" : "#bbb7c9",
                  opacity: index < position.level ? 1 : 0.4,
                }}
              />
            ))}
          </span>
          <span className="hint" style={{ padding: 0 }}>{position.text}</span>
        </div>
      )}
      {note && !position && (
        <div className="hint-row">
          <span className="bars" aria-hidden>
            <i style={{ height: 9, background: "#84cc16" }} />
            <i style={{ height: 12, background: "#bbb7c9", opacity: 0.4 }} />
            <i style={{ height: 14, background: "#bbb7c9", opacity: 0.4 }} />
          </span>
          <span className="hint" style={{ padding: 0 }}>{note}</span>
        </div>
      )}
      {chips && (
        <div className="chips">
          {chips.map((chip) => (
            <button key={chip.value} type="button" className="chip" onMouseDown={(event) => event.preventDefault()} onClick={() => onChip?.(chip.value)}>
              {chip.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (value === PASSWORD) onUnlock();
    else setError(true);
  }

  return (
    <>
      <StatusBar />
      <NavBar title="Вход" />
      <form id="lock-form" className="scroll" onSubmit={submit}>
        <section className="empty">
          <Icon name="tag" alt="" />
          <div className="empty-copy">
            <h2>Вход в продвижение</h2>
            <p>Введите пароль, чтобы создать кампанию</p>
          </div>
          <label className="field" style={{ width: "100%", textAlign: "left" }}>
            <span className="field-label">Пароль</span>
            <span className={`field-box${error ? " error" : ""}`}>
              <input
                type={visible ? "text" : "password"}
                value={value}
                autoComplete="current-password"
                aria-label="Пароль"
                aria-invalid={error}
                onChange={(event) => {
                  setValue(event.target.value);
                  setError(false);
                }}
              />
              <button type="button" className="text-btn" onClick={() => setVisible((current) => !current)}>
                {visible ? "Скрыть" : "Показать"}
              </button>
            </span>
            {error && <span className="hint error">Неверный пароль</span>}
          </label>
        </section>
      </form>
      <div className="dock">
        <button type="submit" form="lock-form" className="primary" disabled={value.trim().length === 0}>
          Войти
        </button>
        <HomeIndicator />
      </div>
    </>
  );
}
