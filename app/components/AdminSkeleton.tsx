type AdminSkeletonProps = {
  scope?: "page" | "overview" | "table" | "gate";
};

const metricSkeletons = ["metric-one", "metric-two", "metric-three", "metric-four"];
const tableSkeletons = ["row-one", "row-two", "row-three", "row-four", "row-five"];

function OverviewSkeleton() {
  return (
    <div className="admin-skeleton__overview" aria-hidden="true">
      <div className="admin-metrics-grid">
        {metricSkeletons.map((id) => (
          <div key={id} className="admin-skeleton admin-skeleton--metric">
            <span />
            <strong />
            <i />
          </div>
        ))}
      </div>
      <div className="admin-charts-grid">
        <div className="admin-skeleton admin-skeleton--chart">
          <span />
          <i />
        </div>
        <div className="admin-skeleton admin-skeleton--chart">
          <span />
          <i />
        </div>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="admin-skeleton admin-skeleton--table" aria-hidden="true">
      <div className="admin-skeleton__table-tabs">
        <span />
        <span />
        <span />
      </div>
      <div className="admin-skeleton__table-head" />
      {tableSkeletons.map((id) => (
        <div key={id} className="admin-skeleton__table-row">
          <span />
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}

export function AdminSkeleton({
  scope = "page",
}: AdminSkeletonProps) {
  if (scope === "gate") {
    return (
      <section
        className="profile-section profile-empty-section admin-access-skeleton"
        aria-labelledby="admin-access-loading-title"
        aria-busy="true"
      >
        <div
          className="profile-empty-card admin-access-skeleton__card"
          role="status"
          aria-live="polite"
        >
          <span id="admin-access-loading-title" className="sr-only">
            Administrator icazəsi yoxlanılır.
          </span>
          <span
            className="admin-skeleton admin-skeleton--account"
            aria-hidden="true"
          />
          <span
            className="admin-skeleton admin-skeleton--eyebrow"
            aria-hidden="true"
          />
          <span
            className="admin-skeleton admin-skeleton--title"
            aria-hidden="true"
          />
        </div>
      </section>
    );
  }

  if (scope === "overview") {
    return (
      <div className="admin-skeleton-region" role="status" aria-live="polite">
        <span className="sr-only">Analitik məlumatlar hazırlanır.</span>
        <OverviewSkeleton />
      </div>
    );
  }

  if (scope === "table") {
    return (
      <div className="admin-skeleton-region" role="status" aria-live="polite">
        <span className="sr-only">Cədvəl məlumatları hazırlanır.</span>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <main
      id="main-content"
      className="route-page admin-dashboard admin-dashboard--loading"
      tabIndex={-1}
      aria-busy="true"
    >
      <span className="sr-only" role="status">
        Administrator paneli hazırlanır.
      </span>
      <div
        className="admin-main admin-skeleton__main"
        style={{ gridColumn: "1 / -1" }}
      >
        <header className="admin-header admin-skeleton__header" aria-hidden="true">
          <div>
            <span className="admin-skeleton admin-skeleton--eyebrow" />
            <span className="admin-skeleton admin-skeleton--title" />
          </div>
          <span className="admin-skeleton admin-skeleton--account" />
        </header>
        <OverviewSkeleton />
        <section className="admin-data-section">
          <TableSkeleton />
        </section>
      </div>
    </main>
  );
}
