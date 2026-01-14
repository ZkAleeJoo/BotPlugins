const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sugerir')
        .setDescription('Abre un formulario profesional para enviar una sugerencia.'),

    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('suggestion_modal')
            .setTitle('💡 Nueva Sugerencia');

        const pluginInput = new TextInputBuilder()
            .setCustomId('suggest_plugin')
            .setLabel("¿Para qué plugin es la idea?")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ej: MaxStaff, SimpleAds, ClearLag+...')
            .setRequired(true);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('suggest_description')
            .setLabel("Describe tu sugerencia")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Explica detalladamente qué te gustaría añadir o cambiar...')
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(pluginInput),
            new ActionRowBuilder().addComponents(descriptionInput)
        );

        await interaction.showModal(modal);
    },
};