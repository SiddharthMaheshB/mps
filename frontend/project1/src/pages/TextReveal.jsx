import { useEffect, useRef, useState } from "react";
import "./TextReveal.css";

function TextReveal({ text, ClassName,imageUrl,imagePos="left",link="" }) {
  const words = text.split(" ");
  const [isRendered, setIsRendered] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isRendered) {
          setIsRendered(true);
        }
      },
      { threshold: 0.5 } 
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [isRendered]);

  if (!isRendered) {
    return <div ref={ref} style={{ height: "100px" }}></div>;
  }
  
  return (
    <div className="text-image-wrapper">
    {imageUrl && <img src={imageUrl} alt="Illustration" style={{float:`${imagePos}`}} className="text-reveal-image" />}
    <div ref={ref} className={ClassName}>
    {(() => {
  let isSubHeading = false;
  let heading = [];
  let description = [];

  words.forEach((word, index) => {
    if (word === "-") {
      isSubHeading = !isSubHeading;
      return;
    }

    const wordSpan = (
      <span
        key={index}
        className="word"
        style={{
          animationDelay: `${index * 0.09}s`,
          fontWeight: !isSubHeading ? "bold" : "normal",
          color: !isSubHeading ? "green" : "black",
          fontSize: !isSubHeading ? "1.9rem" : "1.5rem",
        }}
      >
        {word}{" "}
      </span>
    );

    if (!isSubHeading) heading.push(wordSpan);
    else description.push(wordSpan);
  });

  return (
    <div>
      <div style={{ display: "block" }}>{heading}</div>
      <div style={{ display: "block", marginTop: "0.3rem" }}>{description}</div>
    </div>
  );
})()}
    {link!=""&& <a href={link} className="cta-button">Get Started</a>} 
    </div>
    </div>
  );
}

export default TextReveal;
