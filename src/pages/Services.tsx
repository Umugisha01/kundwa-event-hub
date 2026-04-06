import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Check, ArrowRight, CalendarIcon, MapPin, Clock, ChevronRight, Monitor
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { services, equipmentRentals } from "@/data/services";

const ServicesPage = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [date, setDate] = useState<Date>();
  const [duration, setDuration] = useState("");
  const [location, setLocation] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  const openBooking = (item: string, category: string) => {
    setSelectedItem(item);
    setSelectedCategory(category);
    setBookingOpen(true);
  };

  const handleSubmit = () => {
    if (!date || !duration || !location) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success(`Booking confirmed for ${selectedItem}`, {
      description: `${format(date, "PPP")} • ${duration} • ${location}`,
    });
    setBookingOpen(false);
    setDate(undefined);
    setDuration("");
    setLocation("");
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
      {serviceCategories.map((category, i) => (
        <section key={i} className={`section-padding ${i % 2 === 1 ? "bg-muted/40" : ""}`}>
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`grid md:grid-cols-2 gap-10 items-center mb-14 ${i % 2 === 1 ? "" : ""}`}
            >
              {/* Image */}
              <div className={`${i % 2 === 1 ? "md:order-2" : ""}`}>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                  <img
                    src={category.image}
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
              <div className={`${i % 2 === 1 ? "md:order-1" : ""}`}>
                <span className="text-secondary font-semibold text-xs uppercase tracking-widest">
                  {`0${i + 1}`}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
                  {category.title}
                </h2>
                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  {category.description}
                </p>

                {/* Service items */}
                <div className="space-y-3 mb-6">
                  {category.items.map((item, j) => (
                    <div
                      key={j}
                      className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-secondary/50 hover:shadow-md transition-all group cursor-pointer"
                      onClick={() => openBooking(item.name, category.title)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                          <item.icon className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-secondary transition-colors" />
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    className="btn-gold gap-2"
                    onClick={() => openBooking(`Full ${category.title}`, category.title)}
                  >
                    Book {category.title} <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setExpandedCategory(expandedCategory === i ? null : i)}
                  >
                    {expandedCategory === i ? "Hide Packages" : "View Packages"}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Packages */}
            {expandedCategory === i && category.packages && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid md:grid-cols-3 gap-6 mt-4"
              >
                {category.packages.map((pkg, j) => (
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
                    <Button
                      className={j === 1 ? "btn-gold w-full" : "btn-navy w-full"}
                      onClick={() => openBooking(`${category.title} — ${pkg.name}`, category.title)}
                    >
                      Book {pkg.name}
                    </Button>
                  </div>
                ))}
              </motion.div>
            )}
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
              Premium event equipment available for daily rental — professionally maintained and delivered.
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
                  <p className="text-lg font-bold text-primary-foreground mb-3">
                    {item.price} <span className="text-xs text-primary-foreground/50 font-normal">RWF/day</span>
                  </p>
                  <Button
                    className="btn-gold w-full text-sm"
                    onClick={() => openBooking(item.name, "Equipment Rental")}
                  >
                    Rent Now
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Book: {selectedItem}</DialogTitle>
            <DialogDescription>
              Category: <span className="text-secondary font-medium">{selectedCategory}</span>
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
                <Input
                  id="duration"
                  placeholder="e.g., 4 hours, 2 days"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="location" className="mb-2 block">Location</Label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="e.g., Kigali Convention Centre"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
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

export default ServicesPage;
