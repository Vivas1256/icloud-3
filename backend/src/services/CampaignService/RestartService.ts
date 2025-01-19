import Campaign from "../../models/Campaign";
import { campaignQueue } from "../../queues";
import AppError from "../../errors/AppError";

interface RestartServiceResult {
  campaign: Campaign;
  message: string;
}

export async function RestartService(id: number): Promise<RestartServiceResult> {
  const campaign = await Campaign.findByPk(id);

  if (!campaign) {
    throw new AppError("Campaña no encontrada", 404);
  }

  if (campaign.status === "En proceso") {
    throw new AppError("La campaña ya está en marcha", 400);
  }

  try {
    await campaign.update({ status: "En Proceso" });

    await campaignQueue.add(
      "ProcessCampaign", 
      { id: campaign.id },
      { delay: 3000 }
    );

    return {
      campaign,
      message: "La campaña se reinició con éxito"
    };
  } catch (error) {
    await campaign.update({ status: "ERRO" });
    throw new AppError("No se pudo reiniciar la campaña", 500);
  }
}
