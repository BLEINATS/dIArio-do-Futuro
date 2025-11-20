
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a File object to a GoogleGenAI Part object with inline data.
 */
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { mimeType: string; data: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          mimeType: file.type,
          data: base64Data,
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Uses Gemini Vision to extract text from an image.
 */
export const scanImageToText = async (file: File): Promise<string> => {
  try {
    const imagePart = await fileToGenerativePart(file);

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
            imagePart,
            { text: "Você é um guardião de memórias. Analise esta imagem. Se for uma página de diário, carta ou anotação pessoal, transcreva o conteúdo mantendo a emoção e parágrafos. Responda APENAS com o texto extraído." }
        ]
      },
    });

    return response.text || "";
  } catch (error) {
    console.error("Error scanning image:", error);
    throw new Error("Falha ao ler a imagem.");
  }
};

/**
 * Refines raw voice text.
 */
export const refineText = async (text: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Melhore o seguinte texto de diário para fluir bem, corrigindo gramática mas mantendo a 1ª pessoa e o tom pessoal. Texto: "${text}". Responda apenas com o texto refinado.`,
    });
    return response.text || text;
  } catch (error) {
    return text;
  }
};

/**
 * Generates a daily writing prompt.
 */
export const generateDailyChallenge = async (): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Gere um prompt criativo e inspirador para escrita de diário (máximo 20 palavras). Exemplo: 'Sobre o que você é grato hoje?'. Responda apenas o prompt.",
    });
    return response.text || "Qual foi o melhor momento do seu dia?";
  } catch (error) {
    return "Escreva sobre algo que te fez sorrir hoje.";
  }
};

/**
 * Generates therapeutic questions based on mood.
 */
export const generateTherapeuticQuestions = async (moodLabel: string): Promise<string[]> => {
  try {
    const prompt = `
      Atue como uma psicóloga compassiva e terapeuta holística experiente.
      O usuário está sentindo: "${moodLabel}".
      
      Gere 3 perguntas profundas, terapêuticas e únicas para ajudar o usuário a:
      1. Processar as emoções do dia.
      2. Liberar crenças limitantes ou preconceitos.
      3. Encontrar gratidão ou clareza.

      Estilo: Use uma linguagem acolhedora, espiritual (sem ser religiosa) e reflexiva.
      Formato: Adicione um emoji relevante no início de cada pergunta.
      
      Exemplo de saída desejada (mas crie novas baseadas no humor):
      "🌿 O que eu posso perdoar em mim mesmo hoje?"
      "✨ Qual pequena vitória eu deixei passar despercebida?"
      "🧘‍♀️ Se minha ansiedade pudesse falar, o que ela pediria?"

      Responda APENAS com as 3 perguntas separadas por quebra de linha (sem números).
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || "";
    return text.split('\n').filter(line => line.trim().length > 0).slice(0, 3);
  } catch (error) {
    return [
      "✨ Pelo que você é grato hoje, mesmo nas pequenas coisas?",
      "🌿 O que você aprendeu sobre si mesmo hoje?",
      "💫 Como você pode ser mais gentil consigo mesmo agora?"
    ];
  }
};

/**
 * Generates a book chapter/story based on diary entries with advanced config.
 */
export const generateBookStory = async (entries: string[], config: any): Promise<{ title: string, content: string }> => {
  try {
    const combinedEntries = entries.join("\n\n---\n\n");
    
    const genre = config.customGenre || `${config.genre} ${config.subGenre ? `(${config.subGenre})` : ''}`;

    const prompt = `
      Atue como um autor best-seller. Transforme estas entradas de diário em um capítulo narrativo envolvente.
      
      Configurações da Obra:
      - Gênero: ${genre}
      - Personagens Principais: ${config.characters || "O autor do diário (Narrador)"}
      - Temas: ${config.themes || "Auto-descoberta"}
      - Guia do Usuário (Colaboração): ${config.userGuidance || "Siga o fluxo natural das memórias."}
      
      Entradas Originais do Diário:
      ${combinedEntries}

      Instruções Criativas:
      1. Analise as entradas para identificar arcos narrativos e emoções.
      2. Reescreva os eventos no estilo do gênero escolhido (${genre}).
      3. Incorpore a "Guia do Usuário" na narrativa se fornecida.
      4. Crie um título criativo e evocativo.
      5. O texto deve ser rico, com descrições sensoriais, mas fiel aos eventos reais.

      Responda ESTRITAMENTE no formato JSON:
      {
        "title": "Título Criativo",
        "content": "Texto completo da história..."
      }
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const json = JSON.parse(response.text || "{}");
    return {
      title: json.title || "Capítulo Sem Título",
      content: json.content || "Não foi possível gerar a história. Tente fornecer mais detalhes."
    };

  } catch (error) {
    console.error("Error generating book:", error);
    return { title: "Erro na Geração", content: "Ocorreu um erro ao criar sua história. Tente reduzir o número de entradas ou simplificar o tema." };
  }
};

export const getDailyQuote = async (mood: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Gere uma afirmação curta e poderosa de GRATIDÃO em PRIMEIRA PESSOA (como um mantra), para alguém se sentindo: ${mood}.
      
      IMPORTANTE: Você DEVE variar o início da frase escolhendo aleatoriamente uma destas estruturas:
      1. Comece com "Eu sou grato(a) por..."
      2. Comece com "Eu tenho gratidão por..."
      3. Comece com "Gratidão por..."

      O final da frase deve ser algo específico e positivo (ex: minha saúde, minha família, o sol de hoje, minha força).
      NUNCA diga "sou grato pela gratidão". Seja criativo e direto.
      
      Exemplo: "Eu tenho gratidão pela clareza mental que recebo hoje."
      Responda APENAS a frase.`,
    });
    return response.text || "Gratidão por mais um dia de vida.";
  } catch (error) {
    return "Eu sou grato pelo dom da vida e por todas as bençãos que me cercam.";
  }
};

export const generateAbundanceMantra = async (): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Gere uma afirmação curta, poderosa e impactante sobre PROSPERIDADE, RIQUEZA e ABUNDÂNCIA em PRIMEIRA PESSOA.
      
      Estilo: Lei da Atração, Manifestação, Abundância Infinita.
      
      Exemplos para inspiração:
      "Eu sou um ímã irresistível para o dinheiro."
      "A riqueza flui para mim de fontes esperadas e inesperadas."
      "Eu mereço toda a abundância que o universo tem a oferecer."
      "O sucesso financeiro é o meu estado natural."

      Gere apenas UMA frase. Não use aspas na resposta.`,
    });
    return response.text || "A abundância flui livremente em minha vida hoje.";
  } catch (error) {
    return "Eu sou merecedor de toda a prosperidade e riqueza do universo.";
  }
};
