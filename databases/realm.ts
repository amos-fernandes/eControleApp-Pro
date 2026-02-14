// Arquivo mantido para compatibilidade com códigos legados
// Redireciona para a função getDB do database.ts
import { getDB } from './database';

export const getRealm = async () => {
  console.warn("getRealm está depreciado. Use diretamente as funções do database.ts");
  return getDB();
};
