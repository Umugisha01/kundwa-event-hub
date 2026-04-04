import { Layout } from "@/components/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import { Testimonials } from "@/components/home/Testimonials";
import { StatsSection } from "@/components/home/StatsSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <StatsSection />
      <ServicesPreview />
      <FeaturedEvents />
      <Testimonials />
    </Layout>
  );
};

export default Index;
