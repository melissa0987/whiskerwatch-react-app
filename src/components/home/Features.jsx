import { Shield, Heart, Calendar, MapPin } from "lucide-react";  

// Features
const Features = () => {
  const features = [
    {
      icon: <Shield size={48} color="#2563eb" />,
      title: "Trusted & Verified",
      description: "All pet sitters are thoroughly vetted and background-checked for your peace of mind."
    },
    {
      icon: <Heart size={48} color="#ef4444" />,
      title: "Loving Care",
      description: "Your pets receive personalized attention and care in the comfort of familiar surroundings."
    },
    {
      icon: <Calendar size={48} color="#16a34a" />,
      title: "Flexible Scheduling",
      description: "Book services that fit your schedule, from daily visits to extended stays."
    },
    {
      icon: <MapPin size={48} color="#7c3aed" />,
      title: "Local Network",
      description: "Find experienced pet sitters right in your neighborhood across the GTA."
    }
  ];

  return (
    <section className="features">
      <div className="container text-center">
        <h2>Why Choose Whisker Watch?</h2>
        <p>We make pet care simple, safe, and stress-free for both pets and owners.</p>
        <div className="grid">
          {features.map((feature, i) => (
            <div key={i} className="feature-card">
              {feature.icon}
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 