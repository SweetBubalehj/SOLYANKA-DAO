const getRandomGradient = () => {
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const color1 = getRandomColor();
  const color2 = getRandomColor();
  const angle = Math.floor(Math.random() * 361);

  return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
};

export default getRandomGradient;