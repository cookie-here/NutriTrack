export default function PregnancyInfoSection({ title, icon, tone = 'neutral', intro, items = [] }) {
  return (
    <section className={`pregnancy-info-section ${tone}`}>
      <div className="pregnancy-info-header">
        <span className="pregnancy-info-icon" aria-hidden="true">{icon}</span>
        <div>
          <h2>{title}</h2>
          {intro && <p>{intro}</p>}
        </div>
      </div>

      <ul className="pregnancy-info-list">
        {items.map((item) => (
          <li key={item.title} className="pregnancy-info-item">
            <span className="pregnancy-info-item-marker" aria-hidden="true">{item.marker}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}