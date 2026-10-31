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
      <Seo
        title="Page Not Found"
        description="This page doesn't exist or may have moved. Head back to Nesisoft to explore our web, mobile and custom software development services in Accra, Ghana."
        noindex
      />
      <PageShell>
        <Navbar />
        <PageHeader
          align="center"
          eyebrow="404"
          title="This page does not exist"
          description="The link may be broken, or the page may have moved."
        >
          <Button asChild className="h-11 rounded-lg bg-violet-600 px-5 text-white hover:bg-violet-500">
            <Link to="/">
              Return home
            </Link>
          </Button>
        </PageHeader>
        <Footer />
      </PageShell>
    </>
  );
};

export default NotFound;

