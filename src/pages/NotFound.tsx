import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { PageHeader, PageShell } from "@/components/ui/page-shell";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Seo title="Page Not Found" noindex />
      <PageShell>
        <Navbar />
        <PageHeader
          align="center"
          eyebrow="404"
          title="This page does not exist"
          description="The link may be broken, or the page may have moved."
        >
          <Link to="/">
            <Button className="h-11 rounded-lg bg-violet-600 px-5 text-white hover:bg-violet-500">
              Return home
            </Button>
          </Link>
        </PageHeader>
        <Footer />
      </PageShell>
    </>
  );
};

export default NotFound;

