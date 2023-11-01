/**
 * Command line script for running the parser on a provided c input file.
 */
import {
  compile,
  compileToWat,
  testCompile,
  generate_C_AST,
  generate_WAT_AST,
  generate_processed_C_AST,
} from "./build/index.js";
import yargs from "yargs";
import * as fs from "fs";
import * as path from "node:path";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv))
  .usage("Usage: $0 command C_input_filepath [args]")
  .options({
    o: {
      type: "string",
      alias: "out",
      describe:
        'The file to output generated output to. Defaults to "output/wasm.out for compile, and output/ast.json for generate-ast"',
    },
  })
  .command("compile", "Compile the given input file to wasm")
  .command(
    "generate-c-ast",
    "Generate the initial C AST from parsing as a JSON file for visualisation"
  )
  .command(
    "generate-processed-c-ast",
    "Generate the processed C AST as a JSON file for visualisation"
  )
  .command(
    "generate-wat-ast",
    "Generate the WAT AST as a JSON file for visualisation"
  )
  .demandCommand(2).argv;

if (typeof argv._[1] === "undefined") {
  throw new Error(`No input file provided`);
}

if (!fs.existsSync(argv._[1])) {
  // file does not exist
  throw new Error(`File "${argv._[1]}" does not exist`);
}

const input = fs.readFileSync(argv._[1], "utf-8");

let outputFile;
let output;

if (argv._[0] === "compile") {
  outputFile = argv.o ? path.resolve(argv.o) : path.resolve("output/a.wasm");
  output = await compile(input);
  // create the output directory if output file path provided
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });

  fs.writeFileSync(outputFile, output);
  console.log(output);
} else {
  switch (argv._[0]) {
    case "compile":
      outputFile = argv.o
        ? path.resolve(argv.o)
        : path.resolve("output/a.wasm");
      output = compile(input);
      break;
    case "compile-to-wat":
      outputFile = argv.o ? path.resolve(argv.o) : path.resolve("output/a.wat");
      output = compileToWat(input);
      break;
    case "generate-c-ast":
      outputFile = argv.o
        ? path.resolve(argv.o)
        : path.resolve("output/c-ast.json");
      output = generate_C_AST(input);
      break;
    case "generate-processed-c-ast":
      outputFile = argv.o
        ? path.resolve(argv.o)
        : path.resolve("output/c-processed-ast.json");
      output = generate_processed_C_AST(input);
      break;
    case "generate-wat-ast":
      outputFile = argv.o
        ? path.resolve(argv.o)
        : path.resolve("output/wat-ast.json");
      output = generate_WAT_AST(input);
      break;
    case "test-compile":
      outputFile = argv.o ? path.resolve(argv.o) : path.resolve("output/a.wat");
      output = testCompile(input);
      break;
  }
  // create the output directory if output file path provided
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });

  fs.writeFileSync(outputFile, output);

  console.log(`Output saved to ${outputFile}`);
}
