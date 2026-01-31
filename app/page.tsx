import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import WhyUs from '@/components/WhyUs';
import Testimonials from '@/components/Testimonials';
import { getProductsAsync } from '@/lib/products-db';
import { getAllProductsFromData } from '@/lib/products';

export default async function Home() {
  const data = await getProductsAsync();
  const products = getAllProductsFromData(data).slice(0, 6);
  return (
    <>
      <Hero />
      <FeaturedProducts products={products} />
      <WhyUs />
      <Testimonials />
    </>
  );
}
