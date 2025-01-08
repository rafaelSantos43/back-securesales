import dotenv from "dotenv"
import express from "express"
import { ApolloServer } from "@apollo/server"
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import Jwt from "jsonwebtoken"
import cors from "cors"
import { createServer } from "http"
import mongoDB from "./src/db/mongoDB.js"
import resolvers from "./src/graphql/typeResolver.js";
import typeDefs from "./src/graphql/typeDefs.js";


mongoDB();
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const httpServer = createServer(app);

const schema = makeExecutableSchema({ typeDefs, resolvers });


const getFirebasePublicKeys = async () => {
  try {
    const response = await fetch(
      'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Firebase public keys:", error);
    throw error; // Rethrow the error to handle it upstream if needed
  }
};

const verifyFirebaseToken = async (token) => {
  const firebaseKeys = await getFirebasePublicKeys(); // Obtiene las claves públicas
  const decodedHeader = Jwt.decode(token, { complete: true }); // Decodifica el encabezado
  
  if (!decodedHeader || !decodedHeader.header) {
    throw new Error("Encabezado del token inválido");
  }
  
  const { kid } = decodedHeader.header; // Obtén el 'kid' del encabezado
  const key = firebaseKeys.keys.find((k) => k.kid === kid); // Encuentra la clave pública correspondiente
  
  if (!key) {
    throw new Error("Clave pública no encontrada para el token");
  }
  
  // Construye la clave pública en formato PEM
  const publicKey = `-----BEGIN CERTIFICATE-----\n${key.x5c[0]}\n-----END CERTIFICATE-----`;
  
  try {
    // Verifica el token usando la clave pública
    const decodedToken = Jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    });
    return decodedToken;
  } catch (error) {
    throw new Error("Token inválido o expirado");
  }
};

const server = new ApolloServer({
  schema,
  uploads: false,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanUp.dispose();
          },
        };
      },
    },
  ],
});

const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

const serverCleanUp = useServer({ schema }, wsServer);

const serverStart = async () => {
  await server.start()
  app.use(
    "/graphql",
    cors(),
    expressMiddleware(server, {
      context: async ({req}) => {    
        const authHeader = req?.headers?.authorization
        
        
        if (!authHeader) {
          console.error('No se proporcionó un token')
          throw new Error('Token no proporcionado')
        }
        try {
          const decodedToken = await verifyFirebaseToken(authHeader)
            //const decodedToken = Jwt.verify(authHeader, process.env.SECRET_KEY)
            req.user = decodedToken
            console.log("token verificado", decodedToken);
            
            return {user: decodedToken}
        } catch (error) {
         console.error('Token inválido o expirado', error.message);
          throw new Error('Token inválido o expirado');
        }
      },
    })
  );
};

const PORT = process.env.PORT || 4001;

httpServer.listen(PORT, () => {
  console.log(`El servidor se ejecuta en http://localhost:${PORT}/graphql`);
  console.log(
    `El servidor WebSocket se ejecuta en ws://localhost:${PORT}/graphql`
  );
});

serverStart();
 