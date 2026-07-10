import React, { useState } from "react";
import { useCart, CartItem } from "@/contexts/CartContext";
import { 
  X, Trash2, ShoppingBag, CreditCard, Landmark, 
  Smartphone, Plus, Minus, ArrowRight, CheckCircle2, 
  Loader2, Calendar, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useTheme } from "@/contexts/ThemeContext";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { 
    items, removeFromCart, updateQuantity, clearCart, 
    cartSubtotal, cartTax, cartDelivery, cartTotal 
  } = useCart();

  const [checkoutStep, setCheckoutStep] = useState<"cart" | "payment" | "processing" | "success">("cart");
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "card">("momo");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [momoProvider, setMomoProvider] = useState<"mtn" | "airtel">("mtn");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  if (!isOpen) return null;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep("processing");
    setTimeout(() => {
      setCheckoutStep("success");
    }, 3500); // 3.5s simulated Momo USSD push
  };

  const handleSuccessClose = () => {
    clearCart();
    setCheckoutStep("cart");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className={`w-screen max-w-md transform transition-all duration-300 ${
          isDark 
            ? "bg-slate-950/95 border-l border-white/10 text-white" 
            : "bg-white/95 border-l border-black/10 text-slate-900"
          } backdrop-blur-xl flex flex-col shadow-2xl`}>
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-secondary" /> 
              {checkoutStep === "payment" ? "Select Payment" : "Your Cart"}
            </h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Contents */}
          {checkoutStep === "cart" && (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/35 stroke-[1.5]" />
                    <div>
                      <p className="font-bold text-lg">Your cart is empty</p>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                        Add event tickets, equipment rentals, or packages to get started.
                      </p>
                    </div>
                    <Button onClick={onClose} className="btn-gold rounded-xl px-6">
                      Browse Store
                    </Button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div 
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isDark 
                          ? "bg-white/[0.03] border-white/5 hover:border-white/10" 
                          : "bg-black/[0.02] border-black/5 hover:border-black/10"
                      }`}
                    >
                      <div className="flex gap-4">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-16 h-16 object-cover rounded-xl shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-sm truncate pr-2">{item.name}</h4>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                            item.type === "ticket" ? "bg-purple-500/10 text-purple-400" :
                            item.type === "rental" ? "bg-amber-500/10 text-amber-400" :
                            "bg-sky-500/10 text-sky-400"
                          }`}>
                            {item.type}
                          </span>

                          {/* Rental Details */}
                          {item.type === "rental" && (
                            <div className="mt-2 text-xs space-y-1 text-muted-foreground bg-muted/30 p-2 rounded-lg">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-secondary" />
                                <span>{item.days || 1} days rental ({item.startDate} to {item.endDate})</span>
                              </div>
                              <label className="flex items-center gap-2 mt-1 select-none cursor-pointer">
                                <Checkbox 
                                  checked={item.includeSetup}
                                  onCheckedChange={(checked) => {
                                    // Recalculate or store flag
                                  }}
                                  id={`setup-${item.id}`}
                                />
                                <span>Include Delivery & On-Site Setup</span>
                              </label>
                            </div>
                          )}

                          {/* Price & Quantity controls */}
                          <div className="flex items-center justify-between mt-3">
                            <span className="font-extrabold text-sm text-foreground">
                              {(item.price * (item.type === "rental" ? (item.days || 1) : 1)).toLocaleString()} RWF
                            </span>
                            <div className="flex items-center border border-border/40 rounded-lg overflow-hidden bg-muted/20">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1.5 hover:bg-muted/40 transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-3 text-xs font-bold">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1.5 hover:bg-muted/40 transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="p-6 border-t border-border/40 space-y-4">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-foreground">{cartSubtotal.toLocaleString()} RWF</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT (18% Local Sales Tax)</span>
                      <span className="font-semibold text-foreground">{cartTax.toLocaleString()} RWF</span>
                    </div>
                    {cartDelivery > 0 && (
                      <div className="flex justify-between">
                        <span>Setup & Delivery</span>
                        <span className="font-semibold text-foreground">{cartDelivery.toLocaleString()} RWF</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-border/40 pt-2 text-base font-extrabold text-foreground">
                      <span>Total Amount</span>
                      <span className="text-secondary">{cartTotal.toLocaleString()} RWF</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => setCheckoutStep("payment")} 
                    className="btn-gold w-full py-6 rounded-xl text-base gap-2 font-bold shadow-lg"
                  >
                    Proceed to Payment <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Checkout Payment Step */}
          {checkoutStep === "payment" && (
            <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
              <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                <div>
                  <h3 className="font-bold text-sm mb-3">Choose Payment Method</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("momo")}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                        paymentMethod === "momo" 
                          ? "border-secondary bg-secondary/10" 
                          : "border-border/40 hover:bg-muted/20"
                      }`}
                    >
                      <Smartphone className="h-6 w-6 text-secondary" />
                      <span className="text-xs font-bold">Mobile Money</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                        paymentMethod === "card" 
                          ? "border-secondary bg-secondary/10" 
                          : "border-border/40 hover:bg-muted/20"
                      }`}
                    >
                      <CreditCard className="h-6 w-6 text-secondary" />
                      <span className="text-xs font-bold">Credit/Debit Card</span>
                    </button>
                  </div>
                </div>

                {paymentMethod === "momo" ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground">Mobile Operator</Label>
                      <div className="grid grid-cols-2 gap-3 mt-1.5">
                        <button
                          type="button"
                          onClick={() => setMomoProvider("mtn")}
                          className={`py-2 px-4 rounded-lg border font-bold text-xs transition-all ${
                            momoProvider === "mtn" ? "border-amber-400 bg-amber-400/10 text-amber-500" : "border-border/40"
                          }`}
                        >
                          MTN MoMo
                        </button>
                        <button
                          type="button"
                          onClick={() => setMomoProvider("airtel")}
                          className={`py-2 px-4 rounded-lg border font-bold text-xs transition-all ${
                            momoProvider === "airtel" ? "border-red-400 bg-red-400/10 text-red-500" : "border-border/40"
                          }`}
                        >
                          Airtel Money
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="momoPhone" className="text-xs font-semibold text-muted-foreground">Mobile Phone Number</Label>
                      <Input
                        id="momoPhone"
                        required
                        placeholder="+250 78x xxx xxx"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNum" className="text-xs font-semibold text-muted-foreground">Card Number</Label>
                      <Input
                        id="cardNum"
                        required
                        placeholder="4000 1234 5678 9010"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="cardExp" className="text-xs font-semibold text-muted-foreground">Expiry Date</Label>
                        <Input
                          id="cardExp"
                          required
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardCvv" className="text-xs font-semibold text-muted-foreground">CVV/CVC</Label>
                        <Input
                          id="cardCvv"
                          required
                          placeholder="123"
                          type="password"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-muted/30 border border-border/20 flex gap-3 text-xs text-muted-foreground leading-relaxed">
                  <ShieldCheck className="h-5 w-5 text-secondary shrink-0" />
                  <span>Secure 256-bit encryption. Payment is processed securely through local bank aggregators.</span>
                </div>
              </form>

              <div className="pt-4 border-t border-border/40 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Due:</span>
                  <span className="font-extrabold text-secondary text-base">{cartTotal.toLocaleString()} RWF</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCheckoutStep("cart")}
                    className="w-full py-6 rounded-xl font-bold"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCheckoutSubmit}
                    disabled={paymentMethod === "momo" ? !phoneNumber : !cardNumber}
                    className="btn-gold w-full py-6 rounded-xl font-bold shadow-lg"
                  >
                    Pay Now
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Simulated Processing Step */}
          {checkoutStep === "processing" && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
              <Loader2 className="h-16 w-16 text-secondary animate-spin" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Simulating Payment...</h3>
                {paymentMethod === "momo" ? (
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    We sent a Mobile Money USSD push notification to your phone <span className="font-bold text-foreground">{phoneNumber}</span>. Please enter your PIN on your phone to complete payment.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    Authorizing card payment and performing 3D Secure verification...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Success Step */}
          {checkoutStep === "success" && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
              <CheckCircle2 className="h-20 w-20 text-emerald-400 stroke-[1.5] animate-bounce" />
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Payment Confirmed!</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  Your ticket details, rental logistics confirmation, and receipt invoices have been successfully dispatched via SMS and Email.
                </p>
              </div>
              <div className="w-full bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 font-bold text-sm">
                Generated Tickets QR Link Sent
              </div>
              <Button 
                onClick={handleSuccessClose}
                className="btn-gold w-full py-6 rounded-xl font-bold"
              >
                Return to Store
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
