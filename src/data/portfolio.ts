export interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  description: string;
  thumbnail: string;
  images: string[];
  videoUrl?: string;
  date: string;
  client?: string;
}

export const portfolioProjects: PortfolioProject[] = [
  {
    id: "1",
    title: "Corporate Gala 2025",
    category: "Corporate Events",
    description: "A stunning corporate gala featuring live entertainment, stage design, and professional sound system.",
    thumbnail: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=500&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800"
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    date: "February 2025",
    client: "Fortune 500 Company"
  },
  {
    id: "2",
    title: "Music Festival 2024",
    category: "Festivals",
    description: "Large-scale outdoor music festival with multiple stages, professional lighting, and sound engineering.",
    thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=500&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=800",
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800"
    ],
    videoUrl: "https://www.youtube.com/embed/9bZkp7q19f0",
    date: "August 2024",
    client: "Afrika Music Entertainment"
  },
  {
    id: "3",
    title: "Wedding Ceremony",
    category: "Weddings",
    description: "Elegant wedding ceremony with custom stage design, ambient lighting, and professional MC services.",
    thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
      "https://images.unsplash.com/photo-1525657323557-f91db820e0c5?w=800",
      "https://images.unsplash.com/photo-1537633552988-d49bbb6b9e1e?w=800"
    ],
    date: "June 2024",
    client: "Private Client"
  },
  {
    id: "4",
    title: "Trade Show Exhibition",
    category: "Exhibitions",
    description: "Professional trade show setup with interactive displays, professional lighting, and sound system.",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
      "https://images.unsplash.com/photo-1559027615-cd1628902ec4?w=800",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800"
    ],
    videoUrl: "https://www.youtube.com/embed/tYzD26wJnYk",
    date: "April 2024",
    client: "Tech Innovation Summit"
  },
  {
    id: "5",
    title: "Product Launch",
    category: "Product Events",
    description: "Exciting product launch with advanced visual projection, stage lighting, and brand activation.",
    thumbnail: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
      "https://images.unsplash.com/photo-1539571696357-5a69c006ae11?w=800"
    ],
    videoUrl: "https://www.youtube.com/embed/kffacxfA7g4",
    date: "March 2024",
    client: "TechCorp Industries"
  },
  {
    id: "6",
    title: "Concert Performance",
    category: "Concerts",
    description: "High-energy concert performance with professional stage setup, sound, and lighting effects.",
    thumbnail: "https://images.unsplash.com/photo-1478225143162-5577fbb1c158?w=500&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1478225143162-5577fbb1c158?w=800",
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",
      "https://images.unsplash.com/photo-1501142364523-641e6d016ad0?w=800"
    ],
    videoUrl: "https://www.youtube.com/embed/aqz-KE-bpKQ",
    date: "January 2024",
    client: "African Beats Records"
  }
];
