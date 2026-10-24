// Drafted site content that needs Tania's clinical review before it goes live.
// - JOURNAL_DRAFTS are saved unpublished; publish each one from the admin once reviewed.
// - SERVICE_DETAILS fill a service's "What treatment covers" and "Clinic note". A service
//   page is offered to search engines only once it has treatment points.
// Used by seed.ts (fresh databases) and add-content.ts (an existing database, adding only
// what is missing so nothing edited in the admin is overwritten).
//
// Post text uses the admin's Markdown subset: "### " headings, "- " and "1. " lists,
// **bold**, *italic*, and <a href="…"> links. Every factual claim links to its source.
// Set each post's date to the day it is actually published.

export interface JournalDraft {
  slug: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  readTime: string;
  content: string;
}

// Emergency guidance, the same in every post: urgent help first, then the helpline and its hours.
const CRISIS_LINE = 'If you might act on thoughts of ending your life, or someone is in immediate danger, call <a href="tel:999">999</a> now or go to the nearest hospital emergency department. To talk to someone, the Kaan Pete Roi emotional support helpline is on <a href="tel:09612119911">09612-119911</a>, from 3 pm to 3 am every day. Outside those hours, if you are not safe, call 999.';

const NOT_ADVICE = '*This article is general information. It is not a diagnosis, and it does not replace an assessment with a qualified professional.*';

