import Banner from "@/components/Home/Banner/Banner";
import Products from "@/components/Home/Products/Products";
// import Deals from "@/components/Home/Products/Deals/Deals";
// import TopProducts from "@/components/Home/Products/TopProducts/TopProducts";
import Benefits from "@/components/Home/Benefits/Benefits";
import { useState } from 'react';
import PlaceholderImg from '../assets/images/placeholder-img.png';

function HomeView() {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <main>
        <section className="hero-section">
          <Banner></Banner>
        </section>
        <section className="benefits-section"></section>
        {/* <section className="filters-section">
          <Filters></Filters>
        </section> */}
        <section>
          <Benefits></Benefits>
        </section>
        <section className="products-section">
          <Products>
            {({ products }) => products.map((product) => (
              <div key={product.id}>
                <img 
                  src={product.image_url || PlaceholderImg} 
                  alt={product.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = PlaceholderImg;
                  }}
                />
              </div>
            ))}
          </Products>
        </section>
        {/* <section className="deals">
          <Deals></Deals>
        </section>
        <section className="top-products">
          <TopProducts></TopProducts>
        </section> */}
      </main>
    </div>
  );
}

export default HomeView;
