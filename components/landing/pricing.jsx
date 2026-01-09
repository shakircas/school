import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { AnimatedSection } from "../animation/section";

export function PricingSection() {
  return (
    <AnimatedSection>
      <section id="pricing" className="py-24 bg-muted">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Simple Pricing</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Plan
              title="Starter"
              price="Free"
              features={["50 Students", "Basic Attendance", "Fee Tracking"]}
            />

            <Plan
              title="Professional"
              price="Rs. 2,500 / month"
              highlight
              features={[
                "Unlimited Students",
                "Fees + Installments",
                "Reports & Analytics",
                "Receipts & QR Verification",
              ]}
            />

            <Plan
              title="Enterprise"
              price="Custom"
              features={[
                "Multiple Campuses",
                "Custom Modules",
                "Priority Support",
              ]}
            />
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}

function Plan({ title, price, features, highlight }) {
  return (
    <Card className={highlight ? "border-primary shadow-lg scale-105" : ""}>
      <CardContent className="p-6 space-y-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-3xl font-bold">{price}</p>

        <ul className="space-y-2 text-sm">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              {f}
            </li>
          ))}
        </ul>

        <Button className="w-full mt-4">Get Started</Button>
      </CardContent>
    </Card>
  );
}