export const JOURNAL_DRAFTS: JournalDraft[] = [
  {
    slug: 'online-counselling-bangladesh',
    title: 'Does Online Counselling Work in Bangladesh?',
    date: 'October 24, 2026',
    category: 'Online Counselling',
    summary: 'How counselling by Zoom or Google Meet works in Bangladesh, what research says about how well it works, and how to keep a video session private at home.',
    readTime: '4 min read',
    content: `Online counselling is talking therapy over a video call. For the most common difficulties, such as depression and anxiety, research suggests it works about as well as meeting in the same room. On screen you still work with the same trained professional, towards a plan you agree together.

### What the research says
Several systematic reviews have compared therapy by video with face-to-face therapy:
- A 2022 meta-analysis of randomised trials for depression found no significant difference in results between video and in-person therapy, and people dropped out at similar rates (<a href="https://doi.org/10.1089/tmj.2021.0294">Giovanetti and colleagues, Telemedicine and e-Health</a>).
- A 2021 review of 57 studies, covering more than 4,000 clients, found outcomes largely equivalent (<a href="https://doi.org/10.1016/j.cpr.2020.101944">Batastini and colleagues, Clinical Psychology Review</a>).
- Another 2021 review found video therapy differed negligibly from in-person therapy, with the strongest effects for cognitive behavioural therapy (CBT) and for anxiety, depression and PTSD (<a href="https://doi.org/10.1002/cpp.2594">Fernandez and colleagues, Clinical Psychology &amp; Psychotherapy</a>).

Almost all of these studies took place outside Bangladesh. One review also found that the working relationship between client and therapist can feel a little weaker on screen (<a href="https://doi.org/10.1002/cpp.2315">Norwood and colleagues, Clinical Psychology &amp; Psychotherapy, 2018</a>). If anything about the video format feels awkward in the first sessions, say so: the camera, the sound, the time or the room can all change.

### Why it matters in Bangladesh
Bangladesh's National Mental Health Survey (2018–19) found that 16.8% of adults were living with a mental health condition, and that 92.3% of them were receiving no treatment (<a href="https://www.thedailystar.net/backpage/news/adult-population-225cr-suffer-mental-disorders-1824535">The Daily Star</a>). A 2021 paper counted around 260 psychiatrists for the whole country (<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8554893/">Hasan and colleagues, BJPsych International</a>).

For someone in Sylhet, Rajshahi, Khulna or a smaller town, a video session can mean starting therapy without travelling to Dhaka. It also helps people whose work hours, health, or need for privacy make a trip to a chamber difficult.

### What happens in an online session
1. **Booking.** You choose a time and say briefly what you would like help with. You don't need to explain everything in writing.
2. **The link.** Before the session you receive a Zoom or Google Meet link. Both work on a phone or a laptop.
3. **The first conversation.** You describe what is happening, ask your questions, and decide together whether to continue and how.
4. **If the connection drops.** You agree in advance how you will reconnect, for example by a phone call, so a weak signal or a power cut doesn't end the session.
5. **Regular sessions.** You agree how often to meet and what you are working towards, and review that as you go.

### Keeping a video session private
At home, privacy is often the hardest part, especially in a shared family flat. These steps help:
- Use headphones, so only you can hear the other side.
- Pick a time when the house is quieter, and a room where you can close the door.
- Agree on a signal you can use if someone walks in, so the session can pause.
- Join from your own phone or laptop rather than a shared family device.
- If someone at home is hurting or controlling you, tell your therapist, by message if you need to, so you can plan a safer time or place.

What you share stays confidential. The limits are the same as in person: if there is a serious risk to your life or someone else's, your therapist may need to act to keep people safe. These limits are explained at the start.

### When online counselling is not the right fit
Video sessions are not an emergency service. ${CRISIS_LINE}

Some situations also need a doctor alongside therapy, for example depression so severe that eating and sleeping have broken down, or symptoms that may need medication. <a href="/blog/psychologist-or-psychiatrist-bangladesh">Psychologist or psychiatrist: who to see first</a> explains the difference.

### Getting started
Before you book anyone, online or in person, it is worth asking the <a href="/blog/how-to-choose-a-psychologist-in-dhaka">seven questions in this guide</a>. You can read <a href="/services/online-counselling">how online sessions are arranged</a> and <a href="/about">about Tania Subhashita's training</a>, or <a href="/book">book a free 20-minute consultation</a> from anywhere in Bangladesh.

${NOT_ADVICE}`,
  },
  {
    slug: 'how-to-choose-a-psychologist-in-dhaka',
    title: 'How to Choose a Psychologist in Dhaka',
    date: 'October 24, 2026',
    category: 'Finding Help',
    summary: 'Bangladesh has no legal register of psychologists, so checking is up to you. Seven questions to ask a psychologist in Dhaka before you book.',
    readTime: '4 min read',
    content: `Choosing a psychologist in Dhaka is harder than it should be. Bangladesh has no statutory register for psychologists like the one the Bangladesh Medical and Dental Council (BMDC) keeps for doctors, and researchers have called for a registration system (<a href="https://research.torrens.edu.au/en/publications/bangladesh-needs-to-put-a-stop-to-malpractice-in-mental-health-ca/">The Lancet Psychiatry, 2024</a>). Until one exists, no authority checks who uses titles such as counsellor, therapist or psychologist.

A few direct questions tell you most of what you need to know, and a qualified psychologist will answer them without fuss.

### 1. What is your training in psychology?
Look for a university degree in psychology and, for clinical work, postgraduate training. In Bangladesh, the University of Dhaka offers postgraduate degrees in <a href="https://www.du.ac.bd/postGrad/CPS">clinical psychology</a> and in <a href="https://du.ac.bd/body/History/DECP">counselling psychology</a>; the counselling psychology degree includes supervised practice and an internship. A short certificate course on its own is not the same as professional training.

### 2. Which professional bodies are you a member of?
Professional associations in Bangladesh include the Bangladesh Clinical Psychology Society and the Bangladesh Educational and Counselling Psychology Society. Ask which ones a practitioner belongs to, what membership required, and for their membership number.

### 3. Have you worked with difficulties like mine?
Ask how often they work with people facing the same difficulty, which approach they would use, and why. Cognitive behavioural therapy (CBT) is one of the most researched treatments for anxiety and depression; trauma-focused methods such as EMDR need specific training. A clear, plain-language answer is a good sign.

### 4. How do you protect my confidentiality?
Ask what is written down, who can see it, and when confidentiality might have to be broken (usually only when someone's life or safety is at serious risk). In a close family or a small community, also ask whether relatives will be told anything, and what happens if one of them contacts the practice.

### 5. What are your fees, and how long is a session?
A trustworthy practice tells you the fee, the session length and the cancellation policy before you start.

### 6. Do you work with psychiatrists when medication might help?
Psychologists provide assessment and talking therapy. Medication is prescribed by registered doctors, such as psychiatrists. A psychologist should know when to refer you and say so plainly. <a href="/blog/psychologist-or-psychiatrist-bangladesh">Psychologist or psychiatrist: who to see first</a> explains how the two work together.

### 7. Can we talk before I commit?
A short first conversation tells you a lot: whether you feel heard, whether things are explained clearly, and whether you would be comfortable coming back. You should never feel pressured to book more sessions than you want. Your choice is not limited to Dhaka, either: <a href="/blog/online-counselling-bangladesh">online counselling</a> works well for many people anywhere in Bangladesh.

### Red flags
- A promise of a cure, or of a set result within a set number of sessions
- Pressure to buy packages or pay a large amount in advance
- Advice to stop prescribed medication without your doctor
- Stories about other clients told in a way that could identify them
- Irritation when you ask about training or fees

If you would like to put these questions to Tania Subhashita, you can <a href="/about">read about her training</a> or <a href="/book">book a free 20-minute consultation</a>.

### If you need help now
${CRISIS_LINE}

${NOT_ADVICE}`,
  },
  {
    slug: 'psychologist-or-psychiatrist-bangladesh',
    title: 'Psychologist or Psychiatrist? Who to See First',
    date: 'October 24, 2026',
    category: 'Finding Help',
    summary: 'A psychiatrist is a doctor who can prescribe; a psychologist treats through talking therapy. Who to see first in Bangladesh, and when you need both.',
    readTime: '4 min read',
    content: `A **psychiatrist** is a medical doctor who diagnoses mental illness and can prescribe medication. A **psychologist** assesses difficulties and treats them through talking therapy. Many people need one of them; some do best with both working together.

**If you might act on thoughts of ending your life, or have made a plan, do not wait for an appointment with either:** call <a href="tel:999">999</a> now or go to the nearest hospital emergency department.

### What a psychiatrist does
Bangladesh's Mental Health Act 2018 defines a psychiatrist as a BMDC-registered doctor with a postgraduate qualification in psychiatry (<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8554921/">Karim and Shaikh, BJPsych International, 2021</a>). Psychiatrists:
- diagnose mental illnesses, including severe conditions such as bipolar disorder and psychosis
- prescribe and monitor medication
- arrange hospital care when it is needed

Follow-up appointments are often brief and centre on symptoms and medication, although some psychiatrists also provide therapy.

### What a psychologist does
A psychologist has university training in psychology and, for clinical work, postgraduate training (here is <a href="/blog/how-to-choose-a-psychologist-in-dhaka">how to check a psychologist's training</a>). Psychologists:
- assess what is happening and what keeps it going
- provide talking therapies such as cognitive behavioural therapy (CBT), which teach practical ways to change patterns of thinking, feeling and behaving
- work with relationships, trauma, stress, grief and habits that keep repeating

Sessions are usually longer, often an hour, and happen regularly over weeks or months. Psychologists do not prescribe medication.

### Who should you see first?
**See a psychiatrist, or go to a hospital, first if:**
- you are hearing or seeing things others don't, or feel your thoughts are being controlled
- your mood is so high or so low that you have not been able to sleep, eat or function for days
- you are drinking or using drugs heavily and feel unwell when you stop, because withdrawal can be dangerous without medical care

**A psychologist is a good place to start if:**
- you feel anxious, low or stressed, and it is affecting work, study or relationships
- you keep repeating habits you want to stop, such as procrastinating, endless phone use, anger or gambling
- something painful happened and you can't move past it
- you and your partner or family are stuck in the same arguments

If thoughts of ending your life come and go but you are safe right now, tell whoever you see first, psychologist or psychiatrist, at the start of the first appointment. If you are unsure which to choose, start with either: a psychologist will refer you to a psychiatrist if medication or a medical assessment might help, and many psychiatrists refer patients for therapy.

### Why both can work together
The UK's national guideline on depression in adults recommends talking therapy, medication, or both, depending on how severe the depression is and what the person prefers (<a href="https://www.nice.org.uk/guidance/ng222">NICE guideline NG222</a>). Medication can ease symptoms enough for therapy to become workable, and the skills practised in therapy can help protect against relapse. Starting, changing or stopping medication is a decision to make with the doctor who prescribed it. Read more about <a href="/services/depression">counselling for depression</a>.

### Finding care in Bangladesh
Specialist care is scarce: a 2021 paper counted around 260 psychiatrists for the whole country (<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8554893/">Hasan and colleagues, BJPsych International</a>). If there is no immediate risk and you are waiting to see a psychiatrist, talking therapy, including <a href="/blog/online-counselling-bangladesh">online counselling</a>, can be a useful place to begin. You can <a href="/book">book a free 20-minute consultation</a> to talk it through.

### If you need help right now
${CRISIS_LINE}

${NOT_ADVICE}`,
  },
];

