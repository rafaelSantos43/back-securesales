import HistoryActivity from "../models/historyActivity.js"

export const logActivity = async (userId, activityType, description = "") => {
    try {
      await HistoryActivity.create({
        userId,
        activityType,
        description,
        timestamp: new Date(),
      })
      console.log(`Actividad registrada: ${activityType} para el usuario ${userId}`);
    } catch (error) {
      console.error("Error registrando la actividad:", error);
    }
  };