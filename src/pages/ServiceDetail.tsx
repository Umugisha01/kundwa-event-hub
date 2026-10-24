import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ArrowRight, ArrowLeft, Check, ChevronRight, MessageSquare, Phone, Mail, Send, Zap, AlertCircle, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveMediaUrl } from "@/config/api";
import * as Icons from "lucide-react";

// Helper component to render icon dynamically
const ServiceIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name] || Icons.Settings;
  return <IconComponent className={className} />;
};

const ServiceDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchServiceDetail = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("slug", slug);

      if (error) {
        setFetchError("Unable to retrieve service details from the server.");
        setService(null);
      } else if (data && data.length > 0) {
        const currentService = { ...data[0] };
        currentService.heroImage = resolveMediaUrl(currentService.image_url, "/assets/hero-event.jpg");
        const gallery = currentService.gallery_images && currentService.gallery_images.length > 0
          ? currentService.gallery_images.map((g: string) => resolveMediaUrl(g, currentService.heroImage))
          : [currentService.heroImage];
        currentService.galleryImages = gallery;
        currentService.features = currentService.features || [];
        currentService.highlights = currentService.highlights || [];
        currentService.faqs = currentService.faqs || [];
        
        setService(currentService);
        setActiveImage(0);

        // Fetch related services
        const { data: relatedData } = await supabase
          .from("services")
          .select("*")
          .eq("category", currentService.category);

        if (relatedData) {
          const mappedRelated = relatedData
            .filter((s: any) => s.slug !== currentService.slug)
            .map((s: any) => ({
              ...s,
              tagline: s.tagline || "",
              icon: s.icon || "Settings",
              heroImage: resolveMediaUrl(s.image_url, "/assets/hero-event.jpg")
            }));
          setRelated(mappedRelated);
        }
      } else {
        setService(null);
      }
    } catch {
      setFetchError("Unable to connect to services backend.");
      setService(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchServiceDetail();
  }, [fetchServiceDetail]);

  const handleInquiry = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill in your name, email, and phone number.");
      return;
    }
    setSubmitting(true);
    try {
      const notesContent = `[Service Inquiry for ${service?.name || "Service"}]
Client Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Message / Requirements: ${formData.message || "Requested custom quote"}`;

      // Insert directly into bookings
      const { error: bookingErr } = await supabase.from("bookings").insert({
        booking_type: "service",
        service_name: service?.name || "Service Inquiry",
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        notes: notesContent,
        status: "Pending",
        amount: 0
      });

      if (bookingErr) throw bookingErr;

      // Mirror to contact / inquiries
      try {
        await supabase.from("service_inquiries").insert({
          service_name: service?.name || "Service Inquiry",
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          message: formData.message || "Requested custom quote",
          status: "Pending"
        });
      } catch {
        // ignore
      }

      toast.success("Inquiry sent & added to bookings!", {
        description: "Our team will get back to you within 24 hours.",
      });
      setInquiryOpen(false);
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="section-padding text-center min-h-[60vh] flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-secondary mb-4"></div>
          <p className="text-muted-foreground">Loading service details...</p>
        </div>
      </Layout>
    );
  }

  if (!service) {
    return (
      <Layout>
        <div className="section-padding text-center min-h-[65vh] flex flex-col items-center justify-center max-w-lg mx-auto">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
            {fetchError ? <AlertCircle className="h-8 w-8 text-amber-500" /> : <Icons.Settings className="h-8 w-8 text-secondary" />}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {fetchError ? "Service Details Unavailable" : "Service Not Found"}
          </h1>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            {fetchError 
              ? "We are currently having trouble retrieving the service information. Please check your network connection or try again."
              : "The service you requested could not be located in our catalog. Browse our full list of event solutions or speak directly with our team."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/services">
              <Button className="btn-gold gap-2">
                <ArrowLeft className="h-4 w-4" /> All Services
              </Button>
            </Link>
            <Button variant="outline" onClick={() => fetchServiceDetail()} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
            <Link to="/contact">
              <Button variant="outline">
                Contact Team
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={service.heroImage} alt={service.name} className="w-full h-full object-cover" width={1920} height={800} />
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
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-4">{service.name}</h1>
            <p className="text-xl text-primary-foreground/70 max-w-2xl mb-8">{service.tagline}</p>
            <div className="flex flex-wrap gap-3">
              <Button className="btn-gold gap-2 text-base px-6 py-3" onClick={() => setInquiryOpen(true)}>
                <MessageSquare className="h-4 w-4" /> Get a Quote
              </Button>
              <Link to="/contact">
                <Button 
                  variant="ghost"
                  className="bg-secondary/15 hover:bg-secondary hover:text-slate-900 text-secondary border-2 border-secondary/60 font-bold text-base px-6 py-3 rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-105 gap-2 shadow-lg"
                >
                  <Phone className="h-4 w-4" /> Talk to Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Description + Gallery */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-foreground mb-4">About This Service</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">{service.description}</p>
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

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="rounded-2xl overflow-hidden shadow-2xl mb-3">
              <img src={service.galleryImages[activeImage]} alt={`${service.name} gallery`} className="w-full h-72 md:h-96 object-cover" width={800} height={600} />
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

      {/* Why Choose Us / CTA */}
      <section className="section-padding bg-muted/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-secondary font-semibold text-sm uppercase tracking-widest">Why Us</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
                Tailored to Your Event
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Every event is unique. That's why we don't do fixed packages — we craft a custom solution that fits your vision, venue, and budget. Talk to our team and get a personalized quote.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Zap, title: "Custom Solutions", desc: "Every setup is designed specifically for your event" },
                  { icon: MessageSquare, title: "Free Consultation", desc: "Discuss your needs with our experts at no cost" },
                  { icon: Phone, title: "Fast Response", desc: "Get a detailed quote within 24 hours" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Inline Inquiry Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl border border-border shadow-xl p-8"
            >
              <h3 className="text-xl font-bold text-foreground mb-1">Request a Quote</h3>
              <p className="text-sm text-muted-foreground mb-6">Fill in your details and we'll get back to you shortly.</p>
              <div className="space-y-4">
                <div>
                  <Label className="text-foreground text-sm">Full Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-foreground text-sm">Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-foreground text-sm">Phone / WhatsApp *</Label>
                  <Input
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+250 784 289 407"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-foreground text-sm">Tell us about your event</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={`I'm interested in ${service.name} for my upcoming event...`}
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <Button className="btn-gold w-full gap-2" disabled={submitting} onClick={handleInquiry}>
                  {submitting ? "Sending Inquiry..." : <><Send className="h-4 w-4" /> Send Service Inquiry</>}
                </Button>
                <div className="pt-2 border-t border-border/40 text-center space-y-2">
                  <p className="text-xs text-muted-foreground">Or connect with our production director immediately:</p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <a
                      href={`https://wa.me/250784289407?text=${encodeURIComponent(
                        `Hello Kundwa IB Group, I am interested in ${service.name} for my upcoming event.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-xs font-bold transition-colors border border-emerald-500/20"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Chat on WhatsApp
                    </a>
                    <a
                      href="tel:+250784289407"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 text-xs font-bold transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" /> Call +250 784 289 407
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
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
              <AccordionItem key={i} value={`faq-${i}`} className="card-premium px-6 border-none">
                <AccordionTrigger className="text-foreground font-semibold text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
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
                    <ServiceIcon name={rel.icon} className="h-6 w-6 text-secondary" />
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

      {/* Bottom CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Interested in {service.name}?</h2>
          <p className="text-primary-foreground/60 mb-8 text-lg">
            Get in touch today and let us make your event unforgettable.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="btn-gold gap-2 text-base px-8 py-3" onClick={() => setInquiryOpen(true)}>
              <MessageSquare className="h-4 w-4" /> Get a Quote
            </Button>
            <Link to="/contact">
              <Button 
                variant="ghost"
                className="bg-secondary/15 hover:bg-secondary hover:text-slate-900 text-secondary border-2 border-secondary/60 font-bold text-base px-8 py-3 rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-105 gap-2 shadow-lg"
              >
                <Phone className="h-4 w-4" /> Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Inquiry Dialog */}
      <Dialog open={inquiryOpen} onOpenChange={setInquiryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-secondary" /> Get a Quote
            </DialogTitle>
            <DialogDescription>
              Service: <span className="text-secondary font-medium">{service.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-foreground text-sm">Full Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-foreground text-sm">Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-foreground text-sm">Phone / WhatsApp *</Label>
              <Input
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+250 784 289 407"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-foreground text-sm">Message</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us about your event..."
                rows={3}
                className="mt-1"
              />
            </div>
            <Button className="btn-gold w-full gap-2" disabled={submitting} onClick={handleInquiry}>
              {submitting ? "Sending Inquiry..." : <><Send className="h-4 w-4" /> Send Service Inquiry</>}
            </Button>
            <div className="pt-2 border-t border-border/40 text-center space-y-2">
              <p className="text-xs text-muted-foreground">Or reach our team directly:</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <a
                  href={`https://wa.me/250784289407?text=${encodeURIComponent(
                    `Hello Kundwa IB Group, I am inquiring about ${service.name} for my event.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-xs font-bold transition-colors border border-emerald-500/20"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                </a>
                <a
                  href="tel:+250784289407"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 text-xs font-bold transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" /> Call +250 784 289 407
                </a>
                <a
                  href="mailto:info@kundwaib.com"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-foreground hover:bg-muted/80 text-xs font-bold transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" /> Email
                </a>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ServiceDetailPage;
