/**
 * Writes the OpenAPI document to docs/openapi.json (no database needed).
 *   npm run openapi:export
 */
import './export-openapi.env';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { buildOpenApiDocument } from '../src/common/openapi';
import { modules } from '../src/modules';

const doc = buildOpenApiDocument(modules);
const out = path.resolve(__dirname, '..', 'docs', 'openapi.json');
writeFileSync(out, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
console.log(`✅ Wrote ${Object.keys(doc.paths ?? {}).length} paths to ${out}`);
