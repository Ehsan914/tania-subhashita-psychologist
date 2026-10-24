import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';
import { JOURNAL_DRAFTS, SERVICE_DETAILS } from './content.js';

// The site's content as set out in docs/site-design-and-wording.md: every fact traces to the
// previous site or the calm-elegant design, and the wording there is the wording here.
// Change the document first, then this file.

// The site's single admin. Sign-up is disabled in Better Auth, so the account is
// created here through Better Auth's own adapter and password hasher.
async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@mindcare.com';
  const ctx = await auth.$context;

  if (await ctx.internalAdapter.findUserByEmail(email)) {
    console.log(`✅ Admin ${email} already exists (password unchanged)`);
    return;
  }

  const password = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(12).toString('base64url');
  const user = await ctx.internalAdapter.createUser(
    { email, name: 'Admin', emailVerified: false },
    { method: 'admin' },
  );
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: 'credential',
    accountId: user.id,
    password: await ctx.password.hash(password),
  });
  console.log(`✅ Admin created (email: ${email}, password: ${password}) — change it after first login`);
}

const CHAMBER_ADDRESS = 'Aktar Mansion, House 30, Flat 1/A, Ismail Lane, New Eskaton, Dhaka 1000';

async function main() {
  console.log('🌱 Seeding database with current site content...\n');

  await seedAdmin();

  // The content lists below are created, not upserted, so a second run would duplicate them.
  // A database that already has content (any service) is left as the admin last saved it.
  if (await prisma.service.count() > 0) {
    console.log('✅ Site content already present — left unchanged');
    return;
  }

  // ─── Site Settings ───────────────────────────────────────────────────────────
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'Tania Subhashita',
      siteTagline: 'Psychologist in Dhaka · Online across Bangladesh',
      announcementText: '<strong>First session: 20 minutes free</strong>, in person at MIND CARE, New Eskaton, or online by Zoom or Google Meet.',
      announcementActive: true,
      facebookUrl: 'https://www.facebook.com/share/174Enkbe4y/',
      instagramUrl: '',
      linkedinUrl: 'https://www.linkedin.com/in/tania-rahman-subhashita-a08160221',
    },
  });
  console.log('✅ Site settings created');

  // ─── Hero Section ────────────────────────────────────────────────────────────
  await prisma.heroSection.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      tagline: 'Psychologist in Dhaka · Online across Bangladesh',
      titleLine1: 'A quiet room',
      titleLine2: 'to set it',
      titleLine3: 'down.',
      description: 'Compassionate, evidence-based therapy with psychologist Tania Subhashita for anxiety, low mood, trauma and habits that have taken hold — in a calm room in New Eskaton, Dhaka, or online anywhere in Bangladesh.',
      ctaPrimaryText: 'Book a free consult',
      ctaSecondaryText: 'What I help with',
      portraitImageUrl: '/images/room.jpg',
      portraitQuote: '“Helping you heal, grow, and thrive every day.”',
      portraitAttribution: '— Tania Subhashita',
    },
  });
  console.log('✅ Hero section created');

  // ─── Statistics ──────────────────────────────────────────────────────────────
  // The previous site's home-page figures; see "Needs Tania's confirmation" in the doc.
  const statistics = [
    { value: '1,560', label: 'therapy sessions every year', detail: '', order: 0 },
    { value: '22', label: 'clients supported each week', detail: '', order: 1 },
    { value: '2,134', label: 'clients supported', detail: '', order: 2 },
  ];
  for (const stat of statistics) {
    await prisma.statistic.create({ data: stat });
  }
  console.log('✅ Statistics created (' + statistics.length + ')');

  // ─── Welcome Section ─────────────────────────────────────────────────────────
  await prisma.welcomeSection.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      scriptTitle: 'Psychologist in Dhaka & online',
      heading: 'You do not have to carry it on your own.',
      paragraph1: "Maybe it's a low mood that won't lift, anxiety that holds you hostage at school or work, memories that keep replaying, or a habit that is slowly taking over your decisions. From the outside, you look fine. From the inside, keeping it up is exhausting.",
      paragraph2: 'I am <strong>Tania Subhashita</strong>, a psychologist in New Eskaton, Dhaka. I work with adolescents, adults, couples and families, in person and online. I offer a warm, strictly confidential space where you can let your guard down, look carefully at what hurts, and take evidence-based steps to rebuild.',
      credentialName: 'Tania Subhashita',
      credentialTitle: "Psychologist &amp; Clinical Psycho-Social Counselor. Bachelor's &amp; Master's in Psychology, Professional Master's in Clinical Social Work (University of Dhaka).",
      portraitImageUrl: '/images/warm-editorial-portrait-in-mauve-saree.png',
    },
  });
  console.log('✅ Welcome section created');

  // ─── Methodology Quote ───────────────────────────────────────────────────────
  await prisma.methodologyQuote.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      scriptTitle: 'At your own pace',
      quote: '“I look beyond surface symptoms to the roots underneath, so that recovery holds. Every conversation is free from judgement and bound by complete confidentiality.”',
      attribution: '— Tania Subhashita',
    },
  });
  console.log('✅ Methodology quote created');

  // ─── CTA Section ─────────────────────────────────────────────────────────────
  await prisma.cTASection.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      heading: "Wherever you are right now, you don't have to stay there.",
      subtitle: 'The next chapter can start with one unhurried conversation, with no pressure to continue.',
      scriptTitle: 'Begin when you are ready',
      buttonText: 'Book a free consult',
    },
  });
  console.log('✅ CTA section created');

  // ─── Services (all 26) ──────────────────────────────────────────────────────
  // Names use the words people search for; slugs never change. Categories keep the DB spelling
  // the site's area labels are keyed on (client/site/therapies/therapyData.ts).
  const services = [
    { slug: 'psychotherapy', name: 'Psychotherapy', description: 'Regular one-to-one sessions to understand and work through emotional and mental health difficulties, aiming for change that lasts.', category: 'Self & Relationships', iconName: 'Brain', order: 0 },
    { slug: 'depression', name: 'Depression Counselling', description: 'Support for low mood, hopelessness and loss of interest: understanding what keeps it going, and taking steady, practical steps back towards what matters to you.', category: 'Mood & Emotion', iconName: 'Heart', order: 1 },
    { slug: 'anxiety-disorder', name: 'Anxiety Therapy', description: 'Practical tools for worry, fear and the physical tension of anxiety, using approaches such as CBT, so you can feel calmer and more in control.', category: 'Mood & Emotion', iconName: 'ShieldAlert', order: 2 },
    { slug: 'personality-disorder', name: 'Personality Disorder Support', description: 'Therapy for long-standing patterns of thinking, feeling and relating that cause distress, including skills from dialectical behaviour therapy (DBT).', category: 'Specialized Care', iconName: 'Fingerprint', order: 3 },
    { slug: 'ocd', name: 'OCD Therapy', description: 'Therapy to loosen the cycle of obsessive thoughts and compulsive behaviours, using cognitive behavioural therapy (CBT).', category: 'Specialized Care', iconName: 'Activity', order: 4 },
    { slug: 'drug-addiction', name: 'Drug Addiction Counselling', description: 'Structured, compassionate counselling for substance use: understanding triggers, preventing relapse and rebuilding daily life, alongside medical care where withdrawal needs it.', category: 'Addiction & Behavior', iconName: 'Sparkles', order: 5 },
    { slug: 'behavioral-addiction', name: 'Porn, Gambling, Sex & Device Addiction', description: 'Counselling for compulsive habits such as pornography, gambling, sex or screen use: understanding what drives them and building healthier routines.', category: 'Addiction & Behavior', iconName: 'SmartphoneOff', order: 6 },
    { slug: 'bipolar-disorder', name: 'Bipolar Disorder Support', description: 'Psychological support alongside psychiatric care: understanding mood episodes, noticing early warning signs and building routines that support stability.', category: 'Mood & Emotion', iconName: 'Sparkle', order: 7 },
    { slug: 'trauma', name: 'Trauma & PTSD Therapy', description: 'Trauma-focused therapy, including EMDR, for post-traumatic stress and acute stress after frightening or painful experiences.', category: 'Specialized Care', iconName: 'FlameKindling', order: 8 },
    { slug: 'online-counselling', name: 'Online Counselling', description: 'Therapy sessions by Zoom or Google Meet from anywhere in Bangladesh, with the same confidentiality as meeting in person.', category: 'Specialized Care', iconName: 'Video', order: 9 },
    { slug: 'suicidal-thought', name: 'Suicidal Thought Support', description: 'A safe, confidential space to talk about thoughts of ending your life or harming yourself, and to plan steps towards safety and hope. This is not an emergency service: if you are in danger, call 999.', category: 'Mood & Emotion', iconName: 'LifeBuoy', order: 10 },
    { slug: 'panic-disorder', name: 'Panic Disorder & Phobia', description: 'Techniques for sudden waves of intense fear, and a gradual, agreed plan to face the places and situations you have started to avoid.', category: 'Mood & Emotion', iconName: 'Wind', order: 11 },
    { slug: 'exam-phobia', name: 'Exam Anxiety & Exam Phobia', description: 'Support for students facing overwhelming fear before or during exams, with calming techniques and confidence-building steps.', category: 'Specialized Care', iconName: 'BookOpen', order: 12 },
    { slug: 'grief-management', name: 'Grief Counselling', description: 'Space to work through the complicated feelings that follow a loss, at your own pace, and to find ways to carry it.', category: 'Mood & Emotion', iconName: 'CloudRain', order: 13 },
    { slug: 'indecisiveness', name: 'Indecisiveness & Self-Doubt', description: 'Help with overthinking and second-guessing, so decisions feel clearer and you trust your own judgement more.', category: 'Self & Relationships', iconName: 'GitCommit', order: 14 },
    { slug: 'couple-counselling', name: 'Couple Counselling', description: 'Joint sessions for partners to improve communication, work through conflict and rebuild trust.', category: 'Self & Relationships', iconName: 'Users', order: 15 },
    { slug: 'guilt-feeling', name: 'Persistent Guilt', description: 'Therapy for guilt that will not let go: understanding where it comes from, and moving towards self-forgiveness.', category: 'Mood & Emotion', iconName: 'Sunset', order: 16 },
    { slug: 'stress-management', name: 'Stress Management', description: 'Ways to cope with daily pressure and major life changes, and to recover a sense of balance.', category: 'Mood & Emotion', iconName: 'Smile', order: 17 },
    { slug: 'sleep-disorder', name: 'Sleep Difficulties', description: 'Behavioural strategies for trouble falling or staying asleep, and for the worries that keep you awake.', category: 'Specialized Care', iconName: 'Moon', order: 18 },
    { slug: 'odd', name: 'ODD: Child & Parent Support', description: 'Support for children with oppositional or defiant behaviour, and for their parents, to bring more calm and cooperation at home.', category: 'Specialized Care', iconName: 'Baby', order: 19 },
    { slug: 'anger-management', name: 'Anger Management', description: 'Understanding what triggers your anger, and learning healthier ways to express and manage it.', category: 'Addiction & Behavior', iconName: 'Flame', order: 20 },
    { slug: 'social-anxiety', name: 'Social Anxiety', description: 'Support with fear and self-consciousness in social situations, so you can connect with people more comfortably.', category: 'Self & Relationships', iconName: 'Eye', order: 21 },
    { slug: 'procrastination', name: 'Procrastination', description: 'Understanding the feelings behind putting things off, and practical steps to start and finish what matters.', category: 'Addiction & Behavior', iconName: 'Clock', order: 22 },
    { slug: 'familiar-disharmony', name: 'Family Counselling', description: 'Sessions with family members to reduce conflict, improve communication and understand one another, drawing on systemic family therapy.', category: 'Self & Relationships', iconName: 'Home', order: 23 },
    { slug: 'behavioral-therapy', name: 'Behavioural Therapy', description: 'A goal-focused approach to identify and change specific behaviours, with practical steps you practise between sessions.', category: 'Addiction & Behavior', iconName: 'Compass', order: 24 },
    { slug: 'social-skill', name: 'Social Skills', description: 'Building confidence and practical skills for conversations, friendships and working relationships.', category: 'Self & Relationships', iconName: 'Award', order: 25 },
  ];
  for (const service of services) {
    await prisma.service.create({ data: { ...service, ...SERVICE_DETAILS[service.slug] } });
  }
  console.log('✅ Services created (' + services.length + ')');

  // ─── Programs ────────────────────────────────────────────────────────────────
  // Not on the previous site; see "Needs Tania's confirmation" in the doc.
  const programs = [
    {
      slug: 'anxiety-panic',
      title: 'Anxiety & Panic Program',
      subtitle: 'Eight weeks of guided support for panic and persistent worry',
      duration: '8 weekly sessions, in person or online',
      description: 'A structured eight-week program for panic attacks and persistent worry, combining CBT with practical, body-based calming skills.',
      details: [
        'An assessment that maps your triggers',
        'Calming skills such as slow, paced breathing',
        'Thought records and other CBT tools',
        'A gradual, agreed plan for facing what you avoid',
        'A written plan for setbacks to keep afterwards',
      ],
      suitability: 'People living with panic attacks, social self-consciousness or persistent worry.',
      order: 0,
    },
    {
      slug: 'addiction-reset',
      title: 'Addictive Behaviour Recovery Program',
      subtitle: 'Twelve weeks of structured support for substances and compulsive habits',
      duration: '12 weekly sessions, with fortnightly support calls',
      description: 'A structured twelve-week program for substance use or behavioural habits such as gambling, pornography, sex or excessive screen use.',
      details: [
        'Mapping the triggers and situations behind the habit',
        'Building replacement routines that fit your life',
        'Working on the low mood or anxiety underneath',
        'Urge-surfing and other skills for cravings',
        'Milestones you agree and review together',
      ],
      suitability: 'Anyone who wants to regain control from a persistent, unwanted habit.',
      order: 1,
    },
    {
      slug: 'student-peak-mind',
      title: 'Exam Anxiety Program for Students',
      subtitle: 'Four weeks for exam fear and putting off study',
      duration: '4 weekly sessions, in person or online',
      description: 'For school, college and university students struggling with exam fear, performance blocks or putting off study.',
      details: [
        'Easing perfectionism and fear of failure',
        'Study schedules and warm-up routines',
        'Calming techniques to use in the exam hall',
        'Confidence-building and mindfulness practice',
      ],
      suitability: 'Students preparing for important exams.',
      order: 2,
    },
  ];
  for (const program of programs) {
    await prisma.program.create({ data: program });
  }
  console.log('✅ Programs created (' + programs.length + ')');

  // ─── Blog Posts ──────────────────────────────────────────────────────────────
  // Drafted for review: saved unpublished, published from the admin once Tania has read them.
  const blogPosts = JOURNAL_DRAFTS.map((post, order) => ({ ...post, published: false, order }));
  for (const post of blogPosts) {
    await prisma.blogPost.create({ data: post });
  }
  console.log('✅ Blog posts created (' + blogPosts.length + ')');

  // ─── Testimonials ────────────────────────────────────────────────────────────
  // None: the previous site had no client quotes, and invented ones are not published.
  // Add real ones in the admin, with written consent and no names, initials or dates.
  console.log('✅ Testimonials: none seeded (add real, consented quotes in the admin)');

  // ─── FAQs ────────────────────────────────────────────────────────────────────
  const faqs = [
    { question: 'What should I expect in the first session?', answer: "The first session is an initial consultation. We'll talk about your background, what brings you to therapy and what you'd like to change. It's a space for us to get to know each other and decide together whether we're a good fit. The first 20 minutes are free.", order: 0 },
    { question: 'Is what I share confidential?', answer: 'Yes. Confidentiality is the cornerstone of therapy. Everything we discuss stays confidential, with a few important exceptions relating to safety, such as a risk of serious harm to yourself or others.', order: 1 },
    { question: 'How long is a session?', answer: 'A standard session lasts 60 minutes. EMDR sessions can sometimes run to 90 minutes, depending on your needs and treatment plan.', order: 2 },
    { question: 'Do you offer online counselling outside Dhaka?', answer: 'Yes. Sessions run over Zoom or Google Meet, so you can join from anywhere in Bangladesh. Research suggests video sessions work about as well as meeting in person for common difficulties such as anxiety and depression.', order: 3 },
    { question: 'Where is your chamber in Dhaka?', answer: `MIND CARE, ${CHAMBER_ADDRESS}. Sessions are by appointment, between 10:00 am and 8:00 pm.`, order: 4 },
    { question: 'Do you see adolescents, couples and families?', answer: 'Yes. I work with adolescents, adults, couples and families, in person in New Eskaton and online.', order: 5 },
    { question: 'Is this an emergency service?', answer: 'No. If you are in danger, call 999 or go to the nearest hospital emergency department. The Kaan Pete Roi emotional support helpline is on 09612-119911, 3 pm – 3 am every day.', order: 6 },
  ];
  for (const faq of faqs) {
    await prisma.fAQ.create({ data: faq });
  }
  console.log('✅ FAQs created (' + faqs.length + ')');

  // ─── Gallery Images ──────────────────────────────────────────────────────────
  const galleryImages = [
    { url: '/images/gallery-clinical-psychology-conference.jpeg', altText: 'Tania Subhashita with Prof. Jobeda Khatun at the 6th Bangladesh Clinical Psychology Conference, University of Dhaka', order: 0 },
    { url: '/images/gallery-training-group.jpeg', altText: 'Tania Subhashita with fellow participants at a professional training session', order: 1 },
    { url: '/images/gallery-sfsc-certificate.jpeg', altText: 'Tania Subhashita receiving her Strengthening Families, Strengthening Communities (SFSC) parenting programme certificate', order: 2 },
    { url: '/images/gallery-advanced-therapeutic-workshop.jpeg', altText: 'Tania Subhashita receiving her Advanced Therapeutic Mental Health Workshop certificate', order: 3 },
    { url: '/images/gallery-moonflower-autism-foundation.jpeg', altText: 'Tania Subhashita with Mofijul Islam, Executive Director of Moonflower Autism Foundation', order: 4 },
  ];
  for (const image of galleryImages) {
    await prisma.galleryImage.create({ data: image });
  }
  console.log('✅ Gallery images created (' + galleryImages.length + ')');

  // ─── Contact Info ────────────────────────────────────────────────────────────
  await prisma.contactInfo.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      clinicName: 'MIND CARE',
      address: CHAMBER_ADDRESS,
      city: 'Dhaka',
      phone: '+880 1580 700 700',
      email: 'tr.subhashita@gmail.com',
      officeHours: '10:00 am – 8:00 pm',
      mapEmbedUrl: '',
    },
  });
  console.log('✅ Contact info created');

  // ─── About Section ───────────────────────────────────────────────────────────
  await prisma.aboutSection.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      tagline: 'About',
      heading: 'Meet Tania Subhashita',
      bio1: "Tania Subhashita (Tania Rahman Subhashita) is a psychologist and clinical psycho-social counselor in Dhaka, dedicated to promoting emotional wellbeing and psychological resilience. She holds Honours and Master's degrees in Psychology, along with a Professional Master's degree in Clinical Social Work from the Institute of Social Welfare and Research, University of Dhaka. She works with adolescents, adults, couples and families, and is an experienced meditation practitioner who brings mindfulness into her therapeutic work.",
      bio2: 'Throughout her career, she has worked with numerous psychiatric clinics and rehabilitation centres across Dhaka, providing psychological assessment, psychotherapy, and addiction recovery support. Her areas of expertise include psychiatric conditions, substance use disorders, emotional dysregulation, and family relationship challenges. Beyond clinical practice, she organises workshops, awareness programmes and educational sessions in Dhaka and beyond, and shares insights on mental health through podcasts, YouTube and Facebook.',
      quote: 'My approach is compassionate, personalized, and focused on meaningful progress.',
      location: 'MIND CARE, New Eskaton, Dhaka, and online',
      experience: 'Psychiatric clinics and rehabilitation centres across Dhaka',
      portraitImageUrl: '/images/warm-editorial-portrait-in-mauve-saree.png',
    },
  });
  console.log('✅ About section created');

  // ─── Credentials ─────────────────────────────────────────────────────────────
  const credentials = [
    { title: 'Cognitive Behaviour Therapy (CBT)', description: 'Trained at the University of Dhaka. Identifying and changing unhelpful patterns of thinking and behaviour.', order: 0 },
    { title: 'Dialectical Behaviour Therapy (DBT)', description: 'Skills for emotional regulation, distress tolerance, and healthier relationships.', order: 1 },
    { title: 'Certified Addiction Professional', description: 'Colombo Plan training with the Department of Narcotics Control, Dhaka. Assessment and recovery support for substance use.', order: 2 },
    { title: 'Eye Movement Desensitisation and Reprocessing (EMDR)', description: 'A structured approach to processing traumatic memories.', order: 3 },
    { title: 'SFSC Parenting Programme', description: 'Strengthening Families, Strengthening Communities. Race Equality Foundation, UK.', order: 4 },
    { title: 'Systemic Family Therapy', description: 'Working with the family as a whole to improve communication and resolve conflict.', order: 5 },
    { title: 'Basic Psycho-Therapeutic Counselling', description: 'Foundational training in counselling skills and the therapeutic relationship.', order: 6 },
    { title: 'Sexual Disorder Management', description: 'Assessment and counselling for sexual health concerns.', order: 7 },
    { title: 'Neuro-Linguistic Programming (NLP)', description: 'Techniques for changing patterns of thought, language, and behaviour.', order: 8 },
    { title: 'Transactional Analysis (TA)', description: 'A framework for understanding personality, communication, and relationships.', order: 9 },
    { title: 'Mindfulness', description: 'An experienced meditation practitioner who brings mindfulness techniques into therapy.', order: 10 },
  ];
  for (const cred of credentials) {
    await prisma.credential.create({ data: cred });
  }
  console.log('✅ Credentials created (' + credentials.length + ')');

  // ─── Methodology Steps ───────────────────────────────────────────────────────
  const methodologySteps = [
    { stepNumber: '01', title: 'A safe place to start', description: 'We begin by building trust. Whatever you bring — trauma, a habit, shame or grief — is held with patience and complete confidentiality.', order: 0 },
    { stepNumber: '02', title: 'A plan made for you', description: 'No cookie-cutter advice. Together we map the thinking patterns that keep you stuck, and use proven tools like CBT to loosen them.', order: 1 },
    { stepNumber: '03', title: 'Steady on your own', description: 'The aim is for you to become your own therapist, with a clear plan for the harder days so you feel confident handling them.', order: 2 },
  ];
  for (const step of methodologySteps) {
    await prisma.methodologyStep.create({ data: step });
  }
  console.log('✅ Methodology steps created (' + methodologySteps.length + ')');

  // ─── Assessment Questions ────────────────────────────────────────────────────
  const assessmentQuestions = [
    { text: 'I lie awake for long periods with loops of stressful thoughts or worries about the future.', order: 0 },
    { text: 'I feel unusually defensive, angry or quick to irritation with friends or coworkers.', order: 1 },
    { text: 'I reach for devices, gambling, food or other quick escapes when real-life pressure builds.', order: 2 },
    { text: 'Anxiety has made me avoid social situations, speaking up or sitting exams.', order: 3 },
    { text: 'I struggle with simple choices, caught in cycles of overthinking.', order: 4 },
    { text: "I feel an exhaustion that sleep doesn't fix, with a heaviness in my chest.", order: 5 },
  ];
  for (const q of assessmentQuestions) {
    await prisma.assessmentQuestion.create({ data: q });
  }
  console.log('✅ Assessment questions created (' + assessmentQuestions.length + ')');

  // ─── Assessment Score Bands ──────────────────────────────────────────────────
  const scoreBands = [
    { minScore: 0, maxScore: 1, emoji: '🌱', label: 'Subtle tension', message: 'You seem to be managing stress well, though there may be small pockets of unaddressed worry. Talking to someone early is a powerful form of prevention.' },
    { minScore: 2, maxScore: 3, emoji: '🌿', label: 'Moderate strain', message: "You're carrying a heavy load, and some of your coping methods are starting to show friction. A single conversation can give you tools to release some of that pressure." },
    { minScore: 4, maxScore: 6, emoji: '🤍', label: 'High strain', message: "You may be moving through deep exhaustion or anxiety that is affecting your sleep and relationships. You don't have to struggle in silence — reaching out can change a great deal." },
  ];
  for (const band of scoreBands) {
    await prisma.assessmentScoreBand.create({ data: band });
  }
  console.log('✅ Assessment score bands created (' + scoreBands.length + ')');

  console.log('\n🎉 Database seeded successfully with all current site content!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
