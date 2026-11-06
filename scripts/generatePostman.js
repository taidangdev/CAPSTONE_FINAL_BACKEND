import fs from 'fs';

const swagger = JSON.parse(fs.readFileSync('src/docs/swagger.json', 'utf8'));

const collection = {
  info: {
    _postman_id: 'cybermovie-capstone-api',
    name: 'CyberMovie API - Capstone Node.js',
    description: 'Bộ sưu tập đầy đủ 30 API quản lý phim, rạp và đặt vé cho Capstone Cybersoft.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [
    {
      key: 'baseUrl',
      value: 'https://capstone-final-backend-kvoe.onrender.com',
      type: 'string',
    },
    {
      key: 'accessToken',
      value: '',
      type: 'string',
    },
  ],
  item: [],
};

const folderMap = new Map();

for (const [routePath, methods] of Object.entries(swagger.paths)) {
  for (const [method, op] of Object.entries(methods)) {
    const tag = op.tags?.[0] || 'Chung';
    if (!folderMap.has(tag)) {
      folderMap.set(tag, {
        name: tag,
        item: [],
      });
    }

    const folder = folderMap.get(tag);
    const isAuth = !!op.security;

    const queryParams = (op.parameters || [])
      .filter((p) => p.in === 'query')
      .map((p) => ({
        key: p.name,
        value: String(p.default ?? (p.example !== undefined ? p.example : '')),
        description: p.description || '',
      }));

    const pathSegments = routePath.replace(/^\//, '').split('/');

    const requestItem = {
      name: op.summary || `${method.toUpperCase()} ${routePath}`,
      request: {
        method: method.toUpperCase(),
        header: [],
        url: {
          raw: '{{baseUrl}}' + routePath + (queryParams.length ? '?' + queryParams.map((q) => `${q.key}=${q.value}`).join('&') : ''),
          host: ['{{baseUrl}}'],
          path: pathSegments,
          query: queryParams,
        },
      },
    };

    if (isAuth) {
      requestItem.request.auth = {
        type: 'bearer',
        bearer: [
          {
            key: 'token',
            value: '{{accessToken}}',
            type: 'string',
          },
        ],
      };
    }

    // Body handling
    const bodyParam = (op.parameters || []).find((p) => p.in === 'body');
    const formParams = (op.parameters || []).filter((p) => p.in === 'formData');

    if (bodyParam && bodyParam.schema) {
      requestItem.request.header.push({
        key: 'Content-Type',
        value: 'application/json',
      });
      let sampleBody = {};
      if (bodyParam.schema.$ref) {
        const defName = bodyParam.schema.$ref.split('/').pop();
        const def = swagger.definitions[defName];
        if (def && def.properties) {
          for (const [propName, propVal] of Object.entries(def.properties)) {
            sampleBody[propName] = propVal.example !== undefined ? propVal.example : propVal.default || '';
          }
        }
      }
      requestItem.request.body = {
        mode: 'raw',
        raw: JSON.stringify(sampleBody, null, 2),
      };
    } else if (formParams.length > 0) {
      requestItem.request.body = {
        mode: 'formdata',
        formdata: formParams.map((p) => {
          if (p.type === 'file') {
            return {
              key: p.name,
              type: 'file',
              src: [],
              description: p.description || '',
            };
          }
          return {
            key: p.name,
            value: String(p.default !== undefined ? p.default : ''),
            type: 'text',
            description: p.description || '',
          };
        }),
      };
    }

    folder.item.push(requestItem);
  }
}

for (const folder of folderMap.values()) {
  collection.item.push(folder);
}

fs.writeFileSync('CyberMovie_API.postman_collection.json', JSON.stringify(collection, null, 2), 'utf8');
console.log('Successfully written CyberMovie_API.postman_collection.json');

