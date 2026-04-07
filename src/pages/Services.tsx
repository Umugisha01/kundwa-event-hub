import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  ArrowRight, ChevronRight, MessageSquare, Phone, Mail, Send
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { services, equipmentRentals } from "@/data/services";

const categories = [
  { title: "Event Production", color: "from-primary/80 to-primary" },
  { title: "Event Management", color: "from-secondary/80 to-secondary" },
  { title: "Corporate Events", color: "from-foreground/70 to-foreground/90" },
];

const groupedServices = categories.map((cat) => ({
  ...cat,
  items: services.filter((s) => s.category === cat.title),
}));

const ServicesPage = () => {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquirySubject, setInquirySubject] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });

  const openInquiry = (subject: string) => {
    setInquirySubject(subject);
    setInquiryOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Inquiry sent!", {
      description: "Our team will respond within 24 hours.",
    });
    setInquiryOpen(false);
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-primary text-primary-foreground section-padding overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-secondary font-semibold text-sm uppercase tracking-widest"
          >
            What We Offer
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mt-3 mb-5"
          >
            Our Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-primary-foreground/70 max-w-2xl mx-auto text-lg"
          >
            From production to management, we deliver world-class event experiences across Africa.
          </motion.p>
        </div>
      </section>

      {/* Service Categories */}
      {groupedServices.map((category, i) => (
        <section key={i} className={`section-padding ${i % 2 === 1 ? "bg-muted/40" : ""}`}>
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-10 items-center"
            >
              {/* Image */}
              <div className={i % 2 === 1 ? "md:order-2" : ""}>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                  <img
                    src={category.items[0]?.heroImage}
                    alt={category.title}
                    className="w-full h-72 md:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    width={800}
                    height={600}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-40`} />
                  <div className="absolute bottom-6 left-6 right-6">
                    <span className="text-white text-sm font-semibold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      {category.items.length} {category.items.length === 1 ? "service" : "services"} included
                    </span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className={i % 2 === 1 ? "md:order-1" : ""}>
                <span className="text-secondary font-semibold text-xs uppercase tracking-widest">
                  {`0${i + 1}`}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
                  {category.title}
                </h2>

                <div className="space-y-3 mb-6">
                  {category.items.map((item, j) => (
                    <Link
                      key={j}
                      to={`/services/${item.slug}`}
                      className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-secondary/50 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                          <item.icon className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.tagline}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-secondary transition-colors" />
                    </Link>
                  ))}
                </div>

                <Button
                  className="btn-gold gap-2"
                  onClick={() => openInquiry(category.title)}
                >
                  <MessageSquare className="h-4 w-4" /> Inquire About {category.title}
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      ))}

      {/* Equipment Rentals */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-secondary font-semibold text-sm uppercase tracking-widest">Equipment</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-3">Equipment Rentals</h2>
            <p className="text-primary-foreground/60 max-w-xl mx-auto">
              Premium event equipment available for rental — professionally maintained and delivered.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {equipmentRentals.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-2xl overflow-hidden group hover:bg-primary-foreground/10 transition-all duration-300"
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    loading="lazy"
                    width={800}
                    height={600}
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="h-4 w-4 text-secondary" />
                    <h3 className="font-semibold text-primary-foreground text-sm">{item.name}</h3>
                  </div>
                  <p className="text-xs text-primary-foreground/60 mb-4 line-clamp-2">{item.description}</p>
                  <Button
                    className="btn-gold w-full text-sm gap-1"
                    onClick={() => openInquiry(item.name)}
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Get Quote
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Dialog */}
      <Dialog open={inquiryOpen} onOpenChange={setInquiryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-secondary" /> Get a Quote
            </DialogTitle>
            <DialogDescription>
              For: <span className="text-secondary font-medium">{inquirySubject}</span>
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
              <Label className="text-foreground text-sm">Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+250 78 000 0000"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-foreground text-sm">Message *</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us about your event, date, venue, and requirements..."
                rows={3}
                className="mt-1"
              />
            </div>
            <Button className="btn-gold w-full gap-2" onClick={handleSubmit}>
              <Send className="h-4 w-4" /> Send Inquiry
            </Button>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <a href="tel:+250780000000" className="flex items-center gap-1 hover:text-secondary transition-colors">
                <Phone className="h-3 w-3" /> +250 78 000 0000
              </a>
              <a href="mailto:info@kundwaib.com" className="flex items-center gap-1 hover:text-secondary transition-colors">
                <Mail className="h-3 w-3" /> info@kundwaib.com
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ServicesPage;
