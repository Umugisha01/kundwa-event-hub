import { Link } from "react-router-dom";
import { ArrowRight, Volume2, Lightbulb, Layers, Megaphone, Briefcase, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import concertImg from "@/assets/event-concert.jpg";
import corporateImg from "@/assets/event-corporate.jpg";
import heroImg from "@/assets/hero-event.jpg";

const categories = [
  {
    title: "Event Production",
    description: "Sound systems, lighting, and stage design — everything for a flawless show.",
    image: concertImg,
    items: [
      { icon: Volume2, label: "Sound System" },
      { icon: Lightbulb, label: "Lighting System" },
      { icon: Layers, label: "Stage Design" },
    ],
  },
  {
    title: "Event Management",
    description: "Branding, advertisement, and ticketing to fill your venue and build your brand.",
    image: corporateImg,
    items: [
      { icon: Sparkles, label: "Branding" },
      { icon: Megaphone, label: "Advertisement" },
    ],
  },
  {
    title: "Corporate Events",
    description: "Professional planning and execution for conferences, galas, and team-building.",
    image: heroImg,
    items: [
      { icon: Briefcase, label: "Full Service" },
    ],
  },
];

export function ServicesPreview() {
  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-secondary font-semibold text-sm uppercase tracking-widest">What We Do</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">Our Services</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            End-to-end event solutions tailored for Africa's growing entertainment industry.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="card-premium overflow-hidden group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  width={800}
                  height={600}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-foreground mb-2">{cat.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{cat.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {cat.items.map((item, j) => (
                    <span key={j} className="inline-flex items-center gap-1.5 text-xs font-medium bg-secondary/10 text-secondary px-2.5 py-1 rounded-full">
                      <item.icon className="h-3 w-3" /> {item.label}
                    </span>
                  ))}
                </div>
                <Link to="/services" className="inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:gap-2 transition-all">
                  Learn More <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/services">
            <Button className="btn-gold gap-2">
              View All Services <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
