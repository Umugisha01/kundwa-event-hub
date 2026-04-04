import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Calendar, Check, Monitor, Lightbulb, Volume2, Layers } from "lucide-react";
import soundImg from "@/assets/sound-system.jpg";
import lightingImg from "@/assets/lighting-system.jpg";
import stageImg from "@/assets/stage-design.jpg";
import heroImg from "@/assets/hero-event.jpg";

const categories = ["All", "Screens", "Lighting", "Sound", "Stages"];

const equipment = [
  { name: "LED Screen 4x3m", category: "Screens", price: "150,000", image: heroImg, icon: Monitor, available: true },
  { name: "LED Screen 6x4m", category: "Screens", price: "250,000", image: heroImg, icon: Monitor, available: true },
  { name: "Moving Head Light x4", category: "Lighting", price: "80,000", image: lightingImg, icon: Lightbulb, available: true },
  { name: "PAR LED Set (16pcs)", category: "Lighting", price: "60,000", image: lightingImg, icon: Lightbulb, available: false },
  { name: "Line Array Speaker Set", category: "Sound", price: "200,000", image: soundImg, icon: Volume2, available: true },
  { name: "Digital Mixing Console", category: "Sound", price: "120,000", image: soundImg, icon: Volume2, available: true },
  { name: "Stage 4x3m Modular", category: "Stages", price: "180,000", image: stageImg, icon: Layers, available: true },
  { name: "Stage 8x6m Full", category: "Stages", price: "350,000", image: stageImg, icon: Layers, available: false },
];

const RentalsPage = () => {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? equipment : equipment.filter((e) => e.category === active);

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Equipment</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">Rent Equipment</h1>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto">
            Premium event equipment available for daily rental. All gear is professionally maintained.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={active === cat ? "default" : "outline"}
                className={active === cat ? "btn-gold" : ""}
                onClick={() => setActive(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((item, i) => (
              <div key={i} className="card-premium overflow-hidden group">
                <div className="relative h-40 overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" width={800} height={600} />
                  <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full ${item.available ? "bg-green-500/90 text-primary-foreground" : "bg-destructive/90 text-destructive-foreground"}`}>
                    {item.available ? "Available" : "Booked"}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="h-4 w-4 text-secondary" />
                    <h3 className="font-semibold text-foreground text-sm">{item.name}</h3>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-foreground">{item.price} <span className="text-xs text-muted-foreground font-normal">RWF/day</span></span>
                  </div>
                  <Button className="btn-gold w-full text-sm py-2" disabled={!item.available}>
                    {item.available ? "Rent Now" : "Unavailable"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default RentalsPage;
