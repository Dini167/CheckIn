// Imported first by export-openapi.ts. Building the document does not touch the database,
// but the config module requires these values to exist.
process.env.DATABASE_URL ??= 'postgresql://unused:unused@localhost:5432/unused';
process.env.JWT_SECRET ??= 'only-used-to-export-the-openapi-document-000';
