import { Layout } from "@/components/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { PortfolioPreview } from "@/components/home/PortfolioPreview";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import { Testimonials } from "@/components/home/Testimonials";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      
      <ServicesPreview />

      {/* Divider 1: Fades on Right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[1.5px] w-full bg-gradient-to-r from-secondary/40 via-secondary/10 to-transparent" />
      </div>

      <PortfolioPreview />

      {/* Divider 2: Fades on Left */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[1.5px] w-full bg-gradient-to-l from-secondary/40 via-secondary/10 to-transparent" />
      </div>

      <FeaturedEvents />

      {/* Divider 3: Fades on Right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[1.5px] w-full bg-gradient-to-r from-secondary/40 via-secondary/10 to-transparent" />
      </div>

      <Testimonials />
    </Layout>
  );
};

export default Index;
