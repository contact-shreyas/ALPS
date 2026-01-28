// Map styles for day/night themes
export const mapStyles = {
  day: {
    base: [
      {
        elementType: "geometry",
        stylers: [{ color: "#f5f5f5" }]
      },
      {
        elementType: "labels.text.fill",
        stylers: [{ color: "#616161" }]
      }
    ],
    water: { color: "#b9d3c2" },
    overlay: { opacity: 0.7 }
  },
  night: {
    base: [
      {
        elementType: "geometry",
        stylers: [{ color: "#242f3e" }]
      },
      {
        elementType: "labels.text.fill",
        stylers: [{ color: "#746855" }]
      }
    ],
    water: { color: "#17263c" },
    overlay: { opacity: 0.85 }
  }
};