import {
  Brain, Heart, ShieldAlert, Fingerprint, Activity, Sparkles,
  Smartphone, Video, LifeBuoy, Wind, BookOpen, CloudRain,
  GitCommit, Users, Sunset, Smile, Moon, Baby, Flame, Eye,
  Clock, Home as HomeIcon, Compass, Award, Sparkle
} from 'lucide-react';

// Dynamic helper to map icon strings to Lucide components safely
export function DynamicServiceIcon({ iconName, className = "w-5 h-5" }: { iconName: string; className?: string }) {
  switch (iconName) {
    case 'Brain': return <Brain className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'ShieldAlert': return <ShieldAlert className={className} />;
    case 'Fingerprint': return <Fingerprint className={className} />;
    case 'Activity': return <Activity className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'SmartphoneOff': return <Smartphone className={className} />;
    case 'Sparkle': return <Sparkle className={className} />;
    case 'FlameKindling': return <Flame className={className} />;
    case 'Video': return <Video className={className} />;
    case 'LifeBuoy': return <LifeBuoy className={className} />;
    case 'Wind': return <Wind className={className} />;
    case 'BookOpen': return <BookOpen className={className} />;
    case 'CloudRain': return <CloudRain className={className} />;
    case 'GitCommit': return <GitCommit className={className} />;
    case 'Users': return <Users className={className} />;
    case 'Sunset': return <Sunset className={className} />;
    case 'Smile': return <Smile className={className} />;
    case 'Moon': return <Moon className={className} />;
    case 'Baby': return <Baby className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'Eye': return <Eye className={className} />;
    case 'Clock': return <Clock className={className} />;
    case 'Home': return <HomeIcon className={className} />;
    case 'Compass': return <Compass className={className} />;
    case 'Award': return <Award className={className} />;
    default: return <Sparkles className={className} />;
  }
}
