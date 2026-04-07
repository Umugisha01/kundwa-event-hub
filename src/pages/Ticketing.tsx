import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Ticket, CreditCard, Smartphone, CheckCircle2, QrCode, ArrowRight, Star, Crown, Users } from "lucide-react";

const ticketTypes = [
  {
    id: "standard",
    name: "Standard",
    price: "15,000 RWF",
    priceNum: 15000,
    icon: Ticket,
    color: "border-border",
    features: ["General admission", "Access to main stage", "Food court access"],
  },
  {
    id: "vip",
    name: "VIP",
    price: "50,000 RWF",
    priceNum: 50000,
    icon: Star,
    color: "border-secondary",
    features: ["Priority seating", "Backstage lounge", "Complimentary drinks", "Meet & greet"],
  },
  {
    id: "vvip",
    name: "VVIP",
    price: "120,000 RWF",
    priceNum: 120000,
    icon: Crown,
    color: "border-primary",
    features: ["Front-row reserved", "Private lounge", "Full catering", "Artist meet & greet", "Parking included"],
  },
];

const paymentMethods = [
  { id: "momo", name: "Mobile Money (MTN/Airtel)", icon: Smartphone },
  { id: "card", name: "Credit / Debit Card", icon: CreditCard },
];

export default function Ticketing() {
  const [step, setStep] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState("vip");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const chosen = ticketTypes.find((t) => t.id === selectedTicket)!;
  const total = chosen.priceNum * quantity;

  const handlePurchase = () => {
    if (!name || !email) return;
    setShowConfirmation(true);
  };

  const ticketCode = `KIB-${Date.now().toString(36).toUpperCase()}`;

  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-primary py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--secondary)/0.15),transparent_60%)]" />
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <span className="inline-block bg-secondary/20 text-secondary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Secure Checkout
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-3 font-heading">
            Get Your Tickets
          </h1>
          <p className="text-primary-foreground/70 max-w-xl mx-auto">
            Choose your experience, pay securely, and receive an instant digital ticket.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {["Select Ticket", "Your Details", "Payment"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step > i + 1
                    ? "bg-secondary text-secondary-foreground"
                    : step === i + 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > i + 1 ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:inline ${step === i + 1 ? "text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
              {i < 2 && <div className="w-8 md:w-16 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Step 1 — Ticket Selection */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Choose Your Experience</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {ticketTypes.map((t) => {
                const Icon = t.icon;
                const active = selectedTicket === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicket(t.id)}
                    className={`relative rounded-xl border-2 p-6 text-left transition-all ${
                      active
                        ? "border-secondary bg-secondary/5 shadow-lg scale-[1.02]"
                        : "border-border bg-card hover:border-secondary/40"
                    }`}
                  >
                    {t.id === "vip" && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-[10px] font-bold uppercase px-3 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                    <Icon className={`h-8 w-8 mb-3 ${active ? "text-secondary" : "text-muted-foreground"}`} />
                    <h3 className="text-lg font-bold text-foreground">{t.name}</h3>
                    <p className="text-2xl font-extrabold text-foreground mt-1">{t.price}</p>
                    <ul className="mt-4 space-y-2">
                      {t.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-secondary shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/50 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <Label className="text-sm font-medium text-foreground">Quantity</Label>
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1.5 text-foreground hover:bg-muted">−</button>
                  <span className="px-4 py-1.5 font-bold text-foreground bg-card">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="px-3 py-1.5 text-foreground hover:bg-muted">+</button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-extrabold text-foreground">{total.toLocaleString()} RWF</p>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <Button className="btn-gold gap-2" onClick={() => setStep(2)}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 — Details */}
        {step === 2 && (
          <div className="max-w-lg mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Your Details</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-foreground">Full Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="mt-1" />
              </div>
              <div>
                <Label className="text-foreground">Email *</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className="mt-1" />
              </div>
              <div>
                <Label className="text-foreground">Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250 78 000 0000" className="mt-1" />
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button className="btn-gold gap-2" onClick={() => { if (name && email) setStep(3); }}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 — Payment */}
        {step === 3 && (
          <div className="max-w-lg mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Payment Method</h2>

            {/* Summary */}
            <div className="bg-muted/50 rounded-xl p-5 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ticket</span>
                <span className="font-medium text-foreground">{chosen.name} × {quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Attendee</span>
                <span className="font-medium text-foreground">{name}</span>
              </div>
              <div className="border-t border-border my-2" />
              <div className="flex justify-between">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-extrabold text-lg text-foreground">{total.toLocaleString()} RWF</span>
              </div>
            </div>

            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3 mb-8">
              {paymentMethods.map((pm) => {
                const Icon = pm.icon;
                return (
                  <label
                    key={pm.id}
                    className={`flex items-center gap-4 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      paymentMethod === pm.id ? "border-secondary bg-secondary/5" : "border-border bg-card hover:border-secondary/40"
                    }`}
                  >
                    <RadioGroupItem value={pm.id} />
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">{pm.name}</span>
                  </label>
                );
              })}
            </RadioGroup>

            {paymentMethod === "momo" && (
              <div className="mb-6">
                <Label className="text-foreground">Mobile Money Number</Label>
                <Input placeholder="+250 78 000 0000" className="mt-1" />
              </div>
            )}
            {paymentMethod === "card" && (
              <div className="space-y-4 mb-6">
                <div>
                  <Label className="text-foreground">Card Number</Label>
                  <Input placeholder="4242 4242 4242 4242" className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground">Expiry</Label>
                    <Input placeholder="MM/YY" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-foreground">CVC</Label>
                    <Input placeholder="123" className="mt-1" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button className="btn-gold gap-2" onClick={handlePurchase}>
                Pay {total.toLocaleString()} RWF
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Confirmation Dialog with QR */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              Ticket Confirmed!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <p className="text-muted-foreground text-sm">Your ticket has been booked successfully.</p>

            {/* QR Code placeholder */}
            <div className="mx-auto w-48 h-48 bg-foreground rounded-xl flex items-center justify-center">
              <div className="text-center">
                <QrCode className="h-24 w-24 text-background mx-auto" />
                <p className="text-background text-[10px] mt-1 font-mono">{ticketCode}</p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 text-left space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ticket</span>
                <span className="font-medium text-foreground">{chosen.name} × {quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium text-foreground">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Code</span>
                <span className="font-mono font-bold text-foreground">{ticketCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold text-foreground">{total.toLocaleString()} RWF</span>
              </div>
            </div>

            <Button className="btn-gold w-full" onClick={() => setShowConfirmation(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
