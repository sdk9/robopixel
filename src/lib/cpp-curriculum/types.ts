// The C++17 curriculum: seven phases, each a list of lessons written as data.
export type Row = readonly [code: string, note: string];

export type CppSpec = {
  title: string;
  /** One-line summary shown in the track outline. */
  detail: string;
  time: string;
  concept: string[];
  /** Example with a note under every code line (build it with cpp / sh / cmake). */
  example: string;
  exercise: string;
};

export type CppPhase = {
  number: number;
  title: string;
  blurb: string;
  lessons: CppSpec[];
};

const join = (prefix: string, rows: Row[]) =>
  rows.flatMap(([line, note]) => (line === "" ? [] : [line, `${prefix} ${note}`])).join("\n");

/** C++ example: each row is [code line, note]; the note becomes a // comment under the line. */
export const cpp = (...rows: Row[]) => join("//", rows);
/** XML example (URDF, package.xml): the note becomes an XML comment under the line. */
export const xml = (...rows: Row[]) =>
  rows.flatMap(([line, note]) => (line === "" ? [] : [line, `<!-- ${note} -->`])).join("\n");
/** Shell / CMake example: the note becomes a # comment under the line. */
export const sh = (...rows: Row[]) => join("#", rows);
