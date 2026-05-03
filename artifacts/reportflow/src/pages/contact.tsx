import { useState } from "react";
import { ArrowRight, Mail, MessageSquare, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <a href={basePath || "/"} className="flex items-center gap-2.5 mr-4">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">
              RF
            </div>
            <span className="font-bold text-lg tracking-tight">ReportFlow</span>
          </a>
          <nav className="hidden sm:flex items-center gap-5 text-sm text-muted-foreground">
            <a href={`${basePath}/about`} className="hover:text-foreground transition-colors">About</a>
            <a href={`${basePath}/contact`} className="text-foreground font-medium">Contact</a>
            <a href={`${basePath}/privacy`} className="hover:text-foreground transition-colors">Privacy</a>
          </nav>
          <div className="flex-1" />
          <a
            href={`${basePath}/sign-up`}
            className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Get started free
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Get in touch</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Have a question, need help, or want to give us feedback? We'd love to hear from you.
            Our team typically responds within one business day.
          </p>
        </div>
      </section>

      {/* Contact info cards */}
      <section className="py-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Mail,
              title: "Email us",
              desc: "hello@reportflow.app",
              sub: "For general enquiries",
            },
            {
              icon: MessageSquare,
              title: "Support",
              desc: "support@reportflow.app",
              sub: "For technical issues",
            },
            {
              icon: Clock,
              title: "Response time",
              desc: "Within 24 hours",
              sub: "Monday – Friday",
            },
          ].map((c) => (
            <div key={c.title} className="bg-card border rounded-xl p-5 text-center space-y-2">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mx-auto">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm">{c.title}</h3>
              <p className="text-sm font-medium">{c.desc}</p>
              <p className="text-xs text-muted-foreground">{c.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border rounded-2xl p-6 sm:p-8 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold">Message sent!</h2>
                <p className="text-muted-foreground">
                  Thanks for reaching out. We'll get back to you within one business day.
                </p>
                <Button variant="outline" onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", subject: "", message: "" }); }} className="mt-4">
                  Send another message
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-bold">Send us a message</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Fill in the form below and we'll get back to you as soon as possible.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full name <span className="text-destructive">*</span></Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address <span className="text-destructive">*</span></Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject <span className="text-destructive">*</span></Label>
                    <Select onValueChange={(v) => setFormData({ ...formData, subject: v })} required>
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="What is this about?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General enquiry</SelectItem>
                        <SelectItem value="support">Technical support</SelectItem>
                        <SelectItem value="billing">Billing question</SelectItem>
                        <SelectItem value="feature">Feature request</SelectItem>
                        <SelectItem value="bug">Bug report</SelectItem>
                        <SelectItem value="partnership">Partnership / business</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message <span className="text-destructive">*</span></Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help..."
                      className="min-h-[140px] resize-y"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={!formData.name || !formData.email || !formData.subject || !formData.message}>
                    Send message <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Built by */}
      <section className="py-10 px-4 sm:px-6 text-center">
        <div className="max-w-md mx-auto bg-muted/30 border rounded-xl p-6 space-y-2">
          <p className="text-sm text-muted-foreground">ReportFlow is built and maintained by</p>
          <p className="text-xl font-bold">LS DevCo</p>
          <p className="text-sm text-muted-foreground">
            A software development company building focused, high-quality web applications.
          </p>
          <a href={`${basePath}/about`} className="inline-block text-sm text-primary hover:underline font-medium mt-1">
            Learn more about us →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-xs">RF</div>
            <span>
              ReportFlow by <span className="font-semibold text-foreground">LS DevCo</span>
            </span>
          </div>
          <div className="flex gap-5">
            <a href={basePath || "/"} className="hover:text-foreground transition-colors">Home</a>
            <a href={`${basePath}/about`} className="hover:text-foreground transition-colors">About</a>
            <a href={`${basePath}/privacy`} className="hover:text-foreground transition-colors">Privacy</a>
          </div>
          <p>© 2026 LS DevCo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
