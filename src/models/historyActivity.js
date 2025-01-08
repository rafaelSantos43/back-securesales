import mongoose from "mongoose"

const historyActivitySchema = new mongoose.Schema({
  activityId: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Genera un ID único automáticamente
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  activityType: {
    type: String,
    enum: [
      "STARTED_SIMULATION",
      "LEFT_FEEDBACK",
      "REGISTERED_ACCOUNT",
      "OTHER",
    ],
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const HistoryActivity = mongoose.model("historyActivity", historyActivitySchema)

export default HistoryActivity
