import mongoose from "mongoose"

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    simulationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Simulations',
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1, // Rango de calificación mínimo (puedes ajustar según necesites)
      max: 5, // Rango de calificación máximo
    },
    createdAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['reviewed', 'pending'], // Estados posibles
      required: true,
    },
  },
  {
    timestamps: true, // Genera createdAt y updatedAt automáticamente
    versionKey: false, // Desactiva el campo `__v`
  }
);

const Feedback = mongoose.model("Feedback", feedbackSchema)

export default Feedback
