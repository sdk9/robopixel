import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";

const description = "The 30-day refund policy for RobotCodeHub course purchases.";
export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [
      { title: "Refund Policy | RobotCodeHub" },
      { name: "description", content: description },
      { property: "og:title", content: "RobotCodeHub Refund Policy" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Refunds,
});

function Refunds() {
  return (
    <LegalPage title="Refund Policy" updated="18 September 2026">
      <LegalSection title="30-day money-back guarantee">
        <p>
          If you are not satisfied with a paid RobotCodeHub course, you may request a full refund
          within 30 days of the order date. This voluntary guarantee is additional to any mandatory
          consumer rights that apply to you.
        </p>
      </LegalSection>
      <LegalSection title="How to request a refund">
        <p>
          Refunds are handled by our Merchant of Record, Paddle. Visit{" "}
          <a
            className="text-foreground underline"
            href="https://paddle.net"
            target="_blank"
            rel="noreferrer"
          >
            paddle.net
          </a>
          , provide the email address used at checkout and follow the support steps for your order.
        </p>
      </LegalSection>
      <LegalSection title="After approval">
        <p>
          When Paddle confirms an approved refund, access to the refunded paid course is removed.
          The time for funds to return to your payment method depends on Paddle, the payment method
          and your financial institution.
        </p>
      </LegalSection>
      <LegalSection title="Free courses">
        <p>
          The Ubuntu Linux, C++ and ROS 2 courses do not require payment, so no refund is applicable
          to them.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
