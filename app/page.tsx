import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import FeaturedProducts from '@/components/FeaturedProducts';
import WhyUs from '@/components/WhyUs';
import Testimonials from '@/components/Testimonials';
import { getProductsAsync } from '@/lib/products-db';
import { getAllProductsFromData } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const data = await getProductsAsync();
  const allProducts = getAllProductsFromData(data);
  return (
    <>
      <Hero />
      <Categories products={allProducts} />
      <FeaturedProducts products={allProducts.slice(0, 6)} />
      <WhyUs />
      <Testimonials />
    </>
  );
}
