
const paws = Array.from({ length: 8 });

function MeowLoader() {
  return (
    <div className="meow-loader">
      <h2>Meow Loading...</h2>

      <div className="paw-track">
        {paws.map((_, index) => (
          <svg
            key={index}
            viewBox="0 0 50 50"
            className="paw"
            style={{ animationDelay: `${index * 0.35}s` }}
          >
            <ellipse cx="25" cy="33" rx="10" ry="8" fill="white" />
            <ellipse cx="12" cy="20" rx="5" ry="7" fill="white" transform="rotate(-25 12 20)" />
            <ellipse cx="23" cy="13" rx="5" ry="7" fill="white" />
            <ellipse cx="34" cy="17" rx="5" ry="7" fill="white" transform="rotate(25 34 17)" />
            <ellipse cx="41" cy="27" rx="4" ry="6" fill="white" transform="rotate(35 41 27)" />
          </svg>
        ))}
      </div>
    </div>
  );
}

export default MeowLoader;
