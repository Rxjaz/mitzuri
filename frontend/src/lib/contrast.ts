//formula estandar de WCAG: luminancia relativa y relacion de contraste. Es
//pura y no toca el DOM, asi que sirve igual en el formulario y en un test

const WHITE = "#ffffff";

//umbral AA para texto normal. Por debajo, un color sobre blanco se lee mal
export const CONTRAST_AA = 4.5;

const parseHex = (hex: string): [number, number, number] | null => {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return null;

  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
};

const channelLuminance = (value: number): number => {
  const c = value / 255;

  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const relativeLuminance = ([r, g, b]: [number, number, number]): number => {
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
};

//devuelve `null` cuando alguno de los dos no es un hex de seis digitos: quien
//llama decide si eso es un error o simplemente un campo a medio escribir
export const contrastRatio = (
  foreground: string,
  background: string
): number | null => {
  const fg = parseHex(foreground);
  const bg = parseHex(background);

  if (!fg || !bg) return null;

  const lighter = Math.max(relativeLuminance(fg), relativeLuminance(bg));
  const darker = Math.min(relativeLuminance(fg), relativeLuminance(bg));

  return (lighter + 0.05) / (darker + 0.05);
};

//el acento se usa como texto sobre el fondo blanco del sitio, que es el caso
//que de verdad puede quedar ilegible
export const isLegibleOnWhite = (hex: string): boolean => {
  const ratio = contrastRatio(hex, WHITE);

  return ratio === null || ratio >= CONTRAST_AA;
};
