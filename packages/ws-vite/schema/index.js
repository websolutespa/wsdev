import * as fs from 'fs';
import {
  SchemaGenerator,
  createFormatter,
  createParser,
  createProgram
} from 'ts-json-schema-generator';

run().then((schema) => {
  if (schema) {
    console.log('done');
  } else {
    console.log('nothing to do');
  }
});

async function run() {
  let schema;
  let options;
  try {
    /*
    const p = path.resolve("./src/index.ts");
    console.log("hello from", p);
    */
    options = {
      tsconfig: 'schema/tsconfig.json',
      path: 'schema/types/theme.ts',
      output: 'schema/theme.schema.json',
      type: 'ThemeSchemaJson', // Or <type-name> if you want to generate schema for that one type only
    };
    if (checkFile(options.path, options.output)) {
      schema = await exportSchema(options);
    }

    options = {
      tsconfig: 'schema/tsconfig.json',
      path: 'schema/types/main.ts',
      output: 'schema/main.schema.json',
      type: 'MainSchemaJson',
    };
    if (checkFile(options.path, options.output)) {
      schema = await exportSchema(options);
    }

    options = {
      tsconfig: 'schema/tsconfig.json',
      path: 'schema/types/page.ts',
      output: 'schema/page.schema.json',
      type: 'PageSchemaJson',
    };
    if (checkFile(options.path, options.output)) {
      schema = await exportSchema(options);
    }

  } catch (error) {
    console.log('error', error);
  }
  return schema;
}

async function writeJson(content, output) {
  let json = JSON.stringify(content, null, 2);
  json = json.replace(/"description": "/g, '"markdownDescription": "');
  json = json.replace(/\| \|/g, '|  \\n|');
  await writeFile(json, output);
  return json;
}

async function writeFile(content, output) {
  if (output) {
    await fs.promises.writeFile(output, content);
  }
}

function checkFile(input, output) {
  return lastMod(input) > lastMod(output);
}

function lastMod(filename) {
  if (fs.existsSync(filename)) {
    const { mtime, ctime } = fs.statSync(filename);
    return mtime;
  } else {
    return 0;
  }
}

async function getFileSize(filename) {
  const stats = await fs.promises.stat(filename);
  let size = stats.size;
  const units = ['bytes', 'Kb', 'Mb'];
  let unit = units.shift();
  while (size > 1024 && unit.length > 0) {
    size /= 1024;
    unit = units.shift();
  }
  return {
    ...stats,
    friendlySize: size.toFixed(2) + ' ' + unit,
  };
}

async function exportSchema({ output, ...config }) {
  console.log(config.type, '->', output);
  // We configure the formatter an add our custom formatter to it.
  const formatter = createFormatter(
    config,
    (fmt, circularReferenceTypeFormatter) => {
      /*
      // If your formatter DOES NOT support children, e.g. getChildren() { return [] }:
      fmt.addTypeFormatter(new MyFunctionTypeFormatter());
      // If your formatter DOES support children, you'll need this reference too:
      fmt.addTypeFormatter(new MyFunctionTypeFormatter(circularReferenceTypeFormatter));
      */
    }
  );

  const program = createProgram(config);
  const parser = createParser(program, config);
  const generator = new SchemaGenerator(program, parser, formatter, config);
  const schema = generator.createSchema(config.type);
  // console.log(schema);
  await writeJson(schema, output);
  const stats = await getFileSize(output);
  console.log(output, stats.friendlySize);
  return schema;
}
