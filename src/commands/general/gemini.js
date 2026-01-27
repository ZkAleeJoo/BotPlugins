const { SlashCommandBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

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
            return interaction.editReply('❌ Error: Configura GEMINI_API_KEY en tu .env');
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            
            // Probamos con gemini-1.5-flash que es el más estable actualmente
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (!text) throw new Error("La IA devolvió una respuesta vacía.");

            // Dividir mensajes largos para evitar el límite de 2000 caracteres de Discord
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
            
            // Si sigue dando 404, informamos al usuario para revisar la versión del SDK
            if (error.status === 404) {
                await interaction.editReply('❌ Error 404: El modelo no fue encontrado. Por favor, ejecuta `npm install @google/generative-ai@latest` y reinicia el bot.');
            } else {
                await interaction.editReply('❌ Hubo un fallo al procesar la IA. Revisa la consola del bot.');
            }
        }
    },
};