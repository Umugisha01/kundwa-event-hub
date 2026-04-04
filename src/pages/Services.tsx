import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Volume2, Lightbulb, Layers, Check, ArrowRight } from "lucide-react";
import soundImg from "@/assets/sound-system.jpg";
import lightingImg from "@/assets/lighting-system.jpg";
import stageImg from "@/assets/stage-design.jpg";

const services = [
  {
    icon: Volume2,
    title: "Sound System",
    description: "Industry-leading audio solutions for concerts, conferences, and corporate events.",
    image: soundImg,
    packages: [
      { name: "Basic", price: "200,000 RWF", features: ["2 Main Speakers", "1 Subwoofer", "Basic Mixer", "2 Microphones"] },
      { name: "Professional", price: "500,000 RWF", features: ["4 Line Array Speakers", "2 Subwoofers", "Digital Mixer", "6 Microphones", "Monitor System"] },
      { name: "Premium", price: "1,200,000 RWF", features: ["8 Line Array Speakers", "4 Subwoofers", "Digital Console", "12 Microphones", "Full Monitor System", "Sound Engineer"] },
    ],
  },
  {
    icon: Lightbulb,
    title: "Lighting System",
    description: "Transform any venue with our professional lighting designs and equipment.",
    image: lightingImg,
    packages: [
      { name: "Basic", price: "150,000 RWF", features: ["8 PAR Lights", "2 Moving Heads", "Basic Controller", "Setup Included"] },
      { name: "Professional", price: "400,000 RWF", features: ["16 PAR Lights", "6 Moving Heads", "DMX Controller", "Haze Machine", "Lighting Designer"] },
      { name: "Premium", price: "900,000 RWF", features: ["32 PAR Lights", "12 Moving Heads", "Grand MA Controller", "Full Haze System", "LED Walls", "Lighting Designer"] },
    ],
  },
  {
    icon: Layers,
    title: "Stage Design",
    description: "Custom-built stages that make a statement and captivate your audience.",
    image: stageImg,
    packages: [
      { name: "Basic", price: "300,000 RWF", features: ["4x3m Stage", "Basic Backdrop", "Truss Structure", "Setup & Teardown"] },
      { name: "Professional", price: "800,000 RWF", features: ["8x6m Stage", "Custom Backdrop", "Full Truss System", "LED Screen", "Setup & Teardown"] },
      { name: "Premium", price: "2,000,000 RWF", features: ["12x8m Stage", "Custom Design", "Full Truss & Rigging", "LED Video Wall", "Wings & Extensions", "Production Manager"] },
    ],
  },
];

const ServicesPage = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Our Services</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">Professional Event Solutions</h1>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto">
            From intimate corporate gatherings to massive concerts, we deliver world-class production.
          </p>
        </div>
      </section>

      {/* Services */}
      {services.map((service, i) => (
        <section key={i} className={`section-padding ${i % 2 === 1 ? "bg-muted/50" : ""}`}>
          <div className="max-w-7xl mx-auto">
            <div className={`grid md:grid-cols-2 gap-12 items-center mb-12 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
              <div className={i % 2 === 1 ? "md:order-2" : ""}>
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <img src={service.image} alt={service.title} className="w-full h-64 md:h-80 object-cover" loading="lazy" width={800} height={600} />
                </div>
              </div>
              <div className={i % 2 === 1 ? "md:order-1" : ""}>
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                  <service.icon className="h-6 w-6 text-secondary-foreground" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-3">{service.title}</h2>
                <p className="text-muted-foreground mb-6">{service.description}</p>
                <Button className="btn-gold gap-2">
                  Custom Booking <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Packages */}
            <div className="grid md:grid-cols-3 gap-6">
              {service.packages.map((pkg, j) => (
                <div key={j} className={`card-premium p-6 ${j === 1 ? "ring-2 ring-secondary relative" : ""}`}>
                  {j === 1 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full">
                      Popular
                    </div>
                  )}
                  <h3 className="font-bold text-lg text-foreground mb-1">{pkg.name}</h3>
                  <p className="text-2xl font-bold text-foreground mb-4">{pkg.price}</p>
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((f, k) => (
                      <li key={k} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-secondary flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button className={j === 1 ? "btn-gold w-full" : "btn-navy w-full"}>
                    Book Now
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </Layout>
  );
};

export default ServicesPage;
