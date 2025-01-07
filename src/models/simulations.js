import mongoose from "mongoose";
const simulationsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    parameters: {
      type: Map,
      of: String,
    },
    status : {
      type: String,
      enum: ['completed', 'in-progress', 'pending'],
      required: true,
    },
    result: {
      type: Map,
      of: Number,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
const Simulations = mongoose.model("simulations", simulationsSchema);
export default Simulations