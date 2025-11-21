import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializa o SDK com a chave da API definida no vite.config.ts
// Se a chave não existir, o app não quebrará imediatamente, mas as funções falharão graciosamente.
const API_KEY = process.env.API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// Modelo padrão para uso (Flash é mais rápido e econômico para interações rápidas)
const MODEL_NAME = "gemini-1.5-flash";

/**
 * Converte arquivo para formato aceito pelo Gemini (inline data)
 */
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove o cabeçalho do base64 (ex: "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Usa Gemini Vision para extrair texto de imagem
 */
export const scanImageToText = async (file: File): Promise<string> => {
  try {
    if (!API_KEY) throw new Error("API Key não configurada");
    
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const imagePart = await fileToGenerativePart(file);
    const prompt = "Você é um guardião de memórias. Analise esta imagem. Se for uma página de diário, carta ou anotação pessoal, transcreva o conteúdo mantendo a emoção e parágrafos. Responda APENAS com o texto extraído.";

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Erro ao escanear imagem:", error);
    return "Não foi possível ler a imagem. Verifique sua conexão ou a chave da API.";
  }
};

/**
 * Refina texto de voz
 */
export const refineText = async (text: string): Promise<string> => {
  try {
    if (!API_KEY) return text;
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `Melhore o seguinte texto de diário para fluir bem, corrigindo gramática mas mantendo a 1ª pessoa e o tom pessoal. Texto: "${text}". Responda apenas com o texto refinado.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return text;
  }
};

/**
 * Gera desafio diário
 */
export const generateDailyChallenge = async (): Promise<string> => {
  try {
    if (!API_KEY) return "Qual foi o melhor momento do seu dia?";
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = "Gere um prompt criativo e inspirador para escrita de diário (máximo 20 palavras). Exemplo: 'Sobre o que você é grato hoje?'. Responda apenas o prompt.";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return "Escreva sobre algo que te fez sorrir hoje.";
  }
};

/**
 * Gera perguntas terapêuticas baseadas no humor
 */
export const generateTherapeuticQuestions = async (moodLabel: string): Promise<string[]> => {
  try {
    if (!API_KEY) throw new Error("Sem API Key");
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `
      Atue como uma psicóloga compassiva. O usuário está sentindo: "${moodLabel}".
      Gere 3 perguntas curtas e profundas para reflexão.
      Responda APENAS com as 3 perguntas separadas por quebra de linha.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text.split('\n').filter(line => line.trim().length > 0).slice(0, 3);
  } catch (error) {
    return [
      "✨ Pelo que você é grato hoje?",
      "🌿 O que você aprendeu sobre si mesmo?",
      "💫 Como você pode ser mais gentil consigo agora?"
    ];
  }
};

/**
 * Gera história do livro (JSON Mode)
 */
export const generateBookStory = async (entries: string[], config: any): Promise<{ title: string, content: string }> => {
  try {
    if (!API_KEY) throw new Error("Sem API Key");
    
    // Configura para resposta em JSON
    const model = genAI.getGenerativeModel({ 
        model: MODEL_NAME,
        generationConfig: { responseMimeType: "application/json" }
    });

    const combinedEntries = entries.join("\n\n---\n\n");
    const genre = config.customGenre || `${config.genre} ${config.subGenre ? `(${config.subGenre})` : ''}`;

    const prompt = `
      Atue como um autor best-seller. Transforme estas entradas de diário em um capítulo narrativo (${genre}).
      Personagens: ${config.characters || "O autor"}. Temas: ${config.themes || "Vida"}.
      Entradas: ${combinedEntries}
      
      Responda ESTRITAMENTE no formato JSON: { "title": "...", "content": "..." }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const json = JSON.parse(response.text());
    
    return {
      title: json.title || "Capítulo Sem Título",
      content: json.content || "História gerada."
    };

  } catch (error) {
    console.error("Erro ao gerar livro:", error);
    return { title: "Erro na Geração", content: "Verifique sua chave API ou tente novamente mais tarde." };
  }
};

export const getDailyQuote = async (mood: string): Promise<string> => {
  try {
    if (!API_KEY) return "A gratidão transforma o que temos em suficiente.";
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `Gere uma afirmação curta de GRATIDÃO em 1ª pessoa para alguém sentindo: ${mood}. Ex: "Sou grato pela minha força". Apenas a frase.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return "Eu sou grato pelo dom da vida.";
  }
};

export const generateAbundanceMantra = async (): Promise<string> => {
  try {
    if (!API_KEY) return "A abundância flui para mim.";
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = "Gere uma frase curta e poderosa sobre PROSPERIDADE e RIQUEZA em 1ª pessoa (Lei da Atração). Apenas a frase.";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return "Eu mereço toda a prosperidade do universo.";
  }
};
