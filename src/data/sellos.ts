export const sellos = ['✅', '🩺', '💊', '🏥', '❤️', '🩹', '🧬', '💉'];

export const elegirSelloDistinto = (actual: string, azar: () => number = Math.random) => {
  const otros = sellos.filter((sello) => sello !== actual);
  return otros[Math.floor(azar() * otros.length)];
};
