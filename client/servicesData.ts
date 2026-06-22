export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  category: "Mood & Emotion" | "Addiction & Behavior" | "Self & Relationships" | "Specialized Care";
  iconName: string;
}

export const SERVICES_LIST: ServiceItem[] = [
  {
    id: "psychotherapy",
    name: "Psychotherapy",
    description: "An in-depth therapeutic process to help you understand and resolve emotional and mental health challenges, fostering long-term well-being.",
    category: "Self & Relationships",
    iconName: "Brain"
  },
  {
    id: "depression",
    name: "Depression Support",
    description: "Support and therapeutic guidance to help you navigate feelings of sadness, hopelessness, and loss of interest, paving the way for a more positive outlook.",
    category: "Mood & Emotion",
    iconName: "Heart"
  },
  {
    id: "anxiety-disorder",
    name: "Anxiety Disorder",
    description: "Effective strategies and tools to manage and reduce feelings of worry, fear, and panic, helping you regain a sense of calm and control.",
    category: "Mood & Emotion",
    iconName: "ShieldAlert"
  },
  {
    id: "personality-disorder",
    name: "Personality Disorder",
    description: "Specialized therapy to help you understand and manage persistent thought and behavior patterns that cause distress and impact relationships.",
    category: "Specialized Care",
    iconName: "Fingerprint"
  },
  {
    id: "ocd",
    name: "OCD (Obsessive-Compulsive)",
    description: "Therapy focused on breaking the cycle of obsessive thoughts and compulsive behaviors to help you reclaim your life.",
    category: "Specialized Care",
    iconName: "Activity"
  },
  {
    id: "drug-addiction",
    name: "Drug Addiction",
    description: "Compassionate support and structured therapy to help you overcome substance dependency and build a healthy, sober life.",
    category: "Addiction & Behavior",
    iconName: "Sparkles"
  },
  {
    id: "behavioral-addiction",
    name: "Porn, Gambling, Sex & Device Addiction",
    description: "Targeted counseling to help you understand the root causes of behavioral addictions and develop healthier habits and coping mechanisms.",
    category: "Addiction & Behavior",
    iconName: "SmartphoneOff"
  },
  {
    id: "bipolar-disorder",
    name: "Bipolar Mood Disorder",
    description: "Guidance and support to help you manage extreme mood swings, promoting stability and improving your quality of life.",
    category: "Mood & Emotion",
    iconName: "Sparkle"
  },
  {
    id: "trauma",
    name: "Trauma (PTSD, ASD)",
    description: "Healing-centered therapy to process and recover from traumatic experiences, helping you move forward from post-traumatic stress.",
    category: "Specialized Care",
    iconName: "FlameKindling"
  },
  {
    id: "online-counselling",
    name: "Online Counselling",
    description: "Convenient and secure therapy sessions offered remotely, providing access to professional support from the comfort of your home.",
    category: "Specialized Care",
    iconName: "Video"
  },
  {
    id: "suicidal-thought",
    name: "Suicidal Thought Support",
    description: "A safe, confidential space to discuss thoughts of self-harm, providing immediate support and creating a path toward hope and recovery.",
    category: "Mood & Emotion",
    iconName: "LifeBuoy"
  },
  {
    id: "panic-disorder",
    name: "Panic Disorder & Phobia",
    description: "Techniques to manage sudden episodes of intense fear and reduce the avoidance behaviors associated with specific fears and phobias.",
    category: "Mood & Emotion",
    iconName: "Wind"
  },
  {
    id: "exam-phobia",
    name: "Exam Phobia Support",
    description: "Specialized support for students to overcome overwhelming fear and anxiety related to exams, boosting confidence and performance.",
    category: "Specialized Care",
    iconName: "BookOpen"
  },
  {
    id: "grief-management",
    name: "Grief Management",
    description: "A compassionate approach to help you navigate the complex emotions of loss and find a way to heal and cope.",
    category: "Mood & Emotion",
    iconName: "CloudRain"
  },
  {
    id: "indecisiveness",
    name: "Indecisiveness Care",
    description: "Guidance to help you build confidence in your decision-making, reducing self-doubt and promoting clarity.",
    category: "Self & Relationships",
    iconName: "GitCommit"
  },
  {
    id: "couple-counselling",
    name: "Couple Counselling",
    description: "Joint sessions to improve communication, resolve conflicts, and strengthen the bond between partners.",
    category: "Self & Relationships",
    iconName: "Users"
  },
  {
    id: "guilt-feeling",
    name: "Guilt Feeling Therapy",
    description: "Therapy to help you process and release feelings of excessive guilt, fostering self-forgiveness and emotional freedom.",
    category: "Mood & Emotion",
    iconName: "Sunset"
  },
  {
    id: "stress-management",
    name: "Stress Management",
    description: "Effective techniques to cope with daily pressures and major life stressors, helping you find balance and inner peace.",
    category: "Mood & Emotion",
    iconName: "Smile"
  },
  {
    id: "sleep-disorder",
    name: "Sleep Disorder Solution",
    description: "Strategies and behavioral therapy to help you improve sleep patterns and achieve restful, restorative sleep.",
    category: "Specialized Care",
    iconName: "Moon"
  },
  {
    id: "odd",
    name: "ODD (Oppositional Defiant)",
    description: "Support for both children and parents to manage defiance and behavioral issues, improving family harmony.",
    category: "Specialized Care",
    iconName: "Baby"
  },
  {
    id: "anger-management",
    name: "Anger Management",
    description: "Therapeutic tools to help you understand the triggers of anger and develop healthy ways to express and control it.",
    category: "Addiction & Behavior",
    iconName: "Flame"
  },
  {
    id: "social-anxiety",
    name: "Social Anxiety",
    description: "Support to overcome fear and self-consciousness in social situations, empowering you to connect with others more comfortably.",
    category: "Self & Relationships",
    iconName: "Eye"
  },
  {
    id: "procrastination",
    name: "Procrastination Therapy",
    description: "Therapy to help you understand and overcome the reasons behind procrastination, improving productivity and reducing stress.",
    category: "Addiction & Behavior",
    iconName: "Clock"
  },
  {
    id: "familiar-disharmony",
    name: "Familiar Disharmony",
    description: "Mediation and counseling to address conflicts within the family, promoting understanding and resolving disputes.",
    category: "Self & Relationships",
    iconName: "Home"
  },
  {
    id: "behavioral-therapy",
    name: "Behavioral Therapy",
    description: "A goal-oriented approach to identify and change problematic behaviors, focusing on practical solutions.",
    category: "Addiction & Behavior",
    iconName: "Compass"
  },
  {
    id: "social-skill",
    name: "Social Skill Management",
    description: "Guidance to help you develop the confidence and skills needed to navigate social interactions and build meaningful connections.",
    category: "Self & Relationships",
    iconName: "Award"
  }
];

