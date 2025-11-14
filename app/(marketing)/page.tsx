import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Brain, FileSpreadsheet, TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FinModeler</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signin">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight">
          Financial Modeling for
          <span className="text-primary"> Early Stage Startups</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
          Build investor-ready financial projections without being an Excel
          ninja. Track MRR, burn rate, runway, and model multiple scenarios
          with AI-powered insights.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/auth/signin">
            <Button size="lg">Start Building</Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Everything You Need to Model Your Startup
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <TrendingUp className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Forward Projections</CardTitle>
                <CardDescription>
                  12-36 month projections with MRR, burn rate, runway, and cash
                  flow tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Revenue modeling with churn and expansion</li>
                  <li>• Cost structure with hiring plans</li>
                  <li>• Cash runway analysis</li>
                  <li>• Unit economics (LTV, CAC, payback)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Scenario Planning</CardTitle>
                <CardDescription>
                  Model multiple scenarios to understand best case, worst case,
                  and everything in between
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Base, Optimistic, Pessimistic scenarios</li>
                  <li>• Compare side-by-side</li>
                  <li>• Adjust growth rates and costs</li>
                  <li>• Fundraise impact modeling</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Brain className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>AI Assistant</CardTitle>
                <CardDescription>
                  Get instant answers about your model and recommendations to
                  improve your metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Ask questions about your burn rate</li>
                  <li>• Get benchmark comparisons</li>
                  <li>• Scenario recommendations</li>
                  <li>• Fundraising guidance</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileSpreadsheet className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Export Everything</CardTitle>
                <CardDescription>
                  Generate investor-ready outputs in Excel, CSV, and PDF
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Excel workbooks with all projections</li>
                  <li>• CSV for data analysis</li>
                  <li>• PDF summary reports</li>
                  <li>• Board-ready formats</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Multi-Tenant & Secure</CardTitle>
                <CardDescription>
                  Built for teams with proper workspace isolation and role-based
                  access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Team workspaces</li>
                  <li>• Owner, Editor, Viewer roles</li>
                  <li>• Audit logging</li>
                  <li>• Data privacy built-in</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stage-Appropriate</CardTitle>
                <CardDescription>
                  Tailored for pre-seed through Series A with industry benchmarks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• SaaS, marketplace, fintech models</li>
                  <li>• Stage-specific benchmarks</li>
                  <li>• Sanity checks on assumptions</li>
                  <li>• Best practices built-in</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">
          Simple, Transparent Pricing
        </h2>
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Starter</CardTitle>
              <CardDescription>Perfect for solo founders</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li>✓ 1 company model</li>
                <li>✓ 3 scenarios</li>
                <li>✓ 36-month projections</li>
                <li>✓ Excel & CSV exports</li>
                <li>✓ AI assistant</li>
                <li>✓ Email support</li>
              </ul>
              <Button className="mt-6 w-full" variant="outline">
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <div className="mb-2 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                POPULAR
              </div>
              <CardTitle className="text-2xl">Growth</CardTitle>
              <CardDescription>For growing startups and CFOs</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li>✓ Unlimited companies</li>
                <li>✓ Unlimited scenarios</li>
                <li>✓ 60-month projections</li>
                <li>✓ Excel, CSV & PDF exports</li>
                <li>✓ Advanced AI insights</li>
                <li>✓ Team collaboration (5 seats)</li>
                <li>✓ Priority support</li>
              </ul>
              <Button className="mt-6 w-full">Get Started</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Build Your Financial Model?
          </h2>
          <p className="mb-8 text-lg opacity-90">
            Join founders who are building better financial models in minutes,
            not days.
          </p>
          <Link href="/auth/signin">
            <Button size="lg" variant="secondary">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="font-bold">FinModeler</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Financial modeling made simple for early stage startups.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features">Features</Link>
                </li>
                <li>
                  <Link href="#pricing">Pricing</Link>
                </li>
                <li>
                  <Link href="#">Documentation</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#">About</Link>
                </li>
                <li>
                  <Link href="#">Blog</Link>
                </li>
                <li>
                  <Link href="#">Contact</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#">Privacy</Link>
                </li>
                <li>
                  <Link href="#">Terms</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            © 2024 FinModeler. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
