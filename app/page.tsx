import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import FeaturedProducts from '@/components/FeaturedProducts';
import WhyUs from '@/components/WhyUs';
import Testimonials from '@/components/Testimonials';
import { getProductsAsync } from '@/lib/products-db';
import { getSettingsAsync } from '@/lib/settings-db';
import { getAllProductsFromData } from '@/lib/products';

// La page est rendue une fois puis servie depuis le cache, au lieu
// d'interroger Supabase à chaque visite. Le délai ci-dessous n'est qu'un
// filet de sécurité : toute écriture de l'admin invalide immédiatement le
// cache (revalidatePath dans app/api/products et app/api/settings), donc
// les ajouts de produits apparaissent sans attendre.
export const revalidate = 600;

export default async function Home() {
  const [data, settings] = await Promise.all([getProductsAsync(), getSettingsAsync()]);
  const allProducts = getAllProductsFromData(data, settings?.categories);
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
