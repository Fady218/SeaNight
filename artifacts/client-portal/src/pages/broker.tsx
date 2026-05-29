import { useState } from "react";
import { useLocation } from "wouter";
import {
  DollarSign, Users, Shield, TrendingUp, CheckCircle,
  Star, ChevronRight, Anchor, Phone, Mail, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";

export default function BrokerPage() {
  const [, navigate] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", city: "", experience: "", portfolio: ""
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const earnings = [
    { bookings: 5, avgValue: 3000, monthly: 450 },
    { bookings: 15, avgValue: 3000, monthly: 1350 },
    { bookings: 30, avgValue: 3500, monthly: 3150 },
    { bookings: 60, avgValue: 4000, monthly: 7200 },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-gray-900 via-blue-950 to-cyan-900 py-24 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-20 w-72 h-72 bg-cyan-500 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-sm px-4 py-2 rounded-full mb-6">
              <DollarSign className="w-4 h-4" /> Broker Partner Program
            </div>
            <h1 className="text-5xl font-bold text-white mb-5">
              Earn 3% on Every<br />
              <span className="text-cyan-400">Booking You Bring</span>
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
              Join SeaNight's exclusive broker network. Your existing client relationships are your biggest asset — we handle the platform, payments, and insurance.
            </p>
            <div className="flex gap-4 justify-center">
              <a href="#register">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 h-12 rounded-xl font-semibold">
                  Join as a Broker <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </a>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 px-8 rounded-xl">
                How it works
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">How the Broker Program Works</h2>
              <p className="text-gray-500 mt-2">Simple, transparent, no upfront cost</p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: "01", icon: "🤝", title: "Register", desc: "Apply to join the SeaNight broker network. Approval within 48 hours." },
                { step: "02", icon: "🏠", title: "Browse & Share", desc: "Access all verified listings. Share your unique referral link with clients." },
                { step: "03", icon: "📋", title: "Client Books", desc: "Your client books through your link. Payment is secured in escrow." },
                { step: "04", icon: "💸", title: "Get Paid", desc: "Receive 3% of the booking value — transferred within 3 days of checkout." },
              ].map((item) => (
                <div key={item.step} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-md shadow-cyan-100">
                    {item.icon}
                  </div>
                  <div className="text-xs font-bold text-cyan-500 mb-1">{item.step}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Earnings Calculator */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Your Earning Potential</h2>
              <p className="text-gray-500 mt-2">3% commission on every booking your clients make</p>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              {earnings.map((tier, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-6 text-center border ${
                    i === 2
                      ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-transparent shadow-xl shadow-cyan-200 scale-105"
                      : "bg-white border-gray-100 shadow-sm"
                  }`}
                >
                  <div className={`text-sm font-medium mb-3 ${i === 2 ? "text-white/80" : "text-gray-500"}`}>
                    {tier.bookings} bookings/mo
                  </div>
                  <div className={`text-3xl font-bold mb-1 ${i === 2 ? "text-white" : "text-gray-900"}`}>
                    {tier.monthly.toLocaleString()} EGP
                  </div>
                  <div className={`text-xs ${i === 2 ? "text-white/70" : "text-gray-400"}`}>
                    monthly earnings
                  </div>
                  {i === 2 && (
                    <div className="mt-3 bg-white/20 rounded-lg px-3 py-1 text-white text-xs font-semibold">
                      Most achievable
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-400 mt-4">Based on avg. booking value of 3,000–4,000 EGP/night × 3 nights</p>
          </div>
        </section>

        {/* Why SeaNight */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Why Brokers Choose SeaNight</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Shield className="w-6 h-6 text-cyan-600" />,
                  title: "Insurance-Backed Trust",
                  desc: "Every property is covered by GIS Insurance up to 30,000 EGP. Your clients book with confidence — no more disputes about damages.",
                },
                {
                  icon: <DollarSign className="w-6 h-6 text-cyan-600" />,
                  title: "Transparent Commission",
                  desc: "3% per booking, no hidden fees. You see exactly what you earn before and after each booking is confirmed.",
                },
                {
                  icon: <TrendingUp className="w-6 h-6 text-cyan-600" />,
                  title: "Growing Inventory",
                  desc: "Starting with 25+ chalets in Ain Sokhna through Yalla Masayef. New destinations added monthly.",
                },
                {
                  icon: <Users className="w-6 h-6 text-cyan-600" />,
                  title: "Verified Platform",
                  desc: "National ID verification for all users means fewer no-shows and disputes. Your reputation is protected.",
                },
                {
                  icon: <Star className="w-6 h-6 text-cyan-600" />,
                  title: "Review System",
                  desc: "Build your broker reputation through transparent reviews. Top brokers get priority placement.",
                },
                {
                  icon: <CheckCircle className="w-6 h-6 text-cyan-600" />,
                  title: "Escrow Payments",
                  desc: "All payments via Fawry/InstaPay held in escrow. You get paid on time, every time, automatically.",
                },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Broker Stories</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  name: "Karim El Sayed",
                  city: "Cairo",
                  quote: "I've been doing WhatsApp bookings for 5 years. SeaNight gives me a proper platform with insurance — my clients actually trust me more now.",
                  earnings: "8,400 EGP/month",
                  bookings: 28,
                },
                {
                  name: "Nour Farouk",
                  city: "Alexandria",
                  quote: "The 3% is fair and paid reliably. I focus on bringing clients, SeaNight handles everything else. Exactly what I needed.",
                  earnings: "4,200 EGP/month",
                  bookings: 14,
                },
              ].map((t) => (
                <div key={t.name} className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
                  <div className="flex mb-3">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-gray-700 italic mb-4">"{t.quote}"</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {t.name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                        <div className="text-xs text-gray-400">{t.city}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-cyan-600">{t.earnings}</div>
                      <div className="text-xs text-gray-400">{t.bookings} bookings/mo</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Registration Form */}
        <section id="register" className="py-20 px-4 bg-gray-900">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Anchor className="w-5 h-5 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Become a SeaNight Broker</h2>
              <p className="text-gray-400">Fill in your details and we'll reach out within 48 hours.</p>
            </div>

            {submitted ? (
              <div className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 rounded-2xl p-10 text-center border border-cyan-700/30">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Application Received!</h3>
                <p className="text-gray-300 mb-6">We'll review your application and reach out to {form.email} within 48 hours.</p>
                <Button onClick={() => navigate("/listings")} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                  Browse Properties
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl p-8 border border-gray-700 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300 text-sm">Full Name *</Label>
                    <Input
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Ahmed El Masry"
                      className="mt-1.5 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm">Phone Number *</Label>
                    <Input
                      required
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="+20 10 0000 0000"
                      className="mt-1.5 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300 text-sm">Email Address *</Label>
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="ahmed@example.com"
                    className="mt-1.5 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300 text-sm">Based in *</Label>
                    <Select value={form.city} onValueChange={v => setForm({ ...form, city: v })}>
                      <SelectTrigger className="mt-1.5 bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Cairo", "Suez", "Alexandria", "Hurghada", "Sharm El Sheikh", "Other"].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm">Years in Real Estate *</Label>
                    <Select value={form.experience} onValueChange={v => setForm({ ...form, experience: v })}>
                      <SelectTrigger className="mt-1.5 bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Experience" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Less than 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"].map(e => (
                          <SelectItem key={e} value={e}>{e}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300 text-sm">Tell us about your client base</Label>
                  <Textarea
                    value={form.portfolio}
                    onChange={e => setForm({ ...form, portfolio: e.target.value })}
                    placeholder="e.g. I manage bookings for 50+ families from Cairo who summer in Ain Sokhna every year..."
                    className="mt-1.5 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 min-h-24"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white h-12 rounded-xl font-semibold"
                >
                  Submit Broker Application
                </Button>

                <p className="text-xs text-center text-gray-500">
                  By submitting you agree to SeaNight's broker terms. National ID verification required upon approval.
                </p>
              </form>
            )}
          </div>
        </section>

        {/* Footer CTA */}
        <div className="bg-gray-900 border-t border-gray-800 py-6 px-4 text-center">
          <p className="text-gray-500 text-sm">
            Questions? Contact us at{" "}
            <a href="mailto:brokers@seanight.com" className="text-cyan-400 hover:text-cyan-300">brokers@seanight.com</a>
            {" "}or WhatsApp{" "}
            <a href="tel:+201000000000" className="text-cyan-400 hover:text-cyan-300">+20 100 000 0000</a>
          </p>
        </div>
      </div>
    </div>
  );
}
