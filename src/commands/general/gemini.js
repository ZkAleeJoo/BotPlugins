const { SlashCommandBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
    // Usamos la estructura exacta que pediste
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
            return interaction.editReply('❌ API ERROR');
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (text.length > 2000) {
                const chunks = text.match(/[\s\S]{1,1900}/g) || [];

                for (let i = 0; i < chunks.length; i++) {
                    if (i === 0) {
                        await interaction.editReply(chunks[i]);
                    } else {
                        await interaction.followUp(chunks[i]);
                    }
                }
            } else {
                await interaction.editReply(text);
            }

        } catch (error) {
            console.error('Error con Gemini:', error);
            await interaction.editReply('❌ An error occurred while processing your request. Please try asking a shorter question or asking a different question..');
        }
    },
};