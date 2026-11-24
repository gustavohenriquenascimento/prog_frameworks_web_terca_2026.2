import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  authApi,
  clearAccessToken,
  getAccessToken,
  rentalApi,
  saveAccessToken,
  vehicleApi
} from "./api.js";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const formatCurrency = (value) => currency.format(Number(value));

const formatDate = (value) => new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short"
}).format(new Date(value));

const localDateTimeValue = (date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const toIsoDate = (value) => new Date(value).toISOString();

const errorMessage = (error) => {
  if (error instanceof ApiError && Array.isArray(error.details) && error.details.length) {
    return `${error.message} ${error.details.map((item) => item.message).join(" ")}`;
  }
  return error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
};

function Notice({ notice, onDismiss }) {
  if (!notice) return null;

  return (
    <div className={`notice notice--${notice.type}`} role="status">
      <span>{notice.message}</span>
      <button className="notice__close" type="button" aria-label="Fechar mensagem" onClick={onDismiss}>
        ×
      </button>
    </div>
  );
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ nome: "", email: "", senha: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isRegistration = mode === "register";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isRegistration) {
        await authApi.register(form);
      }
      const session = await authApi.login({ email: form.email, senha: form.senha });
      saveAccessToken(session.accessToken);
      onAuthenticated(session.user);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode(isRegistration ? "login" : "register");
    setForm({ nome: "", email: form.email, senha: "" });
    setError("");
  };

  return (
    <main className="auth-layout">
      <section className="auth-story">
        <div className="brand brand--light">
          <span className="brand__mark">V</span>
          <span>via livre</span>
        </div>
        <div className="auth-story__copy">
          <span className="eyebrow eyebrow--light">O caminho é seu</span>
          <h1>Seu próximo destino começa aqui.</h1>
          <p>Encontre o veículo certo, organize sua viagem e acompanhe tudo em um só lugar.</p>
        </div>
        <div className="road-art" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="auth-story__foot">Liberdade para ir mais longe.</p>
      </section>

      <section className="auth-panel">
        <div className="auth-panel__inner">
          <div className="brand brand--dark">
            <span className="brand__mark">V</span>
            <span>via livre</span>
          </div>
          <span className="eyebrow">{isRegistration ? "Comece sua jornada" : "Que bom ter você de volta"}</span>
          <h2>{isRegistration ? "Crie sua conta" : "Acesse sua conta"}</h2>
          <p className="muted">
            {isRegistration
              ? "Cadastre-se para consultar a frota e gerenciar suas locações."
              : "Entre para continuar sua próxima viagem."}
          </p>

          {error && <div className="form-error" role="alert">{error}</div>}

          <form className="form-stack" onSubmit={handleSubmit}>
            {isRegistration && (
              <label className="field">
                <span>Nome completo</span>
                <input
                  autoComplete="name"
                  maxLength="191"
                  minLength="1"
                  onChange={(event) => setForm({ ...form, nome: event.target.value })}
                  placeholder="Como podemos chamar você?"
                  required
                  value={form.nome}
                />
              </label>
            )}
            <label className="field">
              <span>E-mail</span>
              <input
                autoComplete="email"
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="voce@email.com"
                required
                type="email"
                value={form.email}
              />
            </label>
            <label className="field">
              <span>Senha</span>
              <input
                autoComplete={isRegistration ? "new-password" : "current-password"}
                minLength={isRegistration ? "8" : undefined}
                onChange={(event) => setForm({ ...form, senha: event.target.value })}
                placeholder={isRegistration ? "Pelo menos 8 caracteres" : "Sua senha"}
                required
                type="password"
                value={form.senha}
              />
            </label>
            <button className="button button--primary button--wide" disabled={submitting} type="submit">
              {submitting ? "Aguarde..." : isRegistration ? "Criar conta" : "Entrar"}
              {!submitting && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="auth-switch">
            {isRegistration ? "Já tem uma conta?" : "Ainda não tem uma conta?"}
            <button type="button" onClick={switchMode}>
              {isRegistration ? "Entrar" : "Criar conta"}
            </button>
          </p>
          <p className="auth-privacy">Seus dados são protegidos e usados somente para gerenciar suas locações.</p>
        </div>
      </section>
    </main>
  );
}

