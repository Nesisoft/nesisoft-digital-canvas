import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { Section } from "@/components/ui/section";
import { siteConfig } from "@/config/site";

// Bump whenever the policy text changes.
const LAST_UPDATED = "31 October 2026";

const { contact } = siteConfig;
const siteHost = siteConfig.url.replace(/^https?:\/\//, "");

/**
 * Plain-English privacy policy, written from what the site actually does:
 * contact + newsletter submissions via Web3Forms (or a mailto: fallback),
 * WhatsApp click-to-chat, an optional call-scheduling link (described
 * conditionally, so the text holds whether or not one is configured),
 * optional cookie-free Plausible analytics, and
 * third-party embeds (Google Maps, fonts, Unsplash images). Contact details
 * come from siteConfig so they stay in sync with the rest of the site.
 */
const Privacy = () => {
  return (
    <>
      <Seo
        title="Privacy Policy"
        description={`How ${siteConfig.name} collects, uses and protects the personal data you share through this website, and your rights under Ghana's Data Protection Act, 2012 (Act 843).`}
      />
      <PageShell>
        <Navbar />
        <PageHeader
          backTo="/"
          backLabel="Back to home"
          eyebrow="Legal"
          title="Privacy Policy"
          description="The short version: we only use your details to reply to you and to send updates you asked for. We never sell them, and the public site sets no cookies of its own."
        >
          <p className="text-sm text-slate-400">Last updated: {LAST_UPDATED}</p>
        </PageHeader>

        <Section className="pt-0" containerClassName="max-w-3xl">
          <article className="prose prose-lg prose-invert max-w-none prose-headings:scroll-mt-24 prose-headings:text-white prose-p:leading-8 prose-p:text-slate-300 prose-a:text-violet-300 prose-strong:text-white prose-li:text-slate-300 prose-li:marker:text-violet-300">
            <h2>Who we are</h2>
            <p>
              This website ({siteHost}) is run by {siteConfig.legalName}, a
              software development company based in {contact.location}. In this
              policy, "we", "us" and "our" mean {siteConfig.legalName}. We are
              responsible for the personal data collected through this site.
            </p>
            <p>
              You can reach us about anything in this policy at{" "}
              <a href={`mailto:${contact.emailGeneral}`}>
                {contact.emailGeneral}
              </a>{" "}
              or on{" "}
              <a href={contact.phonePrimary.href} className="whitespace-nowrap">
                {contact.phonePrimary.display}
              </a>
              .
            </p>

            <h2>What we collect and why</h2>
            <p>
              We only collect what you choose to send us, plus the basic
              technical information every website receives.
            </p>
            <ul>
              <li>
                <strong>Enquiries.</strong> When you use our{" "}
                <Link to="/contact">contact form</Link>, we receive your name,
                email address, the service you need and your message, plus
                anything optional you choose to add: your phone or WhatsApp
                number, company or organisation, budget range, timeline and
                how you heard about us. We use them to reply and to discuss
                your project. If the form can't send directly, it opens your
                own email app with your details filled in instead; nothing is
                sent until you press send there.
              </li>
              <li>
                <strong>Newsletter signups.</strong> If you subscribe on our{" "}
                <Link to="/blog">blog</Link>, we receive your email address and
                use it to send occasional updates. Reply to any of those emails
                to unsubscribe.
              </li>
              <li>
                <strong>Direct messages.</strong> If you email, call or
                WhatsApp us, we receive whatever you send, along with your
                email address or phone number, and use it to respond.
              </li>
              <li>
                <strong>Technical data.</strong> When your browser loads a
                page, the servers that deliver it receive standard information
                such as your IP address, browser and device type, and the page
                requested. Our hosting provider may record this in server logs,
                which are used to keep the site running and secure, not to
                identify you.
              </li>
            </ul>
            <p>
              We rely on your consent when you choose to send us your details,
              and on our legitimate interest in running and protecting this
              website.
            </p>

            <h2>Services we use</h2>
            <p>
              A few outside services help us run this site. Each one only
              receives what it needs to do its job, and handles it under its
              own privacy policy.
            </p>
            <ul>
              <li>
                <strong>Web3Forms</strong> delivers contact form and newsletter
                submissions to our inbox.
              </li>
              <li>
                <strong>Google Maps</strong> shows the map in our contact
                sections. When the map loads, Google receives your IP address
                and may set its own cookies.
              </li>
              <li>
                <strong>Google Fonts and Fontshare</strong> supply the fonts
                used on this site, so your browser requests them from their
                servers.
              </li>
              <li>
                <strong>Unsplash</strong> hosts some of the photos you see
                here, so your browser loads them from Unsplash's servers.
              </li>
              <li>
                <strong>Call scheduling.</strong> If you book a call through
                our scheduling link, that provider receives the details you
                enter, such as your name, email address and chosen time, and
                handles them under its own privacy policy.
              </li>
              <li>
                <strong>WhatsApp</strong> handles chats you start with our
                "WhatsApp us" button. Those conversations happen on WhatsApp
                and are covered by its own terms and privacy policy.
              </li>
              <li>
                <strong>Plausible Analytics</strong>, when enabled, counts
                visits and a few actions, such as form submissions and the
                type of service asked about. It does not use cookies and only
                gives us aggregate numbers, not who you are.
              </li>
            </ul>
            <p>
              Some of these providers are based outside Ghana, so your
              information may be processed in other countries.
            </p>

            <h2>Cookies</h2>
            <p>
              The public website does not set any cookies of its own, and we
              don't use advertising or tracking cookies. The only cookie we
              set is a session cookie that keeps our staff signed in to the
              admin area; visitors never receive it. The embedded Google Map
              may set Google's own cookies, which you can block in your
              browser settings without affecting the rest of the site.
            </p>

            <h2>How long we keep it</h2>
            <p>
              We keep enquiries and newsletter signups only as long as we need
              them to respond to you and for legitimate business records, then
              we delete them. If you unsubscribe from the newsletter, we stop
              sending it to you.
            </p>

            <h2>Who we share it with</h2>
            <p>
              We do not sell, rent or trade your personal data, and we don't
              use it for advertising. We only share it with the services
              listed above so they can do their job for us, or when the law
              requires it.
            </p>

            <h2>Keeping it safe</h2>
            <p>
              We take reasonable steps to protect the information you send us.
              The site is served over HTTPS, and the admin area requires a
              staff login. No method of sending data over the internet is
              completely secure, so please don't send passwords or payment
              details through our forms.
            </p>

            <h2>Your rights</h2>
            <p>
              Under Ghana's Data Protection Act, 2012 (Act 843), you can ask
              us to:
            </p>
            <ul>
              <li>
                <strong>Access</strong> the personal data we hold about you.
              </li>
              <li>
                <strong>Correct</strong> anything that is wrong or incomplete.
              </li>
              <li>
                <strong>Delete</strong> your details, unless we must keep them
                by law.
              </li>
              <li>
                <strong>Object</strong> to how we use your data, including
                asking us to stop sending you the newsletter.
              </li>
            </ul>
            <p>
              To make a request, email{" "}
              <a href={`mailto:${contact.emailGeneral}`}>
                {contact.emailGeneral}
              </a>{" "}
              with "Privacy request" in the subject line and tell us what you
              would like us to do. We may need to confirm your identity first,
              and we'll reply as soon as we can.
            </p>
            <p>
              If you're unhappy with how we've handled your data, please talk
              to us first. You also have the right to complain to Ghana's Data
              Protection Commission.
            </p>

            <h2>Children</h2>
            <p>
              This website is meant for businesses and adults. We don't
              knowingly collect personal data from children. If you think a
              child has sent us their details, contact us and we'll delete
              them.
            </p>

            <h2>Changes to this policy</h2>
            <p>
              We may update this policy as our website or services change.
              When we do, we'll change the "Last updated" date at the top of
              this page.
            </p>

            <h2>Contact us</h2>
            <p>
              Questions about this policy or your data? Email{" "}
              <a href={`mailto:${contact.emailGeneral}`}>
                {contact.emailGeneral}
              </a>{" "}
              or call{" "}
              <a href={contact.phonePrimary.href} className="whitespace-nowrap">
                {contact.phonePrimary.display}
              </a>
              . We're based in {contact.location}.
            </p>
          </article>
        </Section>

        <Footer />
      </PageShell>
    </>
  );
};

export default Privacy;
