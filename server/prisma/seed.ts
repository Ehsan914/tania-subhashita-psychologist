import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import bcrypt from 'bcryptjs';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database with current site content...\n');

  // ─── Admin User ────────────────────────────────────────────────────────────────
  const defaultPassword = 'admin123';
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: 'admin@mindcare.com' },
    update: {},
    create: {
      email: 'admin@mindcare.com',
      passwordHash,
      name: 'Admin',
    },
  });
  console.log(`✅ Admin user created (email: admin@mindcare.com, password: ${defaultPassword})`);

  // ─── Site Settings ───────────────────────────────────────────────────────────
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'Tania Subhashita',
      siteTagline: 'Psychologist · Mental Health Expert',
      announcementText: '<strong class="text-[#E4B24C]">First session: 20 minutes free</strong> — in-person at <span class="font-semibold underline decoration-[#E4B24C]">MIND CARE, New Eskaton</span> &amp; online via Zoom / Google Meet.',
      announcementActive: true,
      facebookUrl: '#',
      instagramUrl: '#',
      linkedinUrl: '#',
    },
  });
  console.log('✅ Site settings created');

  // ─── Hero Section ────────────────────────────────────────────────────────────
  await prisma.heroSection.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      tagline: 'Psychotherapy · Counselling · Dhaka Location',
      titleLine1: 'Reconnect',
      titleLine2: 'with your',
      titleLine3: 'true self.',
      description: 'Compassionate, evidence-based professional support for depression, anxiety, trauma, and behavioral addictions. Rebuild meaning and reclaim your personal peace in a safe, completely confidential space.',
      ctaPrimaryText: 'Book 20-Min Free Consult',
      ctaSecondaryText: 'Our services',
      portraitQuote: '\u201cHelping you heal, grow, and thrive — every day.\u201d',
      portraitAttribution: '— Tania Subhashita',
    },
  });
  console.log('✅ Hero section created');

  // ─── Statistics ──────────────────────────────────────────────────────────────
  const statistics = [
    { value: '1,560', label: 'Therapy Sessions Every Year', detail: 'Encompassing clinical assessments, in-depth CBT counseling, and personal follow-ups.', order: 0 },
    { value: '22', label: 'Clients Supported Weekly', detail: 'Dedicated direct contact hours for unhurried, private custom tailored sessions.', order: 1 },
    { value: '2,134', label: 'Happy & Satisfied Clients', detail: 'Individuals, couples, and family members who rediscovered light and peace.', order: 2 },
    { value: '10+', label: 'Personalized Healing & Therapy Plans', detail: 'Advanced custom templates targeted for anxiety, addiction recovery, and youth exam distress.', order: 3 },
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
      scriptTitle: 'Welcome',
      heading: 'You do not have to carry your heavy mental burdens entirely on your own.',
      paragraph1: 'Maybe it is a heavy drop in mood that won\'t lift, anxiety that holds you hostage at school or work, traumatic memories that replay, or a habit that\'s slowly taking control of your daily decisions. From the outside, you look successful. From the inside, running this routine is exhausting.',
      paragraph2: 'I am <strong class="text-[#1C4751] font-medium">Tania Subhashita</strong>, a licensed mental health professional based in Dhaka. I offer a warm, strictly confidential, and unvarnished safe space where you can let down your guard, systematically study what hurts, and introduce evidence-based steps to rebuild.',
      credentialName: 'Tania Subhashita',
      credentialTitle: 'MA in Psychology & Clinical Social Work (University of Dhaka). Specializing in Cognitive and Compassion-focused therapies.',
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
      quote: '\u201cI look beyond the surface level symptoms to heal the actual biological and environment roots — so that the recovery stays secure. Every single dialogue is a safe sanctuary, free from judgment, and bound by absolute clinical confidentiality.\u201d',
      attribution: '— Tania Subhashita, Clinical Psychologist',
    },
  });
  console.log('✅ Methodology quote created');

  // ─── CTA Section ─────────────────────────────────────────────────────────────
  await prisma.cTASection.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      heading: 'Wherever you represent yourself right now, you do not have to stay trapped there.',
      subtitle: 'The subsequent chapter of your life can start this evening. Reclaim control with zero pressure.',
      scriptTitle: 'Begin your emotional journey',
      buttonText: 'Schedule Consultation',
    },
  });
  console.log('✅ CTA section created');

  // ─── Services (all 26) ──────────────────────────────────────────────────────
  const services = [
    { slug: 'psychotherapy', name: 'Psychotherapy', description: 'An in-depth therapeutic process to help you understand and resolve emotional and mental health challenges, fostering long-term well-being.', category: 'Self & Relationships', iconName: 'Brain', order: 0 },
    { slug: 'depression', name: 'Depression Support', description: 'Support and therapeutic guidance to help you navigate feelings of sadness, hopelessness, and loss of interest, paving the way for a more positive outlook.', category: 'Mood & Emotion', iconName: 'Heart', order: 1 },
    { slug: 'anxiety-disorder', name: 'Anxiety Disorder', description: 'Effective strategies and tools to manage and reduce feelings of worry, fear, and panic, helping you regain a sense of calm and control.', category: 'Mood & Emotion', iconName: 'ShieldAlert', order: 2 },
    { slug: 'personality-disorder', name: 'Personality Disorder', description: 'Specialized therapy to help you understand and manage persistent thought and behavior patterns that cause distress and impact relationships.', category: 'Specialized Care', iconName: 'Fingerprint', order: 3 },
    { slug: 'ocd', name: 'OCD (Obsessive-Compulsive)', description: 'Therapy focused on breaking the cycle of obsessive thoughts and compulsive behaviors to help you reclaim your life.', category: 'Specialized Care', iconName: 'Activity', order: 4 },
    { slug: 'drug-addiction', name: 'Drug Addiction', description: 'Compassionate support and structured therapy to help you overcome substance dependency and build a healthy, sober life.', category: 'Addiction & Behavior', iconName: 'Sparkles', order: 5 },
    { slug: 'behavioral-addiction', name: 'Porn, Gambling, Sex & Device Addiction', description: 'Targeted counseling to help you understand the root causes of behavioral addictions and develop healthier habits and coping mechanisms.', category: 'Addiction & Behavior', iconName: 'SmartphoneOff', order: 6 },
    { slug: 'bipolar-disorder', name: 'Bipolar Mood Disorder', description: 'Guidance and support to help you manage extreme mood swings, promoting stability and improving your quality of life.', category: 'Mood & Emotion', iconName: 'Sparkle', order: 7 },
    { slug: 'trauma', name: 'Trauma (PTSD, ASD)', description: 'Healing-centered therapy to process and recover from traumatic experiences, helping you move forward from post-traumatic stress.', category: 'Specialized Care', iconName: 'FlameKindling', order: 8 },
    { slug: 'online-counselling', name: 'Online Counselling', description: 'Convenient and secure therapy sessions offered remotely, providing access to professional support from the comfort of your home.', category: 'Specialized Care', iconName: 'Video', order: 9 },
    { slug: 'suicidal-thought', name: 'Suicidal Thought Support', description: 'A safe, confidential space to discuss thoughts of self-harm, providing immediate support and creating a path toward hope and recovery.', category: 'Mood & Emotion', iconName: 'LifeBuoy', order: 10 },
    { slug: 'panic-disorder', name: 'Panic Disorder & Phobia', description: 'Techniques to manage sudden episodes of intense fear and reduce the avoidance behaviors associated with specific fears and phobias.', category: 'Mood & Emotion', iconName: 'Wind', order: 11 },
    { slug: 'exam-phobia', name: 'Exam Phobia Support', description: 'Specialized support for students to overcome overwhelming fear and anxiety related to exams, boosting confidence and performance.', category: 'Specialized Care', iconName: 'BookOpen', order: 12 },
    { slug: 'grief-management', name: 'Grief Management', description: 'A compassionate approach to help you navigate the complex emotions of loss and find a way to heal and cope.', category: 'Mood & Emotion', iconName: 'CloudRain', order: 13 },
    { slug: 'indecisiveness', name: 'Indecisiveness Care', description: 'Guidance to help you build confidence in your decision-making, reducing self-doubt and promoting clarity.', category: 'Self & Relationships', iconName: 'GitCommit', order: 14 },
    { slug: 'couple-counselling', name: 'Couple Counselling', description: 'Joint sessions to improve communication, resolve conflicts, and strengthen the bond between partners.', category: 'Self & Relationships', iconName: 'Users', order: 15 },
    { slug: 'guilt-feeling', name: 'Guilt Feeling Therapy', description: 'Therapy to help you process and release feelings of excessive guilt, fostering self-forgiveness and emotional freedom.', category: 'Mood & Emotion', iconName: 'Sunset', order: 16 },
    { slug: 'stress-management', name: 'Stress Management', description: 'Effective techniques to cope with daily pressures and major life stressors, helping you find balance and inner peace.', category: 'Mood & Emotion', iconName: 'Smile', order: 17 },
    { slug: 'sleep-disorder', name: 'Sleep Disorder Solution', description: 'Strategies and behavioral therapy to help you improve sleep patterns and achieve restful, restorative sleep.', category: 'Specialized Care', iconName: 'Moon', order: 18 },
    { slug: 'odd', name: 'ODD (Oppositional Defiant)', description: 'Support for both children and parents to manage defiance and behavioral issues, improving family harmony.', category: 'Specialized Care', iconName: 'Baby', order: 19 },
    { slug: 'anger-management', name: 'Anger Management', description: 'Therapeutic tools to help you understand the triggers of anger and develop healthy ways to express and control it.', category: 'Addiction & Behavior', iconName: 'Flame', order: 20 },
    { slug: 'social-anxiety', name: 'Social Anxiety', description: 'Support to overcome fear and self-consciousness in social situations, empowering you to connect with others more comfortably.', category: 'Self & Relationships', iconName: 'Eye', order: 21 },
    { slug: 'procrastination', name: 'Procrastination Therapy', description: 'Therapy to help you understand and overcome the reasons behind procrastination, improving productivity and reducing stress.', category: 'Addiction & Behavior', iconName: 'Clock', order: 22 },
    { slug: 'familiar-disharmony', name: 'Familiar Disharmony', description: 'Mediation and counseling to address conflicts within the family, promoting understanding and resolving disputes.', category: 'Self & Relationships', iconName: 'Home', order: 23 },
    { slug: 'behavioral-therapy', name: 'Behavioral Therapy', description: 'A goal-oriented approach to identify and change problematic behaviors, focusing on practical solutions.', category: 'Addiction & Behavior', iconName: 'Compass', order: 24 },
    { slug: 'social-skill', name: 'Social Skill Management', description: 'Guidance to help you develop the confidence and skills needed to navigate social interactions and build meaningful connections.', category: 'Self & Relationships', iconName: 'Award', order: 25 },
  ];
  for (const service of services) {
    await prisma.service.create({ data: service });
  }
  console.log('✅ Services created (' + services.length + ')');

  // ─── Programs ────────────────────────────────────────────────────────────────
  const programs = [
    {
      slug: 'anxiety-panic',
      title: 'Anxiety & Panic Liberation Program',
      subtitle: '8-Week Guided Coping & Recovery Journey',
      duration: '8 Weekly Sessions (In-person or Online)',
      description: 'A highly systemized program designed to dismantle panic attacks, quiet generalized anxiety, and arm you with concrete relaxation and somatic regulation tools.',
      details: [
        'Diagnostic and triggers mapping assessment',
        'Somatic nervous system soothing exercises (Box Breathing, vagus nerve stimulation)',
        'Cognitive Restructuring sheets and thought records',
        'Gradual safe exposure hierarchy planning',
        'Relapse prevention protocol manual',
      ],
      suitability: 'Highly suitable for individuals experiencing sudden panic, social self-consciousness, or persistent worry.',
      order: 0,
    },
    {
      slug: 'addiction-reset',
      title: 'Addictive Behavior Reset & Rebuild',
      subtitle: '12-Week Comprehensive Recovery Program',
      duration: '12 Weekly Sessions + Bi-weekly support calls',
      description: 'Compassionate, structured therapeutic guidance targeting chemical or behavioral habits (substances, gambling, digital overconsumption, porn or sex addiction).',
      details: [
        'Trigger mapping and dopamine curve analysis',
        'Designing highly resilient positive replacement routines',
        'Underlying sadness or anxiety treatment focus',
        'Compulsion-urge surfing techniques',
        'Accountability milestones setup',
      ],
      suitability: 'Suitable for anyone desiring to regain absolute autonomy from persistent, unwanted habits.',
      order: 1,
    },
    {
      slug: 'student-peak-mind',
      title: 'Student Peak Confidence Program',
      subtitle: '4-Week Exam Phobia & Procrastination Breakthrough',
      duration: '4 Staged Weekly Sessions',
      description: 'Designed specifically for students and young scholars struggling with debilitating exam tension, performance blockages, or chronic study delay.',
      details: [
        'Overcoming perfectionism and fear-of-failure cycles',
        'Interactive focus flow schedules and study warm-ups',
        'Anxiety calming techniques for use inside the examination hall',
        'Confidence anchoring and mindfulness strategies',
      ],
      suitability: 'Highly suitable for school, college, or university students preparing for pivotal tests.',
      order: 2,
    },
  ];
  for (const program of programs) {
    await prisma.program.create({ data: program });
  }
  console.log('✅ Programs created (' + programs.length + ')');

  // ─── Blog Posts ──────────────────────────────────────────────────────────────
  const blogPosts = [
    {
      slug: 'cbt-steps',
      title: 'Understanding CBT: How to Rewrite Negative Thought Patterns',
      date: 'June 12, 2026',
      category: 'Psychotherapy',
      summary: 'Cognitive Behavioral Therapy (CBT) is one of the most effective tools for treating depression and anxiety. Discover the practical step-by-step methods you can run daily.',
      readTime: '5 min read',
      content: `Negative thought patterns, also known as cognitive distortions, can make us feel trapped in anxiety and distress. Cognitive Behavioral Therapy (CBT) provides an empirical, structured framework to identify and challenge these patterns.

### 1. Identifying the "Hot Thought"
The first step is noticing when your mood shifts. What did you say to yourself in that exact moment? Examples include "I always fail at everything" or "Everyone is judging me."

### 2. Gathering Evidence
In CBT, we act as scientists. We write down two columns:
- **Evidence that supports the thought**: Facts, actual occurrences.
- **Evidence that counteracts the thought**: Overlooked victories, alternative circumstances.

### 3. Creating an Alternative Perspective
By evaluating the evidence objectively, you can craft a balanced view. Instead of "I am totally useless," a balanced alternative is "I made a single mistake in this assignment, but I have completed many other assignments successfully in the past."

This unhurried practice helps lower the immediate fight-or-flight stress. Reach out today to see how CBT can support you.`,
      order: 0,
    },
    {
      slug: 'overcome-procrastination',
      title: 'Procrastination and Emotional Regulation: Why We Avoid Tasks',
      date: 'May 28, 2026',
      category: 'Behavioral Therapy',
      summary: 'Procrastination is rarely a time-management failure; it\'s a way of biological stress avoidance. Let\'s look at the emotional causes and how to heal.',
      readTime: '7 min read',
      content: `Many people view procrastination as laziness or a personal failure. In modern psychology, however, procrastination is recognized as a coping mechanism for negative emotions associated with specific tasks—such as boredom, anxiety, insecurity, self-doubt, or frustration.

### The Cycle of Avoidance
1. **Immediate Threat**: You see a task that makes you anxious (e.g. studying, submitting a critical report).
2. **Brain Hijack**: The amygdala perceives this anxiety as a physical threat.
3. **Avoidance Choice**: You clean your room, browse devices, or do minor tasks to get immediate dopamine relief.
4. **Guilt Cycle**: The task remains, now seasoned with added guilt and reduced self-worth, making you even *more* anxious next time.

### Breaking the Loop
- **The 2-Minute Warmup**: Commit to sitting and writing *just* for two minutes. Often, the friction lies only at the point of starting.
- **Self-Compassion**: Forgive yourself for previous procrastination. Studies show that self-forgiving students procrastinate far less on subsequent tests because they carry less emotional baggage.
- **Micro-tasks**: Break down the objective into incredibly small, non-scary steps.

Our custom behavioral therapy plans focus on rebuilding this mental stamina.`,
      order: 1,
    },
    {
      slug: 'trauma-healing',
      title: 'Healing Trauma: What is EMDR and How Does it Function?',
      date: 'April 15, 2026',
      category: 'Specialized Care',
      summary: 'Trauma and PTSD can leave our nervous system permanently on high alert. Eye Movement Desensitization and Reprocessing (EMDR) offers a targeted way back.',
      readTime: '8 min read',
      content: `When a traumatic event occurs, the brain struggle to process it normally. Instead, the sights, physical sounds, and panic of the trauma remain raw and stuck in their original neurological state. EMDR therapy helps desensitize these memory networks.

### Bilateral Stimulation
By utilizing rapid eye movements, hand taps, or audio tones, we alternate brain activity between the left and right hemispheres. This mimics the natural integration processes of REM sleep.

### Resolving the Pain
Over several sessions, the emotional intensity of the traumatic memory decreases. You will always remember what occurred, but the painful physiological panic of PTSD—the shaking, chest tightness, and sudden flash flashbacks—subside.

You do not have to carry the heavy burden of trauma alone.`,
      order: 2,
    },
  ];
  for (const post of blogPosts) {
    await prisma.blogPost.create({ data: post });
  }
  console.log('✅ Blog posts created (' + blogPosts.length + ')');

  // ─── Testimonials ────────────────────────────────────────────────────────────
  const testimonials = [
    { name: 'Sarah Jenkins', gender: 'female', text: "Tania provided me with the most safe and comfortable space I've ever experienced in therapy. I truly feel heard.", role: 'Client since 2021', order: 0 },
    { name: 'Michael R.', gender: 'male', text: 'Her approach is deeply empathetic. I was able to work through years of hidden trauma at my own pace.', role: 'Client since 2022', order: 1 },
    { name: 'Emily W.', gender: 'female', text: 'The perfect balance of professionalism and human connection. I highly recommend her services to anyone seeking true healing.', role: 'Client since 2023', order: 2 },
  ];
  for (const testimonial of testimonials) {
    await prisma.testimonial.create({ data: testimonial });
  }
  console.log('✅ Testimonials created (' + testimonials.length + ')');

  // ─── FAQs ────────────────────────────────────────────────────────────────────
  const faqs = [
    { question: 'What should I expect during the first session?', answer: "The first session is an initial consultation where we will discuss your background, what brings you to therapy, and your goals. It's a space for us to get to know each other and determine if we are a good fit for working together.", order: 0 },
    { question: 'How much do sessions cost and do you take insurance?', answer: "Individual therapy sessions are $150 per 60-minute hour. Currently, I am an out-of-network provider, which means I do not directly bill insurance. However, I can provide you with a 'superbill' that you can submit to your insurance company for potential reimbursement.", order: 1 },
    { question: 'Is what I share in therapy confidential?', answer: 'Yes, confidentiality is a cornerstone of the therapeutic relationship. Everything discussed in our sessions is legally and ethically confidential, with a few crucial exceptions relating to safety (such as risk of harm to yourself or others).', order: 2 },
    { question: 'How long does a typical therapy session last?', answer: 'A standard therapy session lasts for 60 minutes. EMDR sessions can sometimes be scheduled for 90 minutes depending on your specific needs and treatment plan.', order: 3 },
  ];
  for (const faq of faqs) {
    await prisma.fAQ.create({ data: faq });
  }
  console.log('✅ FAQs created (' + faqs.length + ')');

  // ─── Gallery Images ──────────────────────────────────────────────────────────
  const galleryImages = [
    { url: 'https://images.unsplash.com/photo-1544027993-37db48d8e6eb?auto=format&fit=crop&q=80&w=800', altText: 'Therapy room with natural light', order: 0 },
    { url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=800', altText: 'Peaceful meditation space', order: 1 },
    { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800', altText: 'Calm wellness environment', order: 2 },
    { url: 'https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?auto=format&fit=crop&q=80&w=800', altText: 'Nature-inspired healing space', order: 3 },
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
      address: 'Aktar Mansion, House 30, Flat 1/A, Ismail Lane, New Eskaton, Dhaka 1000',
      city: 'Dhaka',
      phone: '+880 1580 700 700',
      email: 'tr.subhashita@gmail.com',
      officeHours: '10:00 AM to 8:00 PM',
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
      tagline: 'Professional Bio',
      heading: 'Meet Tania Subhashita',
      bio1: "I hold my Honours and Master's degrees in Psychology from the <strong class=\"text-[#1C4751]\">University of Dhaka</strong>, followed by a Professional Master's in Clinical Social Work from the same esteemed institution. This dual academic background empowers me to bridge psychological insights and structural social dynamics.",
      bio2: "Over my years of private chamber practice, I have witnessed how traditional methods can sometimes feel rigid or sterile. Patients need both evidence-based scientific procedures and robust, non-judgmental human comfort.",
      quote: '\u201cA mental medical chart only tracks symptoms. Therapeutic alliance heals the actual human underneath those symptoms.\u201d',
      location: 'Dhaka & Online',
      experience: '10+ Years clinical focus',
    },
  });
  console.log('✅ About section created');

  // ─── Credentials ─────────────────────────────────────────────────────────────
  const credentials = [
    { title: 'CBT (Cognitive Therapy)', description: 'Licensed tools for breaking repetitive thinking traps, automatic panic triggers, school exam stress, and trauma.', order: 0 },
    { title: 'DBT (Dialectical Behavior)', description: 'Designed for emotional dysregulation, self-harm impulses, suicidal thoughts, and bipolar mood stabilization.', order: 1 },
    { title: 'EMDR Therapy protocols', description: 'Specialized neuroscience-based desensitization to gently process underlying trauma (PTSD) and abuse memories.', order: 2 },
    { title: 'Addiction Interventions', description: 'Advanced clinical training for complex chemical drug/alcohol abuse recovery, and digital behavioral dependency loop-reset.', order: 3 },
    { title: 'Mindfulness Meditation', description: 'Focus on emotional anchor mapping, parasympathetic somatic breathing exercises, and emotional grounding.', order: 4 },
    { title: 'Family & Couple Systems', description: 'Systemic counseling strategies focused on repairing deep relational scars, parental harmony, and sibling discord.', order: 5 },
  ];
  for (const cred of credentials) {
    await prisma.credential.create({ data: cred });
  }
  console.log('✅ Credentials created (' + credentials.length + ')');

  // ─── Methodology Steps ───────────────────────────────────────────────────────
  const methodologySteps = [
    { stepNumber: '01/', title: 'Empathetic Grounding', description: 'We start by establishing a safe container. Your trauma, chemical battles, shame, or grief is handled with absolute confidentiality and infinite human patience.', order: 0 },
    { stepNumber: '02/', title: 'Tailored Re-Patterning', description: 'Instead of standard cookie-cutter advice, we build a personalized recovery schema. We map your specific cognitive distortions and utilize clinical worksheets to dismantle them.', order: 1 },
    { stepNumber: '03/', title: 'Autonomous Sovereignty', description: 'The goal of therapy is for you to eventually become your own therapist. We secure relapse protocols so that you feel fully confident self-regulating through all future storms.', order: 2 },
  ];
  for (const step of methodologySteps) {
    await prisma.methodologyStep.create({ data: step });
  }
  console.log('✅ Methodology steps created (' + methodologySteps.length + ')');

  // ─── Assessment Questions ────────────────────────────────────────────────────
  const assessmentQuestions = [
    { text: 'I find myself lying awake for long periods due to running loops of stressful thoughts or future worries.', order: 0 },
    { text: 'I feel unusually defensive, angry, or prone to sudden irritability with friends or coworkers.', order: 1 },
    { text: 'I run to devices, gambling, food, or other quick cravings to escape heavy real-life pressures.', order: 2 },
    { text: 'Anxiety and fear have forced me to avoid specific social situations, speaking up, or attending exams.', order: 3 },
    { text: 'I struggle to make simple choices, regularly trapped in a cycle of overthinking and mental paralysis.', order: 4 },
    { text: 'I feel persistent exhaustion that sleep doesn\'t seem to cure, alongside a heaviness in my chest.', order: 5 },
  ];
  for (const q of assessmentQuestions) {
    await prisma.assessmentQuestion.create({ data: q });
  }
  console.log('✅ Assessment questions created (' + assessmentQuestions.length + ')');

  // ─── Assessment Score Bands ──────────────────────────────────────────────────
  const scoreBands = [
    { minScore: 0, maxScore: 1, emoji: '🌱', label: 'Subtle Tension', message: 'You are managing stress well, but there might be tiny pockets of unaddressed anxiety. Remember, taking counseling early acts as powerful preventative wellness.' },
    { minScore: 2, maxScore: 3, emoji: '⚠️', label: 'Moderate Burnout Strain', message: 'You are carrying a heavy workload and emotional burden. Some coping methods are starting to show friction. A single 1-on-1 counseling consultation could provide breakthrough tools to release this pressure.' },
    { minScore: 4, maxScore: 6, emoji: '🚨', label: 'High Strain Levels', message: 'You are wading through deep exhaustion or severe anxiety that is actively impacting personal relationships or sleep architecture. Please know that you do not have to struggle in silence. Placing yourself in safe hands can change everything.' },
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
