const YAML = require('yamljs');
const path = require('path');

try {
  console.log('Loading Swagger YAML...');
  const swaggerDocument = YAML.load(path.join(__dirname, 'docs/swagger/swagger.yaml'));
  
  console.log('✅ Swagger YAML loaded successfully');
  console.log('Title:', swaggerDocument.info.title);
  console.log('Version:', swaggerDocument.info.version);
  
  // Check tags
  if (swaggerDocument.tags) {
    console.log('Tags found:', swaggerDocument.tags.map(t => t.name));
  } else {
    console.log('❌ No tags found');
  }
  
  // Check paths
  if (swaggerDocument.paths) {
    const eventPaths = Object.keys(swaggerDocument.paths).filter(p => p.includes('/api/events'));
    console.log('Event paths found:', eventPaths.length);
    console.log('Event paths:', eventPaths);
  } else {
    console.log('❌ No paths found');
  }
  
  // Check schemas
  if (swaggerDocument.components && swaggerDocument.components.schemas) {
    const schemas = Object.keys(swaggerDocument.components.schemas);
    console.log('Schemas found:', schemas.length);
    console.log('Schemas:', schemas);
  } else {
    console.log('❌ No schemas found');
  }
  
} catch (error) {
  console.error('❌ Error loading Swagger YAML:', error.message);
  console.error('Stack:', error.stack);
}
