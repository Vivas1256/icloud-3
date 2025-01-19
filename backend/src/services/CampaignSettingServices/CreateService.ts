import CampaignSetting from "../../models/CampaignSetting";
import { isArray, isObject } from "lodash";
import AppError from "../../errors/AppError";

interface SettingData {
  [key: string]: any;
}

interface CreateServiceInput {
  settings: SettingData;
}

const CreateService = async (
  data: CreateServiceInput,
  companyId: number
): Promise<CampaignSetting[]> => {
  if (!data.settings || Object.keys(data.settings).length === 0) {
    throw new AppError("No settings provided", 400);
  }

  const settings: CampaignSetting[] = [];

  try {
    for (const [settingKey, settingValue] of Object.entries(data.settings)) {
      const value = isArray(settingValue) || isObject(settingValue)
        ? JSON.stringify(settingValue)
        : settingValue;

      const [record, created] = await CampaignSetting.findOrCreate({
        where: {
          key: settingKey,
          companyId
        },
        defaults: { key: settingKey, value, companyId }
      });

      if (!created) {
        await record.update({ value });
      }

      settings.push(record);
    }

    return settings;
  } catch (error) {
    throw new AppError(`Error creating/updating campaign settings: ${error.message}`, 500);
  }
};

export default CreateService;
