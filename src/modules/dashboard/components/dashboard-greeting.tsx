export function DashboardGreeting({ name }: { name: string }) {
  return (
    <div className="dashboard-greeting">
      <h1 className="dashboard-greeting-title">
        Halo, <span className="dashboard-greeting-name">{name}</span>
      </h1>
    </div>
  );
}