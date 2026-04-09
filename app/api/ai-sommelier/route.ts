import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

const SYSTEM_PROMPT = `Você é o Sommelier Digital da Alma Lik, uma perfumaria curada de alto padrão. 
Seu tom é luxuoso, acolhedor, seguro e objetivo. Você NUNCA recomenda produtos de outras marcas.
Sempre explique por que o perfume combina com a ocasião, personalidade e intensidade desejada.
Quando sugerir perfumes, cite nomes e preços exatos. Use linguagem sofisticada mas acessível.
Responda em português. Sempre que sugerir um produto, inclua o preço no formato €XX.XX.
Organize suas recomendações com marcadores (•) para fácil leitura.`;

export async function POST(request: NextRequest) {
  const { messages } = await request.json();
  
  try {
    const zai = await ZAI.create();
    
    // Get product catalog for context
    const products = await db.product.findMany({
      where: { isKit: false },
      select: { 
        name: true, 
        price: true, 
        description: true, 
        gender: true, 
        olfactiveFamily: true, 
        occasion: true, 
        intensity: true, 
        notesKey: true, 
        fixation: true, 
        projection: true 
      },
    });
    
    const catalogContext = products.map(p => 
      `${p.name} | €${p.price.toFixed(2)} | ${p.gender} | ${p.olfactiveFamily} | ${p.occasion} | ${p.intensity} | Notas: ${p.notesKey} | ${p.description}`
    ).join('\n');

    const allMessages = [
      { role: 'system', content: `${SYSTEM_PROMPT}\n\nCatálogo disponível:\n${catalogContext}` },
      ...messages,
    ];

    const completion = await zai.chat.completions.create({
      messages: allMessages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua solicitação.';

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error('AI Sommelier error:', error);
    return NextResponse.json({ 
      reply: 'Estou com dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes.' 
    });
  }
}
