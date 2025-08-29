 
import '../../css/homepage/PetTypes.css'; // Custom CSS

const PetTypes = () => {
  const petTypes = [
    "Dogs",
    "Cats",
    "Birds",
    "Fish",
    "Rabbits",
    "Hamsters",
    "Guinea Pigs",
    "Reptiles",
    "Ferrets",
    "Chinchillas",
  ];

  return (
    <section className="pet-types">
      <div className="container text-center">
        <h2>We Care for All Types of Pets</h2>
        <p>
          From dogs and cats to birds and reptiles, our experienced sitters can
          care for pets of all kinds.
        </p>
        <div className="pet-list">
          {petTypes.map((petType, index) => (
            <span key={index} className="pet-tag">
              {petType}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PetTypes;