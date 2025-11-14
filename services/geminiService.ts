import { GoogleGenAI } from "@google/genai";
import { StrategyStats } from "../types";

// FIX: Adhere to Gemini API guidelines by removing manual API key checks.
// The API key is sourced from `process.env.API_KEY` and is assumed to be present.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getStrategyInsights = async (results: StrategyStats[]): Promise<string> => {
  const prompt = `
    Análise de Estratégias de Apostas Esportivas

    Com base nos seguintes dados de sucesso de várias estratégias de apostas, atue como um especialista em análise de dados esportivos. Forneça insights acionáveis para um usuário que deseja criar bots de apostas.

    O objetivo é encontrar os melhores "ranges" e condições para apostar.

    Dados Analisados:
    ${results.map(r => `- Estratégia: "${r.name}", Taxa de Sucesso: ${r.successRate}%, Ocorrências: ${r.occurrences}`).join('\n')}

    Por favor, responda em português do Brasil com a seguinte estrutura em Markdown:

    ### Resumo dos Resultados
    - Destaque as 3 estratégias mais bem-sucedidas e as 3 menos bem-sucedidas da lista.

    ### Insights e Recomendações
    - Interprete por que as estratégias de topo podem estar funcionando bem. Por exemplo, "A alta taxa de 'Over 1.5 FT' sugere que os jogos nesta liga são geralmente abertos e com gols."
    - Analise as estratégias com baixo desempenho e sugira possíveis motivos.
    - Sugira combinações de estratégias ou "ranges" que podem ser promissores. Por exemplo, "Dado o sucesso de 'Casa Vence ao Intervalo e Vence no Final', um bot poderia focar em jogos onde o time da casa é um forte favorito e marca cedo."
    - Proponha uma ou duas novas estratégias ou condições a serem testadas com base nos dados fornecidos (seja criativo).

    Seja claro, conciso e focado em fornecer valor prático para a criação de bots.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};
