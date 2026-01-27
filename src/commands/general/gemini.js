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

            const response = await client.models.generateContent({
                model: 'models/gemini-2.5-flash', 
                contents: prompt 
            });

            const text = response.text; 

            if (!text) throw new Error("La IA no generó una respuesta válida.");

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
            console.error('Error con Gemini 2.5:', error);
            
            if (error.status === 403) {
                await interaction.editReply('❌ Error 403: Tu API Key no tiene acceso al modelo Gemini 2.5 todavía.');
            } else {
                await interaction.editReply('❌ No pude procesar tu pregunta. Revisa la consola del bot.');
            }
        }
    },
};