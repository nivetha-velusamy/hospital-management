export default function StatCard({label,value,hint,icon:Icon,tone="teal"}) {
  return <article className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={22}/></div><div className="stat-copy"><p>{label}</p><h3>{value ?? 0}</h3><span>{hint}</span></div></article>;
}
