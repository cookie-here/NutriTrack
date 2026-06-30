import BottomNavigation from '../components/BottomNavigation'
import PregnancyInfoSection from '../components/PregnancyInfoSection'
import '../styles/PregnancyGuide.css'

const trimesterSymptoms = [
  {
    title: 'First trimester',
    icon: '🌱',
    tone: 'calm',
    intro: 'Common symptoms in early pregnancy are usually mild and linked to hormonal changes.',
    items: [
      { marker: '1', title: 'Nausea or vomiting', description: 'Morning sickness is common in early pregnancy and often improves with small, frequent meals.' },
      { marker: '2', title: 'Fatigue', description: 'Feeling tired is very common as your body adjusts to pregnancy.' },
      { marker: '3', title: 'Breast tenderness', description: 'Sore or fuller breasts are a common early sign of pregnancy.' },
      { marker: '4', title: 'Frequent urination', description: 'Needing to pass urine more often can happen in the first trimester.' }
    ]
  },
  {
    title: 'Second trimester',
    icon: '🌿',
    tone: 'calm',
    intro: 'Many women feel better in this stage, but a few new symptoms can appear as the uterus grows.',
    items: [
      { marker: '1', title: 'Mild back or round ligament pain', description: 'Stretching and growth can cause a pulling or aching feeling in the lower belly or back.' },
      { marker: '2', title: 'Increased appetite', description: 'It is common to feel hungrier as baby grows and energy returns.' },
      { marker: '3', title: 'Mild leg cramps', description: 'Cramps can happen more often, especially at night.' },
      { marker: '4', title: 'Skin changes', description: 'Darkening of the skin or a pregnancy line on the belly can appear during this stage.' }
    ]
  },
  {
    title: 'Third trimester',
    icon: '🌾',
    tone: 'calm',
    intro: 'Late pregnancy often brings pressure symptoms as baby gets bigger and space becomes tighter.',
    items: [
      { marker: '1', title: 'Heartburn or indigestion', description: 'Pressure from the growing uterus can make reflux and indigestion more common.' },
      { marker: '2', title: 'Swelling of feet or ankles', description: 'Mild swelling is common, especially after standing for a long time.' },
      { marker: '3', title: 'Trouble sleeping', description: 'Comfort can be harder to find in late pregnancy, which may affect sleep.' },
      { marker: '4', title: 'Braxton Hicks contractions', description: 'Irregular practice contractions can happen and often settle with rest and hydration.' }
    ]
  }
]

const dangerSigns = [
  {
    marker: '!',
    title: 'Vaginal bleeding or fluid leaking',
    description: 'Bleeding, spotting that becomes heavy, or fluid leaking from the vagina needs prompt attention.'
  },
  {
    marker: '!',
    title: 'Severe abdominal pain or strong cramping',
    description: 'Pain that is intense, worsening, or one-sided should not be ignored.'
  },
  {
    marker: '!',
    title: 'Bad headache, blurred vision, or swelling of face and hands',
    description: 'These can be warning signs of high blood pressure in pregnancy and need same-day review.'
  },
  {
    marker: '!',
    title: 'Fever, burning when passing urine, or trouble breathing',
    description: 'These symptoms may point to infection or another urgent problem.'
  },
  {
    marker: '!',
    title: 'Baby moving less than usual',
    description: 'A noticeable decrease in fetal movements, especially after 28 weeks, should be reported quickly.'
  }
]

const hospitalSymptoms = [
  {
    marker: '⚠',
    title: 'Heavy bleeding, severe pain, or fainting',
    description: 'Go to the hospital immediately if bleeding is heavy, pain is severe, or you feel faint or collapse.'
  },
  {
    marker: '⚠',
    title: 'Leakage of fluid with contractions or before 37 weeks',
    description: 'This can mean your water has broken or labor has started early.'
  },
  {
    marker: '⚠',
    title: 'No baby movements for a long period',
    description: 'If movements stop or become much less than normal, especially in the third trimester, seek urgent care.'
  },
  {
    marker: '⚠',
    title: 'Chest pain, seizures, or severe shortness of breath',
    description: 'These are emergency symptoms. Call local emergency services or go to the nearest hospital now.'
  }
]

export default function PregnantHealthGuide() {
  return (
    <div className="pregnancy-guide-container">
      <header className="pregnancy-guide-header">
        <span className="pregnancy-guide-eyebrow">Pregnancy health guide</span>
        <h1>Symptoms to watch during pregnancy</h1>
        <p>
          Symptoms change by trimester. These are the common ones that are usually expected, plus the danger signs that need attention.
        </p>
      </header>

      <main className="pregnancy-guide-content">
        <div className="pregnancy-guide-callout">
          <strong>Quick rule:</strong> If a symptom is sudden, severe, or feels different from normal pregnancy changes, contact your healthcare provider.
        </div>

        {trimesterSymptoms.map((trimester) => (
          <PregnancyInfoSection
            key={trimester.title}
            title={trimester.title}
            icon={trimester.icon}
            tone={trimester.tone}
            intro={trimester.intro}
            items={trimester.items}
          />
        ))}

        <PregnancyInfoSection
          title="Danger signs that need same-day medical advice"
          icon="⚠️"
          tone="warning"
          intro="Call your doctor, midwife, or maternity clinic the same day if you notice any of these symptoms."
          items={dangerSigns}
        />

        <PregnancyInfoSection
          title="Symptoms that mean hospital or emergency care"
          icon="🏥"
          tone="urgent"
          intro="Go to the hospital right away if you have any of the following symptoms."
          items={hospitalSymptoms}
        />

        <section className="pregnancy-guide-footer-note">
          <h2>When to act immediately</h2>
          <p>
            Do not wait if you have heavy bleeding, severe pain, trouble breathing, seizures, or a big reduction in baby movements. If you are unsure, it is safer to get checked.
          </p>
        </section>
      </main>

      <BottomNavigation activeTab="Home" userType="pregnant" />
    </div>
  )
}