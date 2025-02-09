import { useState } from 'react';
import Banner from "@/components/Home/Banner/Banner";
import Products from "@/components/Home/Products/Products";
import Benefits from "@/components/Home/Benefits/Benefits";
import './HomeView.css';

function HomeView() {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <main>
        <section className="hero-section">
          <Banner />
        </section>
        <section className="benefits-section"></section>
        <section>
          <Benefits />
        </section>
        <section className="products-section">
          <Products />
        </section>
      </main>
    </div>
  );
}

export default HomeView;
