const { SlashCommandBuilder } = require('discord.js');
// IMPORTANTE: Ahora el paquete se llama @google/genai
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

        if (!apiKey) {
            return interaction.editReply('❌ Error: La API Key no está configurada.');
        }

        try {
            // Inicializamos con el nuevo SDK
            const client = new GoogleGenAI({
                apiKey: apiKey,
                apiVersion: 'v1' // Forzamos la versión estable v1 para evitar errores 404
            });

            // Generamos contenido usando la estructura del nuevo SDK
            // Nota: El modelo gemini-1.5-flash ya es estable en v1
            const response = await client.models.generateContent({
                model: 'gemini-1.5-flash', 
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
            });

            const text = response.candidates[0].content.parts[0].text;

            if (!text) throw new Error("Respuesta vacía de la IA.");

            // Sistema de troceado de mensajes para Discord (límite 2000 caracteres)
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
            console.error('Error con el nuevo SDK:', error);
            await interaction.editReply('❌ Error al conectar con la IA. Asegúrate de haber instalado `@google/genai`.');
        }
    },
};