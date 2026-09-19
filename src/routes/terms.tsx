import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { legalConfig } from "@/lib/legal-config";

const description = "Terms and conditions for RobotCodeHub robotics courses.";
export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | RobotCodeHub" },
      { name: "description", content: description },
      { property: "og:title", content: "RobotCodeHub Terms & Conditions" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <LegalPage title="Terms & Conditions" updated="18 September 2026">
      <LegalSection title="1. Who these terms are with">
        <p>
          RobotCodeHub is operated by {legalConfig.businessName}, at {legalConfig.postalAddress}.
          When you use the site or enroll in a course, you contract with that operator. Questions
          can be sent to{" "}
          <a className="underline" href={`mailto:${legalConfig.email}`}>
            {legalConfig.email}
          </a>
          . You must be legally able to enter this agreement.
        </p>
      </LegalSection>
      <LegalSection title="2. The courses">
        <p>
          RobotCodeHub provides online educational materials about Ubuntu Linux, C++, ROS 2 and
          industrial robotics. Course material is educational and is not a substitute for
          manufacturer training, workplace risk assessment, qualified supervision or compliance with
          local safety law.
        </p>
      </LegalSection>
      <LegalSection title="3. Accounts">
        <p>
          You must provide accurate information, keep it current and protect your account
          credentials. You are responsible for activity under your account. Paid course access is
          personal, limited, non-exclusive and non-transferable.
        </p>
      </LegalSection>
      <LegalSection title="4. Payments">
        <p>
          Industrial Robots is sold as a one-time purchase. Our order process is conducted by our
          online reseller Paddle.com. Paddle.com is the Merchant of Record for all our orders.
          Paddle provides all customer service inquiries and handles returns. Payment, tax and
          refund mechanics are also governed by{" "}
          <a
            className="text-foreground underline"
            href="https://www.paddle.com/legal/checkout-buyer-terms"
            target="_blank"
            rel="noreferrer"
          >
            Paddle’s Buyer Terms
          </a>
          .
        </p>
      </LegalSection>
      <LegalSection title="5. Acceptable use">
        <p>
          You must not use the service unlawfully; commit fraud or send spam; infringe
          intellectual-property rights; distribute malware; probe, scrape or interfere with
          security; evade access controls; reverse engineer protected parts of the service; or
          resell or redistribute course materials without permission.
        </p>
      </LegalSection>
      <LegalSection title="6. Ownership">
        <p>
          The RobotCodeHub operator retains ownership of the site, course materials, software,
          documentation and branding. Enrollment grants only the personal course-use licence
          described above.
        </p>
      </LegalSection>
      <LegalSection title="7. Availability and safety">
        <p>
          We work to keep the service accurate and available but do not guarantee uninterrupted,
          error-free operation. Robotics can involve hazardous machinery. Follow official
          documentation, equipment manuals, applicable standards and qualified on-site safety
          procedures before operating physical equipment.
        </p>
      </LegalSection>
      <LegalSection title="8. Suspension and termination">
        <p>
          RobotCodeHub may suspend or terminate access for a material breach, non-payment, fraud or
          security risk, or repeated or serious policy violations. Access removed after an approved
          refund follows the Refund Policy.
        </p>
      </LegalSection>
      <LegalSection title="9. Liability">
        <p>
          To the fullest extent permitted by law, the service is provided without implied warranties
          of merchantability or fitness for a particular purpose. RobotCodeHub is not liable for
          indirect, consequential or special loss. Nothing limits liability where doing so is
          unlawful, including for fraud, death or personal injury caused by negligence.
        </p>
      </LegalSection>
      <LegalSection title="10. Changes">
        <p>
          These terms may be updated when the service or legal requirements change. The updated date
          will be shown above. Continued use after an update means acceptance of the revised terms.
        </p>
      </LegalSection>
      <LegalSection title="11. Governing law and disputes">
        <p>
          These terms are governed by {legalConfig.governingLaw}, without removing any mandatory
          consumer protections that apply where you live. Contact us first at{" "}
          <a className="underline" href={`mailto:${legalConfig.email}`}>
            {legalConfig.email}
          </a>{" "}
          so we can try to resolve a dispute.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
