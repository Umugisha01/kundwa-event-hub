import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ArrowRight, ArrowLeft, Check, CalendarIcon, MapPin, Clock, ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getServiceBySlug, services } from "@/data/services";

const ServiceDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const service = getServiceBySlug(slug || "");

  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [date, setDate] = useState<Date>();
  const [duration, setDuration] = useState("");
  const [location, setLocation] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  if (!service) {
    return (
      <Layout>
        <div className="section-padding text-center min-h-[60vh] flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Service Not Found</h1>
          <p className="text-muted-foreground mb-6">The service you're looking for doesn't exist.</p>
          <Link to="/services">
            <Button className="btn-gold gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Services
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const openBooking = (pkgName?: string) => {
    setSelectedPackage(pkgName || service.name);
    setBookingOpen(true);
  };

  const handleSubmit = () => {
    if (!date || !duration || !location) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success(`Booking confirmed for ${selectedPackage}`, {
      description: `${format(date, "PPP")} • ${duration} • ${location}`,
    });
    setBookingOpen(false);
    setDate(undefined);
    setDuration("");
    setLocation("");
  };

  // Related services (same category, excluding current)
  const related = services.filter(
    (s) => s.category === service.category && s.slug !== service.slug
  );

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={service.heroImage}
            alt={service.name}
            className="w-full h-full object-cover"
            width={1920}
            height={800}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/50" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Services
            </Link>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-secondary/20 text-secondary text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full">
                {service.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-4">
              {service.name}
            </h1>
            <p className="text-xl text-primary-foreground/70 max-w-2xl mb-8">
              {service.tagline}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button className="btn-gold gap-2 text-base px-6 py-3" onClick={() => openBooking()}>
                Book Now <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 gap-2"
                onClick={() => document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" })}
              >
                View Packages
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Description + Features */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">About This Service</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              {service.description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {service.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-secondary" />
                  </div>
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl mb-3">
              <img
                src={service.galleryImages[activeImage]}
                alt={`${service.name} gallery`}
                className="w-full h-72 md:h-96 object-cover"
                width={800}
                height={600}
              />
            </div>
            <div className="flex gap-2">
              {service.galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "rounded-lg overflow-hidden border-2 transition-all w-20 h-14",
                    activeImage === i ? "border-secondary shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" width={80} height={56} />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="section-padding bg-muted/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-secondary font-semibold text-sm uppercase tracking-widest">Pricing</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-3">
              Choose Your Package
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Select the package that best fits your event. All packages include professional setup.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {service.packages.map((pkg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "card-premium p-7 flex flex-col",
                  pkg.popular && "ring-2 ring-secondary relative"
                )}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="font-bold text-xl text-foreground mb-1">{pkg.name}</h3>
                <p className="text-3xl font-bold text-foreground mb-5">{pkg.price}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {pkg.features.map((f, k) => (
                    <li key={k} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn("w-full gap-2", pkg.popular ? "btn-gold" : "btn-navy")}
                  onClick={() => openBooking(`${service.name} — ${pkg.name}`)}
                >
                  Book {pkg.name} <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-padding">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-secondary font-semibold text-sm uppercase tracking-widest">FAQ</span>
            <h2 className="text-3xl font-bold text-foreground mt-2">Common Questions</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {service.faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="card-premium px-6 border-none"
              >
                <AccordionTrigger className="text-foreground font-semibold text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Related Services */}
      {related.length > 0 && (
        <section className="section-padding bg-muted/40">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">Related Services</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  to={`/services/${rel.slug}`}
                  className="card-premium p-5 group hover:shadow-lg transition-all flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                    <rel.icon className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{rel.name}</h3>
                    <p className="text-xs text-muted-foreground">{rel.tagline}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-secondary transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Book {service.name}?</h2>
          <p className="text-primary-foreground/60 mb-8 text-lg">
            Get in touch today and let us make your event unforgettable.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="btn-gold gap-2 text-base px-8 py-3" onClick={() => openBooking()}>
              Book Now <ArrowRight className="h-4 w-4" />
            </Button>
            <Link to="/contact">
              <Button variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Book: {selectedPackage}</DialogTitle>
            <DialogDescription>
              Service: <span className="text-secondary font-medium">{service.category}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="mb-2 block">Event Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="duration" className="mb-2 block">Duration</Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input id="duration" placeholder="e.g., 4 hours, 2 days" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="location" className="mb-2 block">Location</Label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Input id="location" placeholder="e.g., Kigali Convention Centre" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>
            <Button className="btn-gold w-full gap-2" onClick={handleSubmit}>
              Confirm Booking <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ServiceDetailPage;
