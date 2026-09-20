import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { legalConfig } from "@/lib/legal-config";

const description = "How Code The Robot collects, uses, shares and protects personal data.";
export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice | Code The Robot" },
      { name: "description", content: description },
      { property: "og:title", content: "Code The Robot Privacy Notice" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <LegalPage title="Privacy Notice" updated="18 September 2026">
      <LegalSection title="1. Data controller">
        <p>
          {legalConfig.businessName}, trading as Code The Robot, is the data controller. Postal
          address: {legalConfig.postalAddress}. Privacy requests can be sent to{" "}
          <a className="underline" href={`mailto:${legalConfig.email}`}>
            {legalConfig.email}
          </a>
          .
        </p>
      </LegalSection>
      <LegalSection title="2. Data we collect">
        <p>
          We may collect your name, email address, account identifiers, enrollment choices, learning
          goals, support messages, course-access status, device and browser information, IP address,
          and basic security and usage records. Paddle separately collects payment information
          needed to process purchases.
        </p>
      </LegalSection>
      <LegalSection title="3. Why we use it">
        <p>
          We use account and enrollment data to provide courses and fulfill our contract with you.
          We use security and limited usage data for our legitimate interests in protecting and
          improving the service. We use consent where required, and process records when needed to
          meet legal obligations.
        </p>
      </LegalSection>
      <LegalSection title="4. Who receives data">
        <p>
          Supabase provides authentication and database services; our hosting and infrastructure
          providers support application delivery; Paddle receives order data as Merchant of Record
          for purchases, tax, invoices and refunds. Data may also be disclosed to professional
          advisers or authorities where legally required. We do not sell personal data.
        </p>
      </LegalSection>
      <LegalSection title="5. Retention">
        <p>
          We keep account and course-access records while your account is active and for any
          additional period required for security, tax, dispute or legal purposes. Other data is
          deleted or anonymized when it is no longer needed.
        </p>
      </LegalSection>
      <LegalSection title="6. Your rights">
        <p>
          Depending on where you live, you may have rights to access, correct, delete, restrict or
          receive a copy of your data; object to certain processing; withdraw consent; and complain
          to a supervisory authority. To exercise a right or request account deletion, email{" "}
          <a className="underline" href={`mailto:${legalConfig.email}`}>
            {legalConfig.email}
          </a>
          . Applicable requests are normally answered within one month.
        </p>
      </LegalSection>
      <LegalSection title="7. International transfers">
        <p>
          Some providers may process data outside your country. Where UK or EEA data is transferred
          internationally, appropriate safeguards such as adequacy decisions or standard contractual
          clauses are used where required.
        </p>
      </LegalSection>
      <LegalSection title="8. Security">
        <p>
          We use appropriate technical and organizational measures, including access controls,
          encrypted connections and restricted administrative access. No online service can
          guarantee absolute security.
        </p>
      </LegalSection>
      <LegalSection title="9. Cookies and local storage">
        <p>
          We use essential browser storage for sign-in, security and checkout operation. If optional
          analytics or marketing tools are introduced, their use and preference controls will be
          disclosed before they are enabled where consent is required.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
