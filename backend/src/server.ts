import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import { initIO } from "./libs/socket";
import { logger } from "./utils/logger";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";
import Company from "./models/Company";
import { startQueueProcess } from "./queues";
import { TransferTicketQueue } from "./wbotTransferTicketQueue";
import cron from "node-cron";
import bodyParser from "body-parser";

const server = app.listen(process.env.PORT, async () => {
  const companies = await Company.findAll();
  const allPromises: any[] = [];
  
  companies.map(async c => {
    const promise = StartAllWhatsAppsSessions(c.id);
    allPromises.push(promise);
  });

  await Promise.all(allPromises);
  startQueueProcess();
  logger.info(`Server started on port: ${process.env.PORT}`);
});

// Middleware para parsear JSON
app.use(bodyParser.json());

// Variable para almacenar la zona horaria del cliente
let userTimezone = "UTC"; // Valor por defecto

// Endpoint para recibir la zona horaria del cliente
app.post('/api/set-timezone', (req, res) => {
  userTimezone = req.body.timezone; // Almacena la zona horaria del cliente
  logger.info(`Zona horaria del cliente establecida: ${userTimezone}`);
  res.sendStatus(200);
});

// Tarea programada
cron.schedule("* * * * *", async () => {
  try {
    logger.info(`c: ${userTimezone}`);
    
    // Aquí puedes convertir la hora local a UTC si es necesario
    await TransferTicketQueue();
  } catch (error) {
    logger.error(error);
  }
});

initIO(server);
gracefulShutdown(server);
