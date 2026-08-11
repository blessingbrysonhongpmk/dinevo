import React from 'react';

export default function ProcessSteps() {
  return (
    <section className="section-pad">
      <div className="container-dv">
        <div className="dv-section-head">
          <div>
            <span className="eyebrow">Seamless 3-Step Flow</span>
            <h2 style={{ marginTop: 8 }}>Scan &middot; Choose &middot; Order</h2>
          </div>
        </div>
        <div className="dv-steps">
          <div className="dv-step">
            <span className="num">01</span>
            <h3>Scan Table QR</h3>
            <p>Point camera at the table QR code or enter your table code to connect to the restaurant table session instantly.</p>
          </div>
          <div className="dv-step">
            <span className="num">02</span>
            <h3>Browse & Select</h3>
            <p>Explore vibrant dishes, filter by categories, customize spice levels, choose add-ons and send orders to cart.</p>
          </div>
          <div className="dv-step">
            <span className="num">03</span>
            <h3>Order & Track</h3>
            <p>Submit orders directly to the kitchen and follow live preparation status right from your table in real time.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