export const STATISTICS = [
  { value: "1,560", label: "Therapy Sessions Every Year", detail: "Encompassing clinical assessments, in-depth CBT counseling, and personal follow-ups." },
  { value: "22", label: "Clients Supported Weekly", detail: "Dedicated direct contact hours for unhurried, private custom tailored sessions." },
  { value: "2,134", label: "Happy & Satisfied Clients", detail: "Individuals, couples, and family members who rediscovered light and peace." },
  { value: "10+", label: "Personalized Healing & Therapy Plans", detail: "Advanced custom templates targeted for anxiety, addiction recovery, and youth exam distress." }
];

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  content: string;
  readTime: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "cbt-steps",
    title: "Understanding CBT: How to Rewrite Negative Thought Patterns",
    date: "June 12, 2026",
    category: "Psychotherapy",
    summary: "Cognitive Behavioral Therapy (CBT) is one of the most effective tools for treating depression and anxiety. Discover the practical step-by-step methods you can run daily.",
    readTime: "5 min read",
    content: `Negative thought patterns, also known as cognitive distortions, can make us feel trapped in anxiety and distress. Cognitive Behavioral Therapy (CBT) provides an empirical, structured framework to identify and challenge these patterns.

### 1. Identifying the "Hot Thought"
The first step is noticing when your mood shifts. What did you say to yourself in that exact moment? Examples include "I always fail at everything" or "Everyone is judging me."

### 2. Gathering Evidence
In CBT, we act as scientists. We write down two columns:
- **Evidence that supports the thought**: Facts, actual occurrences.
- **Evidence that counteracts the thought**: Overlooked victories, alternative circumstances.

### 3. Creating an Alternative Perspective
By evaluating the evidence objectively, you can craft a balanced view. Instead of "I am totally useless," a balanced alternative is "I made a single mistake in this assignment, but I have completed many other assignments successfully in the past."

This unhurried practice helps lower the immediate fight-or-flight stress. Reach out today to see how CBT can support you.`
  },
  {
    id: "overcome-procrastination",
    title: "Procrastination and Emotional Regulation: Why We Avoid Tasks",
    date: "May 28, 2026",
    category: "Behavioral Therapy",
    summary: "Procrastination is rarely a time-management failure; it's a way of biological stress avoidance. Let's look at the emotional causes and how to heal. ",
    readTime: "7 min read",
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

Our custom behavioral therapy plans focus on rebuilding this mental stamina.`
  },
  {
    id: "trauma-healing",
    title: "Healing Trauma: What is EMDR and How Does it Function?",
    date: "April 15, 2026",
    category: "Specialized Care",
    summary: "Trauma and PTSD can leave our nervous system permanently on high alert. Eye Movement Desensitization and Reprocessing (EMDR) offers a targeted way back.",
    readTime: "8 min read",
    content: `When a traumatic event occurs, the brain struggle to process it normally. Instead, the sights, physical sounds, and panic of the trauma remain raw and stuck in their original neurological state. EMDR therapy helps desensitize these memory networks.

### Bilateral Stimulation
By utilizing rapid eye movements, hand taps, or audio tones, we alternate brain activity between the left and right hemispheres. This mimics the natural integration processes of REM sleep.

### Resolving the Pain
Over several sessions, the emotional intensity of the traumatic memory decreases. You will always remember what occurred, but the painful physiological panic of PTSD—the shaking, chest tightness, and sudden flash flashbacks—subside.

You do not have to carry the heavy burden of trauma alone.`
  }
];

export interface ClientProgram {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  details: string[];
  description: string;
  suitability: string;
}

export const PROGRAMS_LIST: ClientProgram[] = [
  {
    id: "anxiety-panic",
    title: "Anxiety & Panic Liberation Program",
    subtitle: "8-Week Guided Coping & Recovery Journey",
    duration: "8 Weekly Sessions (In-person or Online)",
    description: "A highly systemized program designed to dismantle panic attacks, quiet generalized anxiety, and arm you with concrete relaxation and somatic regulation tools.",
    details: [
      "Diagnostic and triggers mapping assessment",
      "Somatic nervous system soothing exercises (Box Breathing, vagus nerve stimulation)",
      "Cognitive Restructuring sheets and thought records",
      "Gradual safe exposure hierarchy planning",
      "Relapse prevention protocol manual"
    ],
    suitability: "Highly suitable for individuals experiencing sudden panic, social self-consciousness, or persistent worry."
  },
  {
    id: "addiction-reset",
    title: "Addictive Behavior Reset & Rebuild",
    subtitle: "12-Week Comprehensive Recovery Program",
    duration: "12 Weekly Sessions + Bi-weekly support calls",
    description: "Compassionate, structured therapeutic guidance targeting chemical or behavioral habits (substances, gambling, digital overconsumption, porn or sex addiction).",
    details: [
      "Trigger mapping and dopamine curve analysis",
      "Designing highly resilient positive replacement routines",
      "Underlying sadness or anxiety treatment focus",
      "Compulsion-urge surfing techniques",
      "Accountability milestones setup"
    ],
    suitability: "Suitable for anyone desiring to regain absolute autonomy from persistent, unwanted habits."
  },
  {
    id: "student-peak-mind",
    title: "Student Peak Confidence Program",
    subtitle: "4-Week Exam Phobia & Procrastination Breakthrough",
    duration: "4 Staged Weekly Sessions",
    description: "Designed specifically for students and young scholars struggling with debilitating exam tension, performance blockages, or chronic study delay.",
    details: [
      "Overcoming perfectionism and fear-of-failure cycles",
      "Interactive focus flow schedules and study warm-ups",
      "Anxiety calming techniques for use inside the examination hall",
      "Confidence anchoring and mindfulness strategies"
    ],
    suitability: "Highly suitable for school, college, or university students preparing for pivotal tests."
  }
];
