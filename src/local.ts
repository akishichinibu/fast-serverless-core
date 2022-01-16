// import path from 'path';
// import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify';

// import { scanFiles, importAsController } from './scan';
// import { metaDataCollection, serviceClzCollection } from './decorators/collection';
// import { wrapper } from './wrapper';

// const server: FastifyInstance = Fastify({});

// export async function register() {
//   for await (const { path: p, filename } of scanFiles(path.join(__dirname, '..', 'test', 'service'))) {
//     console.log('###', p);
//     const m = await importAsController(p);
//     console.log(m);
//   }

//   console.log('###2', serviceClzCollection);
//   console.log('###2', metaDataCollection);

//   serviceClzCollection.forEach((Model, endpointId) => {
//     const m = new Model();
//     const { endpointProps, handlersProps } = metaDataCollection.get(endpointId)!;

//     console.log(Model, endpointId, handlersProps, endpointProps);

//     Array.from(handlersProps).map(([methodName, handlerProps]) => {
//       const f = handlerProps.methodDescriptor.value.bind(m);

//       server.get(`/${'name'}`, {}, async (request, reply) => {
//         console.log(request.params);
//         console.log(request.query);
//         console.log(request.body);
//         return wrapper({ h: f, handlerProps, endpointProps })({
//           pathParameters: request.params,
//           queryParameters: request.query,
//           requestBody: request.body
//         });
//       });
//     });
//   });

//   const start = async () => {
//     try {
//       await server.listen(3000);
//     } catch (err) {
//       server.log.error(err);
//       process.exit(1);
//     }
//   };

//   start();
// }
