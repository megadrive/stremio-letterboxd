import { deleteAsync } from "del";

const globs = [
  ["./dist", "./web/dist"],
  ["./public/**/*", "!./public", "!./public/*.{png,svg}"],
  ["./web/.astro"],
];

const promises = globs.map((glob) => deleteAsync(glob));

Promise.all(promises).then(() => {
  console.log(
    "Working directories cleaned, consider removoing node_modules from ./ and ./web"
  );
});
