const { SlashCommandBuilder } = require('discord.js');
const { GoogleGenAI } = require('@google/genai');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ia')
        .setDescription('Ask what you want to know')
        .addStringOption(option =>
            option.setName('ask')
                .setDescription('What you want to know')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();

        const prompt = interaction.options.getString('ask');
        const apiKey = process.env.GEMINI_API_KEY;

        try {
            const client = new GoogleGenAI({
                apiKey: apiKey,
            });

            // CAMBIO: Usamos gemini-2.0-flash (Estándar en 2026)
            // Simplificamos 'contents' pasando el prompt directamente
            const response = await client.models.generateContent({
                model: 'gemini-2.0-flash', 
                contents: prompt 
            });

            // El nuevo SDK devuelve el texto de forma más directa
            const text = response.text; 

            if (!text) throw new Error("La IA no generó respuesta.");

            // Sistema de división de mensajes (Límite 2000 caracteres)
            if (text.length > 2000) {
                const chunks = text.match(/[\s\S]{1,1900}/g) || [];
                for (let i = 0; i < chunks.length; i++) {
                    if (i === 0) await interaction.editReply(chunks[i]);
                    else await interaction.followUp(chunks[i]);
                }
            } else {
                await interaction.editReply(text);
            }

        } catch (error) {
            console.error('Error detallado:', error);
            
            // Si el 404 persiste, es posible que el nombre exacto haya cambiado
            if (error.status === 404) {
                await interaction.editReply('❌ Error: El modelo gemini-2.0-flash no responde. Intenta con "gemini-2.0-pro" o contacta al admin.');
            } else {
                await interaction.editReply('❌ Hubo un error al procesar tu pregunta.');
            }
        }
    },
};