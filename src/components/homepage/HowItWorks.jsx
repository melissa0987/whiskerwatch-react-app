 import '../../css/homepage/HowItWorks.css'; // Custom CSS

const HowItWorks = () => {
  const steps = [
    {
      step: "1",
      title: "Create Your Profile",
      description:
        "Sign up and tell us about yourself and your pets. Add photos and special care instructions.",
    },
    {
      step: "2",
      title: "Browse & Book",
      description:
        "Search for available pet sitters in your area and book services that fit your schedule.",
    },
    {
      step: "3",
      title: "Meet & Greet",
      description:
        "Connect with your chosen sitter before your booking for a meet and greet session.",
    },
    {
      step: "4",
      title: "Relax & Enjoy",
      description:
        "Go about your day knowing your pet is in loving, capable hands.",
    },
  ];

  return (
    <section className="how-it-works">
      <div className="container text-center">
        <h2>How It Works</h2>
        <p>Getting started with Whisker Watch is simple and straightforward.</p>
        <div className="steps-grid">
          {steps.map((item, index) => (
            <div key={index} className="step-card">
              <div className="step-circle">{item.step}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;