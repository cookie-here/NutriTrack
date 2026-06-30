import { useNavigate } from 'react-router-dom'

export default function PregnancyGuidePreview() {
  const navigate = useNavigate()

  return (
    <section className="pregnancy-guide-preview">
      <div className="pregnancy-guide-preview-header">
        <div>
          <span className="pregnancy-guide-preview-kicker">Pregnancy guidance</span>
          <h2>When to seek help</h2>
        </div>
        <span className="pregnancy-guide-preview-icon" aria-hidden="true">🩺</span>
      </div>

      <p className="pregnancy-guide-preview-copy">
        Quick guide to common symptoms, danger signs, and when to go to hospital.
      </p>

      <button type="button" className="pregnancy-guide-preview-button" onClick={() => navigate('/pregnant/health-guide')}>
        Open the guide
      </button>
    </section>
  )
}