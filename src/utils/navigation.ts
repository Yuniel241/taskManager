import { Task } from "./task";


export type RootStackParamList = {
    Home: undefined;
    AddTask: undefined;
    EditTask: { task: Task };
    // Ajoutez d'autres écrans ici au besoin
  };
  
  declare global {
    namespace ReactNavigation {
      interface RootParamList extends RootStackParamList {}
    }
  }