function PageHeader({ activePage, onChangePage, user, onLogout }) {
  const navItems = [
    { id: "vehicles", label: "Veículos" },
    { id: "rentals", label: "Minhas locações" }
  ];

  return (
    <header className="topbar">
      <a className="brand brand--dark" href="#inicio" onClick={() => onChangePage("vehicles")}>
        <span className="brand__mark">V</span>
        <span>via livre</span>
      </a>
      <nav className="main-nav" aria-label="Navegação principal">
        {navItems.map((item) => (
          <button
            aria-current={activePage === item.id ? "page" : undefined}
            className={activePage === item.id ? "main-nav__item is-active" : "main-nav__item"}
            key={item.id}
            onClick={() => onChangePage(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="account">
        <div className="account__avatar">{user.nome.trim().charAt(0).toUpperCase()}</div>
        <div className="account__details">
          <strong>{user.nome}</strong>
          <span>Minha conta</span>
        </div>
        <button className="button button--quiet" onClick={onLogout} type="button">
          Sair
        </button>
      </div>
    </header>
  );
}

function VehicleCard({ vehicle, onChoose, chosen }) {
  return (
    <article className={chosen ? "vehicle-card vehicle-card--chosen" : "vehicle-card"}>
      <div className="vehicle-card__visual">
        <span className="vehicle-card__class">{vehicle.marca}</span>
        <svg aria-hidden="true" className="vehicle-illustration" viewBox="0 0 220 100">
          <path d="M37 62 49 40c3-6 8-9 15-10l42-4c7 0 12 3 17 9l18 22 17 5c6 2 9 6 9 12v8h-12a17 17 0 0 0-33 0H82a17 17 0 0 0-33 0H37V68c0-3 0-5 0-6Z" fill="currentColor" />
          <path d="m67 39 40-4c5 0 8 2 11 6l12 16H57l10-18Z" fill="#eaf0e8" />
          <circle cx="65" cy="82" r="11" fill="#18372e" />
          <circle cx="65" cy="82" r="5" fill="#d9e3da" />
          <circle cx="148" cy="82" r="11" fill="#18372e" />
          <circle cx="148" cy="82" r="5" fill="#d9e3da" />
        </svg>
        <span className={vehicle.disponivel ? "availability availability--available" : "availability availability--busy"}>
          <span />
          {vehicle.disponivel ? "Disponível" : "Alugado"}
        </span>
      </div>
      <div className="vehicle-card__body">
        <div className="vehicle-card__heading">
          <div>
            <h3>{vehicle.modelo}</h3>
            <p>{vehicle.ano} <span>·</span> {vehicle.placa}</p>
          </div>
          <span className="vehicle-card__price">{formatCurrency(vehicle.valorDiaria)}<small> / dia</small></span>
        </div>
        <button
          className={chosen ? "button button--selected button--wide" : "button button--outline button--wide"}
          disabled={!vehicle.disponivel}
          onClick={() => onChoose(vehicle)}
          type="button"
        >
          {chosen ? "Selecionado para locação" : vehicle.disponivel ? "Escolher veículo" : "Indisponível"}
          {vehicle.disponivel && !chosen && <span aria-hidden="true">→</span>}
        </button>
      </div>
    </article>
  );
}

function VehiclePage({ vehicles, filter, onFilterChange, selectedVehicle, onChoose, onCreateVehicle, onCreateRental, loading }) {
  const [form, setForm] = useState({ marca: "", modelo: "", placa: "", ano: "", valorDiaria: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submitVehicle = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onCreateVehicle({
        ...form,
        ano: Number(form.ano),
        valorDiaria: Number(form.valorDiaria)
      });
      setForm({ marca: "", modelo: "", placa: "", ano: "", valorDiaria: "" });
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-grid">
      <section className="content-column">
        <div className="page-intro">
          <div>
            <span className="eyebrow">Escolha seu próximo caminho</span>
            <h1>Encontre seu veículo</h1>
            <p>Uma frota pronta para acompanhar seus planos.</p>
          </div>
          <div className="intro-stats">
            <span className="intro-stats__icon">↗</span>
            <span><strong>{vehicles.length}</strong> veículos exibidos</span>
          </div>
        </div>

        <div className="section-heading">
          <div>
            <h2>Nossa frota</h2>
            <p>Encontre o veículo ideal para sua viagem.</p>
          </div>
          <label className="filter-field">
            <span>Exibir</span>
            <select onChange={(event) => onFilterChange(event.target.value)} value={filter}>
              <option value="all">Todos os veículos</option>
              <option value="available">Disponíveis</option>
              <option value="unavailable">Indisponíveis</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="empty-state"><span className="loader" />Carregando veículos...</div>
        ) : vehicles.length ? (
          <div className="vehicle-grid">
            {vehicles.map((vehicle) => (
              <VehicleCard
                chosen={selectedVehicle?.id === vehicle.id}
                key={vehicle.id}
                onChoose={onChoose}
                vehicle={vehicle}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state__icon">⌕</span>
            <strong>Nenhum veículo encontrado</strong>
            <span>Experimente mudar o filtro para ver outras opções.</span>
          </div>
        )}
      </section>

      <aside className="side-column">
        <RentalForm
          selectedVehicle={selectedVehicle}
          onClear={() => onChoose(null)}
          onSubmit={onCreateRental}
        />
        <VehicleForm
          error={error}
          form={form}
          onChange={setForm}
          onSubmit={submitVehicle}
          saving={saving}
        />
      </aside>
    </div>
  );
}

function RentalForm({ selectedVehicle, onClear, onSubmit }) {
  const [start, setStart] = useState(() => localDateTimeValue(new Date()));
  const [end, setEnd] = useState(() => localDateTimeValue(new Date(Date.now() + 86400000)));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const duration = new Date(end).getTime() - new Date(start).getTime();
  const billableDays = Number.isFinite(duration) && duration > 0
    ? Math.ceil(duration / 86400000)
    : null;
  const dailyRate = Number(selectedVehicle?.valorDiaria);
  const estimatedTotal = billableDays && Number.isFinite(dailyRate)
    ? dailyRate * billableDays
    : null;

  const submit = async (event) => {
    event.preventDefault();
    if (!selectedVehicle) {
      setError("Escolha um veículo disponível na lista para continuar.");
      return;
    }
    if (new Date(end) <= new Date(start)) {
      setError("A devolução prevista deve ser posterior ao início.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await onSubmit({
        veiculoId: selectedVehicle.id,
        dataInicio: toIsoDate(start),
        dataPrevistaDevolucao: toIsoDate(end)
      });
      onClear();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="panel rental-panel">
      <div className="panel-title">
        <span className="panel-title__icon">✦</span>
        <div><h2>Planeje sua locação</h2><p>Defina o período da sua viagem.</p></div>
      </div>
      {selectedVehicle ? (
        <div className="selected-vehicle">
          <span className="selected-vehicle__mark">V</span>
          <span><strong>{selectedVehicle.modelo}</strong><small>{selectedVehicle.placa}</small></span>
          <button aria-label="Remover veículo selecionado" onClick={onClear} type="button">×</button>
        </div>
      ) : (
        <div className="selection-hint">Selecione um veículo disponível para começar.</div>
      )}
      <form className="form-stack form-stack--compact" onSubmit={submit}>
        <label className="field">
          <span>Retirada</span>
          <input onChange={(event) => setStart(event.target.value)} required type="datetime-local" value={start} />
        </label>
        <label className="field">
          <span>Devolução prevista</span>
          <input min={start} onChange={(event) => setEnd(event.target.value)} required type="datetime-local" value={end} />
        </label>
        {selectedVehicle && (
          <div className={`rental-estimate${estimatedTotal === null ? " rental-estimate--invalid" : ""}`} aria-live="polite">
            {estimatedTotal === null ? (
              <span>Informe um período válido para calcular o valor.</span>
            ) : (
              <>
                <div className="rental-estimate__details">
                  <span>Estimativa · {billableDays} {billableDays === 1 ? "diária" : "diárias"}</span>
                  <small>{formatCurrency(dailyRate)} por diária</small>
                </div>
                <strong>{formatCurrency(estimatedTotal)}</strong>
              </>
            )}
          </div>
        )}
        {error && <p className="inline-error" role="alert">{error}</p>}
        <button className="button button--primary button--wide" disabled={saving} type="submit">
          {saving ? "Registrando..." : "Confirmar locação"} {!saving && <span aria-hidden="true">→</span>}
        </button>
      </form>
      <p className="panel-footnote">Estimativa em tempo real; o valor final é calculado pela API.</p>
    </section>
  );
}

function VehicleForm({ error, form, onChange, onSubmit, saving }) {
  return (
    <details className="panel vehicle-form-panel">
      <summary>
        <span className="panel-title__icon panel-title__icon--muted">+</span>
        <span><strong>Cadastrar veículo</strong><small>Adicionar à frota</small></span>
        <span className="details-chevron">⌄</span>
      </summary>
      <form className="form-stack form-stack--compact vehicle-form" onSubmit={onSubmit}>
        <div className="form-row">
          <label className="field"><span>Marca</span><input maxLength="191" onChange={(event) => onChange({ ...form, marca: event.target.value })} required value={form.marca} /></label>
          <label className="field"><span>Modelo</span><input maxLength="191" onChange={(event) => onChange({ ...form, modelo: event.target.value })} required value={form.modelo} /></label>
        </div>
        <div className="form-row">
          <label className="field"><span>Placa</span><input maxLength="20" onChange={(event) => onChange({ ...form, placa: event.target.value.toUpperCase() })} required value={form.placa} /></label>
          <label className="field"><span>Ano</span><input max={new Date().getFullYear() + 1} min="1886" onChange={(event) => onChange({ ...form, ano: event.target.value })} required type="number" value={form.ano} /></label>
        </div>
        <label className="field"><span>Valor da diária (R$)</span><input min="0.01" onChange={(event) => onChange({ ...form, valorDiaria: event.target.value })} required step="0.01" type="number" value={form.valorDiaria} /></label>
        {error && <p className="inline-error" role="alert">{error}</p>}
        <button className="button button--outline button--wide" disabled={saving} type="submit">
          {saving ? "Salvando..." : "Adicionar veículo"}
        </button>
      </form>
    </details>
  );
}

function RentalsPage({ rentals, loading, onFinalize, onBrowseVehicles }) {
  const activeRentals = rentals.filter((rental) => rental.status === "ATIVA");

  return (
    <section className="rentals-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Tudo organizado para você</span>
          <h1>Minhas locações</h1>
          <p>Acompanhe locações ativas e reveja suas viagens anteriores.</p>
        </div>
        <button className="button button--outline" onClick={onBrowseVehicles} type="button">Ver veículos <span aria-hidden="true">→</span></button>
      </div>

      <div className="rental-summary">
        <div><span className="summary-icon summary-icon--green">↗</span><span><strong>{activeRentals.length}</strong><small>Locações ativas</small></span></div>
        <div><span className="summary-icon summary-icon--sand">✓</span><span><strong>{rentals.length - activeRentals.length}</strong><small>Finalizadas</small></span></div>
        <div><span className="summary-icon summary-icon--blue">⌁</span><span><strong>{rentals.length}</strong><small>Total de viagens</small></span></div>
      </div>

      <div className="section-heading section-heading--history">
        <div><h2>Seu histórico</h2><p>Todos os detalhes das suas locações.</p></div>
        <span className="history-count">{rentals.length} {rentals.length === 1 ? "locação" : "locações"}</span>
      </div>

      {loading ? (
        <div className="empty-state"><span className="loader" />Carregando suas locações...</div>
      ) : rentals.length ? (
        <div className="history-list">
          {rentals.map((rental) => (
            <RentalCard key={rental.id} onFinalize={onFinalize} rental={rental} />
          ))}
        </div>
      ) : (
        <div className="empty-state empty-state--large">
          <span className="empty-state__icon">⌁</span>
          <strong>Suas próximas histórias começam na estrada</strong>
          <span>Você ainda não tem locações. Escolha um veículo e planeje sua primeira viagem.</span>
          <button className="button button--primary" onClick={onBrowseVehicles} type="button">Explorar veículos</button>
        </div>
      )}
    </section>
  );
}

function RentalCard({ rental, onFinalize }) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const finalize = async () => {
    setError("");
    setSaving(true);
    try {
      await onFinalize(rental.id);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="history-card">
      <div className="history-card__vehicle">
        <span className="history-car-icon">V</span>
        <div><strong>{rental.veiculo?.modelo || "Veículo"}</strong><span>{rental.veiculo?.marca} · {rental.veiculo?.placa}</span></div>
      </div>
      <div className="history-card__dates">
        <div><span>Retirada</span><strong>{formatDate(rental.dataInicio)}</strong></div>
        <span className="date-arrow">→</span>
        <div><span>{rental.dataDevolucao ? "Devolvido" : "Devolução prevista"}</span><strong>{formatDate(rental.dataDevolucao || rental.dataPrevistaDevolucao)}</strong></div>
      </div>
      <div className="history-card__total"><span>Valor total</span><strong>{formatCurrency(rental.valorTotal)}</strong></div>
      <div className="history-card__action">
        <span className={rental.status === "ATIVA" ? "status-pill status-pill--active" : "status-pill status-pill--done"}>
          <span />{rental.status === "ATIVA" ? "Em andamento" : "Finalizada"}
        </span>
        {rental.status === "ATIVA" && (
          <button className="button button--quiet button--finish" disabled={saving} onClick={finalize} type="button">
            {saving ? "Finalizando..." : "Finalizar locação"}
          </button>
        )}
        {error && <span className="inline-error">{error}</span>}
      </div>
    </article>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(getAccessToken()));
  const [activePage, setActivePage] = useState("vehicles");
  const [vehicles, setVehicles] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [vehicleFilter, setVehicleFilter] = useState("available");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loadingRentals, setLoadingRentals] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!getAccessToken()) return;

    let active = true;
    authApi.me()
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        clearAccessToken();
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });
    return () => { active = false; };
  }, []);

  const loadVehicles = useCallback(async () => {
    setLoadingVehicles(true);
    try {
      const { veiculos: items } = await vehicleApi.list(vehicleFilter);
      setVehicles(items);
      setSelectedVehicle((current) => items.find((item) => item.id === current?.id && item.disponivel) || null);
    } finally {
      setLoadingVehicles(false);
    }
  }, [vehicleFilter]);

  const loadRentals = useCallback(async () => {
    setLoadingRentals(true);
    try {
      const { locacoes: items } = await rentalApi.list();
      setRentals(items);
    } finally {
      setLoadingRentals(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    Promise.all([loadVehicles(), loadRentals()])
      .catch((error) => setNotice({ type: "error", message: errorMessage(error) }));
  }, [user, loadVehicles, loadRentals]);

  const notify = (type, message) => setNotice({ type, message });

  const handleLogout = () => {
    clearAccessToken();
    setUser(null);
    setVehicles([]);
    setRentals([]);
    setSelectedVehicle(null);
    setNotice(null);
  };

  const createVehicle = async (data) => {
    await vehicleApi.create(data);
    await loadVehicles();
    notify("success", "Veículo cadastrado e incluído na frota.");
  };

  const createRental = async (data) => {
    await rentalApi.create(data);
    setSelectedVehicle(null);
    await Promise.all([loadVehicles(), loadRentals()]);
    notify("success", "Locação registrada. Boa viagem!");
    setActivePage("rentals");
  };

  const finalizeRental = async (id) => {
    await rentalApi.finalize(id);
    await Promise.all([loadVehicles(), loadRentals()]);
    notify("success", "Locação finalizada e veículo disponibilizado novamente.");
  };

  if (authLoading) {
    return <main className="loading-screen"><span className="loader" /><span>Preparando sua próxima viagem...</span></main>;
  }

  if (!user) {
    return <AuthScreen onAuthenticated={setUser} />;
  }

  return (
    <div className="app-shell">
      <PageHeader activePage={activePage} onChangePage={setActivePage} onLogout={handleLogout} user={user} />
      <main className="main-content">
        <Notice notice={notice} onDismiss={() => setNotice(null)} />
        {activePage === "vehicles" ? (
          <VehiclePage
            filter={vehicleFilter}
            loading={loadingVehicles}
            onChoose={setSelectedVehicle}
            onCreateVehicle={createVehicle}
            onCreateRental={createRental}
            onFilterChange={setVehicleFilter}
            selectedVehicle={selectedVehicle}
            vehicles={vehicles}
          />
        ) : (
          <RentalsPage
            loading={loadingRentals}
            onBrowseVehicles={() => setActivePage("vehicles")}
            onFinalize={finalizeRental}
            rentals={rentals}
          />
        )}
      </main>
      <footer className="app-footer">
        <span className="brand brand--dark"><span className="brand__mark">V</span><span>via livre</span></span>
        <span>Liberdade para ir mais longe.</span>
        <span>© {new Date().getFullYear()} Via Livre</span>
      </footer>
    </div>
  );
}

export default App;
