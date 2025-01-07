import { ApolloError } from 'apollo-server-express'
import mongoose from 'mongoose'
import Jwt from 'jsonwebtoken'
import {GraphQLJSON} from 'graphql-type-json'
import User from '../models/User.js'
import Feedback from '../models/feedback.js'
import Simulations from '../models/simulations.js'
import  GraphQLDateTime  from 'graphql-type-datetime'

//const { ObjectId } = require("mongoose").Types;
import { PubSub, withFilter } from 'graphql-subscriptions'


//const pubSub = new PubSub()

const resolvers = {
  Date: GraphQLDateTime,
  JSON: GraphQLJSON,
  Feedback: {
    user: async (parent) => {
      try {
        return await User.findById(parent.userId);
      } catch (error) {
        throw new ApolloError('Error al obtener el usuario asociado al feedback', 'USER_FETCH_ERROR');
      }
    },
    simulation: async (parent) => {
      try {
        return await Simulations.findById(parent.simulationId);
      } catch (error) {
        throw new ApolloError('Error al obtener la simulación asociada al feedback', 'SIMULATION_FETCH_ERROR');
      }
    },
  },

  Simulation: {
    user: async (parent) => {
      try {
        return await User.findById(parent.userId);
      } catch (error) {
        throw new ApolloError('Error al obtener el usuario asociado a la simulación', 'USER_FETCH_ERROR');
      }
    },
    feedbacks: async (parent) => {
      try {
        return await Feedback.find({ simulationId: parent.id });
      } catch (error) {
        throw new ApolloError('Error al obtener los feedbacks asociados a la simulación', 'FEEDBACK_FETCH_ERROR');
      }
    },
  },

  User: {
    simulation: async (parent) => {
      try {
        return await Simulations.find({ userId: parent.id });
      } catch (error) {
        throw new ApolloError('Error al obtener las simulaciones asociadas al usuario', 'SIMULATION_FETCH_ERROR');
      }
    },
    feedbacks: async (parent) => {
      try {
        return await Feedback.find({ userId: parent.id });
      } catch (error) {
        throw new ApolloError('Error al obtener los feedbacks asociados al usuario', 'FEEDBACK_FETCH_ERROR');
      }
    },
  },
  Query: {

    getFeedback: async (_, { id }) => {
      try {
        const feedback = await Feedback.findById(id);
        if (!feedback) throw new ApolloError('Feedback no encontrado', 'FEEDBACK_NOT_FOUND');
        return feedback;
      } catch (error) {
        throw new ApolloError('Error al obtener el feedback', 'FEEDBACK_FETCH_ERROR');
      }
    },

    getFeedbackBySimulation: async (_, { simulationId }) => {
      try {
        return await Feedback.find({ simulationId });
      } catch (error) {
        throw new ApolloError('Error al obtener los feedbacks de la simulación', 'FEEDBACK_FETCH_ERROR');
      }
    },

    getSimulation: async (_, { id }) => {
      try {
        const simulation = await Simulations.findById(id);
        if (!simulation) throw new ApolloError('Simulación no encontrada', 'SIMULATION_NOT_FOUND');
        return simulation;
      } catch (error) {
        throw new ApolloError('Error al obtener la simulación', 'SIMULATION_FETCH_ERROR');
      }
    },

    getSimulationsByUser: async (_, { userId }) => {
      try {
        return await Simulations.find({ userId });
      } catch (error) {
        throw new ApolloError('Error al obtener las simulaciones del usuario', 'SIMULATION_FETCH_ERROR');
      }
    },
    GetUser: async (_, { userId }) => {
      try {
        const users = await User.find()
        const userMe = users.filter((user) => user._id.equals(userId))
        return userMe
      } catch (error) {
        console.warn('Error al traer al usuario', error.message)
      }
    },
  },

  Mutation: {
    createFeedback: async (_, { input }) => {
      try {
        const feedback = new Feedback(input);
        return await feedback.save();
      } catch (error) {
        throw new ApolloError('Error al crear el feedback', 'FEEDBACK_CREATE_ERROR');
      }
    },

    updateFeedback: async (_, { input }) => {
      try {
        const { id, ...updates } = input;
        const feedback = await Feedback.findByIdAndUpdate(id, updates, { new: true });
        if (!feedback) throw new ApolloError('Feedback no encontrado', 'FEEDBACK_NOT_FOUND');
        return feedback;
      } catch (error) {
        throw new ApolloError('Error al actualizar el feedback', 'FEEDBACK_UPDATE_ERROR');
      }
    },

    deleteFeedback: async (_, { id }) => {
      try {
        const feedback = await Feedback.findByIdAndDelete(id);
        if (!feedback) throw new ApolloError('Feedback no encontrado', 'FEEDBACK_NOT_FOUND');
        return true;
      } catch (error) {
        throw new ApolloError('Error al eliminar el feedback', 'FEEDBACK_DELETE_ERROR');
      }
    },

    createSimulation: async (_, { input }) => {
      try {
        const simulation = new Simulations(input);
        return await simulation.save();
      } catch (error) {
        throw new ApolloError('Error al crear la simulación', 'SIMULATION_CREATE_ERROR');
      }
    },

    updateSimulation: async (_, { input }) => {
      try {
        const { id, ...updates } = input;
        const simulation = await Simulations.findByIdAndUpdate(id, updates, { new: true });
        if (!simulation) throw new ApolloError('Simulación no encontrada', 'SIMULATION_NOT_FOUND');
        return simulation;
      } catch (error) {
        throw new ApolloError('Error al actualizar la simulación', 'SIMULATION_UPDATE_ERROR');
      }
    },

    deleteSimulation: async (_, { id }) => {
      try {
        const simulation = await Simulations.findByIdAndDelete(id);
        if (!simulation) throw new ApolloError('Simulación no encontrada', 'SIMULATION_NOT_FOUND');
        return true
      } catch (error) {
        throw new ApolloError('Error al eliminar la simulación', 'SIMULATION_DELETE_ERROR');
      }
    },

    CreateUser: async (_, { input }) => {
      // console.log("data user-->>>", input);
      try {
        const user = new User({
          ...input,
        })
        await user.save()
        return user
      } catch (error) {
        throw new ApolloError('Error al crear el usuario.:', error)
      }
    },

    UpdateUser: async (_, args) => {
      const { id, name, email, password, avatar } = args

      try {
        const changeUser = await User.findByIdAndUpdate(
          id,
          {
            $set: { name, email, password, avatar },
          },

          {
            new: true,
          }
        )

        if (!changeUser) {
          throw new Error('el suaurio no exite')
        }

        return changeUser
      } catch (error) {
        throw new Error('Error al actualizar el usuario', error.message)
      }
    },

    // deleteUser: async (_, { id }) => {
    //   try {
    //     const user = await User.findByIdAndDelete(id);
    //     if (!user) throw new ApolloError('Usuario no encontrado', 'USER_NOT_FOUND');
    //     return true;
    //   } catch (error) {
    //     throw new ApolloError('Error al eliminar el usuario', 'USER_DELETE_ERROR');
    //   }
    // },
  },

}

export default resolvers
