import '../../css/Hero.css'; // Custom CSS

 // Hero
const Hero = () => (
  <section className="hero">
    <div className="container text-center">
      <h1>Professional Pet Care, Whenever You Need It</h1>
      <p>
        Connect with trusted, verified pet sitters in your area. Give your furry friends 
        the love and care they deserve while you're away.
      </p>
      <div className="hero-actions">
        <button className="btn btn-primary">Find a Pet Sitter</button>
        <button className="btn btn-success">Become a Sitter</button>
      </div>
    </div>
  </section>
);



export default Hero;