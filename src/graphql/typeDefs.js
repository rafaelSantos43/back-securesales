const typeDefs = `
  directive @hasRole(roles: [String!]!) on FIELD_DEFINITION

  enum SkillLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  EXPERT
}
  enum Role {
  ADMIN
  USUARIO
}
  
  type User {
  id: ID!
  name: String!
  username: String
  email: String!
  feedbacks: [Feedback]
  dateOfBirth: String!
  password: String!
  registrationDate: String!
  avatar: String
  role: Role!
  simulation:Simulation
  skillLevel: SkillLevel!
  createdAt: String!
  updatedAt: String!
}
 

  input CreateUser {
  name: String!
  username: String
  email: String!
  dateOfBirth: String!
  password: String!
  avatar: String
  role: Role
}
  

  input UpdateMyUser {
    id: ID!
    name: String
    email: String
    password: String
    avartar: String
  }

  type Activity {
  id: ID!
  userId: ID!
  activityType: String!
  description: String
  timestamp: String!
}
  scalar JSON
  type Simulation {
  id: ID!
  userId: ID!
  name: String!
  description: String!
  parameters: [String] 
  status: SimulationStatus!
  result: [Float]
  completedAt: String
   user: User
  createdAt: String!
  updatedAt: String!
}

enum SimulationStatus {
  COMPLETED
  IN_PROGRESS
  PENDING
}

input CreateSimulation {
  userId: ID!
  name: String!
  description: String!
  parameters: JSON
  status: SimulationStatus!
  result: [Float]
  completedAt: String
}

scalar Date

type Simulation { 
  id: ID!
  userId: ID!
  feedbacks: [Feedback]
}

input UpdateSimulationInput {
  id: ID!
  name: String
  description: String
  parameters: [String]
  status: String
  result: [Float]
  completedAt: String
}

type Feedback {
  id: ID!
  userId: ID!
  simulationId: ID!
  user: User
  comment: String!
  rating: Int!
  createdAt: Date!
  status: FeedbackStatus!
  simulation: Simulation!
  updatedAt: Date!
}

enum FeedbackStatus {
  REVIEWED
  PENDING
}

input CreateFeedbackInput {
  userId: ID!
  simulationId: ID!
  comment: String!
  rating: Int!
  status: FeedbackStatus!
}

input UpdateFeedbackInput {
  id: ID!
  comment: String
  rating: Int
  status: FeedbackStatus
}
  type Query {
    getFeedback(id: ID!): Feedback
    getFeedbackBySimulation(simulationId: ID!): [Feedback]
    getSimulation(id: ID!): Simulation
    getSimulationsByUser(userId:ID!):User
    getHistoryActivity(userId: ID!): [Activity!]!
    GetUser(userId: ID!): User @hasRole(roles: ["admin"])
  }

  type Mutation {
    CreateUser(input:CreateUser!): User!
    UpdateUser(id:ID!, name:String, email:String, password: String, avatar: String ): User
    Login(email: String!, password: String!): String!
    createSimulation(userId: ID!, otherFields: String): Simulation
    createFeedback(input: CreateFeedbackInput!): Feedback
    deleteFeedback(id:ID!):Boolean
    updateFeedback(input: UpdateFeedbackInput!): Feedback
    updateSimulation(input: UpdateSimulationInput): Simulation
    deleteSimulation(id: ID!): Boolean
  }

`;

export default typeDefs;