export interface ServiceDetails {
  treatmentPoints: string;
  clinicNote: string;
}

const points = (...lines: string[]) => lines.join('\n');

// The eight services people most often search for; the rest follow once these are reviewed.
export const SERVICE_DETAILS: Record<string, ServiceDetails> = {
  'anxiety-disorder': {
    treatmentPoints: points(
      'Understanding what your anxiety is responding to, and what keeps it going',
      "Calming the body's alarm response with breathing and grounding skills",
      'Noticing and questioning anxious thoughts with cognitive behavioural therapy (CBT)',
      'Gradually facing situations you have been avoiding, at a pace you agree to',
      'Working on worry, sleep and the physical tension that comes with anxiety',
      'A plan for setbacks, so progress lasts',
    ),
    clinicNote: 'If anxiety comes with chest pain, breathlessness or other physical symptoms for the first time, please see a doctor as well, to rule out a medical cause.',
  },
  depression: {
    treatmentPoints: points(
      'Understanding how low mood is affecting your sleep, energy, work and relationships',
      'Small, planned steps back towards the activities that matter to you',
      'Recognising and challenging harsh, hopeless thinking with CBT',
      'Working through loss, guilt or life changes that sit underneath the low mood',
      'Involving family, where that helps and you want it',
      'Working alongside a psychiatrist if medication may help',
    ),
    clinicNote: 'If you are having thoughts of ending your life, please call 999 or go to the nearest hospital emergency department now, or call Kaan Pete Roi on 09612-119911 (3 pm – 3 am).',
  },
  ocd: {
    treatmentPoints: points(
      'A careful assessment of your obsessions, compulsions and what you avoid',
      'Understanding the cycle: why compulsions bring short relief but keep OCD going',
      'Cognitive behavioural therapy for OCD, at a pace you agree to',
      'Learning to live with doubt and "what if" thoughts without arguing with them',
      'Helping family members respond in ways that support recovery',
    ),
    clinicNote: "When OCD is severe, therapy often works best alongside a psychiatrist's care. If that would help you, a referral will be discussed openly.",
  },
  trauma: {
    treatmentPoints: points(
      'Making sense of how a traumatic experience is still affecting you now',
      'Skills to manage flashbacks, panic and feeling constantly on edge',
      'Trauma-focused therapy, including EMDR where it suits you',
      'Rebuilding a sense of safety, trust and control',
      'Working at your pace: you never have to share more than you are ready to',
    ),
    clinicNote: 'If you are still in an unsafe situation, making a safety plan comes before working on past events. Please mention it when you book.',
  },
  'drug-addiction': {
    treatmentPoints: points(
      'An honest, non-judgemental look at your substance use and its effects',
      'Understanding the triggers, feelings and situations that lead to use',
      'Relapse-prevention skills and a personal plan for high-risk moments',
      'Rebuilding routines, relationships and trust',
      "Support for family members affected by a loved one's use",
    ),
    clinicNote: 'Stopping some substances suddenly, including alcohol and some medicines, can be dangerous. If you are physically dependent, withdrawal should be overseen by a doctor or a treatment centre; counselling works alongside that.',
  },
  'behavioral-addiction': {
    treatmentPoints: points(
      'Understanding what the habit gives you, and what it costs you',
      'Mapping your triggers: stress, boredom, loneliness, late nights, particular apps or places',
      'Practical limits and changes around you that make the habit harder to fall back into',
      'Handling urges and shame without restarting the cycle',
      'Rebuilding sleep, focus, relationships and finances',
    ),
    clinicNote: '',
  },
  'couple-counselling': {
    treatmentPoints: points(
      'Understanding the pattern behind the arguments that keep repeating',
      'Communication skills for difficult conversations',
      'Rebuilding trust after it has been broken',
      'Working through differences over family, money, children or intimacy',
      'Deciding together on the way forward',
    ),
    clinicNote: 'If there is violence or fear in the relationship, joint sessions may not be safe. Individual support comes first; please mention it when you book.',
  },
  'online-counselling': {
    treatmentPoints: points(
      'Sessions by Zoom or Google Meet from anywhere in Bangladesh',
      'The same session length and confidentiality as in person',
      'Help finding a private space at home for your sessions',
      'A plan agreed in advance for what happens if the connection drops',
      'In-person sessions in New Eskaton, Dhaka, whenever you prefer',
    ),
    clinicNote: 'Online sessions are not an emergency service. In an emergency, call 999 or go to the nearest hospital emergency department.',
  },
};
