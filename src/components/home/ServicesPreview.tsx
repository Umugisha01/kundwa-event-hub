import { Link } from "react-router-dom";
import { ArrowRight, Volume2, Lightbulb, Layers } from "lucide-react";
import soundImg from "@/assets/sound-system.jpg";
import lightingImg from "@/assets/lighting-system.jpg";
import stageImg from "@/assets/stage-design.jpg";

const services = [
  {
    icon: Volume2,
    title: "Sound System",
    description: "Professional audio solutions with crystal-clear sound for events of any scale.",
    image: soundImg,
  },
  {
    icon: Lightbulb,
    title: "Lighting System",
    description: "Stunning lighting designs that create the perfect atmosphere for your event.",
    image: lightingImg,
  },
  {
    icon: Layers,
    title: "Stage Design",
    description: "Custom stage designs that captivate audiences and elevate performances.",
    image: stageImg,
  },
];

export function ServicesPreview() {
  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">What We Do</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">Our Services</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            End-to-end event production solutions tailored for Africa's growing entertainment industry.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <div key={i} className="card-premium overflow-hidden group animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="relative h-48 overflow-hidden">
                <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" width={800} height={600} />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <div className="absolute bottom-3 left-3 w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <service.icon className="h-5 w-5 text-secondary-foreground" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-foreground mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                <Link to="/services" className="inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:gap-2 transition-all">
                  Learn More <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
