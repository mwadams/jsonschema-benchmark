import { registerSchema, validate } from "@hyperjump/json-schema/draft-2020-12";
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { performance } from 'perf_hooks';

await Promise.all([
  import("@hyperjump/json-schema/draft-2019-09"),
  import("@hyperjump/json-schema/draft-07"),
]);

function readJSONFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    process.exit(1);
  }
}

async function* readJSONLines(filePath) {
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
  });
  for await (const line of rl) {
    yield JSON.parse(line);
  }
}

async function validateSchema(schemaPath, instancePath) {
  const schema = readJSONFile(schemaPath);

  const schemaId = schema["$id"] || "https://example.com" + schemaPath;

  const compileStart = performance.now();
  registerSchema(schema, schemaId);
  const compiled = await validate(schemaId);
  const compileEnd = performance.now();
  const compileDurationNs = (compileEnd - compileStart) * 1e6;

  const instances = [];
  for await (const instance of readJSONLines(instancePath)) {
    instances.push(instance);
  }
  let failed = false;
  const startTime = performance.now();
  for (const instance of instances) {
    const output = compiled(instance);
    if (!output.valid) {
      failed = true;
    }
  }

  const endTime = performance.now();

  const durationNs = (endTime - startTime) * 1e6;
  console.log(durationNs.toFixed(0) + ',' + compileDurationNs.toFixed(0));

  // Exit with non-zero status on validation failure
  if (failed) {
    process.exit(1);
  }
}

if (process.argv.length !== 3) {
  process.exit(1);
}

const schemaPath = path.join(process.argv[2], "schema.json");
const instancePath = path.join(process.argv[2], "/instances.jsonl");

await validateSchema(schemaPath, instancePath);